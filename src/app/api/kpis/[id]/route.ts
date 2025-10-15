import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/authz';

// GET /api/kpis/:id - KPI詳細取得（モック）
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // モックデータ
    const mockKpi = {
      id,
      title: id === 'kpi_1' ? '週あたり商談数' : 'CPA（顧客獲得単価）',
      targetValue: id === 'kpi_1' ? 10 : 5000,
      unit: id === 'kpi_1' ? '件' : '円',
      direction: id === 'kpi_1' ? 'up' : 'down',
      frequency: 'weekly',
      goalId: 'goal_1',
      updates: [
        {
          id: 'update_1',
          kpiId: id,
          value: id === 'kpi_1' ? 7 : 8000,
          note: '今週の実績',
          recordedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
          createdBy: 'user_a',
        },
      ],
    };
    
    return NextResponse.json({ kpi: mockKpi });
  } catch (error) {
    console.error('GET /api/kpis/:id error:', error);
    return NextResponse.json({ error: 'Failed to fetch KPI' }, { status: 500 });
  }
}

// PATCH /api/kpis/:id - KPI更新（モック）
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log('✅ KPIを更新しました（モック）:', { id, ...body });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/kpis/:id error:', error);
    return NextResponse.json({ error: 'Failed to update KPI' }, { status: 500 });
  }
}

// DELETE /api/kpis/:id - KPI削除（モック）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('✅ KPIを削除しました（モック）:', id);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/kpis/:id error:', error);
    return NextResponse.json({ error: 'Failed to delete KPI' }, { status: 500 });
  }
}

