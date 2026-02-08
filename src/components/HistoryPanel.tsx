import { useAppContext } from "../context/AppContext";

export function HistoryPanel() {
  const { state } = useAppContext();

  if (state.history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-2">操作履歴</h2>
        <p className="text-sm text-gray-400">まだ操作がありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-semibold text-gray-600 mb-2">操作履歴</h2>
      <ol className="space-y-1 text-sm">
        {state.history.map((op, index) => (
          <li key={op.timestamp} className="text-gray-700 font-mono">
            <span className="text-gray-400 mr-2">{index + 1}.</span>
            {op.panel1.label}({op.panel1.row},{op.panel1.col})
            <span className="mx-1 text-indigo-500">⇄</span>
            {op.panel2.label}({op.panel2.row},{op.panel2.col})
          </li>
        ))}
      </ol>
    </div>
  );
}
