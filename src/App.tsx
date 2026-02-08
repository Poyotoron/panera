import { AppProvider } from "./context/AppContext";
import { Header } from "./components/Header";
import { DifficultyTabs } from "./components/DifficultyTabs";
import { PatternSelector } from "./components/PatternSelector";
import { BoardGrid } from "./components/BoardDisplay/BoardGrid";
import { ActionButtons } from "./components/ActionButtons";
import { HistoryPanel } from "./components/HistoryPanel";

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
          <DifficultyTabs />
          <PatternSelector />
          <BoardGrid />
          <ActionButtons />
          <HistoryPanel />
        </main>
      </div>
    </AppProvider>
  );
}
