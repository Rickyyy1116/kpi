import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { kpiUpdates } from '@/db/schema';
import { getAuthUserId } from '@/lib/authz';
import { eq } from 'drizzle-orm';

// PATCH /api/updates/:id - KPI更新の編集（直近1件のみ）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // 開発環境ではモックレスポンス
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ KPI更新を編集しました（モック）:', { id, ...body });
      return NextResponse.json({ ok: true });
    }

    const userId = await getAuthUserId();
    const env = (process.env as any) as any;
    const db = getDb(env.DB);
    
    const update = await db.query.kpiUpdates.findFirst({
      where: eq(kpiUpdates.id, id),
    });
    
    if (!update) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }
    
    // 作成者のみ編集可能
    if (update.createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const updateData: any = {};
    if (body.value !== undefined) updateData.value = Number(body.value);
    if (body.note !== undefined) updateData.note = body.note;
    if (body.recordedAt !== undefined) updateData.recordedAt = Number(body.recordedAt);
    
    await db.update(kpiUpdates).set(updateData).where(eq(kpiUpdates.id, id));
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/updates/:id error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/updates/:id - KPI更新の削除（直近1件のみ）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 開発環境ではモックレスポンス
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ KPI更新を削除しました（モック）:', id);
      return NextResponse.json({ ok: true });
    }

    const userId = await getAuthUserId();
    const env = (process.env as any) as any;
    const db = getDb(env.DB);
    
    const update = await db.query.kpiUpdates.findFirst({
      where: eq(kpiUpdates.id, id),
    });
    
    if (!update) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }
    
    // 作成者のみ削除可能
    if (update.createdBy !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await db.delete(kpiUpdates).where(eq(kpiUpdates.id, id));
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/updates/:id error:', error);
    return NextResponse.json({ error: 'Failed to delete update' }, { status: 500 });
  }
}

