import type { Panel } from "../../types";
import { getPanelClasses } from "../../styles/panelStyles";

interface PanelCellProps {
  panel: Panel;
  isSelected: boolean;
  isEditMode: boolean;
  onClick: () => void;
}

export function PanelCell({ panel, isSelected, isEditMode, onClick }: PanelCellProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`パネル ${panel.label || "空"} (${panel.position.row}, ${panel.position.col})`}
      aria-pressed={isSelected}
      className={getPanelClasses(panel.type, isSelected, isEditMode)}
    >
      {panel.label || "\u3000"}
    </button>
  );
}
