# CLAUDE.md — The Aru App (Dutch & Italian flashcards)

Personal vocabulary app for Deniz (incoming uni student in NL, learns Dutch)
and Aruna (learns Italian). Built in Claude Code sessions, June 2026. This
file is the handover context for future sessions — read it before changing
anything.

**This project is intentionally completely separate from `terra-reform-website`.
Never mix the two.**

## Architecture

- **The app shell lives in one static file: `index.html`** — CSS (dark theme
  only), HTML, and a single `<script>` (~20 KB gzipped). No build step.
- Sibling files (the justified breaks from single-file):
  - `deck-nl.js`, `deck-it.js` — the two 1000-word decks, lazy-loaded per
    user so neither language burdens the other (see Word data rules).
  - `sw.js` — service worker (can't be inline); `manifest.webmanifest`;
    `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — white paw on the
    brand gradient, rasterized from an SVG via headless Chromium (recipe in the
    v4.3 session); regenerate the same way if the brand changes.
- **Service worker** (`sw.js`): stale-while-revalidate cache of the app shell —
  instant repeat loads + true offline, updates still arrive within one reload.
  Bump `CACHE_VERSION` in `sw.js` in step with `APP_VERSION` on notable changes.
- Deployed with GitHub Pages (Settings → Pages → `main` / root).
  Live at: https://deniz-bigboss.github.io/dutch-flashcards/
- After editing, just push — that's the whole deploy.

## Word data rules (validate after ANY data edit)

- **Two decks in their own files**: `deck-nl.js` (`window.RAW_NL`) and
  `deck-it.js` (`window.RAW_IT`), same entry format:
  `["Level N", "headword", "english", "Sentence with *word* highlighted", "English sentence"]`
- **Lazy-loaded per user**: `loadDeck()` injects only the logged-in user's deck
  file (`DECKS[x].file`/`.global`); `boot()` awaits it, then `buildCards()` reads
  `window[DECK.global]`. So the other language costs Deniz/Aruna *nothing* —
  not download, parse, memory, nor SW cache (each device only ever fetches its
  own deck; the SW caches it on first load). Validate decks with `node --check`
  + a `new Function('window', …)` eval per file.
- Card ids are `"w:" + headword` → **headwords must be unique within each
  deck** (duplicates silently merge progress). Decks live in separate
  per-user storage namespaces, so NL/IT collisions don't matter.
- **Exactly 200 words per level**, 5 levels per deck: 1 Survival basics ·
  2 Daily life · 3 People & conversation · 4 Student life · 5 Society & fluency.
- `LEVEL_DESC` (name) and `LEVEL_CEFR` (proficiency badge) map each level;
  `cefr(cat)` is shown next to the level on the chips, flashcards and word
  list (via the `.cefr` pill). Custom categories have no badge.
- CEFR badges reflect the **actual** word difficulty, not a tidy A1→C1 ramp:
  L1 A1, L2 A2, L3 A2-B1, L4 B1, L5 B2. The 1000 commonest words span A1→B2
  and never reach C1 (that needs far rarer vocabulary). If the decks' content
  changes, re-judge these from the words rather than assuming a 1:1 ladder.

## Part-of-speech colour coding

- `posOf(headword, gloss, code)` classifies each word noun/verb/adj/adv/num/
  other from the English gloss + headword — no per-word annotation. Strong
  signals: gloss `the …` = noun, `to …` = verb; closed-class sets (`POS_*`)
  catch numbers, days, adverbs, function words/interjections; IT also uses
  article-led headwords + infinitive endings. The sets were **audited over all
  2000 words** (script in the v4.7 session) — if you change deck content, re-run
  that audit and patch the sets so the `adj`/`other` buckets stay clean.
- `POS_META` holds the label + colour per type (noun blue, verb rose, adj
  green, adv purple, num amber, other slate). The headword is tinted on the
  flashcard (`.word span`) and word list (`.rtop b`); the card shows a `.postag`
  pill, the word list a legend (`renderLegend()`). Colours are a fixed palette,
  independent of the NL/IT theme accent.
- The `*highlighted*` word inside each example sentence is also tinted its POS
  colour: `fmt(sentence, posColor(card))` passes the colour into the `.hl` span
  (flashcard + word list), so the word matches everywhere. `.sent`'s left
  border still uses the theme accent.
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

## Level selection (multi-select)

- `settings.cats` is an **array** of selected level/category names; empty = All.
  (Migrated from the old single-string `settings.cat` in `boot()`.) The user
  taps level chips to combine them (e.g. Level 1 + Level 3 = 400-word pool);
  `#deckcount` shows the combined total.
- `pool()` returns the union of selected cats (or everything when empty); all
  study/practice/stats flow through it, so combining "just works".
- `buildSession()` introduces **new** cards in level order for the default All
  view (preserves the Level 1→5 curriculum) but **shuffles** new cards when a
  specific selection is active, so combined levels actually interleave. Due
  (already-seen) cards always interleave by date regardless.

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

- **Gated to the Italian deck.** `boot()` calls `initItalianExtras()` only when
  `DECK === DECKS.it` (wires the music/dog listeners, starts the pizza timer);
  for the Dutch user it calls `removeItalianExtras()` instead, which deletes
  `#musicbtn` and `#dog` from the DOM. So Deniz runs **zero** Italian-only code:
  no recurring pizza timer, no listeners, no dog/music DOM. Keep any new
  Italian-only feature inside this gate (don't attach it at parse time).
- **Music 🎵**: `MUSIC_TRACKS` + a tiny Web Audio chiptune sequencer (square
  wave, note strings like `"E4:.5 R:1"`). Round button bottom-left, visible
  only with `body.theme-it`; starts on tap (autoplay policies), toast shows
  the track name. **Only public-domain melodies** (composer dead 70+ years).
  ⚠️ Never add 'O Sole Mio — an Italian court ruling (Mazzucchi) keeps it in
  copyright until ~2042. Current playlist: Funiculì Funiculà, Santa Lucia,
  Tarantella Napoletana, La donna è mobile, Torna a Surriento.
- **Pizzas 🍕**: `spawnPizza()` drifts emoji up the screen every ~7s via a timer
  started only for Italian (`z-index:2`, `pointer-events:none`, capped at 12);
  `pizzaBurst()` fires on Italian session completion. Both skip when
  `prefers-reduced-motion`.

## Pıtırcık 🐶 (Aruna's dog)

- Inline SVG in `index.html` (`#dog`, fixed bottom-right), visible only with
  `body.user-aruna`. Click/tap/Enter = pet: squash-wiggle, tongue out, faster
  tail wag, floating hearts, sometimes a "Bau!" bubble. Listeners are attached
  only for the Italian deck (`initItalianExtras()`); removed from the DOM for
  the Dutch user.
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
- v4.2: Web Audio chiptune player with public-domain Italian classics;
  floating pizzas + session-end pizza burst on theme-it; in-app "What's new"
  patch-notes panel (auto-opens once per version per user).
- v4.3: offline/PWA — `sw.js` (stale-while-revalidate),
  `manifest.webmanifest`, paw app icons; installs to home screen and works
  with no network. Repeat loads served from cache.
- v4.4 (current): split decks into `deck-nl.js`/`deck-it.js`, lazy-loaded per
  user via `loadDeck()`. Each user now downloads ~59–60 KB gzipped (shell +
  their deck) instead of ~99 KB, and never parses/stores the other language.
  Brief "Loading your words…" paw splash on first (uncached) load.
