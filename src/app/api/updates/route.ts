import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getAuthUserId } from '@/lib/authz';

// GET /api/updates - KPI更新履歴取得（モック）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kpiId = searchParams.get('kpiId');
    
    if (!kpiId) {
      return NextResponse.json({ error: 'kpiId is required' }, { status: 400 });
    }
    
    // モックデータ
    const mockUpdates = [
      {
        id: 'update_1',
        kpiId,
        value: 7,
        note: '今週の実績',
        recordedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        createdBy: 'user_a',
      },
      {
        id: 'update_2',
        kpiId,
        value: 5,
        note: '先週の実績',
        recordedAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
        createdBy: 'user_a',
      },
    ];
    
    return NextResponse.json({ updates: mockUpdates });
  } catch (error) {
    console.error('GET /api/updates error:', error);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}

// POST /api/updates - KPI Check-in（更新値追加）モック版
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const body = await req.json();
    const { kpiId, value, note } = body;
    
    if (!kpiId || value === undefined || value === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // モックレスポンス
    const newUpdate = {
      id: nanoid(),
      kpiId,
      value: Number(value),
      note: note || null,
      recordedAt: Date.now(),
      createdBy: userId,
    };
    
    console.log('✅ KPI更新を記録しました（モック）:', newUpdate);
    
    return NextResponse.json({ update: newUpdate }, { status: 201 });
  } catch (error) {
    console.error('POST /api/updates error:', error);
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
  }
}

