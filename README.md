# 🐾 The Aru App — Dutch & Italian flashcards

A personal flashcard website for two people: **Deniz** learns the **1000 most
common Dutch words**, and **Aruna** learns the **1000 most common Italian
words** — each with the same spaced-repetition engine. One single HTML file —
no dependencies, no build step, works offline once loaded.

**Live app:** https://deniz-bigboss.github.io/dutch-flashcards/

## Features

- **Two built-in decks, 1000 words each, grouped 200 × 5:**
  - Level 1 — Survival basics (greetings, pronouns, numbers, core verbs)
  - Level 2 — Daily life (food, home, transport, shopping, weather)
  - Level 3 — People & conversation (family, emotions, health, free time)
  - Level 4 — Student life (uni, housing, banking, bureaucracy, jobs, tech)
  - Level 5 — Society & fluency (news, abstract words, connectors, idioms)
- Deniz sees the Dutch deck 🇳🇱, Aruna sees the Italian deck 🇮🇹 — same
  structure, same daily rhythm, different language
- Every word shown **in context**: an example sentence (word highlighted)
  with its English translation on the back
- **Spaced repetition tuned for ~200 cards/day** (see below)
- Modern dark glass UI with a per-language accent color
- Text-to-speech in the right language (Dutch for Deniz, Italian for Aruna)
- **Pıtırcık** 🐶 — Aruna's fluffy white maltese-pumi lives in the corner of
  her screen; click or tap him for pets, wiggles, hearts and happy barks
- **Italian music** 🎵 — tap the note button for 8-bit arrangements of
  public-domain Italian classics (Funiculì Funiculà, Santa Lucia, the
  Tarantella…), synthesized right in the browser — no files, no copyright
- **Pizzas** 🍕 — they drift across the Italian side, and finishing a
  session earns a little pizza party
- **Reading** 📚 — a Read tab with short A1/A2 stories built from the deck
  vocabulary; tap any word (even a conjugated verb) to hear it and see its
  meaning, with a translation toggle and quick comprehension questions
- **What's new panel** 📝 — every update is announced in-app (footer link)
- Add your own words, search the full list, export/import backups, daily streak

## The learning schedule

- Review intervals (Leitner ladder): **1 · 3 · 7 · 14 · 30 · 60 · 120 days**;
  a miss sends the word back to the start
- **30 new words/day** (hard cap), so all 1000 words are introduced in ~5 weeks
- Each word takes ~7–8 touches over its lifetime → scheduled reviews peak
  right around **200 cards/day**; the 🎯 goal bar tracks each day, and
  "Keep practicing" rounds top lighter days up by re-drilling your weakest cards
- Tunable in `index.html`: `DAILY_NEW`, `DAILY_GOAL`, `INTERVAL_DAYS`

## Who can log in

Only two names exist:

- **Deniz** — password fixed in the app (stored as a salted hash).
- **Aruna** — the profile is **claimed on first login**: the first person to
  enter the name Aruna chooses the password right there, and from then on the
  profile belongs to them on that device. Nobody else can get in.

The login screen is a **client-side gate** on a static site: it keeps each
user's progress under their own browser storage, but it is **not real
security** — never reuse a password you use anywhere else.

## Your data

- Progress lives in the browser's localStorage, **per device**. To move
  progress between phone and laptop, use **Export backup / Import backup**
  in the footer.
- Because the Aruna claim is also per device, on a new device she just logs
  in with the same name + password again and imports her backup.

## Use it on your phone

Open the live URL, log in, and use your browser's **"Add to Home Screen"** —
it installs with its own paw icon, opens full-screen like a native app, and
works **fully offline** thanks to a service worker (repeat opens are instant;
updates download automatically on your next visit). And yes, Pıtırcık loves
finger taps just as much as mouse clicks.
