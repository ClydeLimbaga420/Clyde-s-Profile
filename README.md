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
- Smooth-scroll navigation, mobile hamburger menu, and responsive breakpoints at 900px / 700px / 400px

## Stack

No build step and no dependencies to install. Just static files plus three pinned CDN
dependencies: Google Fonts (Inter), Font Awesome 6.4.0, and `@emailjs/browser@4`.

## Structure

```
index.html    the entire site — all content, edited in place
Profile.css   all styling, dark mode tokens in :root / .darkmode
Profile.js    theme toggle, music, EmailJS, countdown, seasonal particles
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

## Notes for contributors

Retired projects and sections are kept as commented-out HTML rather than deleted, so
they can be restored later. Please follow that pattern.
