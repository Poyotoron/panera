# panera - DQ7 Reimagined Lucky Panel Solver

## 1. プロジェクト概要

### 1.1 目的
DQ7 Reimagined（ドラゴンクエスト7 リメイク版）のラッキーパネルミニゲームにおいて、盤面の状態を可視化し、プレイヤーがパネルの入れ替え操作をトレースできる攻略支援ツールを提供する。

### 1.2 コンセプト
- クライアントサイドのみで完結する軽量ツール
- GitHub Pages上でホスティング（カスタムドメイン: panera.maaaaa.net）
- 直感的な操作で盤面の状態を管理（パレット選択 + クリック/タップ/指なぞり）
- カメラ/画像認識による盤面の自動読み取り機能
- 複数の難易度とパターンに対応（甘口/中辛/辛口/激辛）

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
│  [甘口] [中辛] [辛口] [激辛]  ← タブ切り替え │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ パネル選択パレット:                    │   │
│  │ [A] [B] [C] [D] [E] [F] [G] ...      │   │
│  │ [+] [-] [消去]                        │   │
│  │ 選択中: [B]                           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         盤面（グリッド表示）            │   │
│  │                                       │   │
│  │    [A] [A] [+] [-]                   │   │
│  │    [B] [B] [D] [E]                   │   │
│  │    [C] [C] [D] [E]                   │   │
│  │                                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ＜編集モード時＞                            │
│  [盤面をクリア] [編集完了]                  │
│                                             │
│  ＜入れ替えモード時＞                        │
│  [盤面を再編集] [初期化] [履歴をクリア]      │
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

**Note（2/15更新）:** 初期パターン選択機能は削除し、パレット方式のエディット機能に統一しました。

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

#### モードの切り替え
```
起動時 / 難易度変更時:
  → 編集モードで開始
  
編集モード:
  - パレットとグリッドが操作可能
  - [編集完了]で入れ替えモードへ
  
入れ替えモード:
  - グリッドのみ操作可能（パネル入れ替え）
  - [盤面を再編集]で編集モードへ戻る
```

#### 編集モードの操作
```
1. パレットからパネルを選択（例: "B"をクリック）
   → パレット上でハイライト表示
   → 「選択中: B」と表示

2. 盤面グリッド上のマスをクリック
   → 選択中のパネル（B）がそのマスに配置される
   → パレットの選択は維持される（連続配置可能）

3. 別のパネルを選択（例: "+"をクリック）
   → 選択が切り替わる

4. 配置を続ける
   → 盤面全体を設定

5. [盤面をクリア]をクリック（必要に応じて）
   → 全マスが空になる

6. [編集完了]をクリック
   → 現在の盤面が初期状態として保存される
   → 入れ替えモードに切り替わる
```

#### 入れ替えモードの操作
```
1. ユーザーが1つ目のパネルをクリック
   → パネルにハイライト表示（selected状態）
   → 「選択中: A(0,0)」と表示（履歴パネル下部など）

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
[初期化]ボタンをクリック（入れ替えモード時のみ表示）
  → 確認ダイアログ表示: "盤面を初期状態に戻しますか？"
  → OK: 編集完了時に保存した初期盤面に戻す
  → Cancel: 何もしない
```

#### 盤面再編集
```
[盤面を再編集]ボタンをクリック（入れ替えモード時のみ表示）
  → 確認ダイアログ表示: "盤面を再編集しますか？（履歴はクリアされます）"
  → OK: 編集モードに切り替え、履歴をクリア
  → Cancel: 何もしない
```

---

## 5. 機能要件詳細

### 5.1 Core Features

#### F1: 難易度タブ切り替え
- **要件**: ユーザーは甘口/中辛/辛口/激辛の4つの難易度を切り替え可能
- **動作**: タブをクリックすると該当難易度の空の盤面が表示される
- **状態管理**: 難易度切り替え時は編集モードで開始

#### F2: パレット選択機能（2/15追加）
- **要件**: パレットから任意のパネル種類を選択可能
- **動作**: 
  - 景品パネル（A-K、難易度により異なる）
  - チャンスパネル（+）
  - シャッフルパネル（-）
  - 消去（マスを空にする）
- **視覚的フィードバック**: 選択中のパネルはハイライト表示

#### F3: 盤面配置機能（2/15追加）
- **要件**: 選択したパネルを盤面グリッド上に配置可能
- **動作**:
  1. パレットからパネルを選択
  2. グリッド上のマスをクリック
  3. 選択したパネルが配置される
  4. パレット選択は維持され、連続配置可能
- **制約**: 編集モード時のみ有効

#### F4: パネル入れ替え操作
- **要件**: 盤面上の任意の2つのパネルを選択して入れ替え可能
- **動作**:
  1. 1つ目のパネルクリック → 選択状態になる
  2. 2つ目のパネルクリック → 2つのパネルが入れ替わる
  3. アニメーション効果で入れ替えを視覚化
- **制約**: 入れ替えモード時のみ有効

#### F5: 操作履歴表示
- **要件**: 実行した入れ替え操作の履歴を時系列で表示
- **表示内容**:
  - 操作番号
  - 入れ替えたパネルの情報（ラベルと座標）
  - タイムスタンプ
- **機能**: [履歴をクリア]ボタンで履歴を削除可能

#### F6: 初期化機能
- **要件**: 盤面を編集完了時の初期状態に戻す
- **動作**:
  - 確認ダイアログを表示
  - OK時: 盤面、選択状態、履歴をリセット
- **制約**: 入れ替えモード時のみ有効

#### F7: モード切り替え機能（2/15追加）
- **要件**: 編集モードと入れ替えモードを切り替え可能
- **動作**:
  - 編集モード: [編集完了]で入れ替えモードへ
  - 入れ替えモード: [盤面を再編集]で編集モードへ
- **状態管理**: モード切り替え時に適切な確認ダイアログを表示

### 5.2 Advanced Features

#### F8: 盤面クリア機能（2/15追加）
- **要件**: 盤面全体を一括でクリア可能
- **動作**: [盤面をクリア]ボタンで全マスを空にする
- **制約**: 編集モード時のみ有効

#### F9: localStorage永続化（2/15追加）
- **要件**: 編集した初期盤面を自動保存
- **動作**:
  - 編集完了時にlocalStorageに保存
  - 次回起動時に同じ難易度なら復元
  - 難易度が異なる場合は空の盤面から開始
