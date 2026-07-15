# Granola LLM Wiki – Demo

> **Demonstration repo with fictional data.** Every transcript, person, and company in
> here is invented (meet the security team at "Coastal Ridge Insurance"). The schema,
> tooling, and workflow are real – fork privately to use them with your own meetings.

A **second brain built from your meetings.** [Granola](https://www.granola.ai) records
and transcribes them; an LLM compiles the transcripts into a persistent, interlinked
wiki organized by PARA + People, and keeps it current. You curate and ask questions;
the LLM does all the bookkeeping. This repo is the working demo: three fictional
security-team meetings, fully ingested and fanned out, plus a fourth left for you to
ingest yourself.

**Obsidian is the IDE, the LLM is the programmer, `wiki/` is the codebase.**

## Credits

This project stands on two sources, credited for different things:

- **Concept:** Andrej Karpathy's ["LLM Wiki"](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
  (April 2026) – the idea that an LLM should build and *maintain* a persistent,
  interlinked knowledge base rather than re-retrieve raw documents per query. In his
  words: "The wiki is a persistent, compounding artifact. The cross-references are
  already there." and "You never (or rarely) write the wiki yourself—the LLM writes
  and maintains all of it."
- **Walkthrough reference:** ["I Turned Claude Into the Ultimate Second Brain"](https://www.youtube.com/watch?v=8QQ_INxAhRs)
  by Nate Herk (AI Automation) – a practical build of the same pattern.
- Also: [Granola](https://www.granola.ai) for the meeting transcription layer, and
  Tiago Forte's [PARA method](https://fortelabs.com/blog/para/) for the organizing
  scheme.

## What this demonstrates

Two lessons in one artifact:

1. **Productivity – a curated second brain beats RAG.** Each meeting is ingested once
   and integrated into every page it touches: people, projects, areas, resources.
   Decisions are logged, contradictions are flagged with both dates, and answers come
   from pages that already reflect every meeting read so far. Nothing is re-derived
   per query. (The fictional meetings even contain a planted contradiction – see the
   guided tour.)
2. **Security – external key management as a control.** The Granola API key is a
   long-lived bearer secret for your entire meeting history. This repo treats it the
   way a GRC team would: resolved at runtime from **1Password CLI** (nothing on disk),
   Keychain as fallback, `.env` as last resort, monthly rotation, full policy in
   [SECURITY.md](SECURITY.md). Maps to NIST CSF 2.0 PR.AA-01.

Bonus: the fictional meetings are themselves security case studies – phishing metrics,
a SOC 2 vendor review, and a shadow-AI cleanup.

## Quickstart (zero credentials)

Prerequisites: [bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`) and,
for the full experience, [Obsidian](https://obsidian.md). If you just installed bun,
open a new terminal (or `source ~/.zshrc`) and confirm with `bun --version` before
continuing. Note: `[[wikilinks]]` are clickable in Obsidian, not on GitHub's file
viewer.

```
git clone https://github.com/CPAtoCybersecurity/granola-llm-wiki
cd granola-llm-wiki
bun tools/granola-fetch.ts list --sample
```

Then open the `wiki/` folder as an Obsidian vault and browse.

### Troubleshooting

None of these are bugs – they're the three ways a fresh setup usually trips:

- **`bun: command not found`** – the installer added bun to your PATH, but your current
  terminal hasn't picked it up. Open a new terminal (or `source ~/.zshrc`) and check
  `bun --version`. Still not found? Run the install one-liner above, then open a new
  terminal.
- **`Module not found "tools/granola-fetch.ts"`** – you're in the wrong directory. Run
  `pwd` and confirm you're in the folder that contains `tools/` and `wiki/`. A classic
  cause: cloning into a folder already named `granola-llm-wiki`, which nests the repo
  one level down (`granola-llm-wiki/granola-llm-wiki`) – `cd` into the inner one.
- **`usage: ingest --sample <id>`** – `ingest` needs a meeting id. Run
  `bun tools/granola-fetch.ts list --sample` first and copy the id it prints
  (`demo-2026-06-23-tabletop-debrief`) into the ingest command.

## Guided tour (3 stops, ~5 minutes)

1. **[`wiki/index.md`](wiki/index.md)** – the catalog. Three meetings in, this is the
   retrieval layer: no embeddings, no vector store, just an index an LLM reads first.
2. **[`wiki/Projects/MFA Rollout.md`](wiki/Projects/MFA%20Rollout.md)** – scroll to
   **Contradictions / updates**. The June 2 meeting said "end of June"; the June 16
   meeting said "mid-July". The wiki kept both, with citations. That evolution is
   exactly what RAG loses and a maintained wiki keeps.
3. **[`wiki/People/Sam Rivera.md`](wiki/People/Sam%20Rivera.md)** – one intern's page,
   compiled across meetings: assignments, delivery, open threads. Ask "what is Sam
   working on?" and this page *is* the answer.

## Now you try

A fourth fictional meeting ships in `samples/`, deliberately not yet integrated. Run
`bun tools/granola-fetch.ts list --sample` and copy the id it prints into the ingest
command:

```
bun tools/granola-fetch.ts ingest --sample demo-2026-06-23-tabletop-debrief
```

Then ask your LLM (Claude Code, or any agent that reads `CLAUDE.md`): *"ingest the new
transcript in raw/transcripts/ per CLAUDE.md."* Watch it write the meeting page, update
three people pages, touch two projects, and log the operation. That fan-out is the
whole idea.

## Using your real Granola account

Do this in a **private fork** – real transcripts and People pages are sensitive.

Store the API key (generated in the Granola desktop app) in order of preference:

1. **1Password CLI** – create an item `Granola` with a `credential` field in your
   `Private` vault. Check sign-in with `op whoami`. The tool reads
   `op://Private/Granola/credential` automatically (override via `GRANOLA_OP_REF`).
2. **macOS Keychain** – `security add-generic-password -a "$USER" -s granola-api-key -w`
3. **`.env`** (gitignored, plaintext on disk – last resort) – see `.env.example`.

Verify with `bun tools/granola-fetch.ts check`, then `list` and `ingest <note_id>`.
Rotate the key monthly; [SECURITY.md](SECURITY.md) explains why and how.

## Layout

- `raw/transcripts/` – immutable transcript drops (source of truth; never edited)
- `samples/` – bundled fictional meetings for the offline exercise
- `wiki/` – the wiki (Obsidian vault): `Meetings/` → `Projects/ Areas/ Resources/ Archive/ People/`
- `wiki/index.md` – catalog · `wiki/log.md` – operation timeline
- `tools/granola-fetch.ts` – secure fetch (1Password CLI → Keychain → .env) + sample mode
- `CLAUDE.md` – **the schema the LLM follows every session** (start there)
- `SECURITY.md` – key management policy, rotation, leak runbook

## License

MIT – see [LICENSE](LICENSE).
