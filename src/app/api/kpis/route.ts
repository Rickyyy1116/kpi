import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { kpis, goals } from '@/db/schema';
import { nanoid } from 'nanoid';
import { getAuthUserId, getUserTeamId } from '@/lib/authz';
import { eq } from 'drizzle-orm';

type CloudflareEnv = {
  DB: D1Database;
  CACHE: KVNamespace;
};

// GET /api/kpis - KPI一覧取得
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get('goalId');
    
    let kpisList;
    if (goalId) {
      // 特定のGoalのKPIを取得
      kpisList = await db.query.kpis.findMany({
        where: eq(kpis.goalId, goalId),
      });
    } else {
      // チーム全体のKPIを取得（Goalのチームスコープで制限）
      kpisList = await db.query.kpis.findMany();
    }
    
    return NextResponse.json({ kpis: kpisList });
  } catch (error) {
    console.error('GET /api/kpis error:', error);
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
  }
}

// POST /api/kpis - KPI作成
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const body = await req.json();
    const { goalId, title, description, targetValue, unit, direction, frequency, ownerId } = body;
    
    if (!goalId || !title || !targetValue || !unit || !direction || !frequency || !ownerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (!['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }
    
    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }
    
    if (Number(targetValue) <= 0) {
      return NextResponse.json({ error: 'Target value must be greater than 0' }, { status: 400 });
    }
    
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    // Goalがチームに所属しているか確認
    const goal = await db.query.goals.findFirst({
      where: eq(goals.id, goalId),
    });
    
    if (!goal || goal.teamId !== teamId) {
      return NextResponse.json({ error: 'Goal not found or forbidden' }, { status: 403 });
    }
    
    const newKpi = {
      id: nanoid(),
      goalId,
      title,
      description: description || null,
      ownerId,
      targetValue: Number(targetValue),
      unit,
      direction,
      frequency,
      weight: 1,
      status: 'active' as const,
    };
    
    await db.insert(kpis).values(newKpi);
    
    return NextResponse.json({ kpi: newKpi }, { status: 201 });
  } catch (error) {
    console.error('POST /api/kpis error:', error);
    return NextResponse.json({ error: 'Failed to create KPI' }, { status: 500 });
  }
}

