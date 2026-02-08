import { useAppContext } from "../context/AppContext";

export function ActionButtons() {
  const { state, dispatch } = useAppContext();

  const canReset = state.selectedPattern !== null && state.board.length > 0;

  function handleReset() {
    if (!canReset) return;
    if (window.confirm("盤面を初期状態に戻しますか？")) {
      dispatch({ type: "RESET_BOARD" });
    }
  }

  function handleClearHistory() {
    dispatch({ type: "CLEAR_HISTORY" });
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={handleReset}
        disabled={!canReset}
        className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
          canReset
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        初期化
      </button>
      <button
        onClick={handleClearHistory}
        disabled={state.history.length === 0}
        className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
          state.history.length > 0
            ? "bg-gray-500 text-white hover:bg-gray-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        履歴をクリア
      </button>
    </div>
  );
}
