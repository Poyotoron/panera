import { useAppContext } from "../context/AppContext";
import { saveInitialBoard } from "../utils/localStorage";

export function ActionButtons() {
  const { state, dispatch } = useAppContext();

  if (state.editMode) {
    function handleClearBoard() {
      dispatch({ type: "CLEAR_BOARD" });
    }

    function handleFinishEditing() {
      dispatch({ type: "FINISH_EDITING" });
      saveInitialBoard(state.board, state.difficulty);
    }

    return (
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleClearBoard}
          className="px-5 py-2 rounded-lg font-bold text-sm transition-colors bg-gray-500 text-white hover:bg-gray-600"
        >
          盤面をクリア
        </button>
        <button
          onClick={handleFinishEditing}
          className="px-5 py-2 rounded-lg font-bold text-sm transition-colors bg-blue-500 text-white hover:bg-blue-600"
        >
          編集完了
        </button>
      </div>
    );
  }

  function handleReEdit() {
    if (window.confirm("盤面を再編集しますか？（履歴はクリアされます）")) {
      dispatch({ type: "RE_EDIT" });
    }
  }

  function handleReset() {
    if (!state.initialBoard) return;
    if (window.confirm("盤面を初期状態に戻しますか？")) {
      dispatch({ type: "RESET_BOARD" });
    }
  }

  function handleClearHistory() {
    dispatch({ type: "CLEAR_HISTORY" });
  }

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <button
        onClick={handleReEdit}
        className="px-5 py-2 rounded-lg font-bold text-sm transition-colors bg-yellow-500 text-white hover:bg-yellow-600"
      >
        盤面を再編集
      </button>
      <button
        onClick={handleReset}
        disabled={!state.initialBoard}
        className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
          state.initialBoard
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
