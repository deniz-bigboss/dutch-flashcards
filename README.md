# 🧀 Woordjes — Dutch flashcards

A personal flashcard website for learning the **1000 most common Dutch words**
you'll meet as an incoming uni student in the Netherlands. One single HTML
file — no dependencies, no build step, works offline once loaded.

**Live app:** https://deniz-bigboss.github.io/dutch-flashcards/

## Features

- **1000 words, grouped 200 × 5:**
  - Level 1 — Survival basics (greetings, pronouns, numbers, core verbs)
  - Level 2 — Daily life (food, home, transport, shopping, weather)
  - Level 3 — People & conversation (family, emotions, health, free time)
  - Level 4 — Student life (uni, housing, banking, BSN/DigiD, side jobs, tech)
  - Level 5 — Society & fluency (news, abstract words, connectors, Dutch-isms)
- Every word shown **in context**: a Dutch example sentence (word highlighted)
  with its English translation on the back
- **Spaced repetition tuned for ~200 cards/day** (see below)
- Dark mode, NL→EN and EN→NL, Dutch text-to-speech, daily streak
- Login screen with per-user progress tracking
- Add your own words, search the full list, export/import backups

## The learning schedule

- Review intervals (Leitner ladder): **1 · 3 · 7 · 14 · 30 · 60 · 120 days**;
  a miss sends the word back to the start
- **30 new words/day** (hard cap), so all 1000 words are introduced in ~5 weeks
- Each word takes ~7–8 touches over its lifetime → scheduled reviews peak
  right around **200 cards/day**; the 🎯 goal bar tracks each day, and
  "Keep practicing" rounds top lighter days up by re-drilling your weakest cards
- Tunable in `index.html`: `DAILY_NEW`, `DAILY_GOAL`, `INTERVAL_DAYS`

## Login & your data

- The login screen is a **client-side gate** on a static site: it keeps each
  user's progress in their own browser storage, but it is **not real
  security** — never reuse a password you use anywhere else.
- Progress lives in the browser's localStorage, **per device**. To move
  progress between phone and laptop, use **Export backup / Import backup**
  in the footer.
- The password is stored as a salted SHA-256 hash in `ACCOUNTS` in
  `index.html` (`sha256("woordjes-v1:" + password)`).

## Use it on your phone

Open the live URL, log in, and use your browser's **"Add to Home Screen"** —
it then opens full-screen like an app and works offline.
