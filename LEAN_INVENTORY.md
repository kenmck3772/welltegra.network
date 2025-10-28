# Lean Inventory Initiative (#46)

The repository carried several legacy demos and multimedia files that duplicated the production experience and inflated the deploy size. Issue #46 tracks the effort to reduce that footprint so GitHub Pages and downstream mirrors only ship what the live marketing shell needs.

## Removed assets

| File | Reason for removal |
| --- | --- |
| `index-v23-fresh.html` | Frozen marketing snapshot from an early planner refresh. All active content now lives in `index.html`. |
| `test-v23-1761097711.html` | Temporary testing harness that duplicated the marketing layout for Playwright sweeps. |
| `quick-wins-demo.html` | Static promotional landing page superseded by the current marketing shell. |
| `test-calculator.html` | Sandbox markup for the legacy calculator experiment. |
| `assets/hero1.mp4`, `assets/hero2.mp4`, `assets/hero4.mp4`, `assets/hero5.mp4`, `assets/hero6.mp4` | Alternate background loops that were never referenced by the production pages. |
| `assets/login.mp4`, `assets/loginbackground.mp4`, `assets/logohome.mp4` | Outdated auth concepts no longer exposed in the product story. |
| `assets/YouTube_Lead_Generation_for_Well_Tegra (2).mp4` | Marketing reel archived elsewhere; unused on site. |

## Assets retained

| File | Notes |
| --- | --- |
| `assets/hero.mp4` | Only hero loop referenced by `index.html`; remains required. |
| `assets/hero-video-descriptions.vtt` | Keeps the hero video accessible for screen readers. |
| `assets/logo.jpg`, `assets/watermark.jpg` | Shared branding across metadata and supporting sections. |
| `assets/Tool_Eqp drawings.xls.xlsx` | Source material for the forthcoming equipment browser refresh. |
| `assets/js/*`, `assets/css/*`, `assets/vendor/*` | Active runtime bundles. |

## Follow-up considerations

1. Convert `Tool_Eqp drawings.xls.xlsx` into structured JSON to support the catalog experience without bundling the entire workbook.
2. Compress `hero.mp4` with a modern codec before the next release to trim the remaining binary footprint.
3. Automate an asset audit as part of the release checklist so future demos stay out of the mainline branch.

Refer to `assets/README.md` for the quick reference table that ships with the repo.
