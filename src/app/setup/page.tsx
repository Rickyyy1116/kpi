'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

type Goal = {
  id: string
  title: string
  description: string | null
  targetValue: number
  unit: string
  dueDate: number | null
  ownerId: string
  status: string
}

type KPI = {
  id: string
  goalId: string
  title: string
  description: string | null
  targetValue: number
  unit: string
  direction: 'up' | 'down'
  frequency: 'daily' | 'weekly' | 'monthly'
  ownerId: string
  status: string
}

export default function SetupPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  
  // Goal作成フォーム
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: '',
    dueDate: '',
    ownerId: 'user_1', // TODO: 実際のユーザーIDを取得
  })
  
  // KPI作成フォーム
  const [kpiForm, setKpiForm] = useState({
    title: '',
    targetValue: '',
    unit: '',
    direction: 'up' as 'up' | 'down',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    ownerId: 'user_1', // TODO: 実際のユーザーIDを取得
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [goalsRes, kpisRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/kpis'),
      ])
      const goalsData = await goalsRes.json()
      const kpisData = await kpisRes.json()
      
      setGoals(goalsData.goals || [])
      setKpis(kpisData.kpis || [])
      
      if (goalsData.goals && goalsData.goals.length > 0) {
        setSelectedGoalId(goalsData.goals[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dueDate = goalForm.dueDate ? new Date(goalForm.dueDate).getTime() : null
      
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...goalForm,
          targetValue: Number(goalForm.targetValue),
          dueDate,
        }),
      })
      
      setGoalForm({
        title: '',
        description: '',
        targetValue: '',
        unit: '',
        dueDate: '',
        ownerId: 'user_1',
      })
      
      fetchData()
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const handleCreateKpi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoalId) return
    
    try {
      await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...kpiForm,
          goalId: selectedGoalId,
          targetValue: Number(kpiForm.targetValue),
        }),
      })
      
      setKpiForm({
        title: '',
        targetValue: '',
        unit: '',
        direction: 'up',
        frequency: 'weekly',
        ownerId: 'user_1',
      })
      
      fetchData()
    } catch (error) {
      console.error('Failed to create KPI:', error)
    }
  }

  const handleDeleteKpi = async (id: string) => {
    if (!confirm('このKPIを削除しますか？')) return
    
    try {
      await fetch(`/api/kpis/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete KPI:', error)
    }
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

  const selectedGoal = goals.find(g => g.id === selectedGoalId)
  const selectedGoalKpis = kpis.filter(k => k.goalId === selectedGoalId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Goal & KPI 設定</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Goal作成 */}
          <Card>
            <CardHeader>
              <CardTitle>Goal作成</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <Label htmlFor="goal-title">タイトル</Label>
                  <Input
                    id="goal-title"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="goal-description">説明</Label>
                  <Textarea
                    id="goal-description"
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal-target">目標値</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      value={goalForm.targetValue}
                      onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-unit">単位</Label>
                    <Input
                      id="goal-unit"
                      value={goalForm.unit}
                      onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="goal-due">期限</Label>
                  <Input
                    id="goal-due"
                    type="date"
                    value={goalForm.dueDate}
                    onChange={(e) => setGoalForm({ ...goalForm, dueDate: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Goalを作成
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Goal一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>Goal一覧</CardTitle>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground">Goalがありません</p>
              ) : (
                <div className="space-y-2">
                  {goals.map(goal => (
                    <div
                      key={goal.id}
                      onClick={() => setSelectedGoalId(goal.id)}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        selectedGoalId === goal.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">
                        目標: {goal.targetValue}{goal.unit}
                        {goal.dueDate && (
                          <> · 期限: {new Date(goal.dueDate).toLocaleDateString('ja-JP')}</>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* KPI管理 */}
        {selectedGoal && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                {selectedGoal.title} の KPI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* KPI作成フォーム */}
              <form onSubmit={handleCreateKpi} className="space-y-4 rounded-lg border p-4">
                <h3 className="font-medium">KPI追加</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="kpi-title">KPIタイトル</Label>
                    <Input
                      id="kpi-title"
                      value={kpiForm.title}
                      onChange={(e) => setKpiForm({ ...kpiForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kpi-target">目標値</Label>
                    <Input
                      id="kpi-target"
                      type="number"
                      value={kpiForm.targetValue}
                      onChange={(e) => setKpiForm({ ...kpiForm, targetValue: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kpi-unit">単位</Label>
                    <Input
                      id="kpi-unit"
                      value={kpiForm.unit}
                      onChange={(e) => setKpiForm({ ...kpiForm, unit: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kpi-direction">方向</Label>
                    <Select
                      value={kpiForm.direction}
                      onValueChange={(value) => setKpiForm({ ...kpiForm, direction: value as 'up' | 'down' })}
                    >
                      <SelectTrigger id="kpi-direction">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="up">↑ 増やす</SelectItem>
                        <SelectItem value="down">↓ 減らす</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="kpi-frequency">頻度</Label>
                    <Select
                      value={kpiForm.frequency}
                      onValueChange={(value) => setKpiForm({ ...kpiForm, frequency: value as any })}
                    >
                      <SelectTrigger id="kpi-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">日次</SelectItem>
                        <SelectItem value="weekly">週次</SelectItem>
                        <SelectItem value="monthly">月次</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  KPIを追加
                </Button>
              </form>

              {/* KPI一覧 */}
              {selectedGoalKpis.length === 0 ? (
                <p className="text-sm text-muted-foreground">KPIがありません</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>タイトル</TableHead>
                      <TableHead>目標</TableHead>
                      <TableHead>方向</TableHead>
                      <TableHead>頻度</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedGoalKpis.map(kpi => (
                      <TableRow key={kpi.id}>
                        <TableCell className="font-medium">{kpi.title}</TableCell>
                        <TableCell>{kpi.targetValue}{kpi.unit}</TableCell>
                        <TableCell>{kpi.direction === 'up' ? '↑ 増やす' : '↓ 減らす'}</TableCell>
                        <TableCell>
                          {kpi.frequency === 'daily' ? '日次' : kpi.frequency === 'weekly' ? '週次' : '月次'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteKpi(kpi.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

