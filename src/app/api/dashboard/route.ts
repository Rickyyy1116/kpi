import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { goals, kpis, kpiUpdates } from '@/db/schema';
import { getAuthUserId, getUserTeamId } from '@/lib/authz';
import { eq, desc } from 'drizzle-orm';
import { kpiRatio, goalProgress, isOverdue } from '@/lib/calc';

type CloudflareEnv = {
  DB: D1Database;
  CACHE: KVNamespace;
};

// GET /api/dashboard - ダッシュボードデータ取得
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    // キャッシュチェック（TODO: 実装）
    // const cached = await env.CACHE?.get(`dashboard:${teamId}`);
    // if (cached) return NextResponse.json(JSON.parse(cached));
    
    // アクティブなGoalを取得
    const activeGoals = await db.query.goals.findMany({
      where: eq(goals.teamId, teamId),
      with: {
        kpis: {
          with: {
            updates: {
              orderBy: [desc(kpiUpdates.recordedAt)],
              limit: 1,
            },
          },
        },
      },
    });
    
    // 各Goalの進捗を計算
    const goalsWithProgress = activeGoals
      .filter(g => g.status === 'active')
      .map(goal => {
        const kpiData = goal.kpis
          .filter(k => k.status === 'active')
          .map(kpi => {
            const latestUpdate = kpi.updates[0];
            const currentValue = latestUpdate?.value || 0;
            const ratio = kpiRatio({
              dir: kpi.direction,
              current: currentValue,
              target: kpi.targetValue,
            });
            
            const lastUpdateTime = latestUpdate?.recordedAt || null;
            const overdue = isOverdue(lastUpdateTime, kpi.frequency);
            
            return {
              kpi,
              currentValue,
              ratio,
              lastUpdate: lastUpdateTime,
              overdue,
            };
          });
        
        const progress = goalProgress(kpiData.map(k => ({ weight: k.kpi.weight, ratio: k.ratio })));
        
        return {
          goal,
          progress,
          kpis: kpiData,
        };
      });
    
    // 未更新KPIの一覧
    const overdueKpis = goalsWithProgress
      .flatMap(g => g.kpis)
      .filter(k => k.overdue)
      .map(k => ({
        id: k.kpi.id,
        title: k.kpi.title,
        frequency: k.kpi.frequency,
        lastUpdate: k.lastUpdate,
      }));
    
    const result = {
      goals: goalsWithProgress,
      overdueKpis,
      overdueCount: overdueKpis.length,
    };
    
    // キャッシュ保存（TODO: 実装）
    // await env.CACHE?.put(`dashboard:${teamId}`, JSON.stringify(result), { expirationTtl: 300 });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

