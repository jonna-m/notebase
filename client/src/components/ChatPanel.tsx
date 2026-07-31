import type { ChatMessageItem, SourceInfo } from '../types';
import Composer from './Composer';
import MessageThread from './MessageThread';
import PromptList from './PromptList';
import { SparkleIcon } from './icons';

type Props = {
  sources: SourceInfo[];
  messages: ChatMessageItem[];
  composerValue: string;
  onComposerChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  statusText: string | null;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
};

export default function ChatPanel({
  sources,
  messages,
  composerValue,
  onComposerChange,
  onSend,
  isSending,
  statusText,
  webSearchEnabled,
  onToggleWebSearch,
}: Props) {
  const sourceAdded = sources.length > 0;
  const hasStartedChat = messages.length > 0;

  let sourceSummary = 'Add a source first — then any prompt runs against it.';
  if (sources.length === 1) {
    sourceSummary = `Prompts will run against "${sources[0].filename}."`;
  } else if (sources.length > 1) {
    sourceSummary = `Prompts will run against ${sources.length} sources.`;
  }

  return (
    <div className="panel panel-right">
      <div className="ai-badge">
        <SparkleIcon />
        AI powered
      </div>

      <div className="step-label">
        <span className={`step-badge${sourceAdded ? '' : ' muted'}`}>2</span>Pick a prompt
      </div>
      <div className="step-sub">{sourceSummary}</div>

      {hasStartedChat ? (
        <MessageThread messages={messages} isSending={isSending} statusText={statusText} />
      ) : (
        <PromptList enabled={sourceAdded} onSelect={onComposerChange} />
      )}

      <Composer
        value={composerValue}
        onChange={onComposerChange}
        onSend={onSend}
        disabled={!sourceAdded}
        isSending={isSending}
        webSearchEnabled={webSearchEnabled}
        onToggleWebSearch={onToggleWebSearch}
      />
    </div>
  );
}
