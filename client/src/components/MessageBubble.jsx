export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 msg-enter ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold tracking-wide mt-0.5"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #6366f1, #4338ca)'
            : 'var(--surface-3)',
          color: isUser ? 'white' : 'var(--text-secondary)',
          boxShadow: isUser ? '0 0 12px rgba(99, 102, 241, 0.25)' : 'none',
        }}
      >
        {isUser ? 'U' : 'NL'}
      </div>

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Image thumbnail */}
        {message.imagePreview && isUser && (
          <div
            className="rounded-lg overflow-hidden max-w-[200px]"
            style={{ border: '1px solid var(--glass-border)' }}
          >
            <img
              src={message.imagePreview}
              alt="Attached"
              className="w-full object-contain max-h-32"
              style={{ background: 'var(--surface-1)' }}
            />
          </div>
        )}

        {/* Text */}
        {message.content && (
          <div
            className={`
              px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap
              ${isUser ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl rounded-tl-md'}
              ${message.streaming ? 'cursor-blink' : ''}
            `}
            style={{
              background: isUser
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(67, 56, 202, 0.9))'
                : 'var(--surface-3)',
              color: isUser ? 'white' : 'var(--text-primary)',
              border: isUser ? 'none' : '1px solid var(--glass-border)',
              boxShadow: isUser
                ? '0 2px 12px rgba(99, 102, 241, 0.2)'
                : '0 1px 4px rgba(0, 0, 0, 0.15)',
              ...(message.error ? {
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
              } : {}),
              fontFamily: isUser ? "'DM Sans', system-ui, sans-serif" : "'DM Sans', system-ui, sans-serif",
            }}
          >
            {message.content}
          </div>
        )}

        {/* Streaming skeleton */}
        {message.streaming && !message.content && (
          <div
            className="px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-1.5"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--glass-border)',
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  background: 'var(--accent)',
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
