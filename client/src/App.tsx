import { useState } from 'react';
import Background from './components/Background';
import ChatPanel from './components/ChatPanel';
import SourcePanel from './components/SourcePanel';
import { ApiError, deleteSource, sendMessage, uploadSource } from './api';
import type { ChatMessageItem, SourceInfo } from './types';

function makeId() {
  return Math.random().toString(36).slice(2);
}

export default function App() {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [composerValue, setComposerValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  async function handleFilesSelected(files: FileList) {
    setIsUploading(true);
    setUploadError(null);

    const uploaded: SourceInfo[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        uploaded.push(await uploadSource(file));
      } catch (err) {
        errors.push(err instanceof ApiError ? err.message : `Couldn't upload "${file.name}".`);
      }
    }

    if (uploaded.length > 0) {
      setSources((prev) => [...prev, ...uploaded]);
    }
    setUploadError(errors.length > 0 ? errors.join(' ') : null);
    setIsUploading(false);
  }

  async function handleRemoveSource(sourceId: string) {
    setSources((prev) => prev.filter((s) => s.sourceId !== sourceId));
    try {
      await deleteSource(sourceId);
    } catch {
      // Best-effort — an orphaned entry in the server's in-memory store isn't user-visible.
    }
  }

  async function handleSend() {
    const text = composerValue.trim();
    if (!text || sources.length === 0 || isSending) return;

    const history = messages;
    const sourceIds = sources.map((s) => s.sourceId);
    const userMessage: ChatMessageItem = { id: makeId(), role: 'user', content: text };
    const assistantId = makeId();
    const assistantMessage: ChatMessageItem = { id: assistantId, role: 'assistant', content: '' };

    setMessages([...history, userMessage, assistantMessage]);
    setComposerValue('');
    setIsSending(true);
    setStatusText(null);

    try {
      await sendMessage(
        { sourceIds, message: text, history, webSearchEnabled },
        {
          onDelta: (chunk) => {
            setStatusText(null);
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)));
          },
          onStatus: (text) => setStatusText(text),
        },
      );
    } catch (err) {
      const errorText = err instanceof ApiError ? err.message : 'Something went wrong talking to Claude.';
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: errorText, isError: true } : m)));
    } finally {
      setIsSending(false);
      setStatusText(null);
    }
  }

  return (
    <>
      <Background />
      <div className="card">
        <div className="divider" />
        <SourcePanel
          sources={sources}
          isUploading={isUploading}
          error={uploadError}
          onFilesSelected={handleFilesSelected}
          onRemoveSource={handleRemoveSource}
        />
        <ChatPanel
          sources={sources}
          messages={messages}
          composerValue={composerValue}
          onComposerChange={setComposerValue}
          onSend={handleSend}
          isSending={isSending}
          statusText={statusText}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={() => setWebSearchEnabled((v) => !v)}
        />
      </div>
    </>
  );
}
