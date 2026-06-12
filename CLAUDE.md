# CLAUDE.md — The Aru App (Dutch & Italian flashcards)

Personal vocabulary app for Deniz (incoming uni student in NL, learns Dutch)
and Aruna (learns Italian). Built in Claude Code sessions, June 2026. This
file is the handover context for future sessions — read it before changing
anything.

**This project is intentionally completely separate from `terra-reform-website`.
Never mix the two.**

## Architecture

- **Everything lives in one static file: `index.html`** — CSS (dark theme only),
  HTML, and a single `<script>`. No build step, no dependencies, works offline.
- Deployed with GitHub Pages (Settings → Pages → `main` / root).
  Live at: https://deniz-bigboss.github.io/dutch-flashcards/
- After editing `index.html`, just push — that's the whole deploy.

## Word data rules (validate after ANY data edit)

- **Two decks**: `RAW_NL` (Dutch) and `RAW_IT` (Italian), same entry format:
  `["Level N", "headword", "english", "Sentence with *word* highlighted", "English sentence"]`
- Card ids are `"w:" + headword` → **headwords must be unique within each
  deck** (duplicates silently merge progress). Decks live in separate
  per-user storage namespaces, so NL/IT collisions don't matter.
- **Exactly 200 words per level**, 5 levels per deck: 1 Survival basics ·
  2 Daily life · 3 People & conversation · 4 Student life · 5 Society & fluency.
- Every target-language sentence wraps the word in `*asterisks*` (rendered as
  an accent-colored highlight; stripped before text-to-speech).
- No double quotes inside the strings (JS data uses `"`); apostrophes are fine
  (Italian needs them: l'acqua, c'è …).
- Check pattern: extract the `<script>` → `node --check`, then per deck:
  count per level, scan duplicate headwords, scan missing `*highlights*`.

## Decks & per-user UI

- `DECKS` object in `index.html` maps deck config: code/flag/name, TTS lang
  (`nl-NL` / `it-IT`), greeting, placeholders. `ACCOUNTS[n].deck` picks it.
- Card objects keep the historic field names `nl`/`nls` for the target
  language, whatever the deck (renaming them would break stored progress).
- `applyDeckUI()` (called from `boot()`) sets all language-dependent labels:
  header subtitle, greeting, direction segment (NL→EN / IT→EN), auto-pronounce
  label, search placeholder, add-word form labels/placeholders.
- Theme accents: `body.theme-nl` (orange/amber) vs `body.theme-it`
  (green/lime); the login screen (no user yet) uses the violet/pink brand
  gradient. All via CSS variables `--ac`/`--ac2`/`--hl`/`--glow1`/`--glow2`.

## Spaced-repetition design (tuned for ~200 cards/day — same for both users)

- `INTERVAL_DAYS = [0,1,3,7,14,30,60,120]`, boxes 0–7; a miss resets to box 0
  and re-queues the card a few places later in the same session.
- `MASTER_BOX = 5` (30+ day interval) counts as "known" in the stats.
- `DAILY_NEW = 30` (hard cap/day), `DAILY_GOAL = 200` (🎯 bar), `SESSION_SIZE = 25`.
- Rationale (verified by 60-day simulation): ~7–8 lifetime touches per word ×
  30 new/day peaks at ≈200 scheduled reviews/day; all 1000 words are introduced
  in ~5 weeks. Weighted practice rounds (weakest cards first) top up light days.
- If the owner asks for a different pace, change `DAILY_NEW`/`DAILY_GOAL` and
  re-check the math (peak scheduled load should stay ≈ the goal).

## Login & per-user data

- Client-side gate only — **not real security** (public static site); the owner
  knows and accepted this. Never store a plaintext password in any repo file.
