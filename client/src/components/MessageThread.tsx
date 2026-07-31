import { useEffect, useRef } from 'react';
import type { ChatMessageItem } from '../types';
import Markdown from './Markdown';

type Props = {
  messages: ChatMessageItem[];
  isSending: boolean;
  statusText: string | null;
};

export default function MessageThread({ messages, isSending, statusText }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, isSending, statusText]);

  return (
    <div className="message-thread">
      {messages.map((message, index) => {
        const isLastMessage = index === messages.length - 1;
        const isGenerating = isSending && isLastMessage && message.role === 'assistant';

        return (
          <div key={message.id} className={`message-row ${message.role}`}>
            <div className={`message-bubble${message.isError ? ' error' : ''}`}>
              {message.content && (message.role === 'assistant' && !message.isError ? (
                <Markdown content={message.content} />
              ) : (
                message.content
              ))}
              {isGenerating && (
                <span className="typing-indicator">
                  {statusText && <span className="typing-status">{statusText}</span>}
                  <span className="typing-dot typing-dot-1" />
                  <span className="typing-dot typing-dot-2" />
                  <span className="typing-dot typing-dot-3" />
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
