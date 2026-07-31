import { useRef, useState } from 'react';
import type { SourceInfo } from '../types';
import { AudioIcon, DocIcon, ImageIcon } from './icons';

type Props = {
  sources: SourceInfo[];
  isUploading: boolean;
  error: string | null;
  onFilesSelected: (files: FileList) => void;
  onRemoveSource: (sourceId: string) => void;
};

export default function SourcePanel({ sources, isUploading, error, onFilesSelected, onRemoveSource }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) onFilesSelected(files);
  }

  return (
    <div className="panel">
      <div className="step-label">
        <span className="step-badge">1</span>Add a source
      </div>
      <div className="step-sub">Drop in papers, transcripts, or notes — add as many as you need.</div>

      {error && <div className="upload-error">{error}</div>}

      {sources.length > 0 && (
        <div className="source-list">
          {sources.map((source) => (
            <div className="source-row" key={source.sourceId}>
              <div className="source-row-icon">
                <DocIcon />
              </div>
              <div className="source-row-text">
                <div className="source-row-name">{source.filename}</div>
                <div className="source-row-type">{source.type === 'pdf' ? 'PDF' : 'Plain text'}</div>
              </div>
              <button
                className="source-remove"
                type="button"
                title={`Remove ${source.filename}`}
                onClick={() => onRemoveSource(source.sourceId)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`dropzone${isDragging ? ' dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {sources.length === 0 && (
          <div className="icon-stack">
            <div className="icon-chip lav">
              <AudioIcon />
            </div>
            <div className="icon-chip peach">
              <DocIcon />
            </div>
            <div className="icon-chip sage">
              <ImageIcon />
            </div>
          </div>
        )}
        <div className="drop-title">
          {isUploading ? 'Uploading…' : sources.length > 0 ? 'Drop another file' : 'Drag your notes here'}
        </div>
        <div className="drop-sub">PDF or plain text (.txt, .md) for now.</div>
        <button
          className="browse-link"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Or browse your files
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.pdf"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
