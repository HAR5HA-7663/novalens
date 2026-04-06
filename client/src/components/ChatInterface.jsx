import { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble.jsx';

export default function ChatInterface({ messages, isStreaming, onSendMessage, hasImage }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
    onSendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center fade-up"
              style={{
                background: 'var(--accent-soft)',
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.15)',
              }}
            >
              <svg className="w-7 h-7" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="fade-up fade-up-delay-1">
              <h3
                className="text-base font-semibold mb-1.5"
                style={{ color: 'var(--text-primary)' }}
              >
                {hasImage ? 'Image loaded. Ask away.' : 'Upload an image to start'}
              </h3>
              <p
                className="text-xs max-w-xs leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                {hasImage
                  ? 'Ask questions about charts, documents, diagrams, screenshots, or any visual content. Nova will analyze and respond in real time.'
                  : 'Drag and drop an image on the left panel, then ask NovaLens anything about what you see.'}
              </p>
            </div>

            {hasImage && (
              <div className="flex flex-wrap gap-2 mt-2 fade-up fade-up-delay-2">
                {['What do you see?', 'Extract text', 'Analyze trends'].map((q) => (
                  <button
                    key={q}
                    onClick={() => onSendMessage(q)}
                    className="px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 hover:brightness-125"
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <MessageBubble key={`${msg.timestamp}-${i}`} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 px-6 py-4"
        style={{
          background: 'linear-gradient(transparent, var(--surface-1) 30%)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2.5 items-end">
            <div
              className="flex-1 rounded-xl overflow-hidden transition-all duration-200"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={hasImage ? 'Ask about this image...' : 'Upload an image first'}
                disabled={!hasImage || isStreaming}
                rows={1}
                className="w-full bg-transparent px-4 py-3 text-sm resize-none focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed placeholder-[var(--text-muted)]"
                style={{
                  color: 'var(--text-primary)',
                  minHeight: '44px',
                  maxHeight: '120px',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!hasImage || !input.trim() || isStreaming}
              className="btn-primary flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
            >
              {isStreaming ? (
                <span
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }}
                />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              )}
            </button>
          </form>
          <p
            className="text-[10px] mt-2 text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            Enter to send &middot; Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
