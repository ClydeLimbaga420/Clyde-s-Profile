# AGENTS.md

Personal portfolio site — static HTML/CSS/JS plus a Netlify Function (Postgres-backed like counter).

## Commands

There is no test, lint, or formatter. The site itself is still static with no build step, but `package.json` now exists purely to supply the one dependency the like-counter function imports. There is no `scripts` block and no build command for the site — Netlify bundles the function on its own.

- Verify changes by opening `index.html` in a browser. Opening it over `file://` still works: the like button falls back to showing its static `500`.
- To exercise the like endpoint you need a real Postgres connection string in `NETLIFY_DB_URL` and a local Postgres. `netlify dev` is the supported way to run functions locally.
- Commit style is a short one-line message (`Update *`, `Huge Update`, `add new proj`). Single `main` branch, linear history, no PR workflow.

## Layout

- `index.html` — the only page. All content is edited in place; it is deeply nested with one element per line (~1300 lines). Match that formatting when editing.
- `Profile.css`, `Profile.js` — the only local assets it loads.
- `emailjs_template.html` — a mockup of the EmailJS message body. Reference only, never served.
- `netlify/functions/likes.js` — the like endpoint. `GET` returns the count, `POST` increments it.
- `netlify/database/migrations/*.sql` — schema. Netlify applies these automatically just before a deploy is published; a failure blocks the deploy.
- Sections in order: `#home`, `#about`, `#projects`, `#academic`, `#skills`, `#education`, `#learning`, `#contact`.

## Gotchas

**The hero photo filename casing used to be wrong.** `index.html` referenced `./profile.jpg` while the committed file is `Profile.jpg`, which 404'd on any case-sensitive host. Fixed — keep the `P` capitalised if you touch the hero.

**Dark mode is class + CSS variables, not `prefers-color-scheme`.** Tokens live in `:root` (Profile.css:1) and are overridden by `.darkmode` (Profile.css:18). `toggleDarkMode()` toggles that class on `<body>` and persists to `localStorage["darkmode"]`. Dark mode never auto-activates. New components must use `var(--token)`; a hardcoded hex will be unreadable in one theme.

**The hero photo is four stacked `<img>` cross-faded by `opacity`** — `light-photo`, `light-hover-photo`, `dark-photo`, `dark-hover-photo` (Profile.css:284-335). Images are never swapped in JS. Changing those class names or adding a variant means updating every opacity rule.

**Visual QA is date-dependent.** `getSeason()` (Profile.js:356) derives the season from `getMonth()`, and its boundaries are deliberately non-standard: Dec-Feb is winter, Mar-May spring, Jun-Aug summer, Sep-Nov autumn. `startSeasonalEffect()` (Profile.js:399) toggles `body.season-summer` and spawns particles, and summer also reshapes the hero photo into a rotating sun via `clip-path` (Profile.css:1509). You cannot see summer behavior without faking the clock. `SEASON_CONFIG[*].count` is currently `7` for every season (a local, uncommitted reduction from 14-28).

**EmailJS credentials are hardcoded and live.** Public key at Profile.js:62, service/template IDs at Profile.js:81-82. The form's `name` attributes (`from_name`, `reply_to`, `message`) must match the remote template — renaming one silently breaks the contact form. Submission needs network access to a live account; it cannot be verified offline.

**The like counter is a Netlify Function over Netlify Database, and the seed is `500`.** `netlify/functions/likes.js` reads `process.env.NETLIFY_DB_URL` and connects with `@neondatabase/serverless` (pinned, exact version — one dep in `package.json`). `GET` reads the row, `POST` runs `UPDATE ... RETURNING`, which is atomic — do not "optimise" it into a read-then-write or concurrent clicks will lose increments. The client is built lazily inside the handler so a missing `NETLIFY_DB_URL` becomes a JSON `500` rather than an import-time crash that takes the function down.

**`likes.php` and `likes.db` are dead code.** Nothing in `index.html`, `Profile.js`, or `Profile.css` references them (no `fetch`, no `likes` string anywhere). It is also the only PHP in the repo, so a static host will never run it. If you do wire it up, the `1022` seed is duplicated in `likes.php:13`, `likes.php:20`, and inside `likes.db` — change all three.

**The birth date is hardcoded in two places** — `2006-02-18` in `calculateAge()` (Profile.js:199) and month `1`, day `18` in `updateBirthdayCountdown()` (Profile.js:269-273). Age, countdown, and footer year are all computed client-side; the HTML holds no placeholder values.

## Conventions

- **Retired content is commented out, not deleted** — see the template cards at `index.html:560` and `index.html:785`. To hide a project, comment it out following that pattern.
- **`#academic` (`index.html:447`) is absent from the nav** (`index.html:38-45`). It looks like an oversight, but confirm with the owner before changing it.
- **Inline `onclick=` handlers call globals** declared in `Profile.js` (e.g. `toggleDarkMode`, `toggleMenu`, `toggleMusic`, `closeEmailToast`). Do not convert `Profile.js` to a module — that silently kills every button.
- **Mobile nav depends on JS**: `Profile.js:48-58` closes `#navMenu` on link click. The menu button only toggles the `active` class; there is no CSS-only fallback.
- **Do not add `autoplay` to `#bgMusic`** — browsers block it, which is why playback starts from `toggleMusic()`.
- CDNs are pinned by version (Font Awesome 6.4.0, `@emailjs/browser@4`, Google Fonts `Inter`) with no SRI hashes. Keep them pinned.
- **Binaries are committed directly and are large**: `music.mp3` (4.1 MB), `Logo.png` (965 KB), plus four JPGs. There is no asset pipeline. With no `.gitignore`, avoid `git add -A`.
- **`node_modules/` and `package-lock.json` must never be committed.** `package.json` exists only to declare the one function dependency; Netlify runs `npm install` on its own builders. There is still no `.gitignore`, so `git add -A` will happily stage `node_modules` after a local install. Stage files explicitly.
