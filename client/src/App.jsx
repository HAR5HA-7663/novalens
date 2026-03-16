import { useState, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import ChatInterface from './components/ChatInterface.jsx';

export default function App() {
  const [image, setImage] = useState(null); // { file, preview, name }
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const handleImageSelect = useCallback((imageData) => {
    setImage(imageData);
    setMessages([]);
  }, []);

  const handleSend = useCallback(async (messageText) => {
    if (!messageText.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: messageText, id: Date.now() };
    const assistantMessage = { role: 'assistant', content: '', id: Date.now() + 1, streaming: true };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    // Build history from previous messages (exclude current pair being added)
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    const formData = new FormData();
    formData.append('message', messageText);
    formData.append('history', JSON.stringify(history));

    // Only send image on first message or when a new image was just uploaded
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
            } catch {
              // skip malformed SSE
            }
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
  }, [image, messages, isStreaming]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleClear = useCallback(() => {
    setMessages([]);
    setImage(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Header onClear={handleClear} hasContent={messages.length > 0 || !!image} />
      <main className="flex-1 flex flex-col lg:flex-row gap-0 max-w-7xl mx-auto w-full">
        <div className="lg:w-2/5 xl:w-1/3 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-800">
          <ImageUploader
            image={image}
            onImageSelect={handleImageSelect}
            onSuggestionClick={handleSend}
            isStreaming={isStreaming}
          />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <ChatInterface
            messages={messages}
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
            hasImage={!!image}
          />
        </div>
      </main>
    </div>
  );
}
