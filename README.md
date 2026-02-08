# panera - DQ7 Reimagined Lucky Panel Solver

DQ7 Reimagined（ドラゴンクエスト7 リメイク版）のラッキーパネルミニゲーム攻略支援ツール

## Demo

https://panera.maaaaa.net/

## Features

- 3つの難易度（甘口/中辛/辛口）に対応
- 各難易度の初期パターンをプリセット（甘口4種/中辛3種/辛口3種）
- パネルの入れ替え操作をトレース
- 操作履歴の記録と表示
- カスタム編集モードで独自パターン作成
- レスポンシブデザイン対応（スマホ/タブレット/デスクトップ）

## Usage

1. **難易度を選択** — 画面上部の「甘口」「中辛」「辛口」タブをクリック
2. **初期パターンをセット** — パターンボタンをクリックして盤面を読み込み
3. **パネルを入れ替え** — パネルを2つ順番にクリックすると入れ替え完了。同じパネルをもう一度クリックすると選択解除
4. **初期化** — 「初期化」ボタンで盤面を初期状態に戻す（確認ダイアログあり）
5. **履歴をクリア** — 「履歴をクリア」ボタンで操作履歴を削除

### パネルの見方

| 色 | 種類 | 説明 |
|----|------|------|
| 青 | 景品パネル（A〜I） | 揃えたい景品 |
| 緑 | チャンスパネル（+） | 踏むべきパネル |
| 赤 | シャッフルパネル（-） | 避けるべきパネル |

### カスタム編集モード

パターン選択エリアの「カスタム編集」ボタンをONにすると、パネルをクリックするたびに種類が `A → B → C → ... → I → + → - → A` の順で変わります。自分で盤面を自由にカスタマイズできます。

## Development

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## GitHub Pages デプロイ

### 1. GitHub Actions（推奨）

リポジトリの Settings > Pages で Source を **GitHub Actions** に設定し、Vite 用のワークフローを追加してください。

### 2. 手動デプロイ（gh-pages）

```bash
npm install -D gh-pages
npx gh-pages -d dist
```

リポジトリの Settings > Pages で Source を **Deploy from a branch** > `gh-pages` に設定してください。

### カスタムドメイン設定

1. `public/CNAME` に `panera.maaaaa.net` が記載済み（ビルド時に `dist/` へコピーされます）
2. GitHub リポジトリの Settings > Pages > Custom domain に `panera.maaaaa.net` を入力
3. 「Enforce HTTPS」にチェック
4. Cloudflare DNS に以下のいずれかを設定:
   - **CNAME レコード**: `panera` → `<username>.github.io`
   - **A レコード**（4件）:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
5. Cloudflare の SSL/TLS 設定を「Full」に変更

> DNS の反映に数分〜数時間、HTTPS 証明書の発行に最大24時間かかる場合があります。

## Tech Stack

- React 19 + TypeScript 5.9
- Vite 7
- TailwindCSS 4
- GitHub Pages (Custom Domain: panera.maaaaa.net)
- Cloudflare DNS

## License

MIT License - see [LICENSE](LICENSE) file for details
