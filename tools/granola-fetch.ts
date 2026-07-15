#!/usr/bin/env bun
/**
 * granola-fetch.ts — secure fetch from the Granola API into raw/transcripts/,
 * plus an offline --sample mode so the demo works with zero credentials.
 *
 * The API key NEVER appears in argv, chat, logs, commits, or URLs.
 *
 * Key resolution order (first hit wins):
 *   1. 1Password CLI      `op read op://<vault>/<item>/<field>`  ← preferred
 *   2. macOS Keychain     `security find-generic-password`
 *   3. Environment        GRANOLA_API_KEY
 *   4. .env file          (gitignored)
 *
 * Why 1Password first: the key never sits on disk in plaintext, rotation is a
 * one-field edit in the vault, revocation and audit live in one place, and the
 * same reference works across machines. See SECURITY.md for the full argument.
 *
 * Usage:
 *   bun tools/granola-fetch.ts list --sample         # list bundled fictional demo meetings
 *   bun tools/granola-fetch.ts fetch --sample <id>   # copy a demo meeting into raw/transcripts/
 *   bun tools/granola-fetch.ts check                 # verify auth (never prints the key)
 *   bun tools/granola-fetch.ts list [--limit N] [--cursor C]  # list your recent meeting notes
 *   bun tools/granola-fetch.ts get <note_id>         # print one note's JSON (key-redacted)
 *   bun tools/granola-fetch.ts fetch <note_id>...    # write raw/transcripts/<date>-<slug>.{json,md}
 *   bun tools/granola-fetch.ts fetch --since YYYY-MM-DD  # bulk-fetch every note on/after a date
 *
 * `ingest` is accepted as an alias of `fetch` for back-compat. In this repo's
 * docs, "ingest" means the full wiki operation (fetch + LLM fan-out, per
 * CLAUDE.md); this tool only does the fetch step.
 *
 * Config (env, all optional):
 *   GRANOLA_OP_REF            default op://Private/Granola/credential
 *   GRANOLA_API_BASE          default https://public-api.granola.ai/v1
 *   GRANOLA_KEYCHAIN_SERVICE  default granola-api-key
 */

import { spawnSync } from "bun";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const API_BASE = process.env.GRANOLA_API_BASE ?? "https://public-api.granola.ai/v1";
const OP_REF = process.env.GRANOLA_OP_REF ?? "op://Private/Granola/credential";
const KEYCHAIN_SERVICE = process.env.GRANOLA_KEYCHAIN_SERVICE ?? "granola-api-key";
// fileURLToPath, not URL.pathname: pathname yields "/C:/..." on Windows and
// percent-encodes spaces, both of which break fs calls.
const RAW_DIR = fileURLToPath(new URL("../raw/transcripts/", import.meta.url));
const SAMPLES_DIR = fileURLToPath(new URL("../samples/", import.meta.url));
const MEETINGS_DIR = fileURLToPath(new URL("../wiki/Meetings/", import.meta.url));

// --- key resolution (never logged) ------------------------------------------

/** 1Password CLI. Silent no-op if `op` is not installed or not signed in. */
function keyFromOnePassword(): string | null {
  try {
    const r = spawnSync(["op", "read", OP_REF]);
    if (r.exitCode === 0) {
      const k = r.stdout.toString().trim();
      return k.length ? k : null;
    }
  } catch { /* op CLI not installed — fall through to Keychain */ }
  return null;
}

function keyFromKeychain(): string | null {
  try {
    const user = process.env.USER ?? "";
    const r = spawnSync([
      "security", "find-generic-password", "-a", user, "-s", KEYCHAIN_SERVICE, "-w",
    ]);
    if (r.exitCode === 0) {
      const k = r.stdout.toString().trim();
      return k.length ? k : null;
    }
  } catch { /* security not available (non-macOS) */ }
  return null;
}

function keyFromDotEnv(): string | null {
  try {
    const p = fileURLToPath(new URL("../.env", import.meta.url));
    const txt = readFileSync(p, "utf8");
    const m = txt.match(/^\s*GRANOLA_API_KEY\s*=\s*(.+)\s*$/m);
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  } catch { return null; }
}

