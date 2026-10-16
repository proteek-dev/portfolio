# Proteek // Portfolio

A cinematic personal portfolio site for **Proteek Kumar Sanyal** — AI Solutions Analyst | Business & Systems Analyst | Data Analyst with 6 years of experience.

## Overview

The portfolio uses a "Lens Portal" concept: visitors choose a viewing mode (lens) that tailors the content to their perspective. Each lens is a separate page with its own theme and narrative.

## Lenses

| Lens | Page | For |
|---|---|---|
| **Visitor** | `visitor.html` | Anyone curious: who I am, in two minutes |
| **Recruiter** | `recruiter.html` | Screening: roles, proof, availability |
| **Partner** | `partner.html` | Someone who might build or pay for something: case studies, how I work |
| **Ask Me** | `ask.html` | Questions answered from the CV by a scripted guide |

## Structure

```
portfolio/
├── index.html              # Lens portal entry point
├── visitor.html            # Visitor lens
├── recruiter.html          # Recruiter lens
├── partner.html            # Partner lens
├── ask.html                # Ask Me lens
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
