# panera - DQ7 Reimagined Lucky Panel Solver

## 1. プロジェクト概要

### 1.1 目的
DQ7 Reimagined（ドラゴンクエスト7 リメイク版）のラッキーパネルミニゲームにおいて、盤面の状態を可視化し、プレイヤーがパネルの入れ替え操作をトレースできる攻略支援ツールを提供する。

### 1.2 コンセプト
- クライアントサイドのみで完結する軽量ツール
- GitHub Pages上でホスティング（カスタムドメイン: panera.maaaaa.net）
- 直感的な操作で盤面の状態を管理
- 複数の難易度とパターンに対応

### 1.3 技術スタック
```
Frontend:
  - React 18+
  - TypeScript 5+
  - Vite (Build Tool)
  - TailwindCSS (Styling)
  
Storage:
  - localStorage (盤面状態の一時保存)
  
Hosting:
  - GitHub Pages
  - Custom Domain: panera.maaaaa.net
  - DNS: Cloudflare
```

---

## 2. ゲームルール仕様

### 2.1 難易度定義
```
甘口（Easy）:
  - 盤面サイズ: 3行 × 4列 = 12マス
  - 景品数: 5個（A-E）
  - 初期パターン数: 4種類

中辛（Medium）:
  - 盤面サイズ: 4行 × 4列 = 16マス
  - 景品数: 7個（A-G）
  - 初期パターン数: 3種類

辛口（Hard）:
  - 盤面サイズ: 4行 × 5列 = 20マス
  - 景品数: 9個（A-I）
  - 初期パターン数: 3種類

激辛（Expert）:
  - 未実装（将来対応予定）
```

### 2.2 パネル種類
```typescript
enum PanelType {
  PRIZE = "prize",      // 景品パネル（A-I）
  SHUFFLE = "shuffle",  // シャッフルパネル（-）: 避けるべき
  CHANCE = "chance"     // チャンスパネル（+）: 踏むべき
}

interface Panel {
  id: string;           // 一意のID（例: "0-0" for row-col）
  type: PanelType;
  label: string;        // 表示ラベル（A-I, +, -）
  position: {
    row: number;
    col: number;
  };
}
```

---

## 3. データ構造

### 3.1 初期盤面パターン定義
```typescript
interface BoardPattern {
  difficulty: "easy" | "medium" | "hard";
  patternId: number;
  layout: string[][];  // 2次元配列でパネル配置を表現
}

// 甘口パターン1の例
const easyPattern1: BoardPattern = {
  difficulty: "easy",
  patternId: 1,
  layout: [
    ["A", "A", "+", "-"],
    ["B", "B", "D", "E"],
    ["C", "C", "D", "E"]
  ]
};
```

### 3.2 完全なパターンデータ
```typescript
const INITIAL_PATTERNS: BoardPattern[] = [
  // 甘口（3×4）
  {
    difficulty: "easy",
    patternId: 1,
    layout: [
      ["A", "A", "+", "-"],
      ["B", "B", "D", "E"],
      ["C", "C", "D", "E"]
    ]
  },
  {
    difficulty: "easy",
    patternId: 2,
    layout: [
      ["A", "A", "B", "-"],
      ["C", "D", "B", "+"],
      ["C", "D", "E", "E"]
    ]
  },
  {
    difficulty: "easy",
    patternId: 3,
    layout: [
      ["A", "B", "C", "+"],
      ["A", "B", "C", "-"],
      ["D", "D", "E", "E"]
    ]
  },
  {
    difficulty: "easy",
    patternId: 4,
    layout: [
      ["A", "B", "B", "-"],
      ["A", "C", "C", "+"],
      ["D", "D", "E", "E"]
    ]
  },
  
  // 中辛（4×4）
  {
    difficulty: "medium",
    patternId: 1,
    layout: [
      ["A", "A", "-", "+"],
      ["B", "B", "E", "F"],
      ["C", "C", "E", "F"],
      ["D", "D", "G", "G"]
    ]
  },
  {
    difficulty: "medium",
    patternId: 2,
    layout: [
      ["A", "A", "-", "E"],
      ["B", "C", "+", "E"],
      ["B", "C", "F", "F"],
      ["D", "D", "G", "G"]
    ]
  },
  {
    difficulty: "medium",
    patternId: 3,
    layout: [
      ["A", "A", "C", "-"],
      ["B", "B", "C", "+"],
      ["D", "E", "F", "F"],
      ["D", "E", "G", "G"]
    ]
  },
  
  // 辛口（4×5）
  {
    difficulty: "hard",
    patternId: 1,
    layout: [
      ["A", "C", "C", "G", "G"],
      ["A", "D", "E", "+", "H"],
      ["B", "D", "E", "-", "H"],
      ["B", "F", "F", "I", "I"]
    ]
  },
  {
    difficulty: "hard",
    patternId: 2,
    layout: [
      ["A", "A", "E", "G", "+"],
      ["B", "B", "E", "G", "-"],
      ["C", "C", "F", "H", "I"],
      ["D", "D", "F", "H", "I"]
    ]
  },
  {
    difficulty: "hard",
    patternId: 3,
    layout: [
      ["A", "B", "C", "G", "G"],
      ["A", "B", "C", "+", "-"],
      ["D", "E", "F", "H", "H"],
      ["D", "E", "F", "I", "I"]
    ]
  }
];
```

