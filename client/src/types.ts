export type SourceInfo = {
  sourceId: string;
  filename: string;
  type: 'text' | 'pdf';
};

export type ChatRole = 'user' | 'assistant';

export type ChatMessageItem = {
  id: string;
  role: ChatRole;
  content: string;
  isError?: boolean;
};
