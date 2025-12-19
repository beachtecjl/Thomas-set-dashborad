# LEGO Set Ranking Dashboard (Dark Mode)

Client-side LEGO investment tracker built with **React**, **Vite**, and **Tailwind CSS**. Search sets, rank across four categories, track purchase/current prices, and view BrickLink images and links automatically. Data is stored in `localStorage` and seeded from a bundled dataset for quick starts.

## Features
- Dark-mode UI with table + detail layout.
- Search by set ID, name, or theme.
- Sort by total score (default), current price, or ROI%.
- Four adjustable ranks (-20..20) with instant total score updates.
- Purchase/current price tracking with delta + ROI% calculations.
- BrickLink image thumbnails and “Open on BrickLink” links (generated from `setId`).
- Notes and comma-separated tags per set.
- Add new sets (ID-only required, with live BrickLink preview and validation).
- Delete sets from the table or detail panel (with confirmation).
- XLSX import (SheetJS) with duplicate skipping and summary modal.
- Add new sets (validates ID format and prevents duplicates).
- Local persistence via `localStorage` plus starter data in `src/data/seedSets.js`.

## Getting Started
```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

### Importing XLSX
- Click **Import XLSX** and choose a `.xlsx`/`.xls` file.
- The first sheet is read; accepted headers for set IDs (case-insensitive): `setId`, `set_id`, `set`, `set #`, `set#`, `set number`, `set_number`.
- Rows missing a set ID are skipped; numeric IDs are auto-converted to `####-1`.
- Duplicates are skipped. A summary modal reports imported / duplicate / invalid counts.

## Project Structure
- `src/App.jsx` – Main layout, state, persistence, filtering, sorting.
- `src/components/` – Reusable UI pieces (table, detail editor, search, modal).
- `src/data/seedSets.js` – Initial LEGO set dataset.
- `tailwind.config.js` / `postcss.config.js` – Styling configuration.

## Notes
- Images and BrickLink links are derived from `setId` (`https://img.bricklink.com/ItemImage/SN/0/{setId}.png`).
- No backend required; all data stays in the browser.
