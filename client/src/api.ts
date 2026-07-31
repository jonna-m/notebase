import type { ChatMessageItem, SourceInfo } from './types';

export class ApiError extends Error {}

export async function uploadSource(file: File): Promise<SourceInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.error ?? 'Upload failed.');
  }
  return data as SourceInfo;
}

export async function deleteSource(sourceId: string): Promise<void> {
  const res = await fetch(`/api/upload/${sourceId}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    throw new ApiError('Failed to remove that source.');
  }
}

type ChatEvent = { type: 'text' | 'status'; text: string };

export async function sendMessage(
  params: {
    sourceIds: string[];
    message: string;
    history: ChatMessageItem[];
    webSearchEnabled: boolean;
  },
  handlers: {
    onDelta: (chunk: string) => void;
    onStatus: (text: string) => void;
  },
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceIds: params.sourceIds,
      message: params.message,
      history: params.history.map((m) => ({ role: m.role, content: m.content })),
      webSearchEnabled: params.webSearchEnabled,
    }),
  });

  if (!res.ok || !res.body) {
    let errorMessage = 'Something went wrong talking to Claude.';
    try {
      const data = await res.json();
      errorMessage = data.error ?? errorMessage;
    } catch {
      // response wasn't JSON (e.g. failed mid-stream) — keep the default message
    }
    throw new ApiError(errorMessage);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  function handleLine(line: string) {
    if (!line) return;
    let event: ChatEvent;
    try {
      event = JSON.parse(line);
    } catch {
      return; // ignore a malformed/partial line rather than crashing the chat
    }
    if (event.type === 'text') handlers.onDelta(event.text);
    else if (event.type === 'status') handlers.onStatus(event.text);
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) handleLine(line);
  }
  handleLine(buffer);
}
