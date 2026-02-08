import type { Action, AppState } from "../types";
import { INITIAL_PATTERNS } from "../data/patterns";
import { cyclePanel, layoutToBoard, swapPanels } from "../utils/boardOperations";

export const initialState: AppState = {
  difficulty: "easy",
  selectedPattern: null,
  board: [],
  selectedPanel: null,
  history: [],
  isEditMode: false,
};

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_DIFFICULTY":
      return {
        ...initialState,
        difficulty: action.payload,
      };

    case "LOAD_PATTERN": {
      const pattern = INITIAL_PATTERNS.find(
        (p) =>
          p.difficulty === state.difficulty && p.patternId === action.payload
      );
      if (!pattern) return state;
      return {
        ...state,
        selectedPattern: action.payload,
        board: layoutToBoard(pattern.layout),
        selectedPanel: null,
        history: [],
        isEditMode: false,
      };
    }

    case "SELECT_PANEL":
      return {
        ...state,
        selectedPanel: action.payload,
      };

    case "DESELECT_PANEL":
      return {
        ...state,
        selectedPanel: null,
      };

    case "SWAP_PANELS": {
      const { panel1, panel2 } = action.payload;
      const newBoard = swapPanels(
        state.board,
        panel1.position,
        panel2.position
      );
      return {
        ...state,
        board: newBoard,
        selectedPanel: null,
        history: [
          ...state.history,
          {
            timestamp: Date.now(),
            panel1: {
              row: panel1.position.row,
              col: panel1.position.col,
              label: panel1.label,
            },
            panel2: {
              row: panel2.position.row,
              col: panel2.position.col,
              label: panel2.label,
            },
          },
        ],
      };
    }

    case "RESET_BOARD": {
      if (state.selectedPattern === null) return state;
      const pattern = INITIAL_PATTERNS.find(
        (p) =>
          p.difficulty === state.difficulty &&
          p.patternId === state.selectedPattern
      );
      if (!pattern) return state;
      return {
        ...state,
        board: layoutToBoard(pattern.layout),
        selectedPanel: null,
        history: [],
      };
    }

    case "CLEAR_HISTORY":
      return {
        ...state,
        history: [],
      };

    case "TOGGLE_EDIT_MODE":
      return {
        ...state,
        isEditMode: !state.isEditMode,
        selectedPanel: null,
      };

    case "EDIT_PANEL": {
      const panel = action.payload;
      const newBoard = state.board.map((row) => row.map((p) => ({ ...p })));
      const cycled = cyclePanel(panel);
      newBoard[panel.position.row][panel.position.col] = cycled;
      return {
        ...state,
        board: newBoard,
      };
    }

    default:
      return state;
  }
}
