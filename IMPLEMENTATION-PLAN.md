# コンビニ商品レーティングアプリ 実装プラン

## 概要

このドキュメントは、提供された要件に基づいて、コンビニ商品レーティングアプリの実装プランをまとめたものです。

## 実装目標

1. **ある程度の網羅性**: リリース時に50-200件の商品データを用意
2. **毎週の新商品カバー**: 週次で新商品を追加・露出
3. **スキャン→未登録なら即DB追加**: バーコードスキャンで未登録商品を即座に追加可能

## 技術スタック（無料優先）

### フロントエンド
- **Next.js 13+** (App Router) - 現在使用中
- **React Native / Expo** - ネイティブアプリ対応（将来）

### バックエンド・データベース
- **Supabase** - PostgreSQL + Storage（現在使用中）
- **無料プランで開始可能**

### バーコード読み取り
- **@zxing/browser** - Web版（現在）
- **expo-barcode-scanner** - ネイティブ版（将来）

### 商品情報取得
- **Open Food Facts API** - 無料（優先）
- **商用API** - 将来の拡張用（Barcode Lookup, EAN-Search等）

## 実装フェーズ

### Phase 1: コア機能の実装（Day 0-3）

#### ✅ 完了済み
- [x] 商品写真アップロード機能
- [x] 商品追加フォーム（初追加）
- [x] バーコードスキャン（スタブ実装）

#### 🔄 実装中・次に実装
- [ ] バーコード読み取り機能の実装（@zxing/browser）
- [ ] 商品検索・照会機能の改善
- [ ] 写真アップロードの実装（Supabase Storage）

#### 📋 実装予定
- [ ] 検証（Verify）機能
- [ ] ポイントシステム
- [ ] 評価（Rating）機能の改善
- [ ] 新商品セクション

### Phase 2: 商品データの初期化（Day 1-2）

#### 手動シードデータの準備
1. **CSVファイルの作成**（50-200件）
   - セブン/ファミマ/ローソンの定番商品
   - おにぎり、サンド、カップ麺、ホットスナック、主要PB飲料
   - 項目: `barcode`, `title_ja`, `title_en`, `brand`, `chains[]`, `category`, `image_url`, `release_date`

2. **画像の準備**
   - `/public/images` フォルダに商品画像を配置
   - ファイル名: `{barcode}.jpg` または `{barcode}.webp`
   - サイズ: 最大1MB、推奨800x800px

3. **CSVインポート機能の実装**
   - 管理画面またはCLIツールでCSVをインポート
   - バリデーションとエラーハンドリング

#### Open Food Facts連携
- APIエンドポイント: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- ヒットしたら商品情報を正規化してDBに保存
- `source='off'`, `confidence` フィールドを追加

### Phase 3: 検証・承認システム（Day 2-3）

#### Verify（合議）機能
1. **投票システム**
   - 一致/不一致の投票
   - 条件: Match≥3 && Mismatch<3（24時間以内）で確定
   - Mismatch≥3で一時非表示

2. **検証ポイント付与**
   - 先着3名に +3pt
   - 検証完了時に通知

3. **UI実装**
   - 商品詳細ページに「検証」セクション
   - 投票履歴の表示
   - 検証状況の可視化

### Phase 4: ポイントシステム（Day 3-4）

#### ポイント付与ルール
1. **初追加**: +20pt
2. **評価**: +3pt（日1回/商品/ユーザー）
3. **検証**: +3pt（先着3名）
4. **連続日数ボーナス**:
   - 3日連続: +10pt
   - 7日連続: +20pt
   - 14日連続: +40pt

#### Wallet機能
- ポイント表示
- 履歴表示
- 連続日数の表示
- 最終活動日の記録

### Phase 5: 新商品セクション（Day 2-3）

#### 週次新商品の管理
1. **手動更新（初期）**
   - 管理画面またはCSVで新商品を追加
   - `release_date` が直近14日以内の商品を「NEW」バッジ表示

2. **ホーム画面の実装**
   - 「今週の新発売」セクション
   - 横スクロールカード表示
   - 週の目玉3件をバナー表示

3. **半自動化（将来）**
   - 管理者向け「下書き」フォーム
   - URLを貼る→タイトル/画像/価格を半自動抽出
   - 人が目視で確定保存

### Phase 6: クーポン・報酬システム（Day 4）

#### クーポン機能
1. **クーポン一覧**
   - ポイント消費でクーポン交換
   - ワンタイムQRコード生成
   - 使用履歴の記録

2. **クエスト機能**
   - 週次クエスト（例: 3チェーンで3品評価）
   - クエスト完了でボーナスポイント

### Phase 7: ランキング・統計（Day 3-4）

