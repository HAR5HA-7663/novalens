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
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {isEmpty ? (
          <EmptyState hasImage={hasImage} />
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-800 p-4 lg:p-6 bg-gray-950">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasImage ? 'Ask about your medical document...' : 'Upload a medical document to begin...'}
              disabled={!hasImage && isEmpty}
              rows={1}
              className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all"
              title="Stop generation"
            >
              <StopIcon />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || (!hasImage && isEmpty)}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl transition-all"
              title="Send message"
            >
              <SendIcon />
            </button>
          )}
        </form>
        <p className="text-xs text-gray-700 mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function EmptyState({ hasImage }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-6">
      <div className="text-5xl mb-4">
        {hasImage ? '🔬' : '🩺'}
      </div>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">
        {hasImage ? 'Document ready' : 'Welcome to LabLens'}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        {hasImage
          ? 'Ask a question or use a quick prompt on the left. LabLens will explain your document in plain English.'
          : 'Upload a lab report, prescription, or medical document to get a clear, plain-English explanation powered by Amazon Nova 2 Lite.'
        }
      </p>
      {hasImage && (
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {['What\'s abnormal?', 'Explain in simple terms', 'What should I ask my doctor?'].map(hint => (
            <span key={hint} className="text-xs px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-full text-gray-400">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
