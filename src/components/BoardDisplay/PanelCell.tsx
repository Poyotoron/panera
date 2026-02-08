import type { Panel } from "../../types";
import { getPanelClasses } from "../../styles/panelStyles";

interface PanelCellProps {
  panel: Panel;
  isSelected: boolean;
  onClick: () => void;
}

export function PanelCell({ panel, isSelected, onClick }: PanelCellProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`パネル ${panel.label} (${panel.position.row}, ${panel.position.col})`}
      aria-pressed={isSelected}
      className={getPanelClasses(panel.type, isSelected)}
    >
      {panel.label}
    </button>
  );
}
