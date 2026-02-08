import type { BoardPattern } from "../types";

export const INITIAL_PATTERNS: BoardPattern[] = [
  // 甘口（3×4）
  {
    difficulty: "easy",
    patternId: 1,
    layout: [
      ["A", "A", "+", "-"],
      ["B", "B", "D", "E"],
      ["C", "C", "D", "E"],
    ],
  },
  {
    difficulty: "easy",
    patternId: 2,
    layout: [
      ["A", "A", "B", "-"],
      ["C", "D", "B", "+"],
      ["C", "D", "E", "E"],
    ],
  },
  {
    difficulty: "easy",
    patternId: 3,
    layout: [
      ["A", "B", "C", "+"],
      ["A", "B", "C", "-"],
      ["D", "D", "E", "E"],
    ],
  },
  {
    difficulty: "easy",
    patternId: 4,
    layout: [
      ["A", "B", "B", "-"],
      ["A", "C", "C", "+"],
      ["D", "D", "E", "E"],
    ],
  },

  // 中辛（4×4）
  {
    difficulty: "medium",
    patternId: 1,
    layout: [
      ["A", "A", "-", "+"],
      ["B", "B", "E", "F"],
      ["C", "C", "E", "F"],
      ["D", "D", "G", "G"],
    ],
  },
  {
    difficulty: "medium",
    patternId: 2,
    layout: [
      ["A", "A", "-", "E"],
      ["B", "C", "+", "E"],
      ["B", "C", "F", "F"],
      ["D", "D", "G", "G"],
    ],
  },
  {
    difficulty: "medium",
    patternId: 3,
    layout: [
      ["A", "A", "C", "-"],
      ["B", "B", "C", "+"],
      ["D", "E", "F", "F"],
      ["D", "E", "G", "G"],
    ],
  },

  // 辛口（4×5）
  {
    difficulty: "hard",
    patternId: 1,
    layout: [
      ["A", "C", "C", "G", "G"],
      ["A", "D", "E", "+", "H"],
      ["B", "D", "E", "-", "H"],
      ["B", "F", "F", "I", "I"],
    ],
  },
  {
    difficulty: "hard",
    patternId: 2,
    layout: [
      ["A", "A", "E", "G", "+"],
      ["B", "B", "E", "G", "-"],
      ["C", "C", "F", "H", "I"],
      ["D", "D", "F", "H", "I"],
    ],
  },
  {
    difficulty: "hard",
    patternId: 3,
    layout: [
      ["A", "B", "C", "G", "G"],
      ["A", "B", "C", "+", "-"],
      ["D", "E", "F", "H", "H"],
      ["D", "E", "F", "I", "I"],
    ],
  },
];
