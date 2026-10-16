# Proteek // Portfolio

I'm Proteek Kumar Sanyal, an AI Solutions Analyst | Business & Systems Analyst | Data Analyst based on the Gold Coast, QLD, with 6 years of experience. This is my portfolio site. You start by picking a lens, and each lens shows the part of my work that matters to you. It's a static site on GitHub Pages: plain HTML, CSS and JavaScript, with no framework.

Live site: https://proteek-dev.github.io/portfolio/

## Lenses

| Lens | Page | What it shows |
|---|---|---|
| Visitor | `visitor.html` | The short version |
| Recruiter | `recruiter.html` | The 30-second read |
| Partner | `partner.html` | Case studies and how I work |
| Ask Me | `ask.html` | Questions, answered from my CV |

`looker.html`, `developer.html` and `persona.html` are redirect stubs for the old lens URLs. `404.html` catches any other missing page and links to the four lenses.

## How content works

Facts that appear on more than one page live in `data/profile.json`: contact details, the lens list, roles, skills, projects and writing.

`tools/build.py` reads that file and writes the shared blocks into the HTML. Each block sits between markers:

```html
<!-- @gen:topbar -->
...generated HTML...
<!-- @end -->
```

Don't edit text between the markers by hand. To change a fact:

1. Edit `data/profile.json`.
2. Run `python3 tools/build.py`.
3. Commit the JSON and the regenerated files together.

The build also updates the shared fields at the top of `assets/persona.json`, which the Ask Me guide reads. It uses only the Python standard library, and the output is plain HTML, so every page reads fully with JavaScript turned off.

`python3 tools/build.py --check` exits with an error and prints a diff if any page is out of date. The GitHub Actions workflow in `.github/workflows/check.yml` runs it on every push and pull request to `main`, along with a JSON validity check. GitHub Pages deploys from `main` as before.

## Run locally

```bash
python3 -m http.server 3000
```

Then open http://localhost:3000. The 404 page uses `/portfolio/` paths, so it only renders correctly on GitHub Pages.

## File structure

```
portfolio/
├── index.html              # Landing page: pick a lens
├── visitor.html            # Visitor lens
├── recruiter.html          # Recruiter lens
├── partner.html            # Partner lens: case studies
├── ask.html                # Ask Me lens: scripted guide
├── 404.html                # Not-found page for GitHub Pages
├── looker.html             # Redirect stub to visitor.html
├── developer.html          # Redirect stub to partner.html
├── persona.html            # Redirect stub to ask.html
├── data/
│   └── profile.json        # Shared facts, the source for generated blocks
├── tools/
│   └── build.py            # Writes the generated blocks; --check for CI
├── .github/workflows/
│   └── check.yml           # Runs build.py --check and validates the JSON
└── assets/
    ├── Proteek_Sanyal_Resume.pdf
    ├── persona.json        # Ask Me questions and answers
    ├── css/
    │   ├── base.css        # Tokens, layout, focus and skip link
    │   ├── index.css       # Landing page and cubes
    │   ├── mode.css        # Lens page styles and accents
    │   └── ask.css         # Ask Me layout
    ├── js/
    │   ├── motion.js       # Shared checks: reduced motion, touch, hidden tab
    │   ├── app.js          # Starfield and cursor glow
    │   ├── index.js        # Cube hover particles and click transition
    │   ├── cube-burst.js   # Three.js cube burst, loaded on first hover
    │   └── ask-engine.js   # Ask Me matching, works in the browser and Node
    └── img/
        ├── favicon.svg
        ├── og-image.jpg            # Link preview image
        ├── portrait-256.webp       # Landing page avatar
        ├── portrait-480.webp       # Visitor portrait, small
        ├── portrait-960.webp       # Visitor portrait, large
        └── portrait-960.jpg        # Visitor portrait, JPG fallback
```

## Accessibility and motion

- Text colours come from tokens in `base.css` that reach WCAG AA contrast on the page background.
- Every link, button and input shows a visible focus ring in the page's accent colour. Each page has a skip link to the main content.
- The landing cubes are buttons, so Enter and Space work the same as a click.
- With reduced motion turned on, the starfield and cursor glow stop. A cube click goes straight to the lens.
- On touch screens the starfield is still and the cursor glow and hover particles are off.
- Animations stop while the tab is hidden.
- Three.js loads only after the first hover or focus on a cube. Without WebGL, the cubes use a 2D effect instead.

## Contact

- Email: proteeksanyal1994@gmail.com
- Phone: +61 481 709 247
- LinkedIn: https://www.linkedin.com/in/proteeksanyal/
- GitHub: https://github.com/proteek-dev
- Medium: https://proteeksanyal.medium.com
