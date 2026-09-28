# AI Dashboard Builder MVP

An interactive, browser-local dashboard builder that transforms raw spreadsheet data (`.csv`, `.xlsx`, `.xls`) into visual analytics, charts, and executive PDF reports entirely within your web browser.

---

## Key Features

- **Multi-Format Spreadsheet Import:** Client-side parsing for `.csv`, `.xlsx`, and `.xls` files using PapaParse and SheetJS.
- **Excel Worksheet & Header Row Selection:** Select any worksheet within a multi-sheet workbook and customize column header placement from the first 20 rows.
- **Automated Type Inference & Data Quality Summary:** Automatic detection of Numeric, Currency, Date, Categorical, and String column types with read-only data quality metrics (null/blank counts, duplicate row analysis).
- **Interactive Analytics Dashboard:**
  - KPI measures with Sum, Average, Minimum, and Maximum aggregations.
  - Category grouping bar, column, and donut charts.
  - Time trend line charts with daily, monthly, and yearly date groupings.
  - Dynamic histogram distribution and statistical summary (Valid Count, Min, Max, Mean, Median) for numeric columns.
- **Sensitive Data Privacy Controls:**
  - Automatic detection of personal/sensitive fields (Email, Phone, Mobile, Aadhaar, PAN, Passport, Credit Card, Bank Account, SSN, and Record IDs).
  - Masked values on screen and in printable PDF reports (`••••1234`, `a•••@domain.com`) with an explicit React memory-only **Show values / Hide values** control.
  - Sensitive columns automatically excluded from KPI aggregations, category groupings, filter options, and suggested visuals.
- **Column Customization & Multi-Format Export:**
  - Choose columns for table view and PDF report output.
  - Search, sort, date range, and category filters.
  - Intentional raw-data CSV export with formula injection neutralization.
  - Print preview & executive PDF report export.
- **Configuration Storage:** Scoped dashboard setup saving in browser `localStorage` (saves layout, chart selection, and filters; source rows remain 100% in local React memory).

---

## Setup & Running Locally

Ensure you have [Node.js](https://nodejs.org/) installed on your system.

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle and validate linting
npm run lint
npm run build
```

---

## User Usage Flow

1. **Upload File:** Drag and drop or browse any `.csv`, `.xlsx`, or `.xls` spreadsheet up to **25 MB**.
2. **Configure Sheet & Headers (Excel):** If uploading a multi-sheet workbook, choose the target worksheet and select which row contains column headers.
3. **Inspect Data & Quality:** Review detected column schemas, sample values, data quality summary, and parse timing metadata in Data Preview.
4. **Build Custom Dashboard:** Click **Continue to Dashboard** to explore interactive charts, filters, numeric distributions, sensitive privacy controls, and PDF/CSV export.

---

## Privacy & Security Guarantees

- **100% Local Browser Execution:** All file parsing, data quality checks, filtering, chart computations, and privacy masking occur locally in client browser memory. No source data or parsed rows are ever transmitted to any external server or backend.
- **Sensitive Value Masking:** Sensitive fields (email, phone, credit card, PAN, SSN, IDs) are masked on screen and in printable PDF reports by default.
- **Intentional CSV Export:** CSV downloads export original raw source values and neutralizes formula injection risk.

---

## System Limits & Performance Boundaries

- **Maximum File Size:** 25 MB per upload.
- **Maximum Data Rows:** 50,000 data rows per dataset/worksheet.
- **Maximum Data Cells:** 500,000 total cells per dataset/worksheet.

---

## Note on "AI" Suggestions

The current MVP uses a local, deterministic rule-based suggestion engine to propose visual charts (e.g., category distributions and chronological time trends) based strictly on parsed column data types and cardinality. **No live LLM or external AI API is connected in this version.**

---

## Known MVP Limitations

- **Browser-Local Memory Only:** Refreshing or clearing browser state resets active in-memory dataset rows.
- **Single Worksheet View:** Dashboards analyze one selected Excel worksheet at a time.
- **Date Formatting:** Best results are achieved with standard ISO, `YYYY-MM-DD`, `MM/DD/YYYY`, or Excel serial date values.
- **No Backend / Authentication:** Built as a client-side web application without server user accounts, database persistence, or cloud sync.
