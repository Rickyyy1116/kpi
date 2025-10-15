import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { goals } from '@/db/schema';
import { getAuthUserId, getUserTeamId } from '@/lib/authz';
import { eq } from 'drizzle-orm';

type CloudflareEnv = {
  DB: D1Database;
  CACHE: KVNamespace;
};

// GET /api/goals/:id - Goal詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    const goal = await db.query.goals.findFirst({
      where: eq(goals.id, params.id),
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    const body = await req.json();
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    const goal = await db.query.goals.findFirst({
      where: eq(goals.id, params.id),
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
    
    await db.update(goals).set(updateData).where(eq(goals.id, params.id));
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/goals/:id error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

