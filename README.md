# NLP Timeline — 1962 to 2026

Interactive single-page timeline of Natural Language Processing history, built for **Assignment 1** of the NLP course at Delhi Technological University.

## Stack

- **Next.js 14** (App Router, static export)
- **TypeScript** + **Tailwind CSS**
- **Framer Motion** for animations
- **Neumorphic** UI (soft shadows, raised/in-set elements)
- **Firebase Hosting** for deployment

## Local development

```bash
npm install
npm run dev      # localhost:3000
```

## Build for Firebase

```bash
npm install
npm run build    # outputs to ./out/
firebase deploy --only hosting
```

## Files

- `data/timeline.json` — all 25 milestones across 5 eras, sourced from Wikipedia & arXiv
- `app/page.tsx` — main timeline UI (eras, nodes, detail cards, presenter mode)
- `app/globals.css` — neumorphic CSS classes
- `tailwind.config.ts` — theme tokens (colors, shadows, animations)
- `firebase.json` — hosting config (single-page rewrite to /index.html)

## Features

- 5 eras: Foundations (1962-1989), Statistical (1990-2010), Embeddings (2011-2016), Transformers (2017-2022), Agentic (2023-2026+)
- Era filter pills
- Search across milestones, authors, tags
- Click node → neumorphic detail card with summary, why-it-mattered, glossary tags, references
- Glossary popovers on tag hover
- **Presenter mode** (Cmd/Ctrl+P) — full-screen, large-text for class presentation
- Print-friendly CSS