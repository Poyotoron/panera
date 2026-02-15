import type { Difficulty, Panel } from "../types";

const BOARD_KEY = "panera_initial_board";
const DIFFICULTY_KEY = "panera_difficulty";

export function saveInitialBoard(board: Panel[][], difficulty: Difficulty): void {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(board));
    localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch {
    // localStorage may be full or unavailable
  }
}

export function loadInitialBoard(difficulty: Difficulty): Panel[][] | null {
  try {
    const saved = localStorage.getItem(BOARD_KEY);
    const savedDifficulty = localStorage.getItem(DIFFICULTY_KEY);
    if (saved && savedDifficulty === difficulty) {
      return JSON.parse(saved);
    }
  } catch {
    // corrupted data
  }
  return null;
}

export function clearSavedBoard(): void {
  try {
    localStorage.removeItem(BOARD_KEY);
    localStorage.removeItem(DIFFICULTY_KEY);
  } catch {
    // ignore
  }
}