#### ランキング機能
1. **Top This Week**
   - 直近7日の評価平均が高い商品
   - 評価数≥3の商品のみ表示

2. **人気商品**
   - 評価数が多い順
   - カテゴリ別ランキング

3. **新着商品**
   - リリース日が新しい順
   - 直近14日以内の商品

## データベーススキーマ拡張

### 追加が必要なテーブル・カラム

```sql
-- products テーブルに追加
ALTER TABLE products ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE products ADD COLUMN IF NOT EXISTS confidence integer DEFAULT 100;
ALTER TABLE products ADD COLUMN IF NOT EXISTS verified_count integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mismatch_count integer DEFAULT 0;

-- verifications テーブルの拡張（既存）
-- user_id, barcode, verdict (match/mismatch), created_at

-- reward_events テーブル（既存）
-- id, user_id, type, points, metadata, created_at

-- wallets テーブル（既存）
-- user_id, points, streak, last_activity, updated_at
```

## API実装

### 商品関連
- `GET /api/products` - 商品一覧取得
- `GET /api/products/[barcode]` - 商品詳細取得
- `POST /api/products` - 商品追加
- `PUT /api/products/[barcode]` - 商品更新

### 評価関連
- `POST /api/ratings` - 評価追加
- `GET /api/ratings/[barcode]` - 評価一覧取得

### 検証関連
- `POST /api/verifications` - 検証投票
- `GET /api/verifications/[barcode]` - 検証状況取得

### ポイント関連
- `GET /api/wallet` - ウォレット情報取得
- `GET /api/rewards` - 報酬履歴取得

### 外部API連携
- `GET /api/providers/openfoodfacts/[barcode]` - Open Food Facts照会

## ファイル構造

```
conbini-rater-main/
├── app/
│   ├── add/[barcode]/          # 商品追加フォーム ✅
│   ├── product/[barcode]/       # 商品詳細ページ
│   ├── scan/                    # バーコードスキャン
│   ├── explore/                  # 商品一覧
│   └── api/
│       ├── products/            # 商品API
│       ├── ratings/             # 評価API
│       ├── verifications/      # 検証API
│       └── providers/           # 外部API連携
├── components/
│   ├── barcode-scanner/         # バーコードスキャナー
│   ├── product-form/            # 商品フォーム
│   ├── verification/             # 検証コンポーネント
│   └── wallet/                  # ウォレット表示
├── lib/
│   ├── actions.ts               # Server Actions ✅
│   ├── db-helpers.ts            # DB操作ヘルパー
│   ├── providers.ts             # 外部API連携
│   └── rewards.ts               # ポイント計算
├── services/
│   ├── barcodeProviders.ts      # バーコードプロバイダー
│   └── imageUpload.ts           # 画像アップロード
└── supabase/
    └── migrations/              # DBマイグレーション
```

## 実装優先順位

### 最優先（Week 1）
1. ✅ 商品写真アップロード機能
2. ✅ 商品追加フォーム
3. 🔄 バーコード読み取り機能（@zxing/browser）
4. 📋 検証（Verify）機能
5. 📋 ポイントシステム基本実装

### 高優先度（Week 2）
6. 📋 新商品セクション
7. 📋 ランキング機能
8. 📋 クーポン機能
9. 📋 Open Food Facts連携

### 中優先度（Week 3-4）
10. 📋 週次クエスト
11. 📋 管理画面
12. 📋 通知機能（PWA）
13. 📋 ネイティブアプリ対応（Expo）

## コスト見積もり

### 無料で実装可能
- ✅ Supabase無料プラン（500MB DB、1GB Storage）
- ✅ Open Food Facts API（無料、レート制限あり）
- ✅ Vercel無料プラン（ホスティング）
- ✅ @zxing/browser（クライアント側バーコード読み取り）

### 将来的に有料化が必要な場合
- Supabase Pro（大規模運用時）
- 商用バーコードAPI（高精度が必要な場合）
- プッシュ通知サービス（大規模運用時）

## 次のステップ

1. **バーコード読み取り機能の実装**
   - @zxing/browserの統合
   - カメラアクセス権限の処理
   - エラーハンドリング

2. **Supabase Storageの設定**
   - ストレージバケットの作成
   - 画像アップロードAPIの実装
   - 画像最適化（リサイズ、圧縮）

3. **検証機能の実装**
   - 投票UIの作成
   - 合議ロジックの実装
   - ポイント付与の統合

4. **初期データの準備**
   - CSVファイルの作成
   - 商品画像の収集
   - インポートスクリプトの作成

## 参考資料

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Open Food Facts API](https://world.openfoodfacts.org/data)
- [@zxing/browser Documentation](https://github.com/zxing-js/browser)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/api-reference/components/image)