- **データ**: 盤面配列と難易度を保存

#### F10: レスポンシブデザイン
- **要件**: スマートフォン、タブレット、デスクトップで適切に表示
- **ブレークポイント**:
  - Mobile: < 640px（パネルサイズを動的調整）
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **特殊対応**: 激辛（4×6）はモバイルでパネルサイズを縮小

#### F11: キーボードショートカット（オプション）
- **要件**: キーボードでも操作可能
- **編集モード**:
  - `A-K`: 対応する景品パネルを選択
  - `+`: チャンスパネルを選択
  - `-`: シャッフルパネルを選択
  - `Delete`/`Backspace`: 消去モードを選択
  - `Enter`: 編集完了
- **入れ替えモード**:
  - `E`: 編集モードに切り替え
  - `R`: 初期化
  - `H`: 履歴クリア
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
│   └── TabButton (×4: 甘口/中辛/辛口/激辛)
├── PanelPalette (編集モード時のみ表示)
│   ├── PrizeButtons (A-K)
│   ├── SpecialButtons (+/-)
│   └── EraseButton
├── BoardDisplay
│   ├── BoardGrid
│   │   └── PanelCell (×n)
│   └── ModeIndicator (編集中 or 入れ替え中)
├── ActionButtons (モードにより表示内容が変わる)
│   ├── EditModeButtons
│   │   ├── ClearBoardButton
│   │   └── FinishEditingButton
│   └── SwapModeButtons
│       ├── ReEditButton
│       ├── ResetButton
│       └── ClearHistoryButton
└── HistoryPanel (入れ替えモード時のみ表示)
    └── HistoryItem (×n)
```

**Note（2/15更新）:** PatternSelectorコンポーネントは削除し、PanelPaletteとモード切り替え機能を追加しました。

### 7.2 主要コンポーネント仕様

#### App.tsx
```typescript
// メインアプリケーションコンポーネント
// Context Providerでグローバル状態を管理
// 編集モードと入れ替えモードの切り替えを制御

const App: React.FC = () => {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  
  // 起動時にlocalStorageから復元
  useEffect(() => {
    const savedBoard = loadInitialBoard(state.difficulty);
    if (savedBoard) {
      dispatch({ type: 'LOAD_SAVED_BOARD', payload: savedBoard });
    }
  }, []);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <DifficultyTabs />
          
          {/* 編集モード時のみパレット表示 */}
          {state.editMode && <PanelPalette />}
          
          <BoardDisplay />
          
          {/* モードにより表示内容が変わる */}
          <ActionButtons />
          
          {/* 入れ替えモード時のみ履歴表示 */}
          {!state.editMode && <HistoryPanel />}
        </main>
      </div>
    </AppContext.Provider>
  );
};
```

#### BoardGrid.tsx
```typescript
// 盤面グリッドを表示するコンポーネント
// モードにより動作が変わる

interface BoardGridProps {
  board: Panel[][];
  editMode: boolean;
  selectedPalettePanel: string | null;
  selectedPanels: [Panel | null, Panel | null];
  onPanelClick: (panel: Panel) => void;
}

const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  editMode,
  selectedPalettePanel,
  selectedPanels,
  onPanelClick
}) => {
  const getPanelSize = () => {
    const cols = board[0]?.length || 4;
    const isMobile = window.innerWidth < 640;
    
    if (!isMobile) return 'w-16 h-16';
    
    // モバイル時は列数に応じてサイズ調整
    switch (cols) {
      case 4: return 'w-16 h-16';
      case 5: return 'w-12 h-12';
      case 6: return 'w-10 h-10';  // 激辛
      default: return 'w-14 h-14';
    }
  };
  
  return (
    <div className="grid gap-2 w-fit mx-auto">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((panel, colIndex) => (
            <PanelCell
              key={`${rowIndex}-${colIndex}`}
              panel={panel}
              size={getPanelSize()}
              isSelected={
                editMode 
                  ? false  // 編集モードでは選択状態なし
                  : selectedPanels[0]?.id === panel.id ||
                    selectedPanels[1]?.id === panel.id
              }
              isEditMode={editMode}
              onClick={() => onPanelClick(panel)}
            />
          ))}
        </div>
      ))}
      
      {editMode && (
        <p className="text-center mt-2 text-sm text-gray-600">
          パレットから選択: {selectedPalettePanel || 'なし'}
        </p>
      )}
    </div>
  );
};
```

#### PanelCell.tsx
```typescript
// 個別のパネルセルコンポーネント
// モードにより表示スタイルが変わる

interface PanelCellProps {
  panel: Panel;
  size: string;
  isSelected: boolean;
  isEditMode: boolean;
  onClick: () => void;
}

