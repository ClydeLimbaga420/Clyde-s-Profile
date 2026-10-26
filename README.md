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
- **Content admin** — add/edit projects, people, contacts, and logos in `admin.html`; preview changes in the browser and export `content.js` to commit
- Smooth-scroll navigation, mobile hamburger menu, and responsive breakpoints at 900px / 700px / 400px

## Stack

No build step and no dependencies to install. Just static files plus three pinned CDN
dependencies: Google Fonts (Inter), Font Awesome 6.4.0, and `@emailjs/browser@4`.

## Structure

```
index.html    page shell; hardcoded cards are a no-JS fallback
content.js    source of truth for projects, people, contacts, and logos
admin.html    browser content editor (also admin.css / admin.js)
Profile.css   all styling, dark mode tokens in :root / .darkmode
Profile.js    content rendering, theme toggle, music, EmailJS, countdown, particles
Logo.png      favicon
Profile.jpg   hero photo (ProfileButDark.jpg / Hover.jpg / HoverButDark.jpg are the
ProfileButDark.jpg   dark-mode and hover variants, cross-faded with CSS opacity)
Hover.jpg
HoverButDark.jpg
music.mp3     "Sway" — Bic Runga
emailjs_template.html   mockup of the EmailJS message body, for reference only
likes.php / likes.db    SQLite like counter — not currently wired into the site
```

## Running locally

Open `index.html` in a browser; everything works from the filesystem with no server.

If you have PHP installed and want to poke at `likes.php`:

```sh
php -S localhost:8000
```

The contact form needs network access to a live EmailJS account, so it can't be
verified offline.

## Editing content

Open `admin.html` (or click the small gear in the site footer). The admin asks for a
password first; this is a client-side convenience lock, not real server security.
Edits are saved to `localStorage` as you go, so you can refresh without losing work.
When you're happy with the changes:

1. Click **Export content.js**.
2. Replace the repo's `content.js` with the downloaded file.
3. Commit the change.

Uploaded avatars and logos are resized and embedded as base64 data URLs inside
`content.js`. **Reset draft** discards browser-only changes and reloads the
committed file.

## Notes for contributors

Retired fallback projects and sections are kept as commented-out HTML rather than
deleted. To retire something on the live site, remove it from `content.js` (or the
admin) and commit.
