import type { Action, AppState } from "../types";
import {
  cloneBoard,
  createEmptyBoard,
  applyDetectedPanels,
  placePanelOnBoard,
  swapPanels,
} from "../utils/boardOperations";

export const initialState: AppState = {
  difficulty: "easy",
  board: createEmptyBoard("easy"),
  selectedPanel: null,
  history: [],
  editMode: true,
  selectedPalettePanel: null,
  initialBoard: null,
};

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_DIFFICULTY":
      return {
        ...initialState,
        difficulty: action.payload,
        board: createEmptyBoard(action.payload),
      };

    case "SELECT_PALETTE_PANEL":
      return {
        ...state,
        selectedPalettePanel: action.payload,
      };

    case "PLACE_PANEL": {
      if (state.selectedPalettePanel === null) return state;
      const { row, col } = action.payload;
      return {
        ...state,
        board: placePanelOnBoard(
          state.board,
          row,
          col,
          state.selectedPalettePanel,
        ),
      };
    }

    case "FINISH_EDITING":
      return {
        ...state,
        editMode: false,
        initialBoard: cloneBoard(state.board),
        selectedPalettePanel: null,
        selectedPanel: null,
        history: [],
      };

    case "CLEAR_BOARD":
      return {
        ...state,
        board: createEmptyBoard(state.difficulty),
      };

    case "RE_EDIT":
      return {
        ...state,
        editMode: true,
        selectedPanel: null,
        history: [],
      };

    case "LOAD_SAVED_BOARD":
      return {
        ...state,
        board: action.payload,
        initialBoard: cloneBoard(action.payload),
        editMode: false,
      };

    case "APPLY_RECOGNITION": {
      const newBoard = applyDetectedPanels(state.difficulty, action.payload);
      return {
        ...state,
        board: newBoard,
        editMode: true,
        selectedPalettePanel: null,
        selectedPanel: null,
        history: [],
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
        panel2.position,
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
      if (!state.initialBoard) return state;
      return {
        ...state,
        board: cloneBoard(state.initialBoard),
        selectedPanel: null,
        history: [],
      };
    }

    case "CLEAR_HISTORY":
      return {
        ...state,
        history: [],
      };

    default:
      return state;
  }
}
