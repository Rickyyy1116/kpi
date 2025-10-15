import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { goals } from '@/db/schema';
import { getAuthUserId, getUserTeamId } from '@/lib/authz';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// GET /api/goals/:id - Goal詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 開発環境ではモックデータを返す
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        goal: {
          id,
          title: '月商100万円達成',
          description: '12月末までに達成',
          targetValue: 1000000,
          unit: '円',
          dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          status: 'active',
          kpis: [],
        },
      });
    }

    const userId = await getAuthUserId();
    const env = (process.env as any) as any;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    const goal = await db.query.goals.findFirst({
      where: eq(goals.id, id),
      with: {
        kpis: true,
      },
    });
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    if (goal.teamId !== teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json({ goal });
  } catch (error) {
    console.error('GET /api/goals/:id error:', error);
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
  }
}

// PATCH /api/goals/:id - Goal更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // 開発環境ではモックレスポンス
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Goalを更新しました（モック）:', { id, ...body });
      return NextResponse.json({ ok: true });
    }

    const userId = await getAuthUserId();
    const env = (process.env as any) as any;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    const goal = await db.query.goals.findFirst({
      where: eq(goals.id, id),
    });
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    if (goal.teamId !== teamId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.targetValue !== undefined) updateData.targetValue = Number(body.targetValue);
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? Number(body.dueDate) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId;
    
    await db.update(goals).set(updateData).where(eq(goals.id, id));
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/goals/:id error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

