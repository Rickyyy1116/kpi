'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, User } from 'lucide-react'

type GoalCardProps = {
  goal: {
    id: string
    title: string
    unit: string
    targetValue: number
    dueDate: number | null
    ownerId: string
  }
  progress: number
  kpis: Array<{
    kpi: {
      id: string
      title: string
    }
    overdue: boolean
  }>
  daysRemaining: number | null
}

export function GoalCard({ goal, progress, kpis, daysRemaining }: GoalCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{goal.title}</CardTitle>
            <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
              {daysRemaining !== null && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>残り{daysRemaining}日</span>
                </div>
              )}
              <div>
                目標: {goal.targetValue}{goal.unit}
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm font-medium">KPI一覧</div>
          {kpis.length === 0 ? (
            <p className="text-sm text-muted-foreground">KPIが設定されていません</p>
          ) : (
            <div className="space-y-1">
              {kpis.map(({ kpi, overdue }) => (
                <Link
                  key={kpi.id}
                  href={`/kpi/${kpi.id}`}
                  className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-accent"
                >
                  <span>{kpi.title}</span>
                  {overdue && <Badge variant="destructive" className="text-xs">未更新</Badge>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

