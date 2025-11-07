# Vercelへのデプロイ手順

## 1. GitHubリポジトリの準備

### 1-1. GitHubでリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 「New repository」をクリック
3. リポジトリ名を入力（例: `conbini-rater`）
4. 「Create repository」をクリック

### 1-2. ローカルでGitを初期化してコミット

```bash
# プロジェクトディレクトリに移動
cd conbini-rater-main

# Gitを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Conbini Rater app"

# メインブランチに名前を変更
git branch -M main

# GitHubリポジトリをリモートとして追加（<your-github-repo-url>を実際のURLに置き換え）
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# GitHubにプッシュ
git push -u origin main
```

## 2. Vercelアカウントの準備

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択してGitHubアカウントでログイン

## 3. Vercelにプロジェクトをインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリを選択
3. プロジェクト設定：
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `conbini-rater-main`（プロジェクトのルートディレクトリ）
   - **Build Command**: `npm run build`（自動設定されるはず）
   - **Output Directory**: `.next`（自動設定されるはず）
   - **Install Command**: `npm install`（自動設定されるはず）

## 4. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

1. プロジェクトの「Settings」→「Environment Variables」に移動
2. 以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase Anon Key
```

3. 各環境（Production, Preview, Development）に適用することを確認

### SupabaseのURLとキーの取得方法

1. [Supabase](https://supabase.com)にログイン
2. プロジェクトを選択
3. 「Settings」→「API」に移動
4. 「Project URL」と「anon public」キーをコピー

## 5. デプロイ

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待つ（通常1-2分）
3. デプロイが完了すると、VercelからURLが提供されます（例: `https://your-project.vercel.app`）

## 6. デプロイ後の確認

- デプロイが完了したら、提供されたURLにアクセス
- アプリが正常に動作するか確認
- バーコードスキャン機能をテスト（HTTPS環境なので動作するはず）

## 7. 今後の更新方法

コードを更新したら、GitHubにプッシュするだけで自動的にVercelにデプロイされます：

```bash
git add .
git commit -m "Update: 変更内容の説明"
git push origin main
```

Vercelが自動的に変更を検知して再デプロイします。

## 注意事項

- `.env.local`ファイルはGitにコミットされないため、Vercelでは環境変数を手動で設定する必要があります
- SupabaseのURLとキーは機密情報なので、GitHubにはコミットしないでください
- Vercelの環境変数は、Production、Preview、Developmentの各環境で個別に設定できます
- Supabase Storageのバケット（`product-images`）を作成する必要があります

## トラブルシューティング

### ビルドエラーが発生する場合

1. ローカルで`npm run build`を実行してエラーを確認
2. エラーを修正してから再度プッシュ

### 環境変数が設定されていない場合

1. Vercelダッシュボードで環境変数を確認
2. 各環境（Production, Preview, Development）に設定されているか確認

### Supabase Storageのエラー

1. SupabaseダッシュボードでStorageバケット（`product-images`）を作成
2. バケットの公開設定を確認

