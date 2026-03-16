export default function Header({ onClear, hasContent, mode, onModeChange }) {
  return (
    <header style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

        {/* Left: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '15px', color: '#000', lineHeight: 1 }}>L</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', letterSpacing: '-0.01em', color: 'var(--text)' }}>
            LABLENS
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px',
            background: 'var(--surface)', border: '1px solid var(--border-2)',
            borderRadius: '100px', fontSize: '11px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)', display: 'inline-block', animation: 'blink 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'DM Mono, monospace', color: 'var(--lime)', fontSize: '11px' }}>Nova 2 Lite</span>
          </span>
        </div>

        {/* Center: Mode toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--surface)', border: '1px solid var(--border-2)',
          borderRadius: '10px', padding: '3px', gap: '2px'
        }}>
          <ToggleBtn
            active={mode === 'patient'}
            onClick={() => onModeChange('patient')}
            label="Patient"
            icon="🙋"
          />
          <ToggleBtn
            active={mode === 'doctor'}
            onClick={() => onModeChange('doctor')}
            label="Doctor"
            icon="👨‍⚕️"
          />
        </div>

        {/* Right: Meta + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', color: 'var(--text-3)' }} className="powered-label">
            Powered by <span style={{ color: 'var(--orange)', fontWeight: 600 }}>Amazon Bedrock</span>
          </span>
          {hasContent && (
            <button
              onClick={onClear}
              style={{
                fontSize: '12px', fontWeight: 500, padding: '6px 14px',
                background: 'transparent', border: '1px solid var(--border-2)',
                borderRadius: '8px', color: 'var(--text-2)', cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent'; }}
            >
              New Session
            </button>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .powered-label { display: none; } }`}</style>
    </header>
  );
}

function ToggleBtn({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '7px', border: 'none',
        background: active ? 'var(--lime)' : 'transparent',
        color: active ? '#000' : 'var(--text-2)',
        fontSize: '12px', fontWeight: active ? 600 : 400,
        fontFamily: 'DM Sans, sans-serif',
        cursor: 'pointer', transition: 'all 0.15s ease'
      }}
    >
      <span style={{ fontSize: '13px' }}>{icon}</span>
      {label}
    </button>
  );
}
