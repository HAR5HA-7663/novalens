import { useState, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import ChatInterface from './components/ChatInterface.jsx';

export default function App() {
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState('patient'); // 'patient' | 'doctor'
  const abortRef = useRef(null);

  const handleImageSelect = useCallback((imageData) => {
    setImage(imageData);
    setMessages([]);
  }, []);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setMessages([]);
  }, []);

  const handleSend = useCallback(async (messageText) => {
    if (!messageText.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: messageText, id: Date.now() };
    const assistantMessage = { role: 'assistant', content: '', id: Date.now() + 1, streaming: true };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    const formData = new FormData();
    formData.append('message', messageText);
    formData.append('history', JSON.stringify(history));
    formData.append('mode', mode);

    if (image?.file && messages.length === 0) {
      formData.append('image', image.file);
    }

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setMessages(prev => prev.map(m =>
                  m.id === assistantMessage.id
                    ? { ...m, content: m.content + data.text }
                    : m
                ));
              }
              if (data.done || data.error) {
                setMessages(prev => prev.map(m =>
                  m.id === assistantMessage.id
                    ? { ...m, streaming: false, error: data.error }
                    : m
                ));
              }
            } catch { /* skip malformed SSE */ }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: `Error: ${err.message}`, streaming: false, error: true }
            : m
        ));
      }
    } finally {
      setIsStreaming(false);
      setMessages(prev => prev.map(m =>
        m.id === assistantMessage.id ? { ...m, streaming: false } : m
      ));
      abortRef.current = null;
    }
  }, [image, messages, isStreaming, mode]);

  const handleStop = useCallback(() => { abortRef.current?.abort(); }, []);
  const handleClear = useCallback(() => { setMessages([]); setImage(null); }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Header
        onClear={handleClear}
        hasContent={messages.length > 0 || !!image}
        mode={mode}
        onModeChange={handleModeChange}
      />
      <main style={{ flex: 1, display: 'flex', maxWidth: '1400px', width: '100%', margin: '0 auto', minHeight: 0 }} className="app-main">
        {/* Left panel */}
        <div style={{ width: '340px', flexShrink: 0, padding: '20px', borderRight: '1px solid var(--border)', overflowY: 'auto' }} className="left-panel">
          <ImageUploader
            image={image}
            onImageSelect={handleImageSelect}
            onSuggestionClick={handleSend}
            isStreaming={isStreaming}
          />
        </div>
        {/* Right panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
          <ChatInterface
            messages={messages}
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
            hasImage={!!image}
            mode={mode}
          />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .app-main { flex-direction: column !important; }
          .left-panel { width: 100% !important; border-right: none !important; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </div>
  );
}