function resolveKey(): string {
  const k = keyFromOnePassword() ?? keyFromKeychain() ?? process.env.GRANOLA_API_KEY ?? keyFromDotEnv();
  if (!k) {
    console.error(
      "No Granola API key found. Store it in 1Password (preferred):\n" +
      `  1. Create an item with a 'credential' field, e.g. vault Private, item Granola\n` +
      `  2. Check sign-in with: op whoami\n` +
      `  3. This tool reads: ${OP_REF} (override via GRANOLA_OP_REF)\n` +
      "or macOS Keychain:\n" +
      `  security add-generic-password -a \"$USER\" -s ${KEYCHAIN_SERVICE} -w\n` +
      "or a gitignored .env file with GRANOLA_API_KEY (last resort — plaintext on disk).\n" +
      "No key? Try the offline demo: bun tools/granola-fetch.ts list --sample",
    );
    process.exit(2);
  }
  return k;
}

/** Strip anything that looks like the key from a string before it's ever shown.
 *  The length floor keeps a degenerate short value (e.g. a test placeholder) from
 *  redacting every occurrence of a common substring; real keys are long. Deliberate
 *  tradeoff: a value under 8 chars is NOT split-redacted (no valid Granola key is
 *  that short); the grn_ pattern scrub below applies to anything key-shaped. */
function redact(s: string, key: string): string {
  const scrubbed = key && key.length >= 8 ? s.split(key).join("grn_***REDACTED***") : s;
  return scrubbed.replace(/grn_[A-Za-z0-9_\-]{8,}/g, "grn_***REDACTED***");
}

// --- sample mode (offline, zero credentials) ---------------------------------

function sampleNotes(): { id: string; title: string; date: string; base: string }[] {
  if (!existsSync(SAMPLES_DIR)) return [];
  return readdirSync(SAMPLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const note = JSON.parse(readFileSync(`${SAMPLES_DIR}${f}`, "utf8"));
      return { id: note.id, title: note.title, date: noteDate(note), base: f.replace(/\.json$/, "") };
    });
}

function cmdSampleList() {
  const notes = sampleNotes();
  if (notes.length === 0) { console.log("No bundled samples found in samples/."); return; }
  console.log("Bundled demo meetings (fictional — no API key needed):\n");
  for (const n of notes) console.log(`${n.date}  ${n.id.padEnd(32)}  ${n.title}`);
  console.log(`\nNext: bun tools/granola-fetch.ts fetch --sample <id>`);
}

function cmdSampleIngest(id: string) {
  const note = sampleNotes().find((n) => n.id === id);
  if (!note) {
    console.error(`No sample with id '${id}'. Run: bun tools/granola-fetch.ts list --sample`);
    process.exit(1);
  }
  mkdirSync(RAW_DIR, { recursive: true });
  for (const ext of [".json", ".md"]) {
    const dest = `${RAW_DIR}${note.base}${ext}`;
    if (existsSync(dest)) console.log(`(overwriting existing raw/transcripts/${note.base}${ext})`);
    copyFileSync(`${SAMPLES_DIR}${note.base}${ext}`, dest);
  }
  console.log(`Wrote:\n  raw/transcripts/${note.base}.json\n  raw/transcripts/${note.base}.md`);
  console.log(`\nNext: ask your LLM to read the transcript, write wiki/Meetings/${note.base}.md,`);
  console.log(`and fan out into People/Projects/Areas per CLAUDE.md. That's the whole exercise.`);
}

// --- API ---------------------------------------------------------------------

async function api(path: string, key: string): Promise<any> {
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (/certificat|self.?signed|unable to verify|CERT_/i.test(msg)) {
      throw new Error(
        `${msg}\n` +
        `If you're on a corporate/managed network, this often means TLS interception: the\n` +
        `network re-signs HTTPS with your organization's root certificate, which bun does\n` +
        `not trust by default (your browser does, because IT installed that root). Fix it\n` +
        `by trusting that root, never by disabling verification:\n` +
        `  bun --use-system-ca tools/granola-fetch.ts check          # use the OS trust store\n` +
        `  NODE_EXTRA_CA_CERTS=/path/to/corp-root.pem bun tools/...  # or a PEM file with the root\n` +
        `If you're NOT on a managed network, take the error at face value — the server's\n` +
        `certificate may genuinely be expired, self-signed, or wrong. Do NOT set\n` +
        `NODE_TLS_REJECT_UNAUTHORIZED=0 — that turns off TLS verification entirely.`,
      );
    }
    throw e;
  }
  if (!res.ok) {
    const body = redact(await res.text().catch(() => ""), key);
    let hint = "";
    if (res.status === 404 && path.startsWith("/notes")) {
      hint = "\nHint: a persistent 404 with a valid key usually means the API base/path changed — override with GRANOLA_API_BASE.";
    } else if (res.status === 403) {
      hint = "\nHint: a 403 with an HTML body is usually bot/IP protection in front of the API, not a bad key — try from your normal network.";
    }
    throw new Error(`${res.status} ${res.statusText} on ${path}\n${body.slice(0, 500)}${hint}`);
  }
  return res.json();
}

