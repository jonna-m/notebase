import { randomUUID } from "node:crypto";

export type TextSource = {
  type: "text";
  filename: string;
  content: string;
};

export type PdfSource = {
  type: "pdf";
  filename: string;
  data: string; // base64
};

export type Source = TextSource | PdfSource;

const sources = new Map<string, Source>();

export function saveSource(source: Source): string {
  const id = randomUUID();
  sources.set(id, source);
  return id;
}

export function getSource(id: string): Source | undefined {
  return sources.get(id);
}

export function deleteSource(id: string): boolean {
  return sources.delete(id);
}
