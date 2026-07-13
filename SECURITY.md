# Security – Key Management as a Teachable Control

This repo doubles as a small security lesson. The Granola API key is a **long-lived
bearer secret**: anyone holding the string has full access to your entire meeting
history. That makes it a good case study in credential lifecycle management:
**NIST CSF 2.0 PR.AA-01** ("Identities and credentials for authorized users,
services, and hardware are managed by the organization").

## The problem with personal access tokens and API keys

A raw PAT or API key sitting in a `.env` file has five problems:

1. **Long-lived.** It works today, next month, and next year – every day it exists
   is another chance for it to leak.
2. **Bearer auth.** Possession equals identity. No second factor, no device binding.
3. **Plaintext at rest.** `.env` files end up in backups, disk images, and the
   occasional accidental commit.
4. **Leaky by habit.** Keys passed as command-line arguments show up in shell
   history and `ps` output. Keys pasted into chat windows are cached who-knows-where.
5. **No lifecycle.** Nothing expires it, nothing audits it, and revoking it means
   remembering every place you put it.

The *ideal* fix is short-lived, scoped, auto-expiring credentials. When a vendor
only issues long-lived keys (most do, Granola included), you compensate with the
controls below.

## The control: external key management

This tool reads the key at runtime from an external key manager and never stores
it in the repo. Resolution order:

| Priority | Store | Why |
|----------|-------|-----|
| 1 | **1Password CLI** (`op read op://Private/Granola/credential`) | Nothing on disk. Central rotation, revocation, and audit. Same reference works on every machine. |
| 2 | **macOS Keychain** (`security find-generic-password`) | Encrypted at rest, local to the machine. Good fallback without a 1Password account. |
| 3 | **Environment / `.env`** | Last resort. Plaintext on disk. Kept only so the demo runs anywhere. |

### 1Password setup

```
# 1. Install the CLI and sign in (one time)
brew install 1password-cli
op whoami        # confirms you're signed in

# 2. Create an item: vault "Private", item "Granola", field "credential"
#    Paste your Granola API key into that field. Done – nothing touches disk.

# 3. This tool reads it automatically:
bun tools/granola-fetch.ts check
```

The secret reference is configurable: set `GRANOLA_OP_REF=op://<vault>/<item>/<field>`.
An alternative pattern for whole environments is `op run --env-file=.env.op -- <command>`,
which injects resolved secrets into a subprocess without ever writing them out.

## Rotation

Rotate long-lived keys **monthly**. Rotation is not the control – it's the
parameter. What rotation buys you is a bounded exposure window: if the key leaked
on day 3, it dies by day 31 whether you noticed or not. External key management is
what makes monthly rotation cheap enough to actually happen: generate a new key in
the Granola app, paste it into the 1Password item, revoke the old one. One field
edit, every machine picks it up, nothing else changes.

Set a recurring reminder, or use 1Password's built-in item expiry notifications.

Mapping note: rotation is the lifecycle parameter of PR.AA-01; the same practice also
touches PR.AA-05 (least-privilege access) and PR.DS-01 (protecting data at rest), and
the rotation policy itself belongs to the governance function (GV).

## If the key leaks

If you ever see the key in output, a commit, a log, or a chat window:

1. **Rotate immediately** in the Granola desktop app (generate new, revoke old).
2. Update the 1Password item – every machine gets the new key on next run.
3. If it hit a git commit, treat the repo as burned: rotate first, then scrub.

## Hard rules this repo enforces

- The key never appears in argv (`ps`-visible), output (redacted), or any file.
- `.env` is gitignored; `.env.example` contains placeholders only.
- The bundled demo data is fictional, so this public repo contains no secrets and
  no personal data. **If you fork this for your real Granola account, make the
  fork private** – real transcripts and People pages are sensitive.

## Reporting

Found a security issue in this demo? Open a GitHub issue (no secrets in the
issue body, please).
