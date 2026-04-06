import { useCallback, useState } from 'react';

const SUGGESTIONS = [
  { icon: '~', text: 'Describe this image in detail' },
  { icon: '#', text: 'Extract all visible text' },
  { icon: '%', text: 'What trends do you see?' },
  { icon: '>', text: 'Summarize key data points' },
];

export default function ImageUploader({ currentImage, onImageSelect }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) return;
    if (file.size > 20 * 1024 * 1024) return;
    onImageSelect(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Section label */}
      <div className="fade-up">
        <h2
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          Source
        </h2>
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Upload an image to begin analysis
        </p>
      </div>

      {/* Drop zone */}
      <label
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          flex flex-col items-center justify-center rounded-xl cursor-pointer
          transition-all duration-300 min-h-[160px] fade-up fade-up-delay-1
          ${isDragging ? 'drop-active' : ''}
        `}
        style={{
          border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'rgba(99, 102, 241, 0.2)'}`,
          background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)',
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
          style={{ background: 'var(--accent-soft)' }}
        >
          <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          Drop image here
        </p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
          or click to browse
        </p>
        <p
          className="text-[10px] mt-3 px-2.5 py-1 rounded-full"
          style={{ color: 'var(--text-muted)', background: 'var(--surface-3)' }}
        >
          JPEG, PNG, GIF, WebP &middot; 20MB max
        </p>
      </label>

      {/* Image preview */}
      {currentImage && (
        <div className="flex flex-col gap-2 fade-up">
          <div
            className="relative rounded-xl overflow-hidden img-preview"
            style={{ border: '1px solid var(--glass-border)' }}
          >
            <img
              src={currentImage.preview}
              alt="Uploaded"
              className="w-full object-contain max-h-52"
              style={{ background: 'var(--surface-1)' }}
            />
            <div
              className="absolute bottom-0 inset-x-0 px-3 py-2"
              style={{
                background: 'linear-gradient(transparent, rgba(10, 13, 26, 0.9))',
              }}
            >
              <p
                className="text-[10px] truncate"
                style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {currentImage.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => onImageSelect(null)}
            className="w-full py-2 text-[11px] font-medium rounded-lg transition-all duration-200 hover:brightness-125"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--surface-3)',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)'}
            onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
          >
            Remove
          </button>
        </div>
      )}

      {/* Suggestions */}
      <div className="mt-auto pt-4 fade-up fade-up-delay-2">
        <p
          className="text-[10px] font-semibold tracking-widest uppercase mb-2.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Try asking
        </p>
        <div className="flex flex-col gap-1.5">
          {SUGGESTIONS.map((s) => (
            <div
              key={s.text}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span
                className="text-[11px] font-bold w-4 text-center flex-shrink-0"
                style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {s.icon}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {s.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
