# Weather Wardrobe — Project Context

Learning project. Clarity and correctness matter more than performance or polish.

## What this is
A fullstack app: user inputs a city and clothing preference → backend fetches
weather from Open-Meteo → builds a search query → returns 4 outfit photos from
Unsplash. One endpoint: `POST /api/suggestions`.

## Stack
- Node 22+ / Express (ESM). No frontend framework, no TypeScript, no build step.
- `npm start` must always work out of the box.

## Hard rules — never violate these
- UNSPLASH_ACCESS_KEY lives in `.env` only. Never hardcode it. Never send it to the browser.
- Each file in `src/` has one responsibility only:
  - `weather.js` — Open-Meteo calls
  - `wardrobe.js` — pure mapping logic (no network, no side effects)
  - `images.js` — Unsplash calls
  - `server.js` — wiring only, no business logic
- `wardrobe.js` must stay a pure function: same input → same output, always.

## Workflow — follow this order, every time
1. Before writing any code: ask clarifying questions if anything is unclear.
2. Then propose a short plan (which files change and why) and wait for approval.
3. Only then write code.
4. After changes to `wardrobe.js`: re-run the test scenarios before marking done.

## What not to do
- Do not mix a refactor with a new feature in the same commit.
- Do not update `docs/architecture.md` for *what* changed — only for *why*.
- Do not assume silence means approval. Ask.

## Product decisions (non-negotiable)
- Unsplash query = exact user input + weather condition + temperature band. 
  Never rephrase or expand what the user typed.
- Always return exactly 4 images in this fixed order: hat, shirt, pants, shoes.
  Each is a separate Unsplash search. This order never changes.
- UI must be responsive: desktop shows 4 images in a row, 
  tablet 2x2 grid, mobile 1 column.


# Skill: UI Standards

When building any UI, I will:

1. Make it fully responsive using industry-standard breakpoints.
2. Ensure the layout looks clean and organized on all screen sizes.
3. Use a minimal, modern visual style — no unnecessary decorations.
4. Apply consistent spacing and typography throughout.
5. Present the result and wait for feedback before moving on.