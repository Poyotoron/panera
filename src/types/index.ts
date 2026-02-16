export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type PanelType = "prize" | "shuffle" | "chance" | "empty";

export interface Panel {
  id: string;
  type: PanelType;
  label: string;
  position: {
    row: number;
    col: number;
  };
}

export interface SwapOperation {
  timestamp: number;
  panel1: { row: number; col: number; label: string };
  panel2: { row: number; col: number; label: string };
}

export interface AppState {
  difficulty: Difficulty;
  board: Panel[][];
  selectedPanel: Panel | null;
  history: SwapOperation[];
  editMode: boolean;
  selectedPalettePanel: string | null;
  initialBoard: Panel[][] | null;
  panelCounts: Record<string, number>;
}

export interface DetectedPanel {
  position: { row: number; col: number };
  type: "prize" | "chance" | "shuffle";
  label: string;
  confidence: number;
  imageHash?: string;
}

export interface RecognitionResult {
  success: boolean;
  confidence: number;
  panels: DetectedPanel[];
  errors?: string[];
  processingTime: number;
}

export type Action =
  | { type: "SET_DIFFICULTY"; payload: Difficulty }
  | { type: "SELECT_PALETTE_PANEL"; payload: string }
  | { type: "PLACE_PANEL"; payload: { row: number; col: number } }
  | { type: "FINISH_EDITING" }
  | { type: "CLEAR_BOARD" }
  | { type: "RE_EDIT" }
  | { type: "LOAD_SAVED_BOARD"; payload: Panel[][] }
  | { type: "APPLY_RECOGNITION"; payload: DetectedPanel[] }
  | { type: "SELECT_PANEL"; payload: Panel }
  | { type: "DESELECT_PANEL" }
  | { type: "SWAP_PANELS"; payload: { panel1: Panel; panel2: Panel } }
  | { type: "RESET_BOARD" }
  | { type: "CLEAR_HISTORY" };
