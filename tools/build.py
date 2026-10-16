#!/usr/bin/env python3
"""Generate the repeated blocks in the HTML pages from data/profile.json.

Each block sits between a pair of markers:

    <!-- @gen:contact:card -->
    ...generated HTML...
    <!-- @end -->

The text between the markers is replaced with freshly rendered HTML, indented
to match the opening marker. The shared top-level fields in assets/persona.json
are updated too; its qa entries are left alone.

Usage:
    python3 tools/build.py           write the files
    python3 tools/build.py --check   exit 1 and print a diff if anything would change

Standard library only.
"""
import difflib
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "visitor.html", "recruiter.html", "partner.html", "ask.html", "404.html"]
# 404.html is served for missing paths at any depth, so its links start from the site root
BASES = {"404.html": "/portfolio/"}
EXT = 'target="_blank" rel="noopener"'
DOT = '<span class="dot" aria-hidden="true">•</span>'
MARKER = re.compile(r"^([ \t]*)<!-- @gen:([\w:-]+) -->\n(.*?)^[ \t]*<!-- @end -->", re.M | re.S)


def t(s):
    """Escape text content."""
    return html.escape(str(s), quote=False)


def a(s):
    """Escape an attribute value."""
    return html.escape(str(s), quote=True)


def bare(url):
    """https://www.linkedin.com/in/x/ -> linkedin.com/in/x"""
    return re.sub(r"^https?://(www\.)?", "", url).rstrip("/")


def chips(items):
    return '<div class="chips">' + "".join(f'<span class="chip">{t(c)}</span>' for c in items) + "</div>"


# ---------- blocks ----------

def topbar(P, page):
    lens, base = page["lens"], page["base"]
    first = P["person"]["name"].split()[0].upper()
    if page["file"] == "404.html":
        nf = P["not_found"]
        label, sub, aria, nav = nf["label"], nf["subtitle"], "Back to portal", P["lenses"]
    elif lens is None:
        label, sub, aria, nav = P["portal"]["label"], P["portal"]["subtitle"], "Home", []
    else:
        label, sub, aria = lens["label"], lens["subtitle"], "Back to portal"
        nav = [l for l in P["lenses"] if l["id"] != lens["id"]]
    out = [
        '<header class="topbar">',
        f'  <a class="brand" href="{a(base)}index.html" aria-label="{a(aria)}">',
        '    <span class="brand-dot"></span>',
        f'    <span class="brand-title">{t(first)} <span class="muted">//</span> {t(label.upper())}</span>',
        f'    <span class="brand-sub">{t(sub)}</span>',
        "  </a>",
        '  <div class="top-actions">',
    ]
    out += [f'    <a class="btn" href="{a(base + l["file"])}">{t(l["label"])}</a>' for l in nav]
    out += [
        f'    <a class="btn" href="{a(base + P["resume"])}" {EXT}>Resume</a>',
        "  </div>",
        "</header>",
    ]
    return out


def footer(P, page):
    lens = page["lens"]
    out = ['<footer class="footer">', '  <a class="mini" href="index.html">← Back to portal</a>']
    for l in P["lenses"]:
        if lens and l["id"] == lens["id"]:
            continue
        out += [f"  {DOT}", f'  <a class="mini" href="{a(l["file"])}">{t(l["label"])}</a>']
    return out + ["</footer>"]


def contact(P, variant):
    c = P["contact"]
    mail = f'mailto:{c["email"]}'
    email_mini = f'<a class="mini" href="{a(mail)}">{t(c["email"])}</a>'
    if variant == "portal":
        return ['<div class="portal-foot">', f"  {email_mini}",
                f"  {DOT}", f'  <a class="mini" href="{a(c["github"])}" {EXT}>GitHub</a>',
                f"  {DOT}", f'  <a class="mini" href="{a(c["linkedin"])}" {EXT}>LinkedIn</a>',
                f"  {DOT}", f'  <a class="mini" href="{a(c["medium"])}" {EXT}>Medium</a>',
                "</div>"]
    if variant == "card":
        tel = "tel:" + re.sub(r"[^\d+]", "", c["phone"])
        return ['<div class="portrait-meta">', '  <div class="pm-title">Contact</div>',
                f'  <a href="{a(mail)}">{t(c["email"])}</a>',
                f'  <a href="{a(tel)}">{t(c["phone"])}</a>',
                f'  <a href="{a(c["github"])}" {EXT}>{t(bare(c["github"]))}</a>',
                f'  <a href="{a(c["linkedin"])}" {EXT}>{t(bare(c["linkedin"]))}</a>',
                f'  <a href="{a(c["medium"])}" {EXT}>{t(bare(c["medium"]))}</a>',
                "</div>"]
    if variant == "resume":
        return ['<div class="read-actions">',
                f'  <a class="btn" href="{a(P["resume"])}" download>Download resume</a>',
                f'  <a class="btn" href="{a(mail)}">Email me</a>',
                f"  {email_mini}",
                "</div>"]
    if variant == "cta":
        return ['<div class="read-actions">',
                f'  <a class="btn" href="{a(mail)}">Email me</a>',
                f"  {email_mini}",
                f"  {DOT}", f'  <a class="mini" href="{a(c["github"])}" {EXT}>GitHub</a>',
                f"  {DOT}", f'  <a class="mini" href="{a(c["linkedin"])}" {EXT}>LinkedIn</a>',
                "</div>"]
    raise ValueError(f"unknown contact variant: {variant}")


def skills(P):
    out = ['<div class="grid2">']
    for g in P["skills"]:
        out += ['  <div class="panel">', f'    <div class="kicker">{t(g["group"].upper())}</div>',
                f'    {chips(g["items"])}', "  </div>"]
    return out + ["</div>"]