// --- helpers ------------------------------------------------------------------

function slugify(s: string): string {
  return (s || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function noteDate(note: any): string {
  const d = note?.created_at ?? note?.date ?? note?.updated_at;
  if (!d) return "undated";
  const t = new Date(d);
  return isNaN(+t) ? "undated" : t.toISOString().slice(0, 10); // normalized ISO, so lexical compare == chronological
}

const TRANSCRIPT_FIELDS = ["transcript", "transcript_text", "notes", "content"];

/** Best-effort extraction of a readable transcript. Granola's shape may vary —
 *  we always keep the full .json, so nothing is lost if this misses a field. */
function extractTranscript(note: any): string | null {
  for (const f of TRANSCRIPT_FIELDS) {
    const v = note?.[f];
    if (v) return typeof v === "string" ? v : JSON.stringify(v, null, 2);
  }
  return null;
}

function toMarkdown(note: any): string {
  const title = note?.title ?? note?.name ?? "Untitled meeting";
  const date = noteDate(note);
  const attendees: string[] = (note?.attendees ?? note?.people ?? [])
    .map((a: any) => (typeof a === "string" ? a : a?.name ?? a?.email)).filter(Boolean);
  const body = extractTranscript(note) ?? "";
  return [
    `# ${title}`,
    ``,
    `- **Date:** ${date}`,
    `- **Granola ID:** ${note?.id ?? "unknown"}`,
    attendees.length ? `- **Attendees:** ${attendees.join(", ")}` : ``,
    ``,
    `---`,
    ``,
    body,
    ``,
  ].filter((l) => l !== undefined).join("\n");
}

/** CLAUDE.md rule: never re-ingest a granola_id already in wiki/Meetings/.
 *  Raw refetch is harmless (same source), so we warn instead of blocking. */
function wikiPageFor(id: string): string | null {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^granola_id:\\s*["']?${esc}["']?\\s*$`, "m"); // exact frontmatter value, not substring
  try {
    for (const f of readdirSync(MEETINGS_DIR)) {
      if (!f.endsWith(".md")) continue;
      if (re.test(readFileSync(`${MEETINGS_DIR}${f}`, "utf8"))) return f;
    }
  } catch { /* no wiki yet */ }
  return null;
}

// --- commands -----------------------------------------------------------------

async function cmdCheck(key: string) {
  await api("/notes?limit=1", key);
  console.log("OK — authenticated to Granola. Key resolved and valid. (key not shown)");
}

async function cmdList(key: string, limit: number, cursor?: string) {
  const q = `/notes?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
  const data = await api(q, key);
  const notes: any[] = data?.notes ?? data?.data ?? data ?? [];
  if (!Array.isArray(notes) || notes.length === 0) { console.log("No notes returned."); return; }
  for (const n of notes) {
    console.log(`${noteDate(n)}  ${String(n?.id ?? "?").padEnd(24)}  ${n?.title ?? n?.name ?? "(untitled)"}`);
  }
  if (data?.next_cursor) console.log(`\n(more available — rerun with --cursor ${data.next_cursor})`);
}

async function cmdGet(key: string, id: string) {
  const note = await api(`/notes/${encodeURIComponent(id)}`, key);
  console.log(redact(JSON.stringify(note, null, 2), key));
}

async function cmdFetchOne(key: string, id: string) {
  const page = wikiPageFor(id);
  if (page) {
    console.error(`Note: granola_id ${id} is already integrated into the wiki (wiki/Meetings/${page}).`);
    console.error(`CLAUDE.md rule: don't re-ingest — cross-reference. Refetching the raw transcript anyway.`);
  }
  const note = await api(`/notes/${encodeURIComponent(id)}`, key);
  mkdirSync(RAW_DIR, { recursive: true });
  const base = `${noteDate(note)}-${slugify(note?.title ?? note?.name)}`;
  if (existsSync(`${RAW_DIR}${base}.json`)) console.log(`(overwriting existing raw/transcripts/${base}.json)`);
  writeFileSync(`${RAW_DIR}${base}.json`, JSON.stringify(note, null, 2));
  writeFileSync(`${RAW_DIR}${base}.md`, toMarkdown(note));
  if (extractTranscript(note) === null) {
    console.error(
      `Warning: no transcript-like field found on note ${id} (tried: ${TRANSCRIPT_FIELDS.join(", ")}).\n` +
      `The full JSON is saved, but the .md body is empty. Please open a GitHub issue naming the\n` +
      `field your account's payload uses (field names only — no meeting content).`,
    );
  }
  console.log(`Wrote:\n  raw/transcripts/${base}.json\n  raw/transcripts/${base}.md`);
  console.log(`\nNext: read the transcript, then create wiki/Meetings/${base}.md and fan out per CLAUDE.md.`);
}

async function cmdFetchSince(key: string, since: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error("usage: fetch --since YYYY-MM-DD");
  // No early-stop on "page looks too old": the API's sort order isn't a documented
  // guarantee, and an optimization that can silently drop notes isn't worth it.
  // The page cap bounds cost instead — and warns when it truncates.
  const ids: string[] = [];
  const MAX_PAGES = 20;
  let cursor: string | undefined;
  for (let pageN = 0; pageN < MAX_PAGES; pageN++) {
    const q = `/notes?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const data = await api(q, key);
    const notes: any[] = data?.notes ?? data?.data ?? [];
    if (!Array.isArray(notes) || notes.length === 0) { cursor = undefined; break; }
    for (const n of notes) if (n?.id && noteDate(n) >= since) ids.push(String(n.id));
    const next: string | undefined = data?.next_cursor;
    if (!next || next === cursor) { cursor = undefined; break; } // done, or a stuck cursor
    cursor = next;
  }
  if (cursor) {
    console.error(`Warning: stopped after ${MAX_PAGES} pages with more results pending — the sweep may be incomplete. Rerun with a narrower --since, or continue manually via list --cursor.`);
  }
  if (ids.length === 0) { console.log(`No notes on/after ${since}.`); return; }
  console.log(`Fetching ${ids.length} note(s) since ${since}…\n`);
  for (const id of ids) await cmdFetchOne(key, id);
}

// --- main ----------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const sample = args.includes("--sample");
  const positional = args.filter((a) => a !== "--sample");
  const invoked = positional[0]; // echo the verb the user actually typed in usage errors
  let [cmd, ...rest] = positional;
  if (cmd === "ingest") cmd = "fetch"; // deprecated transitional alias — docs reserve "ingest" for the wiki operation

  if (!cmd || !["check", "list", "get", "fetch"].includes(cmd)) {
    console.log(
      "commands: check | list [--limit N] [--cursor C] [--sample] | get <id> |\n" +
      "          fetch <id>... | fetch --since YYYY-MM-DD | fetch --sample <id>   (ingest = alias of fetch)",
    );
    process.exit(cmd ? 1 : 0);
  }

  // Sample mode is fully offline: no key is ever resolved.
  if (sample) {
    switch (cmd) {
      case "list": return cmdSampleList();
      case "fetch": {
        if (!rest[0]) { console.error(`usage: ${invoked} --sample <id>`); process.exit(1); }
        return cmdSampleIngest(rest[0]);
      }
      default:
        console.error(`--sample only supports list and fetch.`);
        process.exit(1);
    }
  }

  const key = resolveKey(); // only resolved for real commands (needs the credential)
  try {
    switch (cmd) {
      case "check": return await cmdCheck(key);
      case "list": {
        const li = rest.indexOf("--limit");
        const ci = rest.indexOf("--cursor");
        return await cmdList(key, li >= 0 ? Number(rest[li + 1]) || 20 : 20, ci >= 0 ? rest[ci + 1] : undefined);
      }
      case "get": {
        if (!rest[0]) throw new Error("usage: get <note_id>");
        return await cmdGet(key, rest[0]);
      }
      case "fetch": {
        const si = rest.indexOf("--since");
        if (si >= 0) return await cmdFetchSince(key, rest[si + 1] ?? "");
        const ids = rest.filter((a) => !a.startsWith("--"));
        if (ids.length === 0) throw new Error(`usage: ${invoked} <note_id>... | ${invoked} --since YYYY-MM-DD`);
        for (const id of ids) await cmdFetchOne(key, id);
        return;
      }
    }
  } catch (e: any) {
    console.error("Error:", redact(String(e?.message ?? e), key));
    process.exit(1);
  }
}

main();
