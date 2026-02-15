import type React from "react";
import type { Panel } from "../../types";
import { getPanelClasses } from "../../styles/panelStyles";

interface PanelCellProps {
  panel: Panel;
  isSelected: boolean;
  isEditMode: boolean;
  onClick: () => void;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerEnter?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  dataRow?: number;
  dataCol?: number;
}

export function PanelCell({
  panel,
  isSelected,
  isEditMode,
  onClick,
  onPointerDown,
  onPointerEnter,
  dataRow,
  dataCol,
}: PanelCellProps) {
  return (
    <button
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      data-row={dataRow}
      data-col={dataCol}
      aria-label={`パネル ${panel.label || "空"} (${panel.position.row}, ${panel.position.col})`}
      aria-pressed={isSelected}
      className={getPanelClasses(panel.type, isSelected, isEditMode)}
      style={isEditMode ? { touchAction: "none" } : undefined}
    >
      {panel.label || "\u3000"}
    </button>
  );
}
