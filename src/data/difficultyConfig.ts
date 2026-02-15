import type { Difficulty } from "../types";

export interface DifficultyConfig {
  rows: number;
  cols: number;
  prizes: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 3, cols: 4, prizes: 5 },
  medium: { rows: 4, cols: 4, prizes: 7 },
  hard: { rows: 4, cols: 5, prizes: 9 },
  expert: { rows: 4, cols: 6, prizes: 11 },
};

export const PRIZE_LABELS: Record<Difficulty, string[]> = {
  easy: ["A", "B", "C", "D", "E"],
  medium: ["A", "B", "C", "D", "E", "F", "G"],
  hard: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
  expert: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "甘口",
  medium: "中辛",
  hard: "辛口",
  expert: "激辛",
};
