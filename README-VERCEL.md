# Vercelへのデプロイ手順

## 1. Vercelアカウントの準備

1. [Vercel](https://vercel.com)にアクセスしてアカウントを作成（GitHubアカウントでログイン推奨）

## 2. プロジェクトをGitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 3. Vercelにプロジェクトをインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. プロジェクト設定：
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `conbini-rater-main`（プロジェクトのルートディレクトリ）
   - **Build Command**: `npm run build`（自動設定されるはず）
   - **Output Directory**: `.next`（自動設定されるはず）

## 4. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

1. プロジェクトの「Settings」→「Environment Variables」に移動
2. 以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=https://rlbvvqdvmhahrglackgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsYnZ2cWR2bWhhaHJnbGFja2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzU2NzksImV4cCI6MjA3ODA1MTY3OX0.w_jn-UVObv0N-LaoqjSPMlLs01RHfCGEaUwyeVxjUMw
```

3. 各環境（Production, Preview, Development）に適用することを確認

## 5. デプロイ

「Deploy」ボタンをクリックしてデプロイを開始

## 6. デプロイ後の確認

- デプロイが完了すると、VercelからURLが提供されます
- そのURLにアクセスしてアプリが正常に動作するか確認

## 注意事項

- `.env.local`ファイルはGitにコミットされないため、Vercelでは環境変数を手動で設定する必要があります
- SupabaseのURLとキーは機密情報なので、GitHubにはコミットしないでください
- Vercelの環境変数は、Production、Preview、Developmentの各環境で個別に設定できます


