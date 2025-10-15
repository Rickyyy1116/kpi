import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { kpiUpdates } from '@/db/schema';
import { nanoid } from 'nanoid';
import { getAuthUserId } from '@/lib/authz';
import { eq, and, desc } from 'drizzle-orm';

type CloudflareEnv = {
  DB: D1Database;
  CACHE: KVNamespace;
};

// GET /api/updates - KPI更新履歴取得
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const { searchParams } = new URL(req.url);
    const kpiId = searchParams.get('kpiId');
    
    if (!kpiId) {
      return NextResponse.json({ error: 'kpiId is required' }, { status: 400 });
    }
    
    const updates = await db.query.kpiUpdates.findMany({
      where: eq(kpiUpdates.kpiId, kpiId),
      orderBy: [desc(kpiUpdates.recordedAt)],
    });
    
    return NextResponse.json({ updates });
  } catch (error) {
    console.error('GET /api/updates error:', error);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}

// POST /api/updates - KPI Check-in（更新値追加）
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const body = await req.json();
    const { kpiId, value, note, recordedAt } = body;
    
    if (!kpiId || value === undefined || value === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const env = (process.env as unknown) as CloudflareEnv;
    const db = getDb(env.DB);
    
    const newUpdate = {
      id: nanoid(),
      kpiId,
      value: Number(value),
      note: note || null,
      recordedAt: recordedAt ? Number(recordedAt) : Date.now(),
      createdBy: userId,
    };
    
    await db.insert(kpiUpdates).values(newUpdate);
    
    // キャッシュクリア（Dashboard用）
    // TODO: env.CACHE?.delete(`dashboard:${teamId}`);
    
    return NextResponse.json({ update: newUpdate }, { status: 201 });
  } catch (error) {
    console.error('POST /api/updates error:', error);
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
  }
}

