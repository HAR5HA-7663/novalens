import { useCallback, useState } from 'react';

const SUGGESTIONS = [
  { icon: '🔬', label: 'Explain my lab results', text: 'Please explain each test result in plain English. Which values are normal, which are high or low, and what do abnormal results mean?' },
  { icon: '💊', label: 'Explain this prescription', text: 'What is this medication for? Explain the dosage instructions and what side effects should I watch out for?' },
  { icon: '🏥', label: "Summarize doctor's notes", text: "Summarize this medical document in simple terms. What are the key diagnoses, treatments, and what do I need to follow up on?" },
  { icon: '⚠️', label: "What's abnormal?", text: 'Highlight anything in this report that is outside the normal range and explain what it might mean for my health.' },
  { icon: '❓', label: 'Questions for my doctor', text: 'Based on this document, what specific questions should I ask my doctor at my next appointment?' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>

      {/* Section header */}
      <div>
        <p className="label-upper" style={{ marginBottom: '4px' }}>Upload Document</p>
        <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Lab reports · Prescriptions · Imaging · Doctor's notes</p>
      </div>

      {/* Drop Zone */}
      <label
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${image ? 'has-image' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />

        {image ? (
          <div style={{ width: '100%', padding: '12px' }}>
            <img
              src={image.preview}
              alt="Uploaded"
              style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '10px' }}
            />
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                {image.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--lime)', fontWeight: 500, cursor: 'pointer' }}>Change</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'var(--lime-dim)', border: '1px solid var(--lime-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '22px'
            }}>
              🩺
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
              Drop your document here
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>or click to browse · JPG, PNG · max 10MB</p>
          </div>
        )}
      </label>

      {/* Privacy notice */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        padding: '10px 12px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderLeft: '2px solid var(--lime-border)',
        borderRadius: '10px'
      }}>
        <span style={{ fontSize: '13px', marginTop: '1px' }}>🔒</span>
        <p style={{ fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.5 }}>
          Documents are processed securely and never stored. For educational purposes — always consult your doctor.
        </p>
      </div>

      {/* Quick prompts */}
      {image && (
        <div style={{ flex: 1 }}>
          <p className="label-upper" style={{ marginBottom: '8px' }}>Quick Prompts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => onSuggestionClick(s.text)}
                disabled={isStreaming}
                className="prompt-btn"
              >
                <span style={{ fontSize: '14px', lineHeight: 1, flexShrink: 0 }}>{s.icon}</span>
                <span className="prompt-label">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!image && (
        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>
            Upload a document to begin your analysis session
          </p>
        </div>
      )}
    </div>
  );
}
