import type { Panel, PanelType } from "../types";

export function labelToPanelType(label: string): PanelType {
  if (label === "+") return "chance";
  if (label === "-") return "shuffle";
  return "prize";
}

export function layoutToBoard(layout: string[][]): Panel[][] {
  return layout.map((row, rowIndex) =>
    row.map((label, colIndex) => ({
      id: `${rowIndex}-${colIndex}`,
      type: labelToPanelType(label),
      label,
      position: { row: rowIndex, col: colIndex },
    }))
  );
}

export function swapPanels(
  board: Panel[][],
  p1: { row: number; col: number },
  p2: { row: number; col: number }
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

const EDIT_CYCLE = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "+", "-",
];

export function getNextLabel(currentLabel: string): string {
  const index = EDIT_CYCLE.indexOf(currentLabel);
  if (index === -1) return "A";
  return EDIT_CYCLE[(index + 1) % EDIT_CYCLE.length];
}

export function cyclePanel(panel: Panel): Panel {
  const nextLabel = getNextLabel(panel.label);
  return {
    ...panel,
    label: nextLabel,
    type: labelToPanelType(nextLabel),
  };
}
