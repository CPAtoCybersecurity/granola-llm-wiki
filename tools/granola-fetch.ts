#!/usr/bin/env bun
/**
 * granola-fetch.ts — secure ingest from the Granola API into raw/transcripts/,
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
 *   bun tools/granola-fetch.ts list --sample        # list bundled fictional demo meetings
 *   bun tools/granola-fetch.ts ingest --sample <id> # copy a demo meeting into raw/transcripts/
 *   bun tools/granola-fetch.ts check                # verify auth (never prints the key)
 *   bun tools/granola-fetch.ts list [--limit N]     # list your recent meeting notes
 *   bun tools/granola-fetch.ts get <note_id>        # print one note's JSON (key-redacted)
 *   bun tools/granola-fetch.ts ingest <note_id>     # write raw/transcripts/<date>-<slug>.{json,md}
 *
 * Config (env, all optional):
 *   GRANOLA_OP_REF            default op://Private/Granola/credential
 *   GRANOLA_API_BASE          default https://public-api.granola.ai/v1
 *   GRANOLA_KEYCHAIN_SERVICE  default granola-api-key
 */

import { spawnSync } from "bun";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from "node:fs";

const API_BASE = process.env.GRANOLA_API_BASE ?? "https://public-api.granola.ai/v1";
const OP_REF = process.env.GRANOLA_OP_REF ?? "op://Private/Granola/credential";
const KEYCHAIN_SERVICE = process.env.GRANOLA_KEYCHAIN_SERVICE ?? "granola-api-key";
const RAW_DIR = new URL("../raw/transcripts/", import.meta.url).pathname;
const SAMPLES_DIR = new URL("../samples/", import.meta.url).pathname;

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
    const p = new URL("../.env", import.meta.url).pathname;
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

/** Strip anything that looks like the key from a string before it's ever shown. */
function redact(s: string, key: string): string {
  return key ? s.split(key).join("grn_***REDACTED***").replace(/grn_[A-Za-z0-9_\-]{8,}/g, "grn_***REDACTED***") : s;
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
  console.log(`\nNext: bun tools/granola-fetch.ts ingest --sample <id>`);
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
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = redact(await res.text().catch(() => ""), key);
    throw new Error(`${res.status} ${res.statusText} on ${path}\n${body.slice(0, 500)}`);
  }
  return res.json();
}

// --- helpers ------------------------------------------------------------------

function slugify(s: string): string {
  return (s || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function noteDate(note: any): string {
  const d = note?.created_at ?? note?.date ?? note?.updated_at;
  return d ? new Date(d).toISOString().slice(0, 10) : "undated";
}

/** Best-effort extraction of a readable transcript. Granola's shape may vary —
 *  we always keep the full .json, so nothing is lost if this misses a field. */
function toMarkdown(note: any): string {
  const title = note?.title ?? note?.name ?? "Untitled meeting";
  const date = noteDate(note);
  const attendees: string[] = (note?.attendees ?? note?.people ?? [])
    .map((a: any) => (typeof a === "string" ? a : a?.name ?? a?.email)).filter(Boolean);
  const transcript = note?.transcript ?? note?.transcript_text ?? note?.notes ?? note?.content ?? "";
  const body = typeof transcript === "string" ? transcript : JSON.stringify(transcript, null, 2);
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

// --- commands -----------------------------------------------------------------

async function cmdCheck(key: string) {
  await api("/notes?limit=1", key);
  console.log("OK — authenticated to Granola. Key resolved and valid. (key not shown)");
}

async function cmdList(key: string, limit: number) {
  const data = await api(`/notes?limit=${limit}`, key);
  const notes: any[] = data?.notes ?? data?.data ?? data ?? [];
  if (!Array.isArray(notes) || notes.length === 0) { console.log("No notes returned."); return; }
  for (const n of notes) {
    console.log(`${noteDate(n)}  ${String(n?.id ?? "?").padEnd(24)}  ${n?.title ?? n?.name ?? "(untitled)"}`);
  }
  if (data?.next_cursor) console.log(`\n(next_cursor: ${data.next_cursor})`);
}

async function cmdGet(key: string, id: string) {
  const note = await api(`/notes/${encodeURIComponent(id)}`, key);
  console.log(redact(JSON.stringify(note, null, 2), key));
}

async function cmdIngest(key: string, id: string) {
  const note = await api(`/notes/${encodeURIComponent(id)}`, key);
  mkdirSync(RAW_DIR, { recursive: true });
  const base = `${noteDate(note)}-${slugify(note?.title ?? note?.name)}`;
  writeFileSync(`${RAW_DIR}${base}.json`, JSON.stringify(note, null, 2));
  writeFileSync(`${RAW_DIR}${base}.md`, toMarkdown(note));
  console.log(`Wrote:\n  raw/transcripts/${base}.json\n  raw/transcripts/${base}.md`);
  console.log(`\nNext: read the transcript, then create wiki/Meetings/${base}.md and fan out per CLAUDE.md.`);
}

// --- main ----------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const sample = args.includes("--sample");
  const [cmd, ...rest] = args.filter((a) => a !== "--sample");

  if (!cmd || !["check", "list", "get", "ingest"].includes(cmd)) {
    console.log("commands: check | list [--limit N] [--sample] | get <id> | ingest <id> | ingest --sample <id>");
    process.exit(cmd ? 1 : 0);
  }

  // Sample mode is fully offline: no key is ever resolved.
  if (sample) {
    switch (cmd) {
      case "list": return cmdSampleList();
      case "ingest": {
        if (!rest[0]) { console.error("usage: ingest --sample <id>"); process.exit(1); }
        return cmdSampleIngest(rest[0]);
      }
      default:
        console.error(`--sample only supports list and ingest.`);
        process.exit(1);
    }
  }

  const key = resolveKey(); // only resolved for real commands (needs the credential)
  try {
    switch (cmd) {
      case "check": return await cmdCheck(key);
      case "list": {
        const li = rest.indexOf("--limit");
        return await cmdList(key, li >= 0 ? Number(rest[li + 1]) || 20 : 20);
      }
      case "get": {
        if (!rest[0]) throw new Error("usage: get <note_id>");
        return await cmdGet(key, rest[0]);
      }
      case "ingest": {
        if (!rest[0]) throw new Error("usage: ingest <note_id>");
        return await cmdIngest(key, rest[0]);
      }
    }
  } catch (e: any) {
    console.error("Error:", redact(String(e?.message ?? e), key));
    process.exit(1);
  }
}

main();
