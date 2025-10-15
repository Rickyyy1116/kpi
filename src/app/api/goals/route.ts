import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { goals } from '@/db/schema';
import { nanoid } from 'nanoid';
import { getAuthUserId, getUserTeamId } from '@/lib/authz';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// GET /api/goals - Goal一覧取得
export async function GET(req: NextRequest) {
  try {
    // 開発環境ではモックデータを返す
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ goals: [] });
    }

    const userId = await getAuthUserId();
    const env = (process.env as any) as any;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    const goalsList = await db.query.goals.findMany({
      where: eq(goals.teamId, teamId),
      orderBy: (goals, { desc }) => [desc(goals.createdAt)],
    });
    
    return NextResponse.json({ goals: goalsList });
  } catch (error) {
    console.error('GET /api/goals error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST /api/goals - Goal作成
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, targetValue, unit, dueDate, ownerId } = body;
    
    if (!title || !targetValue || !unit || !ownerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // 開発環境ではモックレスポンス
    if (process.env.NODE_ENV === 'development') {
      const newGoal = {
        id: nanoid(),
        title,
        description: description || null,
        targetValue: Number(targetValue),
        unit,
        dueDate: dueDate ? Number(dueDate) : null,
        ownerId,
        status: 'active' as const,
      };
      console.log('✅ Goalを作成しました（モック）:', newGoal);
      return NextResponse.json({ goal: newGoal }, { status: 201 });
    }

    const userId = await getAuthUserId();
    const env = (process.env as any) as any;
    const db = getDb(env.DB);
    
    const teamId = await getUserTeamId(db, userId);
    
    const newGoal = {
      id: nanoid(),
      teamId,
      title,
      description: description || null,
      ownerId,
      targetValue: Number(targetValue),
      unit,
      dueDate: dueDate ? Number(dueDate) : null,
      status: 'active' as const,
    };
    
    await db.insert(goals).values(newGoal);
    
    return NextResponse.json({ goal: newGoal }, { status: 201 });
  } catch (error) {
    console.error('POST /api/goals error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
