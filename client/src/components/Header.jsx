export default function Header({ onClear, hasContent }) {
  return (
    <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base">
            🔭
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white tracking-tight">NovaLens</span>
            <span className="text-xs text-gray-500 hidden sm:inline">Visual Intelligence Platform</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Nova 2 Lite
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
            <span className="text-gray-600">Powered by</span>
            <span className="text-orange-400 font-medium">Amazon Bedrock</span>
          </span>
          {hasContent && (
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-all"
            >
              New Session
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
