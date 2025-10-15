'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type KPI = {
  id: string
  title: string
  targetValue: number
  unit: string
  direction: 'up' | 'down'
  frequency: 'daily' | 'weekly' | 'monthly'
  goalId: string
}

type Update = {
  id: string
  value: number
  note: string | null
  recordedAt: number
  createdBy: string
}

export default function KpiHistoryPage() {
  const params = useParams()
  const kpiId = params.id as string
  
  const [kpi, setKpi] = useState<KPI | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (kpiId) {
      fetchData()
    }
  }, [kpiId])

  const fetchData = async () => {
    try {
      const [kpiRes, updatesRes] = await Promise.all([
        fetch(`/api/kpis/${kpiId}`),
        fetch(`/api/updates?kpiId=${kpiId}`),
      ])
      
      const kpiData = await kpiRes.json()
      const updatesData = await updatesRes.json()
      
      setKpi(kpiData.kpi)
      setUpdates(updatesData.updates || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (updateId: string) => {
    if (!confirm('この記録を削除しますか？')) return
    
    try {
      await fetch(`/api/updates/${updateId}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete update:', error)
    }
  }

  const exportCsv = () => {
    if (!kpi || updates.length === 0) return
    
    const headers = ['日時', '値', 'メモ']
    const rows = updates.map(u => [
      new Date(u.recordedAt).toLocaleString('ja-JP'),
      u.value,
      u.note || '',
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${kpi.title}_履歴.csv`
    link.click()
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

  if (!kpi) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">KPIが見つかりません</div>
        </main>
      </div>
    )
  }

  const chartData = [...updates]
    .reverse()
    .slice(-30)
    .map(u => ({
      date: new Date(u.recordedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      value: u.value,
      target: kpi.targetValue,
    }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{kpi.title}</h1>
          <div className="mt-2 flex items-center space-x-4 text-muted-foreground">
            <div className="flex items-center space-x-1">
              {kpi.direction === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-blue-600" />
              )}
              <span>目標: {kpi.targetValue}{kpi.unit}</span>
            </div>
            <Badge>
              {kpi.frequency === 'daily' ? '日次' : kpi.frequency === 'weekly' ? '週次' : '月次'}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* チャート */}
          {updates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>推移グラフ</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="実績" />
                    <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" name="目標" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 履歴テーブル */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>更新履歴</CardTitle>
                {updates.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportCsv}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV出力
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">まだ記録がありません</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日時</TableHead>
                      <TableHead>値</TableHead>
                      <TableHead>メモ</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {updates.map((update, index) => (
                      <TableRow key={update.id}>
                        <TableCell>
                          {new Date(update.recordedAt).toLocaleString('ja-JP')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {update.value}{kpi.unit}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {update.note || '-'}
                        </TableCell>
                        <TableCell>
                          {index === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(update.id)}
                            >
                              削除
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

