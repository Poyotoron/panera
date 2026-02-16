import type { DetectedPanel, Difficulty, Panel, PanelType } from "../types";
import { DIFFICULTY_CONFIG } from "../data/difficultyConfig";

export function labelToPanelType(label: string): PanelType {
  if (label === "+") return "chance";
  if (label === "-") return "shuffle";
  if (label === "") return "empty";
  return "prize";
}

export function layoutToBoard(layout: string[][]): Panel[][] {
  return layout.map((row, rowIndex) =>
    row.map((label, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      type: labelToPanelType(label),
      label,
      position: { row: rowIndex, col: colIndex },
    })),
  );
}

export function createEmptyBoard(difficulty: Difficulty): Panel[][] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const board: Panel[][] = [];
  for (let r = 0; r < config.rows; r++) {
    const row: Panel[] = [];
    for (let c = 0; c < config.cols; c++) {
      row.push({
        id: `${r}-${c}`,
        type: "empty",
        label: "",
        position: { row: r, col: c },
      });
    }
    board.push(row);
  }
  return board;
}

export function swapPanels(
  board: Panel[][],
  p1: { row: number; col: number },
  p2: { row: number; col: number },
): Panel[][] {
  const newBoard = board.map((row) => row.map((panel) => ({ ...panel })));

  const temp = {
    type: newBoard[p1.row][p1.col].type,
    label: newBoard[p1.row][p1.col].label,
  };

  newBoard[p1.row][p1.col].type = newBoard[p2.row][p2.col].type;
  newBoard[p1.row][p1.col].label = newBoard[p2.row][p2.col].label;

  newBoard[p2.row][p2.col].type = temp.type;
  newBoard[p2.row][p2.col].label = temp.label;

  return newBoard;
}

export function cloneBoard(board: Panel[][]): Panel[][] {
  return board.map((row) => row.map((panel) => ({ ...panel })));
}

export function countPanelLabels(board: Panel[][]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of board) {
    for (const panel of row) {
      if (!panel.label) continue;
      counts[panel.label] = (counts[panel.label] ?? 0) + 1;
    }
  }
  return counts;
}

export function placePanelOnBoard(
  board: Panel[][],
  row: number,
  col: number,
  label: string,
): Panel[][] {
  const newBoard = board.map((r) => r.map((p) => ({ ...p })));
  newBoard[row][col] = {
    ...newBoard[row][col],
    label,
    type: labelToPanelType(label),
  };
  return newBoard;
}

export function applyDetectedPanels(
  difficulty: Difficulty,
  detectedPanels: DetectedPanel[],
): Panel[][] {
  const board = createEmptyBoard(difficulty);
  for (const detected of detectedPanels) {
    const { row, col } = detected.position;
    if (!board[row] || !board[row][col]) continue;
    board[row][col] = {
      ...board[row][col],
      label: detected.label,
      type: labelToPanelType(detected.label),
    };
  }
  return board;
}
