# CLAUDE.md — Woordjes (Dutch flashcards)

Personal Dutch vocabulary app for Deniz (incoming uni student in NL). Built in
a Claude Code session, June 2026. This file is the handover context for future
sessions — read it before changing anything.

**This project is intentionally completely separate from `terra-reform-website`.
Never mix the two.**

## Architecture

- **Everything lives in one static file: `index.html`** — CSS (dark theme only),
  HTML, and a single `<script>`. No build step, no dependencies, works offline.
- Deployed with GitHub Pages (Settings → Pages → `main` / root).
  Live at: https://deniz-bigboss.github.io/dutch-flashcards/
- After editing `index.html`, just push — that's the whole deploy.

## Word data rules (validate after ANY data edit)

- `RAW` array, entry format:
  `["Level N", "dutch headword", "english", "Dutch sentence with *word* highlighted", "English sentence"]`
- Card ids are `"w:" + dutch headword` → **headwords must be unique across the
  whole deck** (duplicates silently merge progress).
- **Exactly 200 words per level**, 5 levels: 1 Survival basics · 2 Daily life ·
  3 People & conversation · 4 Student life · 5 Society & fluency.
- Every Dutch sentence wraps the target word in `*asterisks*` (rendered as an
  orange highlight; stripped before text-to-speech).
- No double quotes inside the strings (JS data uses `"`); apostrophes are fine.
- Check pattern used previously: extract the `<script>` → `node --check`, then
  count per level, scan duplicate headwords, scan missing `*highlights*`.

## Spaced-repetition design (tuned for ~200 cards/day — owner's requirement)

- `INTERVAL_DAYS = [0,1,3,7,14,30,60,120]`, boxes 0–7; a miss resets to box 0
  and re-queues the card a few places later in the same session.
- `MASTER_BOX = 5` (30+ day interval) counts as "known" in the stats.
- `DAILY_NEW = 30` (hard cap/day), `DAILY_GOAL = 200` (🎯 bar), `SESSION_SIZE = 25`.
- Rationale (verified by 60-day simulation): ~7–8 lifetime touches per word ×
  30 new/day peaks at ≈200 scheduled reviews/day; all 1000 words are introduced
  in ~5 weeks. Weighted practice rounds (weakest cards first) top up light days;
  new cards stay capped so the user can't binge-break retention.
- If the owner asks for a different pace, change `DAILY_NEW`/`DAILY_GOAL` and
  re-check the math (peak scheduled load should stay ≈ the goal).

## Login & per-user data

- Client-side gate only — **not real security** (public static site); the owner
  knows and accepted this. Never store the plaintext password in any repo file.
- `ACCOUNTS` in `index.html`: user `deniz` (display "Deniz").
  Password check: `sha256("woordjes-v1:" + password)` hex, with a djb2 fallback
  for non-secure contexts. To change the password, compute both values for
  `"woordjes-v1:" + newPassword` and replace `sha`/`djb` in `ACCOUNTS`.
- Storage is namespaced per user: `localStorage` keys
  `woordjes.<user>.{progress,custom,settings,streak,daily}`.
  Legacy un-namespaced keys (pre-login versions) migrate on first login.
- Data is per-device; Export/Import backup in the footer moves it across devices.

## Conventions

- Keep it a single file; the owner opens it from a phone home screen.
- UI text in English, learning content in Dutch; dark theme only.
- Pronunciation via browser `speechSynthesis`, `nl-NL`.

## Version history

- v1: 169 words, light theme, basic Leitner.
- v2: dark mode default, 1000 words (5×200), 200/day scheduler (simulated & tuned).
- v3 (current): login screen, per-user tracked data, legacy migration.
