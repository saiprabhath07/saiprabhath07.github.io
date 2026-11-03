# Obito Tobi portfolio

A manga-style developer portfolio drawn live by a swarm of cursors. Plain HTML, CSS and JavaScript. No build step, no dependencies.

Live at: https://saiprabhath07.github.io

## Folder map

| Path | What it is |
| --- | --- |
| `index.html` | All the content: header, 4 chapters (panels), footer |
| `css/style.css` | Colours and fonts are at the top (`:root`). Three colours only: ink, paper, red |
| `js/main.js` | The cursor swarm, the typing line, the copy-email button |
| `assets/` | Portrait, FindIt screenshot, favicon |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Deploy on GitHub Pages (one time)

The repo name must be exactly `saiprabhath07.github.io`. That name is what gives you the free address `https://saiprabhath07.github.io`.

### Option A: in the browser, no git needed
1. Open https://github.com/saiprabhath07/saiprabhath07.github.io
2. Click **Add file > Upload files**.
3. Unzip this project, then drag in everything inside the folder: `index.html`, `css`, `js`, `assets` and `.nojekyll`. (If `.nojekyll` is hidden on your computer, skip it; the site still works.)
4. Commit to `main`. The old `index.html` ("Hello World") is replaced.
5. Open **Settings > Pages**. Under *Build and deployment* set **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**, then Save.
6. Wait one to two minutes, then open https://saiprabhath07.github.io

### Option B: with git
```bash
git clone https://github.com/saiprabhath07/saiprabhath07.github.io
cd saiprabhath07.github.io
# copy the project files in here (index.html, css/, js/, assets/, .nojekyll)
git add .
git commit -m "manga portfolio"
git push
```
Then do step 5 above if the site does not appear.

## Updating it later
1. Edit a file.
2. `git add . && git commit -m "update" && git push` (or upload the changed file in the browser).
3. GitHub rebuilds in about a minute. Hard refresh with Ctrl+Shift+R if you still see the old page.

## How to add a project
In `index.html`, find an `<article class="panel proj a" data-build>` block, copy it, and change the title, number, text, tags and link. Use `proj a` (wide) and `proj b` (narrow) in pairs so each row fills up.

## Notes
- The comment block at the top of `index.html` holds your reminders and is visible in the page source. Delete it any time.
- The cursor swarm is original code, inspired by Swarm by Joel Califa. Keep the footer credit.
- The portrait is a Naruto panel (Masashi Kishimoto / Shueisha) used as a fan avatar. Swap `assets/obito.png` if you want to change it.
- Respects "reduce motion": people with that setting see the finished page with no cursors.
- Custom domain later: Settings > Pages > Custom domain, then add a `CNAME` file.