def roles(P):
    out = ['<div class="timeline">']
    for r in P["roles"]:
        out += ['  <div class="panel">', f'    <h3>{t(r["title"])}, {t(r["employer"])} ({t(r["dates"])})</h3>', "    <ul>"]
        for b in r["bullets"]:
            lead = f'<strong>{t(b["lead"])}:</strong> ' if b.get("lead") else ""
            out.append(f'      <li>{lead}{t(b["text"])}</li>')
        out.append("    </ul>")
        if r["chips"]:
            out.append(f'    {chips(r["chips"])}')
        out.append("  </div>")
    return out + ["</div>"]


LINK_LABELS = [("code", "Code"), ("writeup", "Write-up"), ("try", "Try it")]


def personal_projects(P):
    out = ["<ul>"]
    for p in P["projects"]["personal"]:
        links = "".join(f'<a href="{a(p["links"][k])}" {EXT}>{label}</a>'
                        for k, label in LINK_LABELS if k in p["links"])
        out.append(f'  <li><strong>{t(p["name"])}:</strong> {t(p["summary"])} <span class="proof-links">{links}</span></li>')
    return out + ["</ul>"]


def work_projects(P):
    # Projects from the same employer and year share one panel
    groups = []
    for w in P["projects"]["work"]:
        if groups and (groups[-1][0]["employer"], groups[-1][0]["year"]) == (w["employer"], w["year"]):
            groups[-1].append(w)
        else:
            groups.append([w])
    out = [f'<p class="muted">{t(P["projects"]["work_note"])}</p>', "", '<div class="grid2">']
    for g in groups:
        names = " and ".join(w["name"] for w in g)
        items = []
        for w in g:
            items += [c for c in w["chips"] if c not in items]
        out += ['  <article class="panel">', f'    <h3>{t(names)} ({t(g[0]["employer"])}, {t(g[0]["year"])})</h3>', "    <p>"]
        out += [f'      {t(w["summary"])}' for w in g]
        out += ["    </p>", f"    {chips(items)}", "  </article>"]
    return out + ["</div>"]


def lens_tiles(P, page):
    base = page["base"]
    out = ['<nav class="lens-tiles" aria-label="Lenses">']
    for l in P["lenses"]:
        out += [f'  <a class="lens-tile" href="{a(base + l["file"])}" style="--accent: {a(l["accent"])}">',
                f'    <span class="lens-tile-name">{t(l["label"])}</span>',
                f'    <span class="lens-tile-sub">{t(l["subtitle"])}</span>',
                "  </a>"]
    return out + ["</nav>"]


def writing(P):
    out = ['<ul class="writing">']
    for w in P["writing"]:
        out.append(f'  <li><a href="{a(w["url"])}" {EXT}>{t(w["title"])}</a> '
                   f'<span class="muted">{t(w["month"])} {t(w["year"])}</span></li>')
    return out + ["</ul>"]


def render(P, name, page):
    kind, _, variant = name.partition(":")
    if kind == "topbar":
        return topbar(P, page)
    if kind == "footer":
        return footer(P, page)
    if kind == "lens-tiles":
        return lens_tiles(P, page)
    if kind == "contact":
        return contact(P, variant)
    simple = {"skills": skills, "roles": roles, "personal-projects": personal_projects,
              "work-projects": work_projects, "writing": writing}
    if kind in simple:
        return simple[kind](P)
    raise ValueError(f"unknown block: {name}")


# ---------- files ----------

def build_page(P, path):
    page = {"file": path.name, "base": BASES.get(path.name, ""),
            "lens": next((l for l in P["lenses"] if l["file"] == path.name), None)}
    src = path.read_text(encoding="utf-8")

    def sub(m):
        indent, name = m.group(1), m.group(2)
        body = "\n".join(indent + line if line else "" for line in render(P, name, page))
        return f"{indent}<!-- @gen:{name} -->\n{body}\n{indent}<!-- @end -->"

    return src, MARKER.sub(sub, src)


def build_persona(P, path):
    src = path.read_text(encoding="utf-8")
    data = json.loads(src)
    data.update({
        "name": P["person"]["name"],
        "tagline": P["person"]["headline"],
        "email": P["contact"]["email"],
        "github": P["contact"]["github"],
        "linkedin": P["contact"]["linkedin"],
        "medium": P["contact"]["medium"],
    })
    return src, json.dumps(data, indent=2, ensure_ascii=False) + "\n"


def main():
    check = "--check" in sys.argv[1:]
    P = json.loads((ROOT / "data/profile.json").read_text(encoding="utf-8"))
    results = [(ROOT / f, *build_page(P, ROOT / f)) for f in PAGES]
    results.append((ROOT / "assets/persona.json", *build_persona(P, ROOT / "assets/persona.json")))

    changed = [(p, old, new) for p, old, new in results if old != new]
    if check:
        for p, old, new in changed:
            rel = p.relative_to(ROOT).as_posix()
            sys.stdout.writelines(difflib.unified_diff(
                old.splitlines(True), new.splitlines(True), f"a/{rel}", f"b/{rel}"))
        if changed:
            print(f"\n{len(changed)} file(s) out of date. Run: python3 tools/build.py")
            sys.exit(1)
        print("Generated content is up to date.")
        return
    for p, _, new in changed:
        p.write_text(new, encoding="utf-8")
    print("Updated:" if changed else "No changes.", *[p.relative_to(ROOT).as_posix() for p, _, _ in changed])


if __name__ == "__main__":
    main()
