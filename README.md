# LEARN IT v2 – know it all

A mobile-first prototype of a free peer-learning app for university students who
need help with a difficult course topic but can't afford a private tutor
(25–35 €/hour). Students help each other in three ways:

1. **Peer sessions**, paid in swap credits instead of money
2. **Practice tests** that students create for each other
3. **A shared resources library**, plus attachments in chat

Students earn credits by teaching and by making practice tests that others
complete (making material for others also deepens their own understanding:
the protégé effect).

> Prototype – all students, tests and resources are demo data. There is no
> backend: everything you create is saved in your browser's localStorage.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

Use **Reset demo data** at the bottom of Home to start over.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`, no PostCSS config).
  Colours, font and radius are `@theme` tokens in `src/index.css`.
- React Router (client-side routes; `public/_redirects` sends every path to `index.html`)

## Project structure

```
src/
  types/        typed models (Student, PracticeTest, Resource, ChatMessage, …)
  data/         demo data: 17 students, 8 practice tests (58 checked questions), 14 resources, seed state
  lib/          matching, keyword chat replies, scoring, storage (try/catch), formatting
  state/        app state provider + context (persists to localStorage)
  components/   shared UI: tab bar, sheets, ticket card, test/resource/peer cards, booking sheet
  screens/      Home, Topic, TakeTest, CreateTest, Practice, Resources, ShareResource,
                ResourceDetail, Matches, Peer, ChatList, Chat
```

## Deploy on Netlify (from GitHub)

1. Push this folder to a GitHub repository.
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`.
   `public/_redirects` (`/*  /index.html  200`) makes deep links like `/topics/linear-algebra` work.

No GitHub Actions are needed.

## Note: pinned `rolldown`

`package.json` pins Vite's bundler with `"overrides": { "rolldown": "1.2.14" }`.
On the Windows machine this was built on, Smart App Control blocks the native
binary of the newer rolldown 1.2.15, which stops `vite build` from running.
1.2.14 is inside the range Vite 8.3.5 asks for (`~1.2.14`). You can remove the
override once a newer rolldown is allowed on your machine; it makes no
difference on Netlify.
