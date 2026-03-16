export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.error;

  return (
    <div className="message-enter" style={{ display: 'flex', gap: '10px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      {/* Avatar */}
      <div style={{
        flexShrink: 0,
        width: '28px', height: '28px',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '2px',
        fontSize: '12px', fontWeight: 700,
        fontFamily: 'Syne, sans-serif',
        background: isUser
          ? 'var(--lime)'
          : isError
          ? 'rgba(255,60,60,0.15)'
          : 'var(--surface-2)',
        border: isUser
          ? 'none'
          : isError
          ? '1px solid rgba(255,60,60,0.3)'
          : '1px solid var(--border-2)',
        color: isUser ? '#000' : isError ? '#ff6060' : 'var(--text-2)'
      }}>
        {isUser ? 'U' : isError ? '!' : '⬡'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          fontSize: '13px',
          lineHeight: '1.65',
          background: isUser
            ? 'var(--lime)'
            : isError
            ? 'rgba(255,60,60,0.06)'
            : 'var(--surface)',
          border: isUser
            ? 'none'
            : isError
            ? '1px solid rgba(255,60,60,0.2)'
            : '1px solid var(--border)',
          color: isUser ? '#000' : isError ? '#ff8080' : 'var(--text)',
          fontWeight: isUser ? 500 : 400,
        }}>
          {message.content ? (
            <FormattedText text={message.content} isUser={isUser} />
          ) : message.streaming ? (
            <span className="typing-cursor" style={{ color: 'var(--text-3)' }}> </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FormattedText({ text, isUser }) {
  const lines = text.split('\n');
  const accent = isUser ? 'rgba(0,0,0,0.5)' : 'var(--lime)';
  const numColor = isUser ? 'rgba(0,0,0,0.6)' : 'var(--orange)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <p key={i} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', marginTop: '6px', color: isUser ? '#000' : 'var(--text)' }}>{line.slice(3)}</p>;
        }
        if (line.startsWith('# ')) {
          return <p key={i} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', marginTop: '8px' }}>{line.slice(2)}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: accent, marginTop: '2px', flexShrink: 0 }}>•</span>
              <span>{formatInline(line.slice(2), isUser)}</span>
            </div>
          );
        }
        if (/^\d+\. /.test(line)) {
          const match = line.match(/^(\d+)\. (.*)/);
          return (
            <div key={i} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: numColor, fontFamily: 'DM Mono, monospace', fontSize: '11px', marginTop: '2px', minWidth: '14px', flexShrink: 0 }}>{match[1]}.</span>
              <span>{formatInline(match[2], isUser)}</span>
            </div>
          );
        }
        if (line === '') return <div key={i} style={{ height: '4px' }} />;
        return <p key={i}>{formatInline(line, isUser)}</p>;
      })}
    </div>
  );
}

function formatInline(text, isUser) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={{
          background: isUser ? 'rgba(0,0,0,0.15)' : 'var(--surface-2)',
          border: `1px solid ${isUser ? 'rgba(0,0,0,0.1)' : 'var(--border-2)'}`,
          padding: '1px 5px', borderRadius: '4px',
          fontSize: '11px', fontFamily: 'DM Mono, monospace'
        }}>{part.slice(1, -1)}</code>
      );
    }
    return part;
  });
}