const PanelCell: React.FC<PanelCellProps> = ({
  panel,
  size,
  isSelected,
  isEditMode,
  onClick
}) => {
  const styles = PANEL_STYLES[panel.type];
  
  // 空のマス（編集モード用）
  if (!panel.label) {
    return (
      <button
        onClick={onClick}
        className={`
          ${size} rounded-lg text-2xl font-bold
          border-2 border-dashed border-gray-400
          bg-gray-100
          ${isEditMode ? 'hover:bg-gray-200 cursor-pointer' : 'cursor-not-allowed'}
          transition-all duration-200
        `}
        disabled={!isEditMode}
      >
        　
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={`
        ${size} rounded-lg text-2xl font-bold
        transition-all duration-200
        ${styles.background}
        ${styles.hover}
        ${styles.text}
        ${isSelected ? styles.selected : ''}
        ${panel.type === 'shuffle' ? styles.pulse : ''}
        ${panel.type === 'chance' ? styles.glow : ''}
        ${isEditMode ? 'cursor-pointer' : 'active:scale-95'}
      `}
    >
      {panel.label}
    </button>
  );
};
```

#### ActionButtons.tsx
```typescript
// モードにより表示するボタンが変わる

interface ActionButtonsProps {
  editMode: boolean;
  onClearBoard: () => void;
  onFinishEditing: () => void;
  onReEdit: () => void;
  onReset: () => void;
  onClearHistory: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  editMode,
  onClearBoard,
  onFinishEditing,
  onReEdit,
  onReset,
  onClearHistory
}) => {
  if (editMode) {
    return (
      <div className="flex gap-4 justify-center my-4">
        <button
          onClick={onClearBoard}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          盤面をクリア
        </button>
        <button
          onClick={onFinishEditing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          編集完了
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex gap-4 justify-center my-4">
      <button
        onClick={onReEdit}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        盤面を再編集
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        初期化
      </button>
      <button
        onClick={onClearHistory}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        履歴をクリア
      </button>
    </div>
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
│   │   ├── PanelPalette.tsx          // パレット選択UI
│   │   ├── ImageRecognitionPanel.tsx  // 画像認識UI
│   │   ├── BoardDisplay/
│   │   │   ├── BoardGrid.tsx
│   │   │   ├── PanelCell.tsx
│   │   │   └── SelectionIndicator.tsx
│   │   ├── ActionButtons.tsx
│   │   └── HistoryPanel.tsx
│   ├── context/
│   │   ├── AppContext.tsx
│   │   └── AppReducer.ts
│   ├── hooks/
│   │   └── useTouchDrag.ts          // タッチドラッグ
│   ├── data/
│   │   └── difficultyConfig.ts       // 難易度設定
│   ├── types/
│   │   └── index.ts                  // TypeScript型定義
│   ├── utils/
│   │   ├── boardOperations.ts        // 盤面操作ユーティリティ
│   │   ├── PanelRecognizer.ts        // 画像認識エンジン
│   │   ├── localStorage.ts           // 永続化ユーティリティ
│   │   └── animations.ts             // アニメーション関数
│   ├── styles/
│   │   └── panelStyles.ts            // パネルスタイル定義
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .test_images/                     // 画像認識用テスト画像
│   ├── easy/
│   │   ├── sample1.png
│   │   └── ...
│   ├── medium/
│   ├── hard/
│   └── expert/
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

- 🎮 4つの難易度（甘口/中辛/辛口/激辛）に対応
- 🎨 パレット方式の直感的な盤面エディット機能
- 📱 スマホ対応：指なぞりで連続配置
- 📸 カメラ/画像認識による盤面自動読み取り
- 🔄 パネルの入れ替え操作をトレース
- 📝 操作履歴の記録と表示
- 💾 盤面の自動保存（localStorage）
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
□ 初期パターンデータ（data/patterns.ts）→ 削除
□ 難易度設定（激辛を含む4つ）
□ Context/Reducer設定
□ 難易度タブ
□ パレット選択UI
□ 盤面グリッド表示（動的サイズ対応）
□ パネルセルコンポーネント
□ パネル配置ロジック（クリック）
□ タッチドラッグ機能（指なぞり配置）  // NEW
□ パネル入れ替えロジック
□ 初期化機能
□ 履歴表示
□ 履歴クリア
□ モード切り替え（編集⇄入れ替え）
□ 画像認識エンジン                    // NEW
□ カメラ/画像アップロードUI            // NEW
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

## 18. 2/15追加分：激辛難易度と盤面入力の改善

### 18.1 激辛難易度の追加

#### 盤面サイズと景品数
```
激辛（Expert）:
  - 盤面サイズ: 4行 × 6列 = 24マス
  - 景品数: 11個（A-K）
  - チャンスパネル: 1個（+）
  - シャッフルパネル: 1個（-）
  - 合計: 11種類の景品 + チャンス + シャッフル = 13パネル種類
```

#### データ構造の拡張
```typescript
// 難易度定義の更新
const DIFFICULTY_CONFIG = {
  easy: { rows: 3, cols: 4, prizes: 5 },
  medium: { rows: 4, cols: 4, prizes: 7 },
  hard: { rows: 4, cols: 5, prizes: 9 },
  expert: { rows: 4, cols: 6, prizes: 11 }  // NEW
};

// 景品ラベルの拡張
const PRIZE_LABELS = {
  easy: ['A', 'B', 'C', 'D', 'E'],
  medium: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  hard: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  expert: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']  // NEW
};
```

#### UI更新
```
難易度タブに「激辛」を追加:
[甘口] [中辛] [辛口] [激辛]

激辛選択時:
- 4×6のグリッド表示（24マス）
- 11種類の景品パネル（A-K）
```

### 18.2 初期パターン選択機能の削除

**変更理由:**
- 初期盤面のパターンが多様で全てを網羅することが困難
- ユーザーが実際のゲーム画面を見ながら自由に盤面を設定できる方が実用的

**削除する機能:**
- 初期パターン選択ボタン群
- `INITIAL_PATTERNS`定数
- `PatternSelector`コンポーネント

**変更後のワークフロー:**
1. 難易度タブを選択
2. 盤面エディット機能で初期状態を設定
3. パネル入れ替え操作をトレース
4. 必要に応じて初期化ボタンで最初の設定状態に戻す

### 18.3 盤面エディット機能の充実

#### 課題
従来の「1クリックで1種類ずつ循環」方式では、景品数が11個まで増えると：
- A → B → C → ... → K → + → - → A と13回クリックが必要
- 盤面全体（24マス）を設定するのに時間がかかる

#### 解決策：クイック入力パレット方式

**新しいUI設計:**

```
┌─────────────────────────────────────────────┐
│  [甘口] [中辛] [辛口] [激辛]                │
├─────────────────────────────────────────────┤
│                                             │
│  パネル選択パレット:                         │
│  [A] [B] [C] [D] [E] [F] [G] [H] [I] [J] [K]│
│  [+] [-] [消去]                             │
│                                             │
│  選択中: [B] ← ハイライト表示                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         盤面（グリッド表示）            │   │
│  │                                       │   │
│  │  [A] [A] [B] [B] [C] [C]             │   │
│  │  [D] [D] [E] [E] [F] [F]             │   │
│  │  [G] [G] [H] [H] [I] [I]             │   │
│  │  [J] [J] [K] [K] [+] [-]             │   │
│  │                                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [盤面をクリア] [編集完了]                   │
│                                             │
└─────────────────────────────────────────────┘
```

#### 操作フロー

**盤面設定モード（初回起動時 / 難易度切り替え時）:**
```
1. パレットからパネル種類を選択（例: "B"をクリック）
   → 選択中のパネルがハイライト表示

2. 盤面グリッド上のマスをクリック
   → 選択中のパネル（B）が配置される
   → パレットの選択は維持される（連続配置可能）

3. 別のパネルを選択（例: "+"をクリック）
   → 選択が切り替わる

4. 盤面に配置
   → 繰り返し

5. [編集完了]ボタンをクリック
   → 入れ替えモードに切り替わる
```

**入れ替えモード（通常の使用）:**
```
1. 盤面上のパネルを2つ選択して入れ替え
   → 従来通りの操作

2. [盤面を再編集]ボタンで盤面設定モードに戻る
   → パレットが表示され、再度盤面を編集可能
```

#### コンポーネント設計

**新規コンポーネント: PanelPalette.tsx**
```typescript
interface PanelPaletteProps {
  difficulty: "easy" | "medium" | "hard" | "expert";
  selectedPanel: string | null;
  onPanelSelect: (panel: string) => void;
}

const PanelPalette: React.FC<PanelPaletteProps> = ({
  difficulty,
  selectedPanel,
  onPanelSelect
}) => {
  const prizes = PRIZE_LABELS[difficulty];
  const specialPanels = ['+', '-', '消去'];
  
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">パネル選択パレット:</h3>
      
      {/* 景品パネル */}
      <div className="flex flex-wrap gap-2 mb-2">
        {prizes.map(label => (
          <button
            key={label}
            onClick={() => onPanelSelect(label)}
            className={`
              w-12 h-12 rounded font-bold
              ${selectedPanel === label 
                ? 'bg-blue-600 text-white ring-4 ring-blue-300' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* 特殊パネル */}
      <div className="flex gap-2">
        <button
          onClick={() => onPanelSelect('+')}
          className={`
            w-12 h-12 rounded font-bold
            ${selectedPanel === '+' 
              ? 'bg-green-600 text-white ring-4 ring-green-300' 
              : 'bg-green-500 text-white hover:bg-green-600'
            }
          `}
        >
          +
        </button>
        <button
          onClick={() => onPanelSelect('-')}
          className={`
            w-12 h-12 rounded font-bold
            ${selectedPanel === '-' 
              ? 'bg-red-700 text-white ring-4 ring-red-300' 
              : 'bg-red-600 text-white hover:bg-red-700'
            }
          `}
        >
          -
        </button>
        <button
          onClick={() => onPanelSelect('')}
          className={`
            px-4 h-12 rounded font-bold
            ${selectedPanel === '' 
              ? 'bg-gray-600 text-white ring-4 ring-gray-300' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
            }
          `}
        >
          消去
        </button>
      </div>
      
      {selectedPanel && (
        <p className="mt-2 text-sm">
          選択中: <span className="font-bold">{selectedPanel || '消去'}</span>
        </p>
      )}
    </div>
  );
};
```

#### 状態管理の更新

```typescript
interface AppState {
  difficulty: "easy" | "medium" | "hard" | "expert";  // expertを追加
  board: Panel[][];
  selectedPanels: [Panel | null, Panel | null];
  history: SwapOperation[];
  
  // 新規追加
  editMode: boolean;              // 編集モード or 入れ替えモード
  selectedPalettePanel: string | null;  // パレットで選択中のパネル
  initialBoard: Panel[][] | null; // 編集完了時の盤面を保存（初期化用）
}

type Action =
  | { type: "SET_DIFFICULTY"; payload: "easy" | "medium" | "hard" | "expert" }
  | { type: "SELECT_PALETTE_PANEL"; payload: string }
  | { type: "PLACE_PANEL"; payload: { row: number; col: number } }
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "FINISH_EDITING" }  // 編集完了時に初期盤面を保存
  | { type: "CLEAR_BOARD" }
  | { type: "SELECT_PANEL"; payload: Panel }
  | { type: "SWAP_PANELS"; payload: [Panel, Panel] }
  | { type: "RESET_BOARD" }  // 保存した初期盤面に戻す
  | { type: "CLEAR_HISTORY" };
```

#### モード切り替えロジック

```typescript
// 編集モードでの盤面クリック
const handleBoardClickInEditMode = (row: number, col: number) => {
  if (!selectedPalettePanel) {
    alert('パレットからパネルを選択してください');
    return;
  }
  
  dispatch({
    type: 'PLACE_PANEL',
    payload: { row, col }
  });
};

// 入れ替えモードでの盤面クリック
const handleBoardClickInSwapMode = (panel: Panel) => {
  dispatch({
    type: 'SELECT_PANEL',
    payload: panel
  });
};

// 現在のモードに応じて適切なハンドラを使用
const handleBoardClick = (panel: Panel) => {
  if (state.editMode) {
    handleBoardClickInEditMode(panel.position.row, panel.position.col);
  } else {
    handleBoardClickInSwapMode(panel);
  }
};
```

#### ボタンの配置

**編集モード時:**
```
[盤面をクリア] [編集完了]
```

**入れ替えモード時:**
```
[盤面を再編集] [初期化] [履歴をクリア]
```

#### キーボードショートカット（オプション）

```
編集モード:
- A-K: 対応する景品パネルを選択
- +: チャンスパネルを選択
- -: シャッフルパネルを選択
- Delete/Backspace: 消去モードを選択
- Enter: 編集完了

入れ替えモード:
- E: 編集モードに切り替え
- R: 初期化
- H: 履歴クリア
```

### 18.4 レスポンシブ対応の調整

激辛難易度（4×6グリッド）はモバイルで横幅が厳しいため：

```typescript
// パネルサイズの動的調整
const getPanelSize = (difficulty: string, screenWidth: number) => {
  if (screenWidth < 640) {  // Mobile
    switch (difficulty) {
      case 'easy': return 'w-16 h-16';      // 3×4
      case 'medium': return 'w-14 h-14';    // 4×4
      case 'hard': return 'w-12 h-12';      // 4×5
      case 'expert': return 'w-10 h-10';    // 4×6
    }
  }
  return 'w-16 h-16';  // Desktop: 全て同じサイズ
};
```

### 18.5 データ永続化の改善

編集した盤面をlocalStorageに自動保存：

```typescript
// 編集完了時に保存
const saveInitialBoard = (board: Panel[][]) => {
  localStorage.setItem('panera_initial_board', JSON.stringify(board));
  localStorage.setItem('panera_difficulty', state.difficulty);
};

// 起動時に復元
const loadInitialBoard = (): Panel[][] | null => {
  const saved = localStorage.getItem('panera_initial_board');
  const savedDifficulty = localStorage.getItem('panera_difficulty');
  
  if (saved && savedDifficulty === state.difficulty) {
    return JSON.parse(saved);
  }
  return null;
};
```

### 18.6 更新されたファイル構造

```
panera/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── DifficultyTabs.tsx
│   │   ├── PanelPalette.tsx          // NEW: パレット選択UI
│   │   ├── BoardDisplay/
│   │   │   ├── BoardGrid.tsx
│   │   │   ├── PanelCell.tsx
│   │   │   └── SelectionIndicator.tsx
│   │   ├── ActionButtons.tsx         // UPDATED: モード切り替え対応
│   │   └── HistoryPanel.tsx
│   ├── data/
│   │   └── difficultyConfig.ts       // UPDATED: 激辛追加
│   ├── utils/
│   │   ├── boardOperations.ts
│   │   └── localStorage.ts            // NEW: 永続化ユーティリティ
```

### 18.7 実装フェーズの更新

**Phase 1: 基本UI構築（2-3時間）**
```
□ プロジェクトセットアップ
□ 難易度タブ（激辛を含む4つ）
□ PanelPaletteコンポーネント
□ 盤面グリッドの表示（動的サイズ対応）
□ モード切り替えUI
```

**Phase 2: エディット機能（3-4時間）**
```
□ パレット選択ロジック
□ 盤面への配置ロジック
□ 編集モードと入れ替えモードの切り替え
□ 初期盤面の保存と復元
□ localStorage連携
```

**Phase 3: 入れ替え機能（2-3時間）**
```
□ パネル選択ロジック（入れ替えモード）
□ 入れ替えアニメーション
□ 操作履歴の記録
□ 初期化機能
```

**Phase 4: UX改善とテスト（2-3時間）**
```
□ レスポンシブデザイン（特に激辛のモバイル対応）
□ キーボードショートカット
□ エラーハンドリング
□ ユーザビリティテスト
```

**Phase 5: デプロイメント（1時間）**
```
□ ビルド最適化
□ CNAME設定
□ デプロイ
```

### 18.8 更新されたワークフロー図

```
起動
  ↓
難易度選択 → 激辛を含む4つから選択
  ↓
編集モード（初回 or 「盤面を再編集」押下時）
  ↓
パレットから選択 → 盤面に配置
  ↓（繰り返し）
編集完了 → 初期盤面として保存
  ↓
入れ替えモード
  ↓
パネル2つ選択 → 入れ替え → 履歴記録
  ↓（繰り返し）
初期化 → 保存した初期盤面に戻る
```

---

## 19. 2/15追加分その2：スマホUX改善と画像認識

### 19.1 スマホ向け指なぞり配置機能

#### 課題
スマホでの盤面設定時、タップ操作は以下の問題がある：
- 24マス（激辛）を1つずつタップするのは時間がかかる
- パネルサイズが小さい場合、タップミスが発生しやすい
- より直感的な入力方法が求められる

#### 解決策：ドラッグ＆ペイント方式

**操作フロー:**
```
1. パレットからパネルを選択（例: "B"をタップ）
   → 選択状態になる

2. 盤面グリッド上を指でなぞる
   → なぞったマス全てに選択中のパネルが配置される
   → リアルタイムでプレビュー表示

3. 指を離す
   → 配置確定
```

#### タッチイベント実装

**カスタムフック: useTouchDrag.ts**
```typescript
interface TouchDragState {
  isDragging: boolean;
  currentPanel: string | null;
  touchedCells: Set<string>;  // "row-col"形式でタッチ済みセルを追跡
}

export const useTouchDrag = (
  selectedPanel: string | null,
  onPlacePanel: (row: number, col: number) => void
) => {
  const [dragState, setDragState] = useState<TouchDragState>({
    isDragging: false,
    currentPanel: null,
    touchedCells: new Set()
  });

  const handleTouchStart = (e: TouchEvent) => {
    if (!selectedPanel) return;
    
    // デフォルトのスクロール動作を防止
    e.preventDefault();
    
    setDragState({
      isDragging: true,
      currentPanel: selectedPanel,
      touchedCells: new Set()
    });
    
    // 開始位置のマスに配置
    const cell = getCellFromTouch(e.touches[0]);
    if (cell) {
      onPlacePanel(cell.row, cell.col);
      setDragState(prev => ({
        ...prev,
        touchedCells: new Set([`${cell.row}-${cell.col}`])
      }));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragState.isDragging) return;
    
    e.preventDefault();
    const cell = getCellFromTouch(e.touches[0]);
    
    if (cell) {
      const cellKey = `${cell.row}-${cell.col}`;
      
      // まだ触れていないマスなら配置
      if (!dragState.touchedCells.has(cellKey)) {
        onPlacePanel(cell.row, cell.col);
        setDragState(prev => ({
          ...prev,
          touchedCells: new Set([...prev.touchedCells, cellKey])
        }));
      }
    }
  };

  const handleTouchEnd = () => {
    setDragState({
      isDragging: false,
      currentPanel: null,
      touchedCells: new Set()
    });
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging: dragState.isDragging
  };
};

// タッチ座標からグリッドのセルを特定
const getCellFromTouch = (touch: Touch): { row: number; col: number } | null => {
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  
  if (element?.dataset.row && element?.dataset.col) {
    return {
      row: parseInt(element.dataset.row),
      col: parseInt(element.dataset.col)
    };
  }
  
  return null;
};
```

#### BoardGridコンポーネントの更新

```typescript
const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  editMode,
  selectedPalettePanel,
  onPlacePanel,
  onPanelClick
}) => {
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging
  } = useTouchDrag(
    editMode ? selectedPalettePanel : null,
    onPlacePanel
  );
  
  return (
    <div 
      className={`grid gap-2 w-fit mx-auto ${isDragging ? 'select-none' : ''}`}
      onTouchStart={editMode ? handleTouchStart : undefined}
      onTouchMove={editMode ? handleTouchMove : undefined}
      onTouchEnd={editMode ? handleTouchEnd : undefined}
      style={{
        // タッチアクション無効化でスクロール防止
        touchAction: editMode ? 'none' : 'auto'
      }}
    >
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((panel, colIndex) => (
            <PanelCell
              key={`${rowIndex}-${colIndex}`}
              panel={panel}
              size={getPanelSize()}
              isSelected={!editMode && (
                selectedPanels[0]?.id === panel.id ||
                selectedPanels[1]?.id === panel.id
              )}
              isEditMode={editMode}
              onClick={() => onPanelClick(panel)}
              // data属性でセル位置を特定可能にする
              data-row={rowIndex}
              data-col={colIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
```

#### PanelCellコンポーネントの更新

```typescript
interface PanelCellProps {
  panel: Panel;
  size: string;
  isSelected: boolean;
  isEditMode: boolean;
  onClick: () => void;
  'data-row': number;
  'data-col': number;
}

const PanelCell: React.FC<PanelCellProps> = ({
  panel,
  size,
  isSelected,
  isEditMode,
  onClick,
  'data-row': dataRow,
  'data-col': dataCol
}) => {
  const styles = PANEL_STYLES[panel.type];
  
  // 空のマス
  if (!panel.label) {
    return (
      <button
        onClick={onClick}
        data-row={dataRow}
        data-col={dataCol}
        className={`
          ${size} rounded-lg text-2xl font-bold
          border-2 border-dashed border-gray-400
          bg-gray-100
          ${isEditMode ? 'hover:bg-gray-200 active:bg-gray-300' : 'cursor-not-allowed'}
          transition-all duration-200
        `}
        disabled={!isEditMode}
      >
        　
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      data-row={dataRow}
      data-col={dataCol}
      className={`
        ${size} rounded-lg text-2xl font-bold
        transition-all duration-200
        ${styles.background}
        ${styles.hover}
        ${styles.text}
        ${isSelected ? styles.selected : ''}
        ${panel.type === 'shuffle' ? styles.pulse : ''}
        ${panel.type === 'chance' ? styles.glow : ''}
        ${isEditMode ? 'active:scale-95' : 'active:scale-90'}
      `}
    >
      {panel.label}
    </button>
  );
};
```

#### UI/UXフィードバック

**ドラッグ中の視覚的フィードバック:**
```typescript
// ドラッグ中はグリッド全体に視覚効果
const gridClassName = `
  grid gap-2 w-fit mx-auto
  ${isDragging ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}
  ${isDragging ? 'select-none' : ''}
`;

// 操作ガイドの表示
{editMode && (
  <div className="text-center mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
    <p className="text-sm text-blue-800 font-medium">
      💡 タップで1マス、指でなぞって連続配置
    </p>
    <p className="text-xs text-blue-600 mt-1">
      パレットから選択 → 盤面をタップ or なぞる
    </p>
  </div>
)}
```

#### パフォーマンス最適化

```typescript
// スロットリングで過度な更新を防ぐ
const throttledPlacePanel = useCallback(
  throttle((row: number, col: number) => {
    dispatch({ type: 'PLACE_PANEL', payload: { row, col } });
  }, 50),  // 50ms間隔
  []
);
```

### 19.2 カメラ/画像認識による盤面読み取り機能

#### 概要
ゲーム画面のスクリーンショットをカメラまたはファイルアップロードで読み取り、自動的に盤面を設定する機能。

#### 判定ロジック
```
1. 画像内のパネルを検出（グリッド分割）
2. パネルの画像特徴を抽出
3. 同一パネルの検出:
   【景品パネル判定】
   - 2枚ペアで存在する → 景品パネル（A-K）
   - アルファベット順に自動割り当て
   
   【特殊パネル判定】
   - 1枚のみ存在 かつ 黄色系 → チャンスパネル（+）
   - 1枚のみ存在 かつ 紫色系 → シャッフルパネル（-）
   
4. 検出結果を盤面に配置
```

#### テスト画像データ構造

```
.test_images/
├── easy/
│   ├── sample1.png           # 盤面全体のサンプル画像
│   ├── panel_prize_01.png    # 景品パネルの参照画像
│   ├── panel_prize_02.png
│   ├── panel_chance.png      # チャンスパネル（黄色）
│   └── panel_shuffle.png     # シャッフルパネル（紫色）
├── medium/
│   └── ...
├── hard/
│   └── ...
└── expert/
    └── ...
```

#### データ型定義

```typescript
interface RecognitionResult {
  success: boolean;
  confidence: number;  // 0-1の信頼度
  panels: DetectedPanel[];
  errors?: string[];
  processingTime: number;  // ms
}

interface DetectedPanel {
  position: { row: number; col: number };
  type: 'prize' | 'chance' | 'shuffle';
  label: string;  // A-K, +, -
  confidence: number;  // この判定の信頼度
  imageHash?: string;  // 画像のハッシュ値（デバッグ用）
}

interface PanelGroup {
  hash: string;
  members: {
    row: number;
    col: number;
    imageData: ImageData;
  }[];
  dominantColor?: RGB;
}
```

#### 画像認識エンジンの実装

**PanelRecognizer.ts**
```typescript
export class PanelRecognizer {
  private difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  private gridSize: { rows: number; cols: number };
  
  constructor(difficulty: string) {
    this.difficulty = difficulty as any;
    this.gridSize = this.getGridSize(difficulty);
  }
  
  private getGridSize(difficulty: string) {
    const sizes = {
      easy: { rows: 3, cols: 4 },
      medium: { rows: 4, cols: 4 },
      hard: { rows: 4, cols: 5 },
      expert: { rows: 4, cols: 6 }
    };
    return sizes[difficulty];
  }
  
  /**
   * メイン認識処理
   */
  async recognizeFromImage(imageFile: File): Promise<RecognitionResult> {
    const startTime = performance.now();
    
    try {
      // 1. 画像を読み込み
      const image = await this.loadImage(imageFile);
      
      // 2. グリッド領域を検出
      const gridRegion = this.detectGridRegion(image);
      
      // 3. 各セルを切り出し
      const cells = this.extractCells(image, gridRegion);
      
      // 4. セルをグループ化（同一画像を検出）
      const groups = await this.groupSimilarCells(cells);
      
      // 5. 各グループをパネル種類に分類
      const panels = this.classifyPanelGroups(groups);
      
      // 6. 信頼度を計算
      const confidence = this.calculateConfidence(panels);
      
      const processingTime = performance.now() - startTime;
      
      return {
        success: true,
        confidence,
        panels,
        processingTime
      };
      
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        panels: [],
        errors: [error.message],
        processingTime: performance.now() - startTime
      };
    }
  }
  
  /**
   * 画像を読み込んでImageDataに変換
   */
  private async loadImage(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          resolve(imageData);
        };
        
        img.onerror = () => reject(new Error('画像の読み込みに失敗'));
        img.src = e.target!.result as string;
      };
      
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗'));
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * グリッド領域を検出（簡易版：画像全体を等分割）
   */
  private detectGridRegion(image: ImageData) {
    return {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height
    };
  }
  
  /**
   * 各セルを切り出し
   */
  private extractCells(image: ImageData, region: any): CellData[] {
    const { rows, cols } = this.gridSize;
    const cellWidth = region.width / cols;
    const cellHeight = region.height / rows;
    
    const cells: CellData[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = Math.floor(region.x + col * cellWidth);
        const y = Math.floor(region.y + row * cellHeight);
        const w = Math.floor(cellWidth);
        const h = Math.floor(cellHeight);
        
        // セル画像を切り出し
        const cellImageData = this.extractRegion(image, x, y, w, h);
        
        cells.push({
          row,
          col,
          imageData: cellImageData
        });
      }
    }
    
    return cells;
  }
  
  /**
   * 画像の一部を切り出し
   */
  private extractRegion(
    source: ImageData,
    x: number,
    y: number,
    width: number,
    height: number
  ): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(source, 0, 0);
    
    return ctx.getImageData(x, y, width, height);
  }
  
  /**
   * セルをグループ化（パーセプチュアルハッシュで類似画像を検出）
   */
  private async groupSimilarCells(cells: CellData[]): Promise<PanelGroup[]> {
    const groups: PanelGroup[] = [];
    const threshold = 0.85;  // 類似度閾値
    
    for (const cell of cells) {
      const hash = await this.calculatePerceptualHash(cell.imageData);
      
      // 既存グループに追加できるか確認
      let addedToGroup = false;
      for (const group of groups) {
        const similarity = this.compareHashes(hash, group.hash);
        
        if (similarity >= threshold) {
          group.members.push(cell);
          addedToGroup = true;
          break;
        }
      }
      
      // 新しいグループを作成
      if (!addedToGroup) {
        const dominantColor = this.getDominantColor(cell.imageData);
        groups.push({
          hash,
          members: [cell],
          dominantColor
        });
      }
    }
    
    return groups;
  }
  
  /**
   * パーセプチュアルハッシュ計算（簡易版）
   */
  private async calculatePerceptualHash(imageData: ImageData): Promise<string> {
    // 8x8にリサイズ
    const resized = this.resizeImage(imageData, 8, 8);
    
    // グレースケール化
    const gray = this.toGrayscale(resized);
    
    // 平均値を計算
    const avg = this.calculateAverage(gray);
    
    // ハッシュ生成（平均より明るい=1、暗い=0）
    let hash = '';
    for (let i = 0; i < gray.length; i++) {
      hash += gray[i] >= avg ? '1' : '0';
    }
    
    return hash;
  }
  
  /**
   * ハッシュ間の類似度計算（ハミング距離）
   */
  private compareHashes(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;
    
    let differences = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) differences++;
    }
    
    const similarity = 1 - (differences / hash1.length);
    return similarity;
  }
  
  /**
   * グループをパネル種類に分類
   */
  private classifyPanelGroups(groups: PanelGroup[]): DetectedPanel[] {
    const panels: DetectedPanel[] = [];
    let prizeIndex = 0;
    const prizeLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    
    // グループサイズでソート（2枚ペアを優先）
    groups.sort((a, b) => b.members.length - a.members.length);
    
    for (const group of groups) {
      const groupSize = group.members.length;
      
      if (groupSize === 2) {
        // 2枚ペア → 景品パネル
        const label = prizeLabels[prizeIndex];
        prizeIndex++;
        
        for (const member of group.members) {
          panels.push({
            position: { row: member.row, col: member.col },
            type: 'prize',
            label,
            confidence: 0.9,
            imageHash: group.hash
          });
        }
        
      } else if (groupSize === 1) {
        // 1枚のみ → 特殊パネル（色で判定）
        const member = group.members[0];
        const type = this.classifySpecialPanel(group.dominantColor!);
        
        panels.push({
          position: { row: member.row, col: member.col },
          type,
          label: type === 'chance' ? '+' : '-',
          confidence: 0.85,
          imageHash: group.hash
        });
      }
    }
    
    return panels;
  }
  
  /**
   * 特殊パネルの分類（色ベース）
   */
  private classifySpecialPanel(color: RGB): 'chance' | 'shuffle' {
    const hsv = this.rgbToHsv(color);
    
    // 黄色判定（色相: 40-70度、彩度 > 50%）
    if (hsv.h >= 40 && hsv.h <= 70 && hsv.s > 0.5) {
      return 'chance';
    }
    
    // 紫色判定（色相: 270-290度、彩度 > 40%）
    if ((hsv.h >= 270 && hsv.h <= 290) && hsv.s > 0.4) {
      return 'shuffle';
    }
    
    // デフォルト（判定不能時は紫＝シャッフルとする）
    return 'shuffle';
  }
  
  /**
   * 支配的な色を取得
   */
  private getDominantColor(imageData: ImageData): RGB {
    const pixels = imageData.data;
    let r = 0, g = 0, b = 0;
    const pixelCount = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
    }
    
    return {
      r: Math.round(r / pixelCount),
      g: Math.round(g / pixelCount),
      b: Math.round(b / pixelCount)
    };
  }
  
  /**
   * RGB → HSV変換
   */
  private rgbToHsv(rgb: RGB): HSV {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    if (delta !== 0) {
      if (max === r) {
        h = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        h = 60 * (((b - r) / delta) + 2);
      } else {
        h = 60 * (((r - g) / delta) + 4);
      }
    }
    
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : delta / max;
    const v = max;
    
    return { h, s, v };
  }
  
  /**
   * 画像リサイズ（簡易版）
   */
  private resizeImage(imageData: ImageData, newWidth: number, newHeight: number): ImageData {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    
    tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
    return tempCtx.getImageData(0, 0, newWidth, newHeight);
  }
  
  /**
   * グレースケール化
   */
  private toGrayscale(imageData: ImageData): number[] {
    const gray: number[] = [];
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // 輝度計算
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      gray.push(luminance);
    }
    
    return gray;
  }
  
  /**
   * 平均値計算
   */
  private calculateAverage(values: number[]): number {
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }
  
  /**
   * 信頼度計算
   */
  private calculateConfidence(panels: DetectedPanel[]): number {
    if (panels.length === 0) return 0;
    
    const avgConfidence = panels.reduce((sum, p) => sum + p.confidence, 0) / panels.length;
    
    // 期待されるパネル数と比較
    const expectedCount = this.gridSize.rows * this.gridSize.cols;
    const completeness = panels.length / expectedCount;
    
    return avgConfidence * completeness;
  }
}

