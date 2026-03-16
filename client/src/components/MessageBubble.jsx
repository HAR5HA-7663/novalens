export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.error;

  return (
    <div className={`message-enter flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
        ${isUser
          ? 'bg-indigo-600 text-white'
          : isError
          ? 'bg-red-900 text-red-300'
          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
        }`}>
        {isUser ? 'U' : '🔭'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : isError
            ? 'bg-red-950/60 border border-red-800 text-red-200 rounded-tl-sm'
            : 'bg-gray-800/80 text-gray-100 rounded-tl-sm'
          }`}>
          {message.content ? (
            <FormattedText text={message.content} />
          ) : message.streaming ? (
            <span className="text-gray-400 typing-cursor"> </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FormattedText({ text }) {
  // Simple markdown-like formatting
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <p key={i} className="font-bold text-base mt-2">{line.slice(3)}</p>;
        }
        if (line.startsWith('# ')) {
          return <p key={i} className="font-bold text-lg mt-2">{line.slice(2)}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>{formatInline(line.slice(2))}</span>
            </div>
          );
        }
        if (/^\d+\. /.test(line)) {
          const match = line.match(/^(\d+)\. (.*)/);
          return (
            <div key={i} className="flex gap-2">
              <span className="text-indigo-400 font-mono text-xs mt-0.5 min-w-[1rem]">{match[1]}.</span>
              <span>{formatInline(match[2])}</span>
            </div>
          );
        }
        if (line === '') return <div key={i} className="h-1" />;
        return <p key={i}>{formatInline(line)}</p>;
      })}
    </div>
  );
}

function formatInline(text) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-black/30 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
