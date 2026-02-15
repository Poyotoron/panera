import type { PanelType } from "../types";

interface PanelStyle {
  background: string;
  hover: string;
  selected: string;
  text: string;
  extra?: string;
}

export const PANEL_STYLES: Record<PanelType, PanelStyle> = {
  prize: {
    background: "bg-blue-500",
    hover: "hover:bg-blue-600",
    selected: "ring-4 ring-blue-300",
    text: "text-white font-bold",
  },
  shuffle: {
    background: "bg-red-600",
    hover: "hover:bg-red-700",
    selected: "ring-4 ring-red-300",
    text: "text-white font-bold",
    extra: "animate-pulse",
  },
  chance: {
    background: "bg-green-500",
    hover: "hover:bg-green-600",
    selected: "ring-4 ring-green-300",
    text: "text-white font-bold",
    extra: "shadow-lg shadow-green-400/50",
  },
  empty: {
    background: "bg-gray-100",
    hover: "hover:bg-gray-200",
    selected: "",
    text: "text-gray-400",
  },
};

export function getPanelClasses(
  type: PanelType,
  isSelected: boolean,
  isEditMode: boolean
): string {
  const style = PANEL_STYLES[type];

  if (type === "empty") {
    return [
      "w-14 h-14 sm:w-16 sm:h-16 rounded-lg text-xl sm:text-2xl",
      "transition-all duration-200",
      "border-2 border-dashed border-gray-400",
      style.background,
      isEditMode ? "hover:bg-gray-200 cursor-pointer" : "cursor-default",
      style.text,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    "w-14 h-14 sm:w-16 sm:h-16 rounded-lg text-xl sm:text-2xl font-bold",
    "transition-all duration-200 cursor-pointer",
    "active:scale-95",
    style.background,
    style.hover,
    style.text,
    isSelected ? style.selected : "",
    style.extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}
