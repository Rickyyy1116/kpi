'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { GoalCard } from '@/components/goal-card'
import { KpiCard } from '@/components/kpi-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { daysRemaining } from '@/lib/calc'

type DashboardData = {
  goals: Array<{
    goal: any
    progress: number
    kpis: Array<{
      kpi: any
      currentValue: number
      ratio: number
      lastUpdate: number | null
      overdue: boolean
    }>
  }>
  overdueCount: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKpiUpdate = async (kpiId: string, value: number, note?: string) => {
    await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kpiId, value, note }),
    })
    fetchDashboard()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">読み込み中...</div>
        </main>
      </div>
    )
  }

  if (!data || data.goals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>KPI管理へようこそ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                まずはGoalとKPIを作成して、進捗を追跡しましょう。
              </p>
              <Link href="/setup">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Goalを作成
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </div>
          {data.overdueCount > 0 && (
            <Badge variant="destructive" className="text-lg">
              <AlertCircle className="mr-1 h-4 w-4" />
              未更新: {data.overdueCount}件
            </Badge>
          )}
        </div>

        <div className="space-y-8">
          {data.goals.map(({ goal, progress, kpis }) => (
            <div key={goal.id} className="space-y-4">
              <GoalCard
                goal={goal}
                progress={progress}
                kpis={kpis.map(k => ({ kpi: k.kpi, overdue: k.overdue }))}
                daysRemaining={daysRemaining(goal.dueDate)}
              />
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kpis.map(kpi => (
                  <KpiCard
                    key={kpi.kpi.id}
                    kpi={kpi.kpi}
                    currentValue={kpi.currentValue}
                    ratio={kpi.ratio}
                    lastUpdate={kpi.lastUpdate}
                    overdue={kpi.overdue}
                    onUpdate={(value, note) => handleKpiUpdate(kpi.kpi.id, value, note)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

