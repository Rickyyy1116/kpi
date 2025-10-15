import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { kpis, kpiUpdates } from '@/db/schema';
import { getAuthUserId, getUserTeamId } from '@/lib/authz';
import { eq, desc } from 'drizzle-orm';

type CloudflareEnv = {
  DB: D1Database;
  CACHE: KVNamespace;
};

// GET /api/kpis/:id - KPI詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const kpi = await db.query.kpis.findFirst({
      where: eq(kpis.id, params.id),
      with: {
        updates: {
          orderBy: [desc(kpiUpdates.recordedAt)],
        },
      },
    });
    
    if (!kpi) {
      return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
    }
    
    return NextResponse.json({ kpi });
  } catch (error) {
    console.error('GET /api/kpis/:id error:', error);
    return NextResponse.json({ error: 'Failed to fetch KPI' }, { status: 500 });
  }
}

// PATCH /api/kpis/:id - KPI更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    const body = await req.json();
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const kpi = await db.query.kpis.findFirst({
      where: eq(kpis.id, params.id),
    });
    
    if (!kpi) {
      return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
    }
    
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.targetValue !== undefined) updateData.targetValue = Number(body.targetValue);
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.direction !== undefined) updateData.direction = body.direction;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId;
    
    await db.update(kpis).set(updateData).where(eq(kpis.id, params.id));
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/kpis/:id error:', error);
    return NextResponse.json({ error: 'Failed to update KPI' }, { status: 500 });
  }
}

// DELETE /api/kpis/:id - KPI削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const kpi = await db.query.kpis.findFirst({
      where: eq(kpis.id, params.id),
    });
    
    if (!kpi) {
      return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
    }
    
    // ステータスをarchivedに変更（論理削除）
    await db.update(kpis).set({ status: 'archived' }).where(eq(kpis.id, params.id));
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/kpis/:id error:', error);
    return NextResponse.json({ error: 'Failed to delete KPI' }, { status: 500 });
  }
}

