import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5";

let client: Anthropic | null = null;

/**
 * Constructed lazily so a missing key only breaks the /api/chat route,
 * not the whole server (upload doesn't need Claude at all).
 */
export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy server/.env.example to server/.env and add your key.",
    );
  }
  if (!client) {
    client = new Anthropic();
  }
  return client;
}
