import type { Action, AppState } from "../types";
import {
  cloneBoard,
  countPanelLabels,
  createEmptyBoard,
  applyDetectedPanels,
  placePanelOnBoard,
  swapPanels,
} from "../utils/boardOperations";
import { PRIZE_LABELS } from "../data/difficultyConfig";

function getRequiredCount(label: string, prizes: string[]): number {
  if (prizes.includes(label)) return 2;
  if (label === "+" || label === "-") return 1;
  return 0;
}

function shouldAutoTransition(
  label: string,
  prevCounts: Record<string, number>,
  newCounts: Record<string, number>,
  difficulty: AppState["difficulty"],
): boolean {
  const prizes = PRIZE_LABELS[difficulty];
  const required = getRequiredCount(label, prizes);
  if (required === 0) return false;
  const prev = prevCounts[label] ?? 0;
  const next = newCounts[label] ?? 0;
  return prev < required && next >= required;
}

function getNextPanelLabel(
  currentLabel: string,
  counts: Record<string, number>,
  difficulty: AppState["difficulty"],
): string | null {
  const prizes = PRIZE_LABELS[difficulty];

  if (prizes.includes(currentLabel)) {
    const startIndex = prizes.indexOf(currentLabel) + 1;
    for (let i = startIndex; i < prizes.length; i += 1) {
      const prize = prizes[i];
      if ((counts[prize] ?? 0) < 2) return prize;
    }
    if ((counts["+"] ?? 0) < 1) return "+";
    if ((counts["-"] ?? 0) < 1) return "-";
    return null;
  }

  if (currentLabel === "+" || currentLabel === "-") {
    for (const prize of prizes) {
      if ((counts[prize] ?? 0) < 2) return prize;
    }
    const otherSpecial = currentLabel === "+" ? "-" : "+";
    if ((counts[otherSpecial] ?? 0) < 1) return otherSpecial;
    return null;
  }

  return null;
}

export const initialState: AppState = {
  difficulty: "easy",
  board: createEmptyBoard("easy"),
  selectedPanel: null,
  history: [],
  editMode: true,
  selectedPalettePanel: null,
  initialBoard: null,
  panelCounts: {},
};

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_DIFFICULTY":
      return {
        ...initialState,
        difficulty: action.payload,
        board: createEmptyBoard(action.payload),
        panelCounts: {},
      };

    case "SELECT_PALETTE_PANEL":
      return {
        ...state,
        selectedPalettePanel: action.payload,
      };

    case "PLACE_PANEL": {
      const selectedLabel = state.selectedPalettePanel;
      if (selectedLabel === null) return state;
      const { row, col } = action.payload;
      const newBoard = placePanelOnBoard(
        state.board,
        row,
        col,
        selectedLabel,
      );
      const newCounts = countPanelLabels(newBoard);
      let nextSelected = selectedLabel;

      if (
        selectedLabel !== "" &&
        shouldAutoTransition(
          selectedLabel,
          state.panelCounts,
          newCounts,
          state.difficulty,
        )
      ) {
        nextSelected = getNextPanelLabel(
          selectedLabel,
          newCounts,
          state.difficulty,
        );
      }

      return {
        ...state,
        board: newBoard,
        panelCounts: newCounts,
        selectedPalettePanel: nextSelected,
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
        panelCounts: countPanelLabels(state.board),
      };

    case "CLEAR_BOARD":
      return {
        ...state,
        board: createEmptyBoard(state.difficulty),
        panelCounts: {},
        selectedPalettePanel: PRIZE_LABELS[state.difficulty][0] ?? null,
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
        panelCounts: countPanelLabels(action.payload),
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
        panelCounts: countPanelLabels(newBoard),
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
        panelCounts: countPanelLabels(state.initialBoard),
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
