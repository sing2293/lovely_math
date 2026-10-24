# Lovely Math ♡ — a MAT 1330 study garden

A private, playful, interactive study site for **MAT 1330: Calculus for the Life Sciences I** (University of Ottawa), built from a comparison of 31 past exam sittings (2009–2026). English and Turkish.

- **Sign-in:** one name and password open the whole garden. You stay signed in on that device until you press *Log out*.
- **Exam patterns:** 14 recurring question families, ranked by how often they appear in recent papers. Each has a click-through, step-by-step walkthrough of an original worked example and a "your turn" check.
- **Labs:** cobweb diagrams for dynamical systems, secant → tangent, tangent line and Taylor polynomials, optimization, Newton's method, area and the FTC, seasonal rhythms.
- **Method finder:** flip cards for "when you see this, consider this method".
- **Toolbox:** a working pink calculator (keyboard friendly) and a pocket formula sheet.
- **Test room:** three original mock tests (two midterms and a final) with hints and full worked solutions.
- **7-day plan** and progress: plan ticks, mastered families, solved "your turn" questions, test self-scores and the last test opened all save automatically in the browser.
- **EN | TR** switch in the top bar and on the sign-in card.

Every example and test question is original and is not a past exam question.

## Run it

Serve the folder and open it in a browser:

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000. It is a static site with no build step, so it also works on GitHub Pages: Settings → Pages → Deploy from a branch → `main`, folder `/ (root)`. The sign-in needs a secure page (https, localhost, or a local file).

## How the lock works

All of the site's content and solutions are encrypted (AES-GCM) in `assets/js/secure-data.js`. The browser derives the key from the name and password (PBKDF2-SHA256), so nothing readable is in the page source or this repository. Name and password ignore capital letters, and the password also ignores spaces. It is a study-site lock, not bank-grade security.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | Page layout, sign-in card and the SVG artwork (blossoms, lavender, hearts) |
| `assets/css/style.css` | The pastel paper look |
| `assets/js/i18n.js` | English and Turkish interface text and the language switch |
| `assets/js/auth.js` | Sign-in, decryption and the remembered session |
| `assets/js/secure-data.js` | Encrypted content and solutions for both languages (generated) |
| `assets/js/app.js` | Walkthrough player, method finder, test room, plan, progress saving |
| `assets/js/labs.js`, `plot.js` | The interactive labs and a tiny SVG plotting helper |
| `assets/js/calc.js` | Calculator with a safe expression parser (no `eval`) |
| `tools/seal-site.mjs` | Re-encrypts the content after you edit it |

## Editing the content

The plaintext content is deliberately **not** in this repository. Keep it in `../vault-source/` next to the repo folder: `content.json` and `solutions.json` for English, `content_tr.json` and `solutions_tr.json` for Turkish. After editing, re-seal:

```bash
SITE_NAME='name' SITE_PASSWORD='password' node tools/seal-site.mjs \
  en=../vault-source/content.json,../vault-source/solutions.json \
  tr=../vault-source/content_tr.json,../vault-source/solutions_tr.json
```

Changing the name or password this way also signs everyone out, so they sign in again with the new details.

## Credits

Math rendering by [KaTeX](https://katex.org). Fonts from Google Fonts (Great Vibes, Dancing Script, Caveat, Quicksand, Josefin Sans).
