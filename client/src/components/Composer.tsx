import { useEffect, useRef } from 'react';
import { SearchIcon } from './icons';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  isSending: boolean;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
};

export default function Composer({
  value,
  onChange,
  onSend,
  disabled,
  isSending,
  webSearchEnabled,
  onToggleWebSearch,
}: Props) {
  const canSend = !disabled && !isSending && value.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Textareas don't grow on their own — measure the content and set an
  // explicit height each time it changes, capped by max-height in CSS
  // (which also kicks in the scrollbar once text exceeds it).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function handleSend() {
    if (canSend) onSend();
  }

  return (
    <div className="composer-anchor">
      <div className="composer-box">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={disabled ? 'Add a source to start chatting' : 'Ask anything'}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="composer-actions">
          <div
            className={`search-toggle${webSearchEnabled ? ' active' : ''}`}
            title="Let Claude search the web for this message"
            onClick={onToggleWebSearch}
          >
            <SearchIcon />
            Web search
            <span className="switch">
              <span className="switch-knob" />
            </span>
          </div>
          <button className="composer-btn send" type="button" title="Send" disabled={!canSend} onClick={handleSend}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