### 3.3 盤面状態管理
```typescript
interface BoardState {
  difficulty: "easy" | "medium" | "hard";
  currentPattern: number | null;  // 選択中のパターンID
  board: Panel[][];                // 現在の盤面状態
  history: SwapOperation[];        // 入れ替え履歴
  isModified: boolean;             // 初期状態から変更されているか
}

interface SwapOperation {
  timestamp: number;
  panel1: { row: number; col: number; label: string };
  panel2: { row: number; col: number; label: string };
}
```

---

## 4. UI/UX設計

### 4.1 画面レイアウト
```
┌─────────────────────────────────────────────┐
│           panera - Lucky Panel Solver       │
├─────────────────────────────────────────────┤
│                                             │
│  [甘口] [中辛] [辛口]  ← タブ切り替え         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 初期パターン選択:                      │   │
│  │ [パターン1] [パターン2] [パターン3] ... │   │
│  │                                       │   │
│  │ [カスタム編集モード]                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         盤面（グリッド表示）            │   │
│  │                                       │   │
│  │    [A] [A] [+] [-]                   │   │
│  │    [B] [B] [D] [E]                   │   │
│  │    [C] [C] [D] [E]                   │   │
│  │                                       │   │
│  │  選択中: なし                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [初期化] [履歴をクリア]                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 操作履歴:                              │   │
│  │ 1. A(0,0) ⇄ +(0,2)                   │   │
│  │ 2. B(1,0) ⇄ D(1,2)                   │   │
│  │ ...                                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.2 パネル表示仕様
```typescript
// パネルのスタイル定義
const PANEL_STYLES = {
  prize: {
    background: "bg-blue-500",
    hover: "hover:bg-blue-600",
    selected: "ring-4 ring-blue-300",
    text: "text-white font-bold"
  },
  shuffle: {
    background: "bg-red-600",      // ネガティブ強調（避けるべき）
    hover: "hover:bg-red-700",
    selected: "ring-4 ring-red-300",
    text: "text-white font-bold",
    pulse: "animate-pulse"          // 注意喚起
  },
  chance: {
    background: "bg-green-500",     // ポジティブ強調（踏むべき）
    hover: "hover:bg-green-600",
    selected: "ring-4 ring-green-300",
    text: "text-white font-bold",
    glow: "shadow-lg shadow-green-400"
  }
};
```

### 4.3 インタラクション仕様

#### パネル選択と入れ替え
```
1. ユーザーが1つ目のパネルをクリック
   → パネルにハイライト表示（selected状態）
   → 「選択中: A(0,0)」と表示

2. ユーザーが2つ目のパネルをクリック
   → 2つのパネルの位置を入れ替え
   → アニメーション効果で入れ替えを視覚化
   → 履歴に記録
   → 選択状態をクリア

3. 選択中に同じパネルをクリック
   → 選択を解除
```

#### 初期化動作
```
[初期化]ボタンをクリック
  → 確認ダイアログ表示: "盤面を初期状態に戻しますか？"
  → OK: 選択中のパターンの初期状態に戻す
  → Cancel: 何もしない
```

#### カスタム編集モード
```
[カスタム編集モード]をONにすると:
  - 各パネルをクリックで種類を変更可能
  - A → B → C → ... → + → - → A の順で循環
  - 編集完了後は通常モードに戻して使用
