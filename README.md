# Notebase

Drop in research papers, ask questions grounded only in what you uploaded, with optional live web search. Built for my master's thesis literature review — works for any research workflow.

![Notebase demo](client/public/demo.gif)

Built as a lightweight RAG (Retrieval-Augmented Generation) pipeline: uploaded documents are parsed and injected as grounded context for the Claude API, with prompt-engineered instructions enforcing citation discipline and preventing hallucinated sources.

## Why I built this

I'm doing a qualitative literature review for my master's thesis, which means constantly cross-referencing findings, methods, and arguments across a stack of papers — and losing track of which claim came from which study. I wanted something I could drop a batch of sources into and ask direct questions against, without it inventing citations, silently smoothing over disagreements between papers, or answering from the model's general knowledge instead of what I actually gave it.

<!-- Personalize this: name your actual thesis topic/field, e.g. "for my thesis on [topic], I needed to compare methodology across N papers on [X]." -->

Notebase is the result: a small, self-contained research assistant scoped to exactly the sources you upload — no more, no less.

## Prompt design

A few things it's explicitly designed to do:

- **Ground every claim in the uploaded source(s)** rather than the model's general knowledge, and say plainly when something isn't covered — unless web search is explicitly turned on for that question.
- **Preserve argument structure and methodology** (sample size, study design, population) instead of flattening a paper into a generic summary.
- **Surface disagreement instead of merging it** — when multiple documents partially overlap or conflict, the model is instructed to say so explicitly rather than blending them into one answer.
- **Refuse to fabricate citations.** If a citation format is ambiguous, it falls back to author-year rather than inventing page numbers or full bibliographic details.

Condensed version of the actual system prompt:

```
You are a research assistant helping the user work through source material for
their master's thesis. They are conducting qualitative research and need help
engaging critically with academic papers, not just summarizing them.

When answering:
- Ground every claim in the uploaded document(s). Quote or closely paraphrase
  specific findings, methods, and arguments rather than generalizing.
- If something isn't covered by the uploaded content, say so plainly — do not
  fill gaps from general knowledge unless web search is explicitly enabled.
- When asked to summarize or rewrite, preserve each source's actual argument
  structure and any named authors, studies, or theoretical frameworks it
  cites — don't flatten nuance for brevity.
- Note each source's methodology (sample size, study design, population) since
  this affects how strongly its findings can be used as evidence.
- If multiple documents agree, disagree, or only partially overlap, say so
  explicitly rather than merging them into one flattened answer.
- Default to academic register: precise, neutral, citation-aware.

Do not fabricate citations, page numbers, or study details that are not
present in the source. If a citation format is ambiguous, use author-year
rather than inventing full bibliographic details.
```

## Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node + Express + TypeScript, streaming responses to the client as NDJSON (text deltas and status events like "Searching the web…" interleaved)
- **LLM:** Claude API (`claude-opus-5`)
- **Retrieval:** full-document injection, not chunked/embedded — text sources go into the system prompt, PDFs travel as native document blocks. Prompt caching (`cache_control: ephemeral`) keeps repeated turns over the same source(s) cheap.
- **Web search:** toggle-controlled; Claude's `web_search` tool is only added to the request when the toggle is on, so plain document Q&A never pays for it.

## Status

✅ Multi-document upload (`.txt`, `.md`, `.pdf`) — add and remove sources mid-conversation, no need to restart
✅ Citation-aware, hallucination-resistant prompting, including explicit multi-document disagreement handling
✅ Streaming answers with live status updates, so multi-step tool use (e.g. several web searches in a row) doesn't look like the app hung
✅ Web search toggle, on demand, via Claude's server-side `web_search` tool
✅ Prompt caching across turns for repeated document content

🚧 Vector-based retrieval / chunking for large corpora — currently everything is injected as full-document context, which is fine for a handful of papers but won't scale to a large corpus
🚧 Persistent source library — uploaded sources live in server memory only and are gone on restart
🚧 Audio and image sources — the upload UI gestures at them, but only text and PDF are actually implemented today

## What's next

This is a working v1, not a finished product. A few concrete directions I'd take it if I kept building:

- **A distinct "my work-in-progress / my thesis" source type** — right now every upload is treated as reference material with equal weight. One of the built-in prompts asks Claude to "compare this paper's argument to my thesis framing," but there's currently no way to actually give it your own thesis draft to compare against. Letting you tag a source as your own writing (thesis chapter, proposal, notes) rather than a reference paper would make that comparison real instead of aspirational.
- **Real retrieval** (embeddings + chunking) once a source library grows past what comfortably fits in context
- **Page-level citations** for PDFs, so an answer can point to exactly where a claim came from
- **A small eval set** of thesis-relevant questions to catch prompt regressions before they ship, instead of eyeballing responses
- **Persistent storage** (even just SQLite) so sources and conversations survive a server restart
- **Basic auth + a real deployment**, since it currently only runs locally for a single user

If you're reading this as a portfolio piece: the gaps above are known, not accidental — I scoped this to prove the core idea (grounded, citation-honest Q&A over your own sources) rather than build every feature at once.

## Getting started

Requires Node.js and an [Anthropic API key](https://console.anthropic.com).

```bash
npm run install:all
cp server/.env.example server/.env   # then add your ANTHROPIC_API_KEY
npm run dev                          # runs client (5173) and server (3001) together
```
