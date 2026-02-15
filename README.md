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

### GitHub Actions（自動デプロイ）

`main` ブランチへの push で自動的にビルド・デプロイされます（`.github/workflows/deploy.yml`）。

**初回セットアップ:**

1. GitHub リポジトリの Settings > Pages を開く
2. Source を **GitHub Actions** に変更
3. `main` に push すればデプロイが走ります

### 手動デプロイ（gh-pages）

GitHub Actions を使わない場合:

```bash
npm install -D gh-pages
npx gh-pages -d dist
```

リポジトリの Settings > Pages で Source を **Deploy from a branch** > `gh-pages` に設定してください。

## Tech Stack

- React 19 + TypeScript 5.9
- Vite 7
- TailwindCSS 4
- GitHub Pages

## License

MIT License - see [LICENSE](LICENSE) file for details
