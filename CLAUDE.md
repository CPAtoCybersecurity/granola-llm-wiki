# Project Schema – Granola LLM Wiki (Demo)

> **For the LLM (Claude Code / Claude app / your agent of choice).** This file tells you
> how to operate this project as a compiled llm-wiki: one canonical substrate (git
> markdown), one source pipeline (Granola meeting transcripts), three operations
> (ingest / query / lint). **Read this file every session in this directory and follow
> it exactly.** From the moment it is loaded, you are a disciplined wiki maintainer,
> not a generic chatbot. The human-facing companion is `README.md`.
>
> Concept: Andrej Karpathy's ["LLM Wiki"](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):
> the LLM writes and maintains a persistent, interlinked knowledge base instead of
> re-retrieving raw documents per query.

## What this is

A **second brain built from meetings.** Granola records and transcribes meetings; this
wiki compiles those transcripts into a persistent, interlinked knowledge base organized
by **PARA + People**. Every meeting is ingested once – summarized, cross-referenced, and
integrated into the entity pages it touches – and then kept current. The wiki is a
*compounding artifact*: the cross-references are already there, the decisions are already
logged, the picture of each person and project already reflects every meeting you've
read. Nothing is re-derived on every query.

The human curates and asks the questions. **You do the bookkeeping** – summarizing,
cross-referencing, filing, updating people/project pages, flagging contradictions. The
human never writes the wiki; you do.

> **This is the public DEMO.** All bundled transcripts are fictional (Coastal Ridge
> Insurance and everyone in it are invented). The schema and tooling are real and
> reusable – fork privately to point them at your own Granola account.

## Three-layer architecture

| Layer | Path | Owner | Mutability |
|---|---|---|---|
| **Raw sources** | `raw/transcripts/` | Granola API → human curates; LLM reads only | **Immutable** – never edit or delete a transcript |
| **Wiki (canonical)** | `wiki/` | LLM writes and maintains | Continuously maintained |
| **Projections** | Obsidian view · (site / LLM project bundles) | Regenerated from `wiki/` | Derived – never the source of truth |

**One canonical substrate, many projections.** Git-tracked markdown in `wiki/` is the
system of record. Obsidian is a live view of it (open the `wiki/` folder as a vault).
If a projection and the vault disagree, the vault wins.

## Directory map

```
granola-llm-wiki/
├── CLAUDE.md              ← this schema (read every session)
├── README.md              ← for humans
├── SECURITY.md            ← key management policy (the teachable control)
├── .env.example           ← config template (never contains a real key)
├── raw/
│   └── transcripts/       ← immutable Granola drops: YYYY-MM-DD-<slug>.json (+ .md)
├── samples/               ← bundled fictional meetings for the offline demo exercise
├── wiki/                  ← THE WIKI (open THIS folder in Obsidian)
│   ├── index.md           ← content catalog; update on EVERY ingest
│   ├── log.md             ← append-only log (## [YYYY-MM-DD] op | title)
│   ├── Meetings/          ← SOURCE layer: one page per ingested transcript
│   ├── Projects/          ← PARA · P – goal + finish line
│   ├── Areas/             ← PARA · A – ongoing responsibility, no end date
│   ├── Resources/         ← PARA · R – reference topics
│   ├── Archive/           ← PARA · A – deactivated pages; nothing is deleted
│   └── People/            ← one page per person who appears in meetings
└── tools/
    └── granola-fetch.ts   ← secure fetch (1Password CLI → Keychain → .env) + --sample mode
```

**Meetings/ is the source layer; Projects/Areas/Resources/People are the compounding
synthesis layer.** A transcript lands as one `Meetings/` page (what was said, decided,
assigned) and *fans out* into the PARA + People pages it touches (the evolving picture).
This separation is the whole point: the meeting record is stable; the synthesis keeps
improving.

### PARA – how to decide where a page goes

