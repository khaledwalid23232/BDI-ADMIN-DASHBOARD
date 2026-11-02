# Business Daily Insights: Awards Pipeline Dashboard

The original Business Daily Insights dashboard (not the admin console): a single HTML file with the opportunity funnel, kanban workspace, calendar and the AI proposal writer, in English and Arabic.

Open `index.html` in a browser, or serve it with GitHub Pages.

**Next step: turning this demo into a live product.** See [`docs/PRODUCT_PLAN.md`](docs/PRODUCT_PLAN.md) for the plan, and [`CLAUDE.md`](CLAUDE.md) for the project rules.

## What is in it
- Funnel, kanban workspace and calendar of opportunities
- Company profile (top right) that auto-fills every proposal
- AI proposal writer in two phases:
  1. **Screening**: upload the ToR, get a screening memo (fit, chance of winning, time needed, effort by area, wins, misses, top 2 recommendations), then choose GO, GO WITH CONDITIONS or NO-GO
  2. **Proposal**: written to the playbook for the opportunity type (18 types across tenders, grants, competitions, programs and events)

## Notes
- All opportunities are illustrative demo data, not live tenders.
- The writing and the screening numbers are demo logic; no external AI service is called.
- Everything is saved in the browser (localStorage) of whoever opens it.
- Fonts and the PDF reader (pdf.js) load from Google Fonts and cdnjs, so an internet connection is needed.
