import { useAppContext } from "../../context/AppContext";
import { PanelCell } from "./PanelCell";

export function BoardGrid() {
  const { state, dispatch } = useAppContext();

  if (state.board.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
        パターンを選択してください
      </div>
    );
  }

  function handlePanelClick(panel: (typeof state.board)[number][number]) {
    if (state.isEditMode) {
      dispatch({ type: "EDIT_PANEL", payload: panel });
      return;
    }

    if (state.selectedPanel === null) {
      dispatch({ type: "SELECT_PANEL", payload: panel });
    } else if (state.selectedPanel.id === panel.id) {
      dispatch({ type: "DESELECT_PANEL" });
    } else {
      dispatch({
        type: "SWAP_PANELS",
        payload: { panel1: state.selectedPanel, panel2: panel },
      });
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col gap-2 items-center">
        {state.board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((panel) => (
              <PanelCell
                key={panel.id}
                panel={panel}
                isSelected={state.selectedPanel?.id === panel.id}
                onClick={() => handlePanelClick(panel)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-sm text-gray-500">
        {state.isEditMode ? (
          <span className="text-indigo-600 font-semibold">
            編集モード: パネルをクリックして種類を変更
          </span>
        ) : state.selectedPanel ? (
          <span>
            選択中:{" "}
            <span className="font-bold">
              {state.selectedPanel.label}({state.selectedPanel.position.row},
              {state.selectedPanel.position.col})
            </span>
          </span>
        ) : (
          <span>パネルをクリックして選択</span>
        )}
      </div>
    </div>
  );
}
