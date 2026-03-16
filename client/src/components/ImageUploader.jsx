import { useCallback, useState } from 'react';

const SUGGESTIONS = [
  { icon: '📊', label: 'Summarize this chart', text: 'Summarize the key insights from this chart. What trends or patterns are most important?' },
  { icon: '📋', label: 'Extract data points', text: 'Extract all the data points, values, and labels visible in this image.' },
  { icon: '🔍', label: 'Analyze in detail', text: 'Give me a detailed analysis of this image. What does it show and what are the main takeaways?' },
  { icon: '📝', label: 'Summarize document', text: 'Summarize the content of this document. What are the key points?' },
  { icon: '🐛', label: 'Debug this screenshot', text: 'I see an issue in this screenshot. Can you identify what went wrong and suggest fixes?' },
  { icon: '💡', label: 'Explain the diagram', text: 'Explain this diagram. What is it showing and how does the system/process work?' }
];

export default function ImageUploader({ image, onImageSelect, onSuggestionClick, isStreaming }) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    onImageSelect({ file, preview, name: file.name });
  }, [onImageSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleFileInput = useCallback((e) => {
    processFile(e.target.files[0]);
    e.target.value = '';
  }, [processFile]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-1">Upload Image</h2>
        <p className="text-xs text-gray-500">Charts, documents, diagrams, screenshots</p>
      </div>

      {/* Drop Zone */}
      <label
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 min-h-[160px]
          ${isDragging
            ? 'border-indigo-400 bg-indigo-950/40'
            : image
            ? 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
            : 'border-gray-700 bg-gray-900/30 hover:border-indigo-600 hover:bg-indigo-950/20'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        {image ? (
          <div className="w-full p-3">
            <img
              src={image.preview}
              alt="Uploaded"
              className="w-full max-h-48 object-contain rounded-lg"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 truncate max-w-[70%]">{image.name}</span>
              <span className="text-xs text-indigo-400 hover:text-indigo-300">Change</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <div className="text-3xl mb-3">🖼️</div>
            <p className="text-sm text-gray-400 font-medium">Drop image here</p>
            <p className="text-xs text-gray-600 mt-1">or click to browse</p>
            <p className="text-xs text-gray-700 mt-2">JPG, PNG, GIF, WebP · max 10MB</p>
          </div>
        )}
      </label>

      {/* Suggestions */}
      {image && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick prompts</h3>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => onSuggestionClick(s.text)}
                disabled={isStreaming}
                className="flex items-center gap-2.5 px-3 py-2 text-left text-xs text-gray-300 bg-gray-900/60 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span className="text-base leading-none">{s.icon}</span>
                <span className="group-hover:text-white transition-colors">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!image && (
        <div className="mt-auto">
          <p className="text-xs text-gray-600 text-center">
            Upload an image to start your visual intelligence session
          </p>
        </div>
      )}
    </div>
  );
}
