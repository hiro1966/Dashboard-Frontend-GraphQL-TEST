# 医療ダッシュボード フロントエンド

Next.js 15 + TypeScript + Apollo Client + Shadcn UI で構築された医療ダッシュボードのフロントエンドアプリケーション。

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **GraphQL Client**: Apollo Client
- **Charts**: Recharts

## 必要要件

- Node.js 18.17 以上
- npm または yarn
- バックエンドAPI（GraphQLエンドポイント）

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成：

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:5260/graphql
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
dashboard-frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # ルートレイアウト
│   │   ├── page.tsx      # トップページ
│   │   └── globals.css   # グローバルCSS
│   ├── components/       # Reactコンポーネント
│   │   ├── ui/          # Shadcn UIコンポーネント
│   │   └── apollo-wrapper.tsx
│   ├── lib/             # ユーティリティ・設定
│   │   └── apollo-client.ts
│   └── graphql/         # GraphQLクエリ定義
├── public/              # 静的ファイル
└── package.json
```

## 利用可能なスクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動
- `npm run lint` - ESLintチェック

## バックエンド連携

このフロントエンドは、以下のGraphQLエンドポイントと連携します：

- **リポジトリ**: [Dashbord-CSharp](https://github.com/hiro1966/Dashbord-CSharp)
- **エンドポイント**: `http://localhost:5260/graphql`

### バックエンドのセットアップ

1. バックエンドリポジトリをクローン
2. `DashboardServer/start-server.bat` を実行
3. GraphQL Playground: `http://localhost:5260/graphql` で動作確認

### GraphQLクエリ例

```graphql
# 入院患者データ取得
query {
  inpatientData {
    title
    labels
    values
  }
}

# 外来患者データ取得
query {
  outpatientData(department: "全科", period: "月毎") {
    title
    labels
    datasets {
      label
      data
      borderColor
      backgroundColor
      fill
    }
  }
}
```

## 機能

### 統合ダッシュボード（トップページ）
- 入院患者数と外来患者数を並べて表示
- 各カードクリックで詳細画面へ遷移

### 入院患者詳細画面
- 病棟別患者数の棒グラフ
- 統計情報表示

### 外来患者詳細画面
- 診療科別フィルター（全科/全科(色分)/内科/小児科/整形外科）
- 期間種別選択（年毎/月毎/日毎）
- 日付範囲選択
- 積み上げエリアチャート

## ライセンス

ISC
