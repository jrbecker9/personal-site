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
| `style.css` | Shared site styles |
| `jesse-becker-resume.pdf` | Downloadable resume |

## Case Studies

The deeper portfolio stories are modularized so each one can have its own layout and behavior while still using the shared site design language.

| File | Purpose |
| --- | --- |
| `case-study-kb.html` | Knowledge Base Design System case study |
| `case-study.css` | Knowledge base case-study styles |
| `case-study.js` | Knowledge base component explorer behavior |
| `kb-sample.html` | Anonymized rendered knowledge-base sample |
| `case-study-training.html` | Career progression and global training journey case study |
| `training-case-study.css` | Timeline-specific styles |
| `training-case-study.js` | Timeline reveal and stat-counter behavior |

## Local Preview

The site can be opened directly from `index.html`, but running a small local server is more reliable for checking links, iframes, and interactive behavior.

With Python:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
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

1. Create a dedicated HTML page.
2. Reuse `style.css` for shared navigation, banners, cards, buttons, and footer styling.
3. Add a page-specific stylesheet and script only when the interaction requires them.
4. Link the case study from its portfolio card.
5. Keep employer, client, pricing, and policy details anonymized where appropriate.

### Update shared styles

When changing `style.css`, increment its query-string version in every HTML file:

```html
<link rel="stylesheet" href="style.css?v=YYYYMMDD-N">
```

Apply the same pattern to page-specific CSS files when they change. This prevents browsers and Cloudflare from serving stale styles.

## Design Notes

- Shared navigation and footer patterns are reused across all pages.
- Contact links are available in every footer and at the top of the web resume.
- Portfolio filters are implemented with a small inline script in `portfolio.html`.
- The knowledge-base sample is anonymized and rendered inside an iframe.
- The training timeline progressively enhances: the full content remains visible if JavaScript is unavailable.
- SEO-oriented terms such as `LMS`, `KMS`, `training enablement`, `learning operations`, and `performance support` appear naturally in metadata and page copy.

## Verification Checklist

Before publishing:

1. Open the homepage, portfolio, resume, personal page, and both case studies.
2. Test each portfolio filter.
3. Confirm that new project links and downloadable files resolve.
4. Check responsive layouts at narrow and wide viewport sizes.
5. Verify that anonymized samples do not expose sensitive details.
6. Confirm that CSS version tokens were bumped after style changes.
