import { useAppContext } from "../context/AppContext";
import { INITIAL_PATTERNS } from "../data/patterns";

export function PatternSelector() {
  const { state, dispatch } = useAppContext();

  const patterns = INITIAL_PATTERNS.filter(
    (p) => p.difficulty === state.difficulty
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-semibold text-gray-600 mb-3">
        初期パターン選択
      </h2>
      <div className="flex flex-wrap gap-2 items-center">
        {patterns.map((pattern) => (
          <button
            key={pattern.patternId}
            onClick={() =>
              dispatch({ type: "LOAD_PATTERN", payload: pattern.patternId })
            }
            className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${
              state.selectedPattern === pattern.patternId
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            パターン{pattern.patternId}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-600">カスタム編集</label>
          <button
            onClick={() => dispatch({ type: "TOGGLE_EDIT_MODE" })}
            disabled={state.board.length === 0}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              state.isEditMode ? "bg-indigo-600" : "bg-gray-300"
            } ${state.board.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                state.isEditMode ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
