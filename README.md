# panera - DQ7 Reimagined Lucky Panel Solver

DQ7 Reimagined（ドラゴンクエスト7 リメイク版）のラッキーパネルミニゲーム攻略支援ツール

## Demo

https://panera.maaaaa.net/

## Features

- 4つの難易度に対応（甘口/中辛/辛口/激辛）
- パレット方式の盤面エディタで自由に盤面を作成
- パネルの入れ替え操作をトレース
- 操作履歴の記録と表示
- 編集した盤面をlocalStorageに自動保存・復元
- レスポンシブデザイン対応（スマホ/タブレット/デスクトップ）

### 難易度別の盤面サイズ

| 難易度 | サイズ | 景品数 |
|--------|--------|--------|
| 甘口 | 3×4 | 5（A〜E） |
| 中辛 | 4×4 | 7（A〜G） |
| 辛口 | 4×5 | 9（A〜I） |
| 激辛 | 4×6 | 11（A〜K） |

## Usage

1. **難易度を選択** — 画面上部の「甘口」「中辛」「辛口」「激辛」タブをクリック
2. **盤面を編集** — パレットからパネルを選び、盤面上のマスをクリックして配置
3. **編集完了** — 「編集完了」ボタンで入れ替えモードへ移行
4. **パネルを入れ替え** — パネルを2つ順番にクリックすると入れ替え完了。同じパネルをもう一度クリックすると選択解除
5. **初期化** — 「初期化」ボタンで編集完了時の盤面に戻す（確認ダイアログあり）
6. **盤面を再編集** — 「盤面を再編集」ボタンで編集モードに戻る

### パネルの見方

| 色 | 種類 | 説明 |
|----|------|------|
| 青 | 景品パネル（A〜K） | 揃えたい景品 |
| 緑 | チャンスパネル（+） | 踏むべきパネル |
| 赤 | シャッフルパネル（-） | 避けるべきパネル |

### パレット編集モード

パレットから配置したいパネルの種類を選択し、盤面上のマスをクリックすると配置されます。「消去」ボタンで配置済みパネルをクリアできます。編集した盤面はlocalStorageに自動保存され、次回アクセス時に復元されます。

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
