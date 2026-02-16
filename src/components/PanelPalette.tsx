import { useAppContext } from "../context/AppContext";
import { PRIZE_LABELS } from "../data/difficultyConfig";

export function PanelPalette() {
  const { state, dispatch } = useAppContext();
  const prizes = PRIZE_LABELS[state.difficulty];
  const counts = state.panelCounts;

  function getRequiredCount(label: string): number {
    if (prizes.includes(label)) return 2;
    if (label === "+" || label === "-") return 1;
    return 0;
  }

  function getCount(label: string): number {
    return counts[label] ?? 0;
  }

  function handleSelect(label: string) {
    dispatch({ type: "SELECT_PALETTE_PANEL", payload: label });
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-semibold text-gray-600 mb-3">
        パネル選択パレット
      </h2>

      {/* Prize panels */}
      <div className="flex flex-wrap gap-2 mb-2">
        {prizes.map((label) => (
          <button
            key={label}
            onClick={() => handleSelect(label)}
            className={`relative w-12 h-12 rounded-lg font-bold text-lg transition-all ${
              state.selectedPalettePanel === label
                ? "bg-blue-600 text-white ring-4 ring-blue-300 scale-105"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } ${
              getCount(label) >= getRequiredCount(label) ? "opacity-60" : ""
            }`}
          >
            {label}
            <span className="absolute -top-1 -right-1 rounded-full bg-white text-[10px] font-semibold text-blue-700 px-1.5 py-0.5 shadow">
              {getCount(label)}/{getRequiredCount(label)}
            </span>
          </button>
        ))}
      </div>

      {/* Special panels */}
      <div className="flex gap-2">
        <button
          onClick={() => handleSelect("+")}
          className={`relative w-12 h-12 rounded-lg font-bold text-lg transition-all ${
            state.selectedPalettePanel === "+"
              ? "bg-green-600 text-white ring-4 ring-green-300 scale-105"
              : "bg-green-500 text-white hover:bg-green-600"
          } ${getCount("+") >= 1 ? "opacity-60" : ""}`}
        >
          +
          <span className="absolute -top-1 -right-1 rounded-full bg-white text-[10px] font-semibold text-green-700 px-1.5 py-0.5 shadow">
            {getCount("+")}/1
          </span>
        </button>
        <button
          onClick={() => handleSelect("-")}
          className={`relative w-12 h-12 rounded-lg font-bold text-lg transition-all ${
            state.selectedPalettePanel === "-"
              ? "bg-red-700 text-white ring-4 ring-red-300 scale-105"
              : "bg-red-600 text-white hover:bg-red-700"
          } ${getCount("-") >= 1 ? "opacity-60" : ""}`}
        >
          -
          <span className="absolute -top-1 -right-1 rounded-full bg-white text-[10px] font-semibold text-red-700 px-1.5 py-0.5 shadow">
            {getCount("-")}/1
          </span>
        </button>
        <button
          onClick={() => handleSelect("")}
          className={`px-4 h-12 rounded-lg font-bold text-sm transition-all ${
            state.selectedPalettePanel === ""
              ? "bg-gray-600 text-white ring-4 ring-gray-300 scale-105"
              : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
        >
          消去
        </button>
      </div>

      {state.selectedPalettePanel !== null && (
        <p className="mt-2 text-sm text-gray-600">
          選択中:{" "}
          <span className="font-bold text-indigo-600">
            {state.selectedPalettePanel === ""
              ? "消去"
              : state.selectedPalettePanel}
          </span>
        </p>
      )}
    </div>
  );
}
