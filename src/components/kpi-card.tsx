'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, AlertCircle } from 'lucide-react'
import { useState } from 'react'

type KpiCardProps = {
  kpi: {
    id: string
    title: string
    unit: string
    direction: 'up' | 'down'
    targetValue: number
    frequency: 'daily' | 'weekly' | 'monthly'
  }
  currentValue: number
  ratio: number
  lastUpdate: number | null
  overdue: boolean
  onUpdate: (value: number, note?: string) => Promise<void>
}

export function KpiCard({ kpi, currentValue, ratio, lastUpdate, overdue, onUpdate }: KpiCardProps) {
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value) return
    
    setLoading(true)
    try {
      await onUpdate(Number(value), note)
      setValue('')
      setNote('')
    } finally {
      setLoading(false)
    }
  }

  const frequencyLabel = {
    daily: '日次',
    weekly: '週次',
    monthly: '月次',
  }[kpi.frequency]

  return (
    <Card className={overdue ? 'border-destructive' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{kpi.title}</CardTitle>
            <div className="mt-1 flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{frequencyLabel}</span>
              <span>·</span>
              {kpi.direction === 'up' ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-blue-600" />
              )}
              <span>目標: {kpi.targetValue}{kpi.unit}</span>
            </div>
          </div>
          {overdue && (
            <Badge variant="destructive">
              <AlertCircle className="mr-1 h-3 w-3" />
              未更新
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold">
                {currentValue}
                <span className="ml-1 text-lg font-normal text-muted-foreground">{kpi.unit}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                達成率: {Math.round(ratio * 100)}%
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {lastUpdate ? (
                <>最終更新: {new Date(lastUpdate).toLocaleDateString('ja-JP')}</>
              ) : (
                <>未入力</>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="number"
              placeholder="値を入力"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !value}>
              記録
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

