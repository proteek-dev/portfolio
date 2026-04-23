# Proteek // Portfolio

A cinematic personal portfolio site for **Proteek Kumar Sanyal** — Data Scientist with 6+ years of experience in ML, analytics, and cloud data engineering.

## Overview

The portfolio uses a "Lens Portal" concept: visitors choose a viewing mode (lens) that tailors the content to their perspective. Each lens is a separate page with its own theme and narrative.

## Lenses

| Lens | Page | Focus |
|---|---|---|
| **Looker** | `looker.html` | Orientation — who I am, what I do |
| **Recruiter** | `recruiter.html` | Skills, experience, impact, credibility |
| **Developer** | `developer.html` | Architecture, systems thinking, tradeoffs |
| **Persona** | `persona.html` | AI self, personality, interaction |

## Structure

```
portfolio/
├── index.html              # Lens portal entry point
├── looker.html             # Looker lens
├── recruiter.html          # Recruiter lens
├── developer.html          # Developer lens
├── persona.html            # Persona lens
├── assets/
│   ├── css/
│   │   ├── base.css        # Shared base styles
│   │   ├── index.css       # Portal/landing page styles
│   │   └── mode.css        # Per-lens page styles
│   ├── js/
│   │   ├── app.js          # Shared: starfield animation, cursor glow
│   │   └── index.js        # Portal: cube interaction, disintegration FX
│   └── img/
│       └── portrait.jpg    # Profile photo
```

## Features

- Animated starfield background canvas
- Cursor glow effect
- 3D CSS cube navigation with disintegration particle FX on lens select
- Aurora + noise texture cinematic layers
- Responsive layout with four themed lens pages

## Tech Stack

Plain HTML, CSS, and vanilla JavaScript — no frameworks or build tools.

## Contact

- Email: proteeksanyal1994@gmail.com
- GitHub: [github.com/proteek-dev](https://github.com/proteek-dev)
- LinkedIn: [linkedin.com/in/proteeksanyal](https://www.linkedin.com/in/proteeksanyal/)
