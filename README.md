# Jesse Becker Personal Site

Static portfolio and resume site for Jesse Becker, a Global Learning and Development Manager focused on learning operations, training enablement, LMS administration, knowledge management systems (KMS), and performance support.

The site is built with plain HTML, CSS, and JavaScript. It is intentionally lightweight: there is no build step, package manager, or front-end framework.

## Site Structure

| File | Purpose |
| --- | --- |
| `index.html` | Homepage, professional summary, expertise, and featured work |
| `portfolio.html` | Filterable portfolio grid with project cards |
| `resume.html` | Web resume |
| `personal.html` | Personal interests and projects |
| `site.js` | Footer year, mobile nav, theme toggle, `initReveal`, `initCounters` |
| `jesse-becker-resume.pdf` | Downloadable resume |

### Stylesheets

The design system lives in `css/`, loaded in this order on every page. Each
file has one job, so a change usually only touches one of them.

| File | Purpose |
| --- | --- |
| `css/tokens.css` | Every colour, space, size, radius, and easing curve. Light and dark. No selectors beyond `:root` and `[data-theme="dark"]` |
| `css/base.css` | Reset, document typography, layout primitives, paper grain, accessibility layer, reduced-motion |
| `css/components.css` | Reusable vocabulary: paper sheets, tape, buttons, chips, ledger rows, work cards, reveal states |
| `css/layout.css` | Page furniture: navbar and theme toggle, hero, page banner, CTA, footer |
| `css/pages.css` | Sections belonging to one page: home stats, portfolio filters, resume, personal |
| `css/print.css` | Loaded `media="print"`. Generates the resume PDF |

**Never hardcode a colour or spacing value downstream.** If a value is missing,
add a token to `css/tokens.css` and reference it. That is what keeps the dark
theme working: switching themes only reassigns tokens.

## Case Studies

The deeper portfolio stories are modularized so each one can have its own layout and behavior while still using the shared site design language.

| File | Purpose |
| --- | --- |
| `case-study.css` | Chrome shared by all case studies, plus the KnowledgeOwl component library shown as a work sample (scoped to `.kb-live`) |
| `case-study.js` | Showcase tabs and component-explorer behavior |
| `case-study-kb.html` | Knowledge Base Design System case study |
| `kb-sample.html` | Anonymized rendered knowledge-base sample — **do not restyle** |
| `case-study-training.html` | Career progression and global training journey case study |
| `training-case-study.css` / `.js` | Timeline spine, reveal, and stat counters |
| `case-study-callflows.html` | Interactive decision-tree case study |
| `callflow-case-study.css` / `.js` | Decision-tree widget and its state machine |
| `case-study-elearning.html` | Interactive e-learning case study |
| `course-sample.html` | Self-contained LMS course demo — **do not restyle** |

## Local Preview

Pages link to each other with clean, extensionless URLs (`/portfolio`, `/resume`),
which Cloudflare Pages resolves in production. Opening `index.html` from disk will
break those links, so use the bundled server, which mirrors the same rewriting:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/serve.ps1 -Port 8731
```

Then open:

```text
http://localhost:8731
```

## Deployment

The repository is hosted on GitHub and deployed through Cloudflare Pages. Because the project is static, deployment does not require a build command.

Typical update workflow:

```powershell
git status
git add .
git commit -m "Describe the site update"
git push
```

Cloudflare Pages should publish the pushed revision automatically.

## Content Updates

### Add a portfolio card

Add a new `<article class="project-card">` inside `#project-grid` in `portfolio.html`.

Each card needs a `data-category` value that matches an existing filter:

- `km` - Knowledge Management
- `ld` - Learning and Development
- `lt` - Learning Systems
- `ops` - Operations
- `creative` - Creative Production

### Add a deep dive

For a project that needs a full case study:

1. Create a dedicated HTML page. Copy the `<head>`, navbar, and footer from an
   existing case study so the theme script and shared chrome come with it.
2. Load the six `css/` modules, then `case-study.css`, then any page-specific sheet.
3. Add a page-specific stylesheet and script only when the interaction requires them.
4. Link the case study from its portfolio card, and add it to `sitemap.xml`.
5. Keep employer, client, pricing, and policy details anonymized where appropriate.

### Update shared styles

Asset URLs carry a `?v=YYYYMMDD-N` stamp so browsers and Cloudflare do not serve
stale files. With six stylesheets across eight pages that is 65 references, so
they are not maintained by hand. After changing anything in `css/` or a `.js`
file, run:

```powershell
.\.claude\bump-cache.ps1
```

Pass `-Revision 2` for a second release on the same day, or `-WhatIf` to preview
without writing.

### Theming

Both themes are driven entirely by `css/tokens.css`. The theme is applied by a
small inline script in each page's `<head>`, before the stylesheets, so there is
no flash of the wrong theme on load. `site.js` owns only the toggle button and
the system-preference listener.

If you add a page, copy that inline script across — a page without it will flash
light before switching.

Print always renders light. `css/print.css` re-declares the light token values
for both `:root` and `[data-theme="dark"]`, so a visitor printing in dark mode
still gets ink on white paper.

### Refresh the downloadable resume

The printable resume uses `resume.html` as its source of truth. After changing resume content, export `resume.html` to `jesse-becker-resume.pdf` with browser print output so the web and downloadable versions stay aligned.

## Design Notes

The visual language is "Paper & Ink": warm paper surfaces with a subtle grain,
Fraunces for display type against Inter for body copy, and a single vermilion
accent. Cards are sheets of paper, sometimes stacked and slightly tilted.

A few rules worth keeping:

- **One accent.** Vermilion is the only brand hue. Where colour previously
  distinguished categories (tags, timeline phases, card accents), hierarchy is
  now carried by type, shape, and position instead.
- **Shape carries meaning.** Full-round is reserved for the hero location stamp.
  Buttons, chips, and filters are rectangles so shape stays available for emphasis.
- **Accent text needs the deep variant.** `--accent` on paper is about 3.9:1,
  which is fine for large display type and non-text marks but not for small text.
  Use `--accent-deep` below roughly 1.2rem. Text sitting *on* an accent fill uses
  `--on-accent`, since white only reaches ~3.1:1 on vermilion.
- **Card tilt composes through `--tilt`.** Resting tilt lives in a custom property
  rather than the transform, so reveal and hover states can rebuild the whole
  transform without clobbering each other.
- **The embedded artifacts are off-limits.** `kb-sample.html` and
  `course-sample.html` are self-contained work samples with their own fictional
  branding. They are framed as labelled "Live sample" specimens rather than
  restyled, so the frame reads as intentional in dark mode.
- The training timeline progressively enhances: content remains visible without JavaScript.
- SEO-oriented terms such as `LMS`, `KMS`, `training enablement`, `learning operations`,
  and `performance support` appear naturally in metadata and page copy.

## Verification Checklist

Before publishing:

1. Open every page in both themes and confirm the toggle persists across navigation.
2. Test each portfolio filter, and confirm the result count announces.
3. Exercise the interactive widgets: case-study tabs (including arrow keys), the
   component explorer, the call-flow decision tree, and the photo lightbox
   (Escape, backdrop click, focus return).
4. Check responsive layouts at 375px and desktop; confirm no horizontal scroll.
5. Print-preview `resume.html` **in dark mode** — it must come out light, and the
   layout should match `jesse-becker-resume.pdf`.
6. Verify that anonymized samples do not expose sensitive details.
7. Run `.\.claude\bump-cache.ps1` and update `sitemap.xml` lastmod dates.
