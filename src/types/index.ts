export type Difficulty = "easy" | "medium" | "hard";

export type PanelType = "prize" | "shuffle" | "chance";

export interface Panel {
  id: string;
  type: PanelType;
  label: string;
  position: {
    row: number;
    col: number;
  };
}

export interface BoardPattern {
  difficulty: Difficulty;
  patternId: number;
  layout: string[][];
}

export interface SwapOperation {
  timestamp: number;
  panel1: { row: number; col: number; label: string };
  panel2: { row: number; col: number; label: string };
}

export interface AppState {
  difficulty: Difficulty;
  selectedPattern: number | null;
  board: Panel[][];
  selectedPanel: Panel | null;
  history: SwapOperation[];
  isEditMode: boolean;
}

export type Action =
  | { type: "SET_DIFFICULTY"; payload: Difficulty }
  | { type: "LOAD_PATTERN"; payload: number }
  | { type: "SELECT_PANEL"; payload: Panel }
  | { type: "DESELECT_PANEL" }
  | { type: "SWAP_PANELS"; payload: { panel1: Panel; panel2: Panel } }
  | { type: "RESET_BOARD" }
  | { type: "CLEAR_HISTORY" }
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "EDIT_PANEL"; payload: Panel };
