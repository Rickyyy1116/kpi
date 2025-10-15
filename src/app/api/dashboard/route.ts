import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// モックデータ（開発用）
const mockDashboardData = {
  goals: [
    {
      goal: {
        id: 'goal_1',
        title: '月商100万円達成',
        targetValue: 1000000,
        unit: '円',
        dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30日後
        status: 'active',
      },
      progress: 65,
      kpis: [
        {
          kpi: {
            id: 'kpi_1',
            title: '週あたり商談数',
            targetValue: 10,
            unit: '件',
            direction: 'up' as const,
            frequency: 'weekly' as const,
          },
          currentValue: 7,
          ratio: 0.7,
          lastUpdate: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2日前
          overdue: false,
        },
        {
          kpi: {
            id: 'kpi_2',
            title: 'CPA（顧客獲得単価）',
            targetValue: 5000,
            unit: '円',
            direction: 'down' as const,
            frequency: 'weekly' as const,
          },
          currentValue: 8000,
          ratio: 0.625,
          lastUpdate: Date.now() - 9 * 24 * 60 * 60 * 1000, // 9日前
          overdue: true,
        },
      ],
    },
  ],
  overdueKpis: [
    {
      id: 'kpi_2',
      title: 'CPA（顧客獲得単価）',
      frequency: 'weekly' as const,
      lastUpdate: Date.now() - 9 * 24 * 60 * 60 * 1000,
    },
  ],
  overdueCount: 1,
};

// GET /api/dashboard - ダッシュボードデータ取得
export async function GET(req: NextRequest) {
  try {
    // 開発環境ではモックデータを返す
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(mockDashboardData);
    }

    // 本番環境用のコード（後で実装）
    return NextResponse.json({
      goals: [],
      overdueKpis: [],
      overdueCount: 0,
    });
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

