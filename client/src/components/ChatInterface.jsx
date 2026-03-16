import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble.jsx';

export default function ChatInterface({ messages, onSend, onStop, isStreaming, hasImage }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '48px';
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 16px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isEmpty ? (
            <EmptyState hasImage={hasImage} />
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px 20px',
        background: 'var(--bg)'
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasImage ? 'Ask about your medical document...' : 'Upload a document to begin...'}
              disabled={!hasImage && isEmpty}
              rows={1}
              className="chat-input"
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />

            {isStreaming ? (
              <button type="button" onClick={onStop} className="stop-btn" title="Stop">
                <StopIcon />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || (!hasImage && isEmpty)}
                className="send-btn"
                title="Send"
              >
                <SendIcon />
              </button>
            )}
          </form>

          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px', textAlign: 'center' }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasImage }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', textAlign: 'center', padding: '40px 24px' }}>

      {/* Decorative ring */}
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        border: '1.5px solid var(--border-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px', position: 'relative'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: hasImage ? 'var(--lime-dim)' : 'var(--surface)',
          border: `1.5px solid ${hasImage ? 'var(--lime-border)' : 'var(--border-2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px'
        }}>
          {hasImage ? '🔬' : '🩺'}
        </div>
      </div>

      <h3 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px',
        color: 'var(--text)', marginBottom: '8px', letterSpacing: '-0.01em'
      }}>
        {hasImage ? 'Document Ready' : 'Welcome to LabLens'}
      </h3>

      <p style={{ fontSize: '13px', color: 'var(--text-2)', maxWidth: '360px', lineHeight: 1.6 }}>
        {hasImage
          ? 'Ask a question or pick a quick prompt on the left. LabLens will explain your document in plain English.'
          : 'Upload a lab report, prescription, or medical document to get a clear, plain-English explanation powered by Amazon Nova 2 Lite.'
        }
      </p>

      {hasImage && (
        <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {["What's abnormal?", "Explain in simple terms", "Questions for my doctor"].map(hint => (
            <span key={hint} style={{
              fontSize: '11px', padding: '5px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              borderRadius: '100px',
              color: 'var(--text-2)'
            }}>
              "{hint}"
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  );
}
