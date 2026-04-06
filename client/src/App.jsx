import { useState, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import ChatInterface from './components/ChatInterface.jsx';

export default function App() {
  const [currentImage, setCurrentImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const handleImageSelect = useCallback((file) => {
    if (!file) {
      setCurrentImage(null);
      setMessages([]);
      return;
    }
    const preview = URL.createObjectURL(file);
    setCurrentImage({ file, preview, name: file.name });
    setMessages([]);
  }, []);

  const handleSendMessage = useCallback(async (userText) => {
    if (isStreaming) return;

    const userMsg = {
      role: 'user',
      content: userText,
      imagePreview: currentImage?.preview,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantMsg = { role: 'assistant', content: '', streaming: true, timestamp: Date.now() };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const formData = new FormData();
      formData.append('message', userText);

      if (currentImage?.file) {
        formData.append('image', currentImage.file);
      }

      const history = messages.map(m => ({ role: m.role, content: m.content }));
      formData.append('history', JSON.stringify(history));

      abortRef.current = new AbortController();
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'delta') {
              fullText += data.text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: fullText,
                };
                return updated;
              });
            }

            if (data.type === 'done') {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: fullText,
                  streaming: false,
                };
                return updated;
              });
            }

            if (data.type === 'error') {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: `Something went wrong: ${data.error}`,
                  streaming: false,
                  error: true,
                };
                return updated;
              });
            }
          } catch (e) {
            // skip malformed SSE lines
          }
        }
      }

      // finalize if stream ended without explicit done event
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.streaming) {
          updated[updated.length - 1] = { ...last, streaming: false };
        }
        return updated;
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content || `Failed to get response: ${err.message}`,
              streaming: false,
              error: true,
            };
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, currentImage, messages]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--surface-1)' }}>
      <div className="noise-overlay" />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside
          className="w-80 flex-shrink-0 flex flex-col overflow-y-auto"
          style={{
            background: 'var(--surface-2)',
            borderRight: '1px solid var(--glass-border)',
          }}
        >
          <ImageUploader
            currentImage={currentImage}
            onImageSelect={handleImageSelect}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 lens-glow">
          <ChatInterface
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            hasImage={!!currentImage}
          />
        </main>
      </div>
    </div>
  );
}