```

---

## 5. 機能要件詳細

### 5.1 Core Features

#### F1: 難易度タブ切り替え
- **要件**: ユーザーは甘口/中辛/辛口の3つの難易度を切り替え可能
- **動作**: タブをクリックすると該当難易度の初期パターン選択ボタンが表示される
- **状態管理**: 難易度切り替え時は盤面をリセット

#### F2: 初期パターン選択
- **要件**: 各難易度ごとの初期パターンをボタンで選択可能
- **動作**: パターンボタンをクリックすると盤面に該当パターンが読み込まれる
- **視覚的フィードバック**: 選択中のパターンはボタンの色が変わる

#### F3: パネル入れ替え操作
- **要件**: 盤面上の任意の2つのパネルを選択して入れ替え可能
- **動作**:
  1. 1つ目のパネルクリック → 選択状態になる
  2. 2つ目のパネルクリック → 2つのパネルが入れ替わる
  3. アニメーション効果で入れ替えを視覚化
- **制約**: なし（どのパネル同士でも入れ替え可能）

#### F4: 操作履歴表示
- **要件**: 実行した入れ替え操作の履歴を時系列で表示
- **表示内容**:
  - 操作番号
  - 入れ替えたパネルの情報（ラベルと座標）
  - タイムスタンプ
- **機能**: [履歴をクリア]ボタンで履歴を削除可能

#### F5: 初期化機能
- **要件**: 盤面を選択中の初期パターン状態に戻す
- **動作**:
  - 確認ダイアログを表示
  - OK時: 盤面、選択状態、履歴をリセット
- **制約**: 初期パターンが選択されていない場合はボタンが無効

### 5.2 Advanced Features

#### F6: カスタム編集モード
- **要件**: ユーザーが独自の盤面パターンを作成可能
- **動作**:
  - トグルスイッチでモードON/OFF
  - ONの間はパネルクリックで種類を変更
  - 景品パネルは最大9種類まで（A-I）
- **保存**: 編集した盤面はlocalStorageに保存（任意）

#### F7: レスポンシブデザイン
- **要件**: スマートフォン、タブレット、デスクトップで適切に表示
- **ブレークポイント**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

#### F8: キーボードショートカット
- **要件**: キーボードでも操作可能（オプション）
- **ショートカット**:
  - `R`: 初期化（Reset）
  - `E`: 編集モード切り替え（Edit）
  - `H`: 履歴クリア（History clear）
  - `Tab`: パネル間移動
  - `Enter`: パネル選択

---

## 6. データフロー

### 6.1 状態管理アーキテクチャ
```typescript
// React Context + Reducerパターンを使用

interface AppState {
  difficulty: "easy" | "medium" | "hard";
  selectedPattern: number | null;
  board: Panel[][];
  selectedPanels: [Panel | null, Panel | null];
  history: SwapOperation[];
  isEditMode: boolean;
}

type Action =
  | { type: "SET_DIFFICULTY"; payload: "easy" | "medium" | "hard" }
  | { type: "LOAD_PATTERN"; payload: number }
  | { type: "SELECT_PANEL"; payload: Panel }
  | { type: "SWAP_PANELS"; payload: [Panel, Panel] }
  | { type: "RESET_BOARD" }
  | { type: "CLEAR_HISTORY" }
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "EDIT_PANEL"; payload: { panel: Panel; newType: PanelType } };

function boardReducer(state: AppState, action: Action): AppState {
  // 各アクションに応じた状態更新ロジック
}
```

### 6.2 データフロー図
```
┌─────────────┐
│   User      │
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  UI Event   │────▶│   Reducer    │
│  Handler    │     │  (State Mgmt)│
└─────────────┘     └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  AppState    │
                    │  (Context)   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  React       │
                    │  Re-render   │
                    └──────────────┘
```

---

## 7. コンポーネント設計

### 7.1 コンポーネントツリー
```
App
├── Header
│   └── Title
├── DifficultyTabs
│   └── TabButton (×3)
├── PatternSelector
│   ├── PatternButton (×n)
│   └── CustomEditToggle
├── BoardDisplay
│   ├── BoardGrid
│   │   └── PanelCell (×n)
│   └── SelectionIndicator
├── ActionButtons
│   ├── ResetButton
│   └── ClearHistoryButton
└── HistoryPanel
    └── HistoryItem (×n)
```

### 7.2 主要コンポーネント仕様

#### App.tsx
```typescript
// メインアプリケーションコンポーネント
// Context Providerでグローバル状態を管理

