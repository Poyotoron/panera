import { useEffect } from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { Header } from "./components/Header";
import { DifficultyTabs } from "./components/DifficultyTabs";
import { PanelPalette } from "./components/PanelPalette";
import { BoardGrid } from "./components/BoardDisplay/BoardGrid";
import { ActionButtons } from "./components/ActionButtons";
import { HistoryPanel } from "./components/HistoryPanel";
import { loadInitialBoard } from "./utils/localStorage";

function AppContent() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const savedBoard = loadInitialBoard(state.difficulty);
    if (savedBoard) {
      dispatch({ type: "LOAD_SAVED_BOARD", payload: savedBoard });
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        <DifficultyTabs />
        {state.editMode && <PanelPalette />}
        <BoardGrid />
        <ActionButtons />
        {!state.editMode && <HistoryPanel />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