- Exactly two possible names, enforced in `tryLogin()`:
  - `deniz` (display "Deniz", deck `nl`): fixed password —
    `sha256("woordjes-v1:" + password)` hex with djb2 fallback, hardcoded in
    `ACCOUNTS`. To change it, compute both values and replace `sha`/`djb`.
  - `aruna` (display "Aruna", deck `it`, `claim:true`): **claim-on-first-login**.
    First login with this name stores `{sha,djb,at}` of the chosen password in
    `localStorage["woordjes.claim.aruna"]` (min 4 chars); afterwards the
    password must match the claim. The claim is per device (no server) — on a
    new device she claims again with the same credentials and imports a backup.
  - `yes` (display "Yes (test)", deck `it`, password `yes`): **TEMPORARY**
    test account so Deniz can preview the Italian experience (incl. Pıtırcık,
    via the `dog:true` flag) without claiming Aruna's profile. Remove the
    `ACCOUNTS` entry when testing is done.
  - Any other name → rejected with a friendly "private app" message.
- Storage is namespaced per user: `localStorage` keys
  `woordjes.<user>.{progress,custom,settings,streak,daily}` (keys keep the
  legacy `woordjes.` prefix on purpose — renaming would orphan stored data).
- Legacy un-namespaced keys migrate on first login — **Deniz only** (the
  pre-login era was Dutch-only); `migrateLegacy()` guards on this.
- Data is per-device; Export/Import backup in the footer moves it across
  devices (filename `aru-app-<user>-backup.json`).

## Patch notes (MAINTENANCE RULE — applies to every future session)

- **Every user-visible change must be announced to the users**: append an
  entry to `PATCH_NOTES` in `index.html` (newest first; small changes may be
  combined into one entry) and bump `APP_VERSION`.
- The "What's new" panel auto-opens once per user per version
  (`settings.seenNotes`), and stays reachable via the footer link.

## Italian extras (theme-it only)

- **Music 🎵**: `MUSIC_TRACKS` + a tiny Web Audio chiptune sequencer (square
  wave, note strings like `"E4:.5 R:1"`). Round button bottom-left, visible
  only with `body.theme-it`; starts on tap (autoplay policies), toast shows
  the track name. **Only public-domain melodies** (composer dead 70+ years).
  ⚠️ Never add 'O Sole Mio — an Italian court ruling (Mazzucchi) keeps it in
  copyright until ~2042. Current playlist: Funiculì Funiculà, Santa Lucia,
  Tarantella Napoletana, La donna è mobile, Torna a Surriento.
- **Pizzas 🍕**: `spawnPizza()` drifts emoji up the screen every ~7s
  (`z-index:2`, `pointer-events:none`, capped at 12); `pizzaBurst()` fires on
  Italian session completion. Both skip when `prefers-reduced-motion`.

## Pıtırcık 🐶 (Aruna's dog)

- Inline SVG in `index.html` (`#dog`, fixed bottom-right), visible only with
  `body.user-aruna`. Click/tap/Enter = pet: squash-wiggle, tongue out, faster
  tail wag, floating hearts, sometimes a "Bau!" bubble.
- Pet count persists in Aruna's `settings.pets`; every 50th pet shows a toast.
- Idle animations (breathe/wag/blink) are pure CSS; respects
  `prefers-reduced-motion`.

## Conventions

- Keep it a single file; the owners open it from a phone home screen.
- UI text in English, learning content in Dutch/Italian; dark theme only.
- Pronunciation via browser `speechSynthesis`, language from `DECK.lang`.

## Version history

- v1: 169 words, light theme, basic Leitner.
- v2: dark mode default, 1000 words (5×200), 200/day scheduler (simulated & tuned).
- v3: login screen, per-user tracked data, legacy migration.
- v4.0: renamed to **The Aru App**; modern glass UI with per-language
  themes; Italian deck `RAW_IT` (1000 words, 5×200) for Aruna; claim-on-first-
  login Aruna account; Pıtırcık the pettable dog; fixed missing `toast()`
  (was called but never defined in v3).
- v4.1: temp `yes` test account; `touch-action:manipulation` fix for
  double-tap zoom while petting; mobile flows verified in emulation.
- v4.2 (current): Web Audio chiptune player with public-domain Italian
  classics; floating pizzas + session-end pizza burst on theme-it; in-app
  "What's new" patch-notes panel (auto-opens once per version per user).
