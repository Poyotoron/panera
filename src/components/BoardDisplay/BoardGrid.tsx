import { useAppContext } from "../../context/AppContext";
import { PanelCell } from "./PanelCell";

export function BoardGrid() {
  const { state, dispatch } = useAppContext();

  function handlePanelClick(panel: (typeof state.board)[number][number]) {
    if (state.editMode) {
      // In edit mode, place the selected palette panel
      dispatch({
        type: "PLACE_PANEL",
        payload: { row: panel.position.row, col: panel.position.col },
      });
      return;
    }

    // In swap mode
    if (panel.type === "empty") return;

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
                isSelected={!state.editMode && state.selectedPanel?.id === panel.id}
                isEditMode={state.editMode}
                onClick={() => handlePanelClick(panel)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-sm text-gray-500">
        {state.editMode ? (
          <span className="text-indigo-600 font-semibold">
            {state.selectedPalettePanel !== null
              ? `編集モード: パレットから「${state.selectedPalettePanel === "" ? "消去" : state.selectedPalettePanel}」を選択中`
              : "編集モード: パレットからパネルを選択してください"}
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
      <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-blue-500" />
          景品
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-green-500" />
          +: チャンス
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-red-600" />
          -: シャッフル
        </span>
      </div>
    </div>
  );
}