const App: React.FC = () => {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <DifficultyTabs />
          <PatternSelector />
          <BoardDisplay />
          <ActionButtons />
          <HistoryPanel />
        </main>
      </div>
    </AppContext.Provider>
  );
};
```

#### BoardGrid.tsx
```typescript
// 盤面グリッドを表示するコンポーネント
// レスポンシブでタッチ/クリック両対応

interface BoardGridProps {
  board: Panel[][];
  onPanelClick: (panel: Panel) => void;
  selectedPanels: [Panel | null, Panel | null];
}

const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  onPanelClick,
  selectedPanels
}) => {
  return (
    <div className="grid gap-2 w-fit mx-auto">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((panel, colIndex) => (
            <PanelCell
              key={`${rowIndex}-${colIndex}`}
              panel={panel}
              isSelected={
                selectedPanels[0]?.id === panel.id ||
                selectedPanels[1]?.id === panel.id
              }
              onClick={() => onPanelClick(panel)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
```

#### PanelCell.tsx
```typescript
// 個別のパネルセルコンポーネント
// アニメーション、スタイリング、インタラクションを管理

interface PanelCellProps {
  panel: Panel;
  isSelected: boolean;
  onClick: () => void;
}

const PanelCell: React.FC<PanelCellProps> = ({
  panel,
  isSelected,
  onClick
}) => {
  const styles = PANEL_STYLES[panel.type];
  
  return (
    <button
      onClick={onClick}
      className={`
        w-16 h-16 rounded-lg text-2xl font-bold
        transition-all duration-200
        ${styles.background}
        ${styles.hover}
        ${styles.text}
        ${isSelected ? styles.selected : ""}
        ${panel.type === "shuffle" ? styles.pulse : ""}
        ${panel.type === "chance" ? styles.glow : ""}
        active:scale-95
      `}
    >
      {panel.label}
    </button>
  );
};
```

---

## 8. 実装フェーズ

### Phase 1: 基本UI構築（2-3時間）
```
□ プロジェクトセットアップ（Vite + React + TypeScript）
□ TailwindCSS設定
□ 基本レイアウトとヘッダー
□ 難易度タブコンポーネント
□ 盤面グリッドの表示（静的）
□ パネルセルコンポーネント（スタイリング含む）
```

### Phase 2: データ管理とロジック（3-4時間）
```
□ 初期パターンデータの定義
□ Context + Reducerセットアップ
□ パターン選択機能の実装
□ パネル選択ロジック（2つ選択→入れ替え）
□ 盤面状態の更新ロジック
□ 初期化機能
```

### Phase 3: 高度な機能（2-3時間）
```
□ 操作履歴の表示
□ 履歴クリア機能
□ カスタム編集モード
□ アニメーション効果（入れ替え時）
□ 確認ダイアログ
```

### Phase 4: UX改善とテスト（2-3時間）
```
□ レスポンシブデザイン調整
□ タッチデバイス最適化
□ キーボードショートカット（オプション）
□ ユーザビリティテスト
□ バグ修正
```

### Phase 5: デプロイメント（1時間）
```
□ ビルド設定の最適化
□ public/CNAMEファイル作成
□ GitHub Pagesデプロイ設定
□ Cloudflare DNS設定（CNAMEレコード）
□ カスタムドメイン動作確認
□ README作成
□ デプロイとテスト
```

**総推定時間: 10-14時間**

---

## 9. ファイル構造

```
panera/
├── public/
│   ├── favicon.ico
│   └── CNAME                     // カスタムドメイン設定
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── DifficultyTabs.tsx
│   │   ├── PatternSelector.tsx
│   │   ├── BoardDisplay/
│   │   │   ├── BoardGrid.tsx
│   │   │   ├── PanelCell.tsx
│   │   │   └── SelectionIndicator.tsx
│   │   ├── ActionButtons.tsx
│   │   └── HistoryPanel.tsx
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── AppReducer.ts
│   ├── data/
│   │   └── patterns.ts          // 初期パターン定義
│   ├── types/
│   │   └── index.ts              // TypeScript型定義
│   ├── utils/
│   │   ├── boardOperations.ts    // 盤面操作ユーティリティ
│   │   └── animations.ts         // アニメーション関数
│   ├── styles/
│   │   └── panelStyles.ts        // パネルスタイル定義
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── LICENSE
└── README.md
```

---

## 10. GitHub Pagesデプロイ設定

### 10.1 vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',  // カスタムドメイン使用時はルートパス
  build: {
    outDir: 'dist'
  }
});
```

**Note**: カスタムドメイン（panera.maaaaa.net）を使用するため、`base`は`'/'`に設定します。

### 10.2 package.json scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.0"
  }
}
```

### 10.3 デプロイ手順
```bash
# 1. 初回セットアップ
npm install gh-pages --save-dev

# 2. CNAMEファイルの作成
# public/CNAMEファイルを作成し、カスタムドメインを記載
echo "panera.maaaaa.net" > public/CNAME

# 3. ビルドとデプロイ
npm run deploy

# 4. GitHub Settings
# - Pages → Source: gh-pages branch
# - Pages → Custom domain: panera.maaaaa.net
# - 「Enforce HTTPS」にチェック

# 5. Cloudflare DNS設定（Kagamiプロジェクトと同様）
# - CNAMEレコード: panera.maaaaa.net → <username>.github.io
# - または A レコードで GitHub Pages IPを指定:
#   185.199.108.153
#   185.199.109.153
#   185.199.110.153
#   185.199.111.153
```

**カスタムドメイン設定の注意点:**
- `public/CNAME`ファイルは必須（ビルド時に`dist/`にコピーされる）
- DNS設定の反映には数分〜数時間かかる場合がある
- HTTPS証明書の発行には最大24時間かかる場合がある
- Cloudflareを使用する場合、SSL/TLS設定を「Full」に推奨

---

## 11. 将来の拡張機能（Optional）

### 11.1 データ永続化
```
- localStorageに盤面状態を自動保存
- 過去のセッションを復元可能
- カスタムパターンの保存/読み込み
```

### 11.2 分析機能
```
- 最短手数の計算（簡易アルゴリズム）
- よく使われるパターンの統計
- 入れ替え回数のカウント
```

### 11.3 ソーシャル機能
```
- 盤面状態のURL共有（クエリパラメータエンコード）
  例: https://panera.maaaaa.net/?board=AABDCCDE...
- Twitter/Discord等へのシェアボタン
```

### 11.4 激辛難易度対応
```
- 攻略情報が集まり次第、激辛難易度を追加
- より大きな盤面サイズに対応
```

---

## 12. テストケース

### 12.1 基本機能テスト
```
□ 各難易度タブが正しく切り替わる
□ 初期パターンが正しく読み込まれる
□ パネルの選択・入れ替えが正常に動作
□ 初期化ボタンで盤面がリセットされる
□ 履歴が正しく記録される
```

### 12.2 エッジケーステスト
```
□ パターン未選択時の動作
□ 同じパネルを2回クリック（選択解除）
□ 履歴が空の時の表示
□ 編集モードでのパネル種類変更
```

### 12.3 レスポンシブテスト
```
□ モバイル画面（375px）で正しく表示
□ タブレット画面（768px）で正しく表示
□ デスクトップ画面（1920px）で正しく表示
□ タッチ操作が正常に動作
```

---

## 13. パフォーマンス要件

### 13.1 ロード時間
- 初期ロード: < 2秒
- ビルドサイズ: < 500KB（gzip後）

### 13.2 インタラクション
- パネルクリック反応: < 100ms
- 入れ替えアニメーション: 300ms
- タブ切り替え: < 50ms

### 13.3 最適化手法
- コンポーネントのメモ化（React.memo）
- 不要な再レンダリングの防止
- 画像の最適化（使用する場合）
- Code Splitting（必要に応じて）

---

## 14. アクセシビリティ

### 14.1 要件
```
□ キーボード操作対応
□ スクリーンリーダー対応（ARIA属性）
□ 色覚異常者への配慮（色だけでなくアイコンも使用）
□ コントラスト比 WCAG AA準拠
□ フォーカスインジケーターの明確化
```

### 14.2 実装例
```typescript
// ARIAラベル付与
<button
  aria-label={`パネル ${panel.label} at row ${panel.position.row}, column ${panel.position.col}`}
  aria-pressed={isSelected}
  tabIndex={0}
>
  {panel.label}
</button>
```

---

## 15. セキュリティ考慮事項

### 15.1 クライアントサイドのみの実装
- XSS対策: Reactのデフォルトエスケープを使用
- ユーザー入力のサニタイゼーション（カスタム編集時）
- localStorageのデータ検証

### 15.2 GitHub Pagesセキュリティ
- HTTPSで配信（GitHub Pagesデフォルト）
- Content Security Policy（任意）
- 外部スクリプトの最小化

---

## 16. README.md テンプレート

```markdown
# panera - DQ7 Reimagined Lucky Panel Solver

DQ7 Reimagined（ドラゴンクエスト7 リメイク版）のラッキーパネルミニゲーム攻略支援ツール

## Features

- 🎮 3つの難易度（甘口/中辛/辛口）に対応
- 📋 各難易度の初期パターンをプリセット
- 🔄 パネルの入れ替え操作をトレース
- 📝 操作履歴の記録と表示
- ✏️ カスタム編集モードで独自パターン作成
- 📱 レスポンシブデザイン対応

## Demo

https://panera.maaaaa.net/

## Usage

1. 難易度タブを選択
2. 初期パターンボタンをクリックして盤面をセット
3. パネルを2つ選択して入れ替え操作をトレース
4. [初期化]ボタンで盤面をリセット

## Development

\`\`\`bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build
npm run build

# Deploy to GitHub Pages
npm run deploy
\`\`\`

## Tech Stack

- React 18
- TypeScript 5
- Vite
- TailwindCSS
- GitHub Pages (Custom Domain: panera.maaaaa.net)
- Cloudflare DNS

## License

MIT License - see [LICENSE](LICENSE) file for details
```

---

## 17. 実装チェックリスト

### セットアップ
```
□ Viteプロジェクト作成
□ TypeScript設定
□ TailwindCSS導入
□ ESLint/Prettier設定
□ Git初期化
□ LICENSEファイル作成
```

### コア機能
```
□ 型定義（types/index.ts）
□ 初期パターンデータ（data/patterns.ts）
□ Context/Reducer設定
□ 難易度タブ
□ パターン選択ボタン
□ 盤面グリッド表示
□ パネルセルコンポーネント
□ パネル選択ロジック
□ パネル入れ替えロジック
□ 初期化機能
□ 履歴表示
□ 履歴クリア
```

### UI/UX
```
□ レスポンシブデザイン
□ パネルスタイリング（景品/シャッフル/チャンス）
□ アニメーション効果
□ 確認ダイアログ
□ ローディング状態（必要に応じて）
```

### 高度な機能
```
□ カスタム編集モード
□ キーボードショートカット
□ localStorage永続化
```

### テスト・デプロイ
```
□ ローカルテスト
□ モバイルテスト
□ public/CNAMEファイル作成（panera.maaaaa.net）
□ GitHub Pagesデプロイ
□ Cloudflare DNS設定
□ カスタムドメイン動作確認
□ README作成
```

---

## 18. ライセンス

### 18.1 使用ライブラリのライセンス確認
```
React 18+           - MIT License ✓
TypeScript 5+       - Apache License 2.0 ✓
Vite                - MIT License ✓
TailwindCSS         - MIT License ✓
gh-pages            - MIT License ✓
```

全ての使用ライブラリがMITライセンスまたは互換性のあるライセンスであるため、本プロジェクトもMITライセンスを採用します。

### 18.2 LICENSE ファイル

プロジェクトルートに以下の内容で`LICENSE`ファイルを作成してください：

```
MIT License

Copyright (c) 2025 Poyotoron

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 18.3 package.json へのライセンス表記

```json
{
  "name": "panera",
  "version": "1.0.0",
  "license": "MIT",
  "author": "Poyotoron",
  "description": "DQ7 Reimagined Lucky Panel Solver",
  ...
}
```

---

## まとめ

このドキュメントは、Claude Codeがpaneraプロジェクトを実装するための完全な要件定義書です。

**開始前の確認事項:**
1. GitHub Pagesのホスティング先リポジトリを作成
2. Cloudflare DNSでpanera.maaaaa.netの設定を準備
3. `public/CNAME`ファイルに`panera.maaaaa.net`を記載
4. `vite.config.ts`の`base`設定を`'/'`に設定（カスタムドメイン使用時）
5. Node.js 18+の環境を確認

**実装の優先順位:**
1. Phase 1-2: 基本機能（盤面表示、入れ替え）
2. Phase 3: 高度な機能（履歴、編集モード）
3. Phase 4-5: UX改善とデプロイ

全ての機能が実装されると、ユーザーはブラウザ上で直感的にラッキーパネルの盤面を操作し、攻略をサポートできるツールが完成します。
