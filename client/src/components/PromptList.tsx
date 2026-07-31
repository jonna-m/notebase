import { ChevronIcon } from './icons';

const PROMPTS = [
  'Summarize this paper for me in three bullets',
  'Extract the key arguments and citations from this',
  'Draft candidate interview codes from these notes',
  'Make quiz questions to test my recall of this',
  "Compare this paper's argument to my thesis framing",
  'Rewrite this as a short literature review paragraph',
];

type Props = {
  enabled: boolean;
  onSelect: (prompt: string) => void;
};

export default function PromptList({ enabled, onSelect }: Props) {
  return (
    <div className="prompt-list">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          className={`prompt-row${enabled ? ' enabled' : ''}`}
          disabled={!enabled}
          onClick={() => onSelect(prompt)}
        >
          {prompt}
          <ChevronIcon />
        </button>
      ))}
    </div>
  );
}
