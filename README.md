# KPI管理アプリ

2人で運営する会社向けの、Goal → KPI → 行動（タスク）を一気通貫で可視化・更新できる軽量Webアプリです。

## 機能

- **Goal管理**: 期限付きの目標設定と進捗追跡
- **KPI管理**: Goal配下のKPI作成と定期的なCheck-in
- **ダッシュボード**: 全体の進捗と未更新KPIの可視化
- **履歴管理**: KPIの推移グラフとCSVエクスポート

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **認証**: Clerk
- **データベース**: Cloudflare D1 (Drizzle ORM)
- **デプロイ**: Cloudflare Pages

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env.example`を`.env.local`にコピーして、必要な値を設定します：

```bash
cp .env.example .env.local
```

- Clerk のAPIキーを [https://clerk.com/](https://clerk.com/) から取得
- Cloudflare D1 データベースIDを取得

### 3. データベースのセットアップ

```bash
# D1データベース作成
wrangler d1 create kpi-duo-db

# マイグレーション実行
pnpm run db:generate
pnpm run db:migrate
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) でアプリにアクセスできます。

## 画面構成

### Dashboard (`/`)
- 全Goalの進捗リング
- KPIのクイックCheck-in
- 未更新KPIのバッジ表示

### Setup (`/setup`)
- Goal作成/編集
- KPI作成/編集/削除
- Goal-KPIの紐付け

### History (`/kpi/[id]`)
- KPIの推移グラフ
- 更新履歴一覧
- CSV出力

## デプロイ

### Cloudflare Pages

```bash
# ビルド
pnpm build

# Cloudflare Pagesにデプロイ
wrangler pages publish .next
```

## ライセンス

MIT

