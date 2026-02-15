import { useCallback, useRef, useState } from "react";
import type React from "react";

type CellPosition = { row: number; col: number } | null;
type TouchPoint = { clientX: number; clientY: number };

function getCellFromTouch(touch: TouchPoint): CellPosition {
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!element) return null;
  const row = element.getAttribute("data-row");
  const col = element.getAttribute("data-col");
  if (row === null || col === null) return null;
  const parsedRow = Number(row);
  const parsedCol = Number(col);
  if (Number.isNaN(parsedRow) || Number.isNaN(parsedCol)) return null;
  return { row: parsedRow, col: parsedCol };
}

export function useTouchDrag(
  selectedPanel: string | null,
  onPlacePanel: (row: number, col: number) => void,
) {
  const [isDragging, setIsDragging] = useState(false);
  const touchedCellsRef = useRef<Set<string>>(new Set());

  const resetDragState = useCallback(() => {
    touchedCellsRef.current.clear();
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!selectedPanel) return;
      event.preventDefault();
      touchedCellsRef.current.clear();
      setIsDragging(true);
      const cell = getCellFromTouch(event.touches[0]);
      if (!cell) return;
      const key = `${cell.row}-${cell.col}`;
      touchedCellsRef.current.add(key);
      onPlacePanel(cell.row, cell.col);
    },
    [onPlacePanel, selectedPanel],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isDragging) return;
      event.preventDefault();
      const cell = getCellFromTouch(event.touches[0]);
      if (!cell) return;
      const key = `${cell.row}-${cell.col}`;
      if (touchedCellsRef.current.has(key)) return;
      touchedCellsRef.current.add(key);
      onPlacePanel(cell.row, cell.col);
    },
    [isDragging, onPlacePanel],
  );

  const handleTouchEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  return {
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
