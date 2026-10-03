# Clyde's Profile

A personal portfolio site — one self-contained page covering who I am, my projects,
team academic work, skills, education, what I'm currently learning, and how to reach me.

Repo: <https://github.com/ClydeLimbaga420/Clyde-s-Profile>

## Features

- **Dark mode** — moon/sun toggle, remembers the choice in `localStorage`
- **Background music** — user-toggled player with a spinning disc animation
- **Seasonal effects** — falling snow/petals/leaves or summer fireflies, derived from the current month; in summer the hero photo morphs into a rotating sun
- **Birthday countdown** — live days/hours/minutes/seconds, with confetti on the day
- **Random greeting** — the hero says hi in a different language on each visit
- **Contact form** — sends through EmailJS with success/error toasts
- **Like counter** — a global count that everyone can add to, starting at 500, stored in Netlify Database and served by a Netlify Function
- Smooth-scroll navigation, mobile hamburger menu, and responsive breakpoints at 900px / 700px / 400px

## Stack

The site itself is still just static files with no build step. Three pinned CDN dependencies
are loaded by the browser: Google Fonts (Inter), Font Awesome 6.4.0, and `@emailjs/browser@4`.

There is a `package.json`, but the site does not use it. It exists only so Netlify can install
the one dependency the like-counter function needs (`@neondatabase/serverless`) when it bundles
the function. Netlify does that on its own — there is no build command.

## Structure

```
index.html    the entire site — all content, edited in place
Profile.css   all styling, dark mode tokens in :root / .darkmode
Profile.js    theme toggle, music, EmailJS, countdown, seasonal particles, likes
Logo.png      favicon
Profile.jpg   hero photo (ProfileButDark.jpg / Hover.jpg / HoverButDark.jpg are the
ProfileButDark.jpg   dark-mode and hover variants, cross-faded with CSS opacity)
Hover.jpg
HoverButDark.jpg
music.mp3     "Sway" — Bic Runga
emailjs_template.html   mockup of the EmailJS message body, for reference only
netlify/functions/likes.js          like endpoint — GET reads, POST increments
netlify/database/migrations/*.sql    schema, applied automatically on deploy
likes.php / likes.db    old SQLite counter, unused — see Notes
```

## Running locally

Open `index.html` in a browser; everything works from the filesystem with no server. The like
button deliberately falls back to showing its starting value of 500, because
`/.netlify/functions/likes` only exists once deployed.

To exercise the like endpoint for real you need Netlify CLI, a local Postgres, and its
connection string in `NETLIFY_DB_URL`:

```sh
netlify dev
```

The contact form needs network access to a live EmailJS account, so it can't be
verified offline.

## Deploying the like counter

1. In the Netlify UI, create a database for the site (Netlify Database — Postgres).
2. Push this repo. Netlify applies `netlify/database/migrations/*.sql` immediately before
   publishing, which creates the `likes` table and seeds it at 500.
3. `NETLIFY_DB_URL` is injected for you — there is nothing to set by hand.

A failing migration blocks the deploy rather than shipping broken code, which is intentional.

## Notes for contributors

Retired projects and sections are kept as commented-out HTML rather than deleted, so
they can be restored later. Please follow that pattern.

`likes.php` and `likes.db` are leftovers from an earlier SQLite-based counter that was
never connected to the page. Nothing references them and no static host would run the PHP
anyway, so they are safe to delete.
