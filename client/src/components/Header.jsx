export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-5 py-2.5 flex-shrink-0 z-10"
      style={{
        background: 'linear-gradient(180deg, var(--surface-2) 0%, var(--surface-1) 100%)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
          }}
        >
          NL
        </div>
        <div className="flex flex-col">
          <h1
            className="text-sm font-semibold tracking-tight leading-none"
            style={{ color: 'var(--text-primary)' }}
          >
            NovaLens
          </h1>
          <span
            className="text-[10px] font-medium tracking-widest uppercase mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Visual Intelligence
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-2 h-2">
            <span
              className="absolute w-2 h-2 rounded-full animate-ping opacity-40"
              style={{ background: '#22c55e' }}
            />
            <span
              className="relative w-1.5 h-1.5 rounded-full"
              style={{ background: '#22c55e' }}
            />
          </div>
          <span
            className="text-[11px] font-medium"
            style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            Nova 2 Lite
          </span>
        </div>
      </div>
    </header>
  );
}
