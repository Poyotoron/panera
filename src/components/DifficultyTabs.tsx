import { useAppContext } from "../context/AppContext";
import type { Difficulty } from "../types";

const TABS: { key: Difficulty; label: string }[] = [
  { key: "easy", label: "甘口" },
  { key: "medium", label: "中辛" },
  { key: "hard", label: "辛口" },
  { key: "expert", label: "激辛" },
];

export function DifficultyTabs() {
  const { state, dispatch } = useAppContext();

  return (
    <div className="flex gap-2 justify-center">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => dispatch({ type: "SET_DIFFICULTY", payload: tab.key })}
          className={`px-6 py-2 rounded-lg font-bold text-sm sm:text-base transition-colors ${
            state.difficulty === tab.key
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