// 型定義
interface CellData {
  row: number;
  col: number;
  imageData: ImageData;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSV {
  h: number;  // 0-360
  s: number;  // 0-1
  v: number;  // 0-1
}
```

#### UIコンポーネント実装

**ImageRecognitionPanel.tsx**
```typescript
export const ImageRecognitionPanel: React.FC<ImageRecognitionPanelProps> = ({
  difficulty,
  onRecognitionComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // カメラを起動
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',  // 背面カメラ
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('カメラアクセスエラー:', err);
      alert('カメラへのアクセスに失敗しました。\nブラウザの設定でカメラの許可を確認してください。');
    }
  };
  
  // カメラを停止
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };
  
  // カメラ映像をキャプチャして認識
  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    // キャンバスに描画
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d')!;
    context.drawImage(video, 0, 0);
    
    // Blob化
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });
    
    // 認識実行
    await recognizeImage(new File([blob], 'capture.png', { type: 'image/png' }));
    
    // カメラを停止
    stopCamera();
  };
  
  // ファイルアップロードから認識
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await recognizeImage(file);
  };
  
  // 画像認識処理
  const recognizeImage = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const recognizer = new PanelRecognizer(difficulty);
      const result = await recognizer.recognizeFromImage(file);
      
      setResult(result);
      
      if (result.success && result.confidence > 0.7) {
        // 認識結果を盤面に適用
        onRecognitionComplete(result.panels);
        alert(`盤面を読み取りました！\n信頼度: ${(result.confidence * 100).toFixed(1)}%`);
      } else if (result.success) {
        // 信頼度が低い場合は確認
        const confirmed = confirm(
          `認識精度が低い可能性があります（${(result.confidence * 100).toFixed(1)}%）\n` +
          `それでも適用しますか？`
        );
        if (confirmed) {
          onRecognitionComplete(result.panels);
        }
      } else {
        alert('画像の認識に失敗しました。\n別の画像を試してください。');
      }
      
    } catch (error) {
      console.error('認識エラー:', error);
      alert('エラーが発生しました。');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="mb-4 p-4 border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <h3 className="font-bold mb-3 text-purple-800 flex items-center gap-2">
        <span className="text-2xl">📸</span>
        画像から盤面を読み取り
      </h3>
      
      {/* カメラプレビュー */}
      {cameraActive && (
        <div className="mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
      
      {/* ボタン群 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {!cameraActive ? (
          <>
            <button
              onClick={startCamera}
              disabled={isProcessing}
              className="flex-1 min-w-[140px] px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              📷 カメラで撮影
            </button>
            
            <label className="flex-1 min-w-[140px] px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer text-center font-medium">
              🖼️ 画像を選択
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          </>
        ) : (
          <>
            <button
              onClick={captureAndRecognize}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-medium"
            >
              ✨ 撮影して認識
            </button>
            
            <button
              onClick={stopCamera}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              キャンセル
            </button>
          </>
        )}
      </div>
      
      {/* 処理中インジケーター */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 font-medium">画像を解析中...</span>
        </div>
      )}
      
      {/* 認識結果表示 */}
      {result && !isProcessing && (
        <div className={`p-3 rounded-lg ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`font-medium ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.success 
              ? `✅ 認識成功 (信頼度: ${(result.confidence * 100).toFixed(1)}%)`
              : '❌ 認識失敗'
            }
          </p>
          <p className="text-sm text-gray-600 mt-1">
            処理時間: {result.processingTime.toFixed(0)}ms
          </p>
          {result.errors && result.errors.length > 0 && (
            <p className="text-sm text-red-600 mt-1">
              エラー: {result.errors.join(', ')}
            </p>
          )}
        </div>
      )}
      
      {/* 使い方ヒント */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>💡 ヒント:</strong>
        </p>
        <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside space-y-1">
          <li>盤面全体が写るように撮影してください</li>
          <li>明るい場所で撮影すると精度が上がります</li>
          <li>パネルがはっきり見えるようにピントを合わせてください</li>
        </ul>
      </div>
    </div>
  );
};
```

### 19.3 更新されたファイル構造

```
panera/
├── src/
│   ├── components/
│   │   ├── ImageRecognitionPanel.tsx    // NEW: 画像認識UI
│   │   └── ...
│   ├── hooks/
│   │   └── useTouchDrag.ts               // NEW: タッチドラッグ
│   ├── utils/
│   │   ├── PanelRecognizer.ts            // NEW: 画像認識エンジン
│   │   └── ...
├── .test_images/                         // NEW: テスト画像
│   ├── easy/
│   ├── medium/
│   ├── hard/
│   └── expert/
```

### 19.4 実装フェーズの更新

**Phase 2: エディット機能（4-5時間）** ← 時間増加
```
□ パレット選択ロジック
□ 盤面への配置ロジック
□ タッチドラッグ機能の実装       // NEW
□ 画像認識エンジンの実装         // NEW
□ 画像認識UIコンポーネント       // NEW
□ 編集モードと入れ替えモードの切り替え
□ 初期盤面の保存と復元
□ localStorage連携
```

**総推定時間: 12-16時間**（画像認識機能追加により2-3時間増加）

### 19.5 必要なnpmパッケージ

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "typescript": "^5.0.0",
    // 画像認識は標準Canvas APIを使用するため追加ライブラリ不要
  },
  "devDependencies": {
    "@types/react": "^18.2.0"
  }
}
```

**Note**: 画像認識はブラウザ標準のCanvas APIのみを使用して実装するため、外部ライブラリは不要です。これによりバンドルサイズを最小限に抑えられます。

---

## 20. ライセンス

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

**重要な仕様変更（2/15更新）:**
1. 激辛難易度を追加（4×6、景品11個）
2. 初期パターン選択機能を削除
3. パレット方式の盤面エディット機能を実装
4. 編集モードと入れ替えモードの切り替え機能を実装

**実装の優先順位:**
1. Phase 1-2: 基本UI（パレット、エディット機能）
2. Phase 3: 入れ替え機能
3. Phase 4-5: UX改善とデプロイ

全ての機能が実装されると、ユーザーはパレットから素早くパネルを選択して盤面を設定し、その後の入れ替え操作をトレースできるツールが完成します。