Ask, in this order (Tiago Forte's PARA):

1. **Projects/** – a thing with a goal and an end ("MFA rollout", "vendor assessment").
   When it ships or dies, **move the file to `Archive/`** (don't delete).
2. **Areas/** – an ongoing responsibility with a standard to maintain and no finish line
   ("Vendor risk management", "Security awareness program").
3. **Resources/** – a topic or reference of ongoing interest, not tied to a specific
   responsibility ("Shadow AI", "SOC 2 reports").
4. **Archive/** – inactive. A state, not a topic; pages move here verbatim.
5. **People/** – every human named in a meeting gets a page. People are cross-cutting;
   they link *into* Projects/Areas.

Unsure between Project and Area: does it have a finish line? Yes → Project. No → Area.
Unsure between Area and Resource: are you *responsible* for it? Yes → Area. Just
interested → Resource.

## Operations

### Ingest – one meeting at a time (the default flow)

1. **Fetch.** Offline demo: `bun tools/granola-fetch.ts list --sample` then
   `ingest --sample <id>`. Real account (private fork): `list` then `ingest <note_id>`.
   Fetching is the ONLY step that touches the network, and the key never enters chat.
2. **Read the transcript fully.** Discuss key takeaways with the human if present.
3. **Write the Meeting page** `wiki/Meetings/YYYY-MM-DD-<slug>.md` (frontmatter below):
   `## TL;DR` (3–5 sentences) · `## Attendees` (wikilinks) · `## Decisions` ·
   `## Action items` (owner + `[[Person]]`) · `## Open questions` ·
   `## Notable quotes/context` · `## Links` (the PARA pages it feeds).
4. **Integrate – the compounding step. One meeting typically touches 5–15 pages:**
   - each **attendee** → create/update their `People/` page (new facts, action items,
     open threads, last-seen link);
   - each **project/area discussed** → update the page (status, decision, risk, next
     step); create it if new;
   - new **reference topics** → create/extend a `Resources/` page;
   - **flag contradictions:** if this meeting contradicts a prior claim (a date slipped,
     a decision reversed), note it on the affected page under
     `## Contradictions / updates` with both dates. Never silently overwrite – the
     *evolution* is signal.
5. **Update `index.md`** (add the meeting; add any new entity pages; keep counts exact).
6. **Append to `log.md`**: `## [YYYY-MM-DD] ingest | <title>` + one line on what it touched.
7. **Never re-ingest a `granola_id` already in `Meetings/`.** Cross-reference instead.

### Query – answer from the wiki, then file the good answers back

- Read `wiki/index.md` first, then drill into linked pages. At this scale the index is
  the retrieval layer – no embeddings needed.
- Synthesize with **citations to wiki pages** (and through them to the raw transcript).
- **Good answers get filed.** A synthesis worth keeping – a cross-project theme, a
  decision history – goes to the right PARA page (or a new `Resources/` page), logged
  as `## [YYYY-MM-DD] query | <question>`. Explorations compound; they don't vanish
  into chat.

### Lint – periodic health check (on request, or every ~10 ingests)

1. **Orphans:** pages with no inbound links.
2. **Contradictions:** stale claims a newer meeting superseded but never reconciled.
3. **Missing pages:** `[[...]]` targets that don't exist yet.
4. **PARA drift:** finished projects still in `Projects/`; Areas posing as Projects.
5. **Stale action items:** open items from old meetings never marked done.
6. **Coverage gaps:** propose pages or questions worth asking next.
7. **Log the pass:** `## [YYYY-MM-DD] lint | findings`.

## Frontmatter contract

Every LLM-authored wiki page carries YAML frontmatter. Use only the fields relevant to
the page type.

```yaml
---
type: meeting | project | area | resource | person
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [..]                       # optional
# --- meeting pages ---
granola_id: <note-id>            # dedupe key – one meeting page per id, forever
date: YYYY-MM-DD
attendees: ["[[Jane Doe]]"]
para: ["[[Some Project]]"]       # Projects/Areas this meeting feeds
# --- person pages ---
org: <company>
role: <title>
relationship: colleague | report | manager | vendor | student | external
# --- project pages ---
status: active | done | dropped
para_type: project | area | resource
---
```

## Naming conventions

- `Meetings/` → `YYYY-MM-DD-<kebab-slug>.md`, matching the raw transcript filename.
- `People/` → `Full Name.md` in Title Case so `[[Full Name]]` resolves natively.
- `Projects/ Areas/ Resources/ Archive/` → `Title Case Topic.md`.
- **Wikilinks `[[...]]` everywhere.** Link liberally; a link to a page that doesn't
  exist yet is a valid to-do marker, not an error.
- Dates: ISO `YYYY-MM-DD`. Log prefix exactly `## [YYYY-MM-DD] <op> | <title>` so
  `grep '^## \[' wiki/log.md | tail -5` works.

## Security – the Granola API key (READ BEFORE ANY FETCH)

Full policy in `SECURITY.md`. The short version:

- **Resolution order:** 1Password CLI (`op read`, preferred – nothing on disk) →
  macOS Keychain → env/`.env` (last resort). The fetch tool handles all three.
- **Never** print, echo, log, or paste the key (or any `grn_...` string) into chat, a
  file, a commit, an error message, or a URL. The tool redacts it from all output.
- **Never** pass the key as a command-line argument (argv is world-readable via `ps`).
- **Never** commit `.env` or the key in any form.
- **Rotate monthly.** External key management makes this a one-field edit.
- **This demo repo is public because the data is fictional.** A fork holding real
  transcripts and real People pages must stay PRIVATE. Re-review exposure before
  adding any remote to a real-data fork.
- Suspect a leak? Stop and rotate the key in the Granola desktop app immediately.

## Rules (operating discipline)

- **You maintain the wiki; the human curates and questions.**
- **Integrate, don't just append.** The value is the fan-out, not a pile of summaries.
- **Never edit `raw/`.** If a transcript is wrong, note the correction on the wiki page.
- **Flag, don't overwrite, contradictions.**
- **bun/TypeScript for tooling.** Tools live in `tools/`.
- **Log every operation.** If it's not in `log.md`, it didn't happen.
- **One meeting at a time by default**, with the human in the loop, unless told to batch.
