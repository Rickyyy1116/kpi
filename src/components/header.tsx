import Link from 'next/link'
import { Home, Settings, Target } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">KPI管理</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary"
            >
              <Home className="h-4 w-4" />
              <span>ダッシュボード</span>
            </Link>
            <Link
              href="/setup"
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary"
            >
              <Settings className="h-4 w-4" />
              <span>設定</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">ユーザー: A</span>
        </div>
      </div>
    </header>
  )
}

