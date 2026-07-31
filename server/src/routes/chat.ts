import { Router } from "express";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODEL } from "../anthropic.js";
import { getSource, type PdfSource, type TextSource } from "../store.js";

type ChatMessage = { role: "user" | "assistant"; content: string };

export const chatRouter = Router();

const BASE_INSTRUCTIONS = 

`You are a research assistant helping the user work through source material for their master's thesis. They are conducting qualitative research and need help engaging critically with academic papers, not just summarizing them.

When answering:
- Ground every claim in the uploaded document(s). Quote or closely paraphrase specific findings, methods, and arguments rather than generalizing.
- If something isn't covered by the uploaded content, say so plainly — do not fill gaps from general knowledge unless web search is explicitly enabled for this query.
- When asked to summarize or rewrite, preserve each source's actual argument structure and any named authors, studies, or theoretical frameworks it cites — don't flatten nuance for brevity.
- When relevant, note each source's methodology (sample size, study design, population) since this affects how strongly its findings can be used as evidence.
- If multiple documents are uploaded and their claims agree, disagree, or only partially overlap, say so explicitly rather than merging them into one flattened answer.
- If the user's prompt implies comparing a source to other literature or to their own thesis argument, and no other context has been provided beyond the uploaded document(s), note that the comparison is limited to what's been uploaded so far.
- Default to academic register: precise, neutral, citation-aware. Avoid casual hedging ("it seems like") in favor of direct, sourced claims.
- Keep outputs scoped to what was asked — a "three bullet summary" should be three bullets, not five, unless brevity would misrepresent the source.

Do not fabricate citations, page numbers, or study details that are not present in the source. If a citation format is ambiguous, use author-year (e.g., "Ko et al., 2016") rather than inventing full bibliographic details.`;


chatRouter.post("/", async (req, res) => {
  const { sourceIds, message, history, webSearchEnabled } = req.body as {
    sourceIds?: string[];
    message?: string;
    history?: ChatMessage[];
    webSearchEnabled?: boolean;
  };

  if (!sourceIds || sourceIds.length === 0 || !message) {
    res.status(400).json({ error: "sourceIds and message are required." });
    return;
  }

  const sources = [];
  for (const id of sourceIds) {
    const source = getSource(id);
    if (!source) {
      res.status(404).json({ error: "One of your sources wasn't found — please re-upload it." });
      return;
    }
    sources.push(source);
  }
  const textSources = sources.filter((s): s is TextSource => s.type === "text");
  const pdfSources = sources.filter((s): s is PdfSource => s.type === "pdf");

  const priorMessages = history ?? [];

  // Plain text documents are cheap to keep in the system prompt. A single
  // cache_control marker on the last block caches the whole stable prefix
  // (instructions + every text document) up to that point.
  const system: Anthropic.Messages.TextBlockParam[] = [{ type: "text", text: BASE_INSTRUCTIONS }];
  for (const source of textSources) {
    system.push({ type: "text", text: `<document filename="${source.filename}">\n${source.content}\n</document>` });
  }
  system[system.length - 1].cache_control = { type: "ephemeral" };

  let messages: Anthropic.Messages.MessageParam[];

  if (pdfSources.length === 0) {
    messages = [
      ...priorMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];
  } else {
    // PDFs must travel as `document` content blocks inside a user message
    // (not the system prompt). Attach them all to the first turn only, so
    // their position in the prompt stays identical across requests and can cache.
    const allTurns: ChatMessage[] = [...priorMessages, { role: "user", content: message }];
    messages = allTurns.map((turn, index) => {
      if (index === 0) {
        const documentBlocks: Anthropic.Messages.ContentBlockParam[] = pdfSources.map((source, i) => ({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: source.data,
          },
          ...(i === pdfSources.length - 1 ? { cache_control: { type: "ephemeral" as const } } : {}),
        }));
        return {
          role: "user",
          content: [...documentBlocks, { type: "text", text: turn.content }],
        } satisfies Anthropic.Messages.MessageParam;
      }
      return { role: turn.role, content: turn.content };
    });
  }

  let anthropic;
  try {
    anthropic = getAnthropic();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
    return;
  }

  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  // Each line is a small JSON event so the client can tell "generating an
  // answer" apart from "waiting on a tool call" (e.g. a web search) — those
  // silent stretches with no text delta are what made the UI look stuck.
  function writeEvent(event: { type: "text" | "status"; text: string }) {
    if (clientGone || res.writableEnded) return;
    res.write(`${JSON.stringify(event)}\n`);
  }

  const TOOL_STATUS_LABEL: Record<string, string> = {
    web_search: "Searching the web…",
    web_fetch: "Reading a page…",
  };

  const tools: Anthropic.Messages.ToolUnion[] | undefined = webSearchEnabled
    ? [{ type: "web_search_20260209", name: "web_search" }]
    : undefined;

  // Writing to the response after the client has gone away (tab closed,
  // page reloaded, request aborted) throws — and if that error is left
  // unhandled it crashes the whole Node process, taking down every other
  // in-flight request too. Guard both directions: stop writing once the
  // client is gone, and swallow write errors instead of letting them escape.
  let clientGone = false;
  let currentStream: ReturnType<Anthropic["messages"]["stream"]> | null = null;

  // `req`'s 'close' event fires as soon as Express finishes reading the
  // request body — i.e. almost immediately, not on client disconnect. `res`'s
  // 'close' fires when the response's connection ends; check writableEnded
  // to tell "client actually left mid-stream" apart from "response finished
  // normally and the socket was then closed."
  res.on("close", () => {
    if (!res.writableEnded) {
      clientGone = true;
      currentStream?.controller.abort();
    }
  });
  res.on("error", (err) => {
    console.error("Response write failed (client likely disconnected):", err.message);
  });

  // Web search runs as a server-side tool loop with a default 10-iteration
  // cap; a search-heavy turn can hit that and come back with
  // stop_reason: "pause_turn" instead of a finished answer. Resume by
  // re-sending the conversation with the paused assistant turn appended —
  // capped here so a pathological loop can't stream forever.
  const MAX_CONTINUATIONS = 3;

  try {
    for (let attempt = 0; attempt <= MAX_CONTINUATIONS; attempt++) {
      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 4096,
        system,
        messages,
        tools,
        output_config: { effort: "medium" },
      });
      currentStream = stream;

      stream.on("text", (delta) => {
        writeEvent({ type: "text", text: delta });
      });

      stream.on("streamEvent", (event) => {
        if (event.type !== "content_block_start") return;
        const block = event.content_block;
        if (block.type === "server_tool_use") {
          writeEvent({ type: "status", text: TOOL_STATUS_LABEL[block.name] ?? "Using a tool…" });
        } else if (block.type === "web_search_tool_result" || block.type === "web_fetch_tool_result") {
          writeEvent({ type: "status", text: "Reading results…" });
        }
      });

      const finalMessage = await stream.finalMessage();
      if (clientGone) break;

      if (finalMessage.stop_reason === "pause_turn" && attempt < MAX_CONTINUATIONS) {
        writeEvent({ type: "status", text: "Still searching…" });
        messages = [...messages, { role: "assistant", content: finalMessage.content }];
        continue;
      }
      break;
    }
    if (!clientGone && !res.writableEnded) res.end();
  } catch (err) {
    console.error("Claude request failed:", err);
    if (!res.headersSent) {
      const detail = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Something went wrong talking to Claude: ${detail}` });
    } else if (!clientGone && !res.writableEnded) {
      res.end();
    }
  }
});
