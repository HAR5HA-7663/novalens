import { useCallback, useState } from 'react';

const SUGGESTIONS = [
  { icon: '🔬', label: 'Explain my lab results', text: 'Please explain each test result in plain English. Which values are normal, which are high or low, and what do abnormal results mean?' },
  { icon: '💊', label: 'Explain this prescription', text: 'What is this medication for? Explain the dosage instructions and what side effects should I watch out for?' },
  { icon: '🏥', label: 'Summarize doctor\'s notes', text: 'Summarize this medical document in simple terms. What are the key diagnoses, treatments, and what do I need to follow up on?' },
  { icon: '📊', label: 'What\'s abnormal?', text: 'Highlight anything in this report that is outside the normal range and explain what it might mean for my health.' },
  { icon: '❓', label: 'Questions to ask my doctor', text: 'Based on this document, what specific questions should I ask my doctor at my next appointment?' },
  { icon: '🩻', label: 'Explain imaging report', text: 'Translate this radiology or imaging report into plain language. What did they find and how significant is it?' }
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
    processFile(e.dataTransfer.files[0]);
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
        <h2 className="text-sm font-semibold text-gray-300 mb-1">Upload Medical Document</h2>
        <p className="text-xs text-gray-500">Lab reports, prescriptions, imaging reports, doctor's notes</p>
      </div>

      {/* Drop Zone */}
      <label
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 min-h-[160px]
          ${isDragging
            ? 'border-emerald-400 bg-emerald-950/40'
            : image
            ? 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
            : 'border-gray-700 bg-gray-900/30 hover:border-emerald-600 hover:bg-emerald-950/20'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

        {image ? (
          <div className="w-full p-3">
            <img src={image.preview} alt="Uploaded" className="w-full max-h-48 object-contain rounded-lg" />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 truncate max-w-[70%]">{image.name}</span>
              <span className="text-xs text-emerald-400 hover:text-emerald-300">Change</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <div className="text-3xl mb-3">🩺</div>
            <p className="text-sm text-gray-400 font-medium">Drop your document here</p>
            <p className="text-xs text-gray-600 mt-1">or click to browse</p>
            <p className="text-xs text-gray-700 mt-2">JPG, PNG · max 10MB</p>
          </div>
        )}
      </label>

      {/* Privacy notice */}
      <div className="flex items-start gap-2 px-3 py-2 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
        <span className="text-emerald-400 text-xs mt-0.5">🔒</span>
        <p className="text-xs text-emerald-300/70">Documents are processed securely and never stored. For educational use — always consult your doctor.</p>
      </div>

      {/* Quick prompts */}
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
          <p className="text-xs text-gray-600 text-center">Upload a medical document to get plain-English explanations</p>
        </div>
      )}
    </div>
  );
}
