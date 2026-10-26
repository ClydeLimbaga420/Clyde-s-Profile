# AGENTS.md

Personal portfolio site — static HTML/CSS/JS plus one orphaned PHP endpoint. No build step.

## Commands

There is no package manager, build, test, lint, or formatter. `package.json`, CI, and `.gitignore` do not exist — do not invent npm commands or add tooling.

- Verify changes by opening `index.html` in a browser.
- `php -S localhost:8000` from the repo root is the only way to exercise `likes.php`. Serving over `file://` works for everything else.
- Commit style is a short one-line message (`Update *`, `Huge Update`, `add new proj`). Single `main` branch, linear history, no PR workflow.

## Layout

- `index.html` — the page shell, deeply nested with one element per line (~1350 lines). Match that formatting when editing. Project cards, contributors, socials, contact details, and logos render from `content.js`; the hardcoded cards remain only as a no-JS fallback and are replaced on load.
- `content.js` — source of truth for `projects`, `people`, `contacts`, and `logos`. Add/edit content here (or through the admin) rather than in `index.html`.
- `admin.html`, `admin.css`, `admin.js` — browser content editor. Edits save to `localStorage` immediately; use **Export content.js**, replace the repo file, and commit. The site's footer gear links here.
- `Profile.css`, `Profile.js` — site styling and behavior, including the `renderSiteContent()` renderer in `Profile.js`.
- `emailjs_template.html` — a mockup of the EmailJS message body. Reference only, never served.
- Sections in order: `#home`, `#about`, `#projects`, `#academic`, `#skills`, `#education`, `#learning`, `#contact`.

## Gotchas

**`content.js` is the source of truth.** `index.html` still contains the original hardcoded cards as a no-JS fallback, but `renderSiteContent()` (Profile.js) clears `#projectsGrid`, `#academicGrid`, `#heroSocials`, `#footerSocials`, `#emailList`, and `#logoWall`, then rebuilds them from `window.SITE_CONTENT` on load. Edit the data or the admin, not the fallback. Keep those container IDs stable.

**Admin edits live in `localStorage["siteContentDraft"]` until exported.** `admin.html` never writes to disk. **Export content.js** downloads the replacement; replace the repo file and commit. Uploaded logo/avatar images are resized and stored as base64 data URLs inside `content.js`, so the file can grow quickly. Use **Reset draft** to discard browser changes and reload the committed file. The footer gear is the only link to the admin; it has no server-side write access.

**The admin password is a client-side gate, not real security.** `admin.js` compares a SHA-256 hash (with an FNV fallback for non-secure origins) and stores success in `sessionStorage["adminUnlocked"]` until the tab closes or **Lock** is clicked. Changing the password means updating both `PASSWORD_HASH` and `PASSWORD_FALLBACK_HASH` (`admin.js:7-8`). Anyone who can read the source can bypass this; move to server-side auth if real protection is needed.

**Dark mode is class + CSS variables, not `prefers-color-scheme`.** Tokens live in `:root` (Profile.css:1) and are overridden by `.darkmode` (Profile.css:17). `toggleDarkMode()` toggles that class on `<body>` and persists to `localStorage["darkmode"]`. Dark mode never auto-activates. New components must use `var(--token)`; a hardcoded hex will be unreadable in one theme.

**The hero photo is four stacked `<img>` cross-faded by `opacity`** — `light-photo`, `light-hover-photo`, `dark-photo`, `dark-hover-photo` (Profile.css:284-335). Images are never swapped in JS. Changing those class names or adding a variant means updating every opacity rule.

**Visual QA is date-dependent.** `getSeason()` (Profile.js:762) derives the season from `getMonth()`, and its boundaries are deliberately non-standard: Dec-Feb is winter, Mar-May spring, Jun-Aug summer, Sep-Nov autumn. `startSeasonalEffect()` (Profile.js:805) toggles `body.season-summer` and spawns particles, and summer also reshapes the hero photo into a rotating sun via `clip-path` (Profile.css:1537). You cannot see summer behavior without faking the clock. `SEASON_CONFIG[*].count` is currently `4` (winter/spring/autumn) and `5` (summer), a local reduction from 14-28.

**EmailJS credentials are hardcoded and live.** Public key at Profile.js:468, service/template IDs at Profile.js:487-488. The form's `name` attributes (`from_name`, `reply_to`, `message`) must match the remote template — renaming one silently breaks the contact form. Submission needs network access to a live account; it cannot be verified offline.

**`likes.php` and `likes.db` are dead code.** Nothing in `index.html`, `Profile.js`, or `Profile.css` references them (no `fetch`, no `likes` string anywhere). It is also the only PHP in the repo, so a static host will never run it. If you do wire it up, the `1022` seed is duplicated in `likes.php:13`, `likes.php:20`, and inside `likes.db` — change all three.

**The birth date is hardcoded in two places** — `2006-02-18` in `calculateAge()` (Profile.js:604) and month `1`, day `18` in `updateBirthdayCountdown()` (Profile.js:675-679). Age, countdown, and footer year are all computed client-side; the HTML holds no placeholder values.

## Conventions

- **Retired fallback content is commented out, not deleted** — see the commented-out `project-button` blocks in `#academic`. To retire a project on the live site, remove it from `content.js` (or the admin) and commit; the hardcoded fallback can stay commented.
- **`#academic` (`index.html:497`) is absent from the nav** (`index.html:38-45`). It looks like an oversight, but confirm with the owner before changing it.
- **Inline `onclick=` handlers call globals** declared in `Profile.js` (e.g. `toggleDarkMode`, `toggleMenu`, `toggleMusic`, `closeEmailToast`). Do not convert `Profile.js` to a module — that silently kills every button.
- **Mobile nav depends on JS**: `Profile.js:454-464` closes `#navMenu` on link click. The menu button only toggles the `active` class; there is no CSS-only fallback.
- **Do not add `autoplay` to `#bgMusic`** — browsers block it, which is why playback starts from `toggleMusic()`.
- CDNs are pinned by version (Font Awesome 6.4.0, `@emailjs/browser@4`, Google Fonts `Inter`) with no SRI hashes. Keep them pinned.
- **Binaries are committed directly and are large**: `music.mp3` (4.1 MB), `Logo.png` (965 KB), plus four JPGs. There is no asset pipeline. With no `.gitignore`, avoid `git add -A`.
