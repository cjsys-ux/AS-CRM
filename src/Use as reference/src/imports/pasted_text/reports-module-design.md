# ActivateSwag Command Center — Reports Module (Complete Figma AI Prompt)

Design a comprehensive Reports module for the "Command Center" internal CRM platform for a B2B distribution company called ActivateSwag. The company does ~$8M in annual revenue across two business lines: Promotional Products (corporate branded merchandise) and PPE/Safety Equipment distributed through Amazon. The CEO is scaling from $8M to $200M+ in 3 years.

The Reports module is the deep-dive companion to the high-level Dashboard views (Finance, Sales, Operations, Customer Service, Executive). While dashboards show "what's happening now," Reports answer "what happened, why, and what does the trend tell us?" This module contains detailed, filterable, exportable reports across every business dimension. Every report supports date range filtering, PDF/CSV export, and drill-down into individual records.

The Reports module lives under a renamed "Reports" navigation item (replacing "Analytics") in the left sidebar. When clicked, it opens to a Reports Hub landing page with cards linking to each report category. Each category then has its own sub-reports.

Use the existing design system: dark navy sidebar (#1B2A4A), white/light gray content area, "ActivateSwag Command Center" branding. Same typography, card styling, and color palette as all other views.

---

## Global Design System (Same as Dashboard Views)

### Overall Layout
- Full-width, 1440px wide. Left sidebar: 240px. Main content: remaining width, 16px padding.
- Cards: white background, 8px border-radius, box-shadow 0 1px 3px rgba(0,0,0,0.1), 24px internal padding.
- Font: Inter or SF Pro.

### Left Sidebar
- Dark navy (#1B2A4A). Logo: "ActivateSwag" + "Command Center."
- Navigation: Dashboard, **Reports** (active, replacing "Analytics"), Sales Leads, CRM, Orders, Products, Order Flow, Warehouse, Amazon Distribution, Billing, Email Templates.
- "Reports" nav item has a small expand arrow — when expanded, shows sub-items: Reports Hub, Revenue, Financial, Clients, Pipeline & Sales, Operations, Amazon/PPE, Marketing.

### Top Bar
- "Command Center" title + subtitle.
- Right side: notification bell, user avatar "Patrick Lowenthal."
- Search bar: "Search anything..."

### Report Page Template (Every Report Follows This Structure)
- **Breadcrumb**: Reports > [Category] > [Report Name]
- **Title bar**: Report name (20px bold) + description (13px gray) + date range picker (dropdown: Last 30 Days, Last 90 Days, Last 12 Months, YTD, Custom Range) + "Export" button (dropdown: PDF, CSV, Excel)
- **Filter bar** (below title): Contextual filters that change per report — e.g., business line (All, Promo, PPE), client, date range, team member, vendor, etc. Filter chips show active filters with X to remove.
- **Report content area**: Charts + data tables. Tables are sortable by clicking column headers, with pagination.
- **Summary bar** at bottom of each report: Key takeaway metrics.

### Color Palette (Consistent)
- Primary Navy: #1B2A4A
- Promo Green: #10B981
- PPE/Amazon Blue: #3B82F6
- Warning Orange: #F59E0B
- Alert Red: #EF4444
- Purple: #7C3AED
- Teal: #14B8A6
- Background: #F8FAFC
- Card Background: #FFFFFF
- Text Primary: #1E293B
- Text Secondary: #64748B
- Border/Divider: #E2E8F0

---

---

# REPORTS HUB (Landing Page)

When the user clicks "Reports" in the sidebar, they land on the Reports Hub — a clean grid of category cards that serve as the entry point to all reports.

## Layout

**Title area:**
- Page title: "Reports" (28px bold)
- Subtitle: "Detailed analytics and reporting across every dimension of your business"
- Right side: "Favorites" toggle (shows only starred/pinned reports) and global search: "Search reports..."

**Category Cards Grid: 2 columns, 4 rows (8 cards total)**

Each card: white background, 8px radius, soft shadow, ~180px tall. Contains: icon (colored circle), category title (16px bold), description (13px gray), number of reports in that category, and a list of the top 3 report names as clickable links. Hover: slight elevation + colored top border accent.

**Card 1: Revenue Reports**
- Icon: Dollar sign on green circle
- Title: "Revenue Reports"
- Description: "Revenue history, YoY/MoM trends, class breakdown, client revenue analysis"
- "7 reports"
- Quick links: "10-Year Revenue History", "Monthly Revenue (YoY)", "Revenue by Client"
- Top border accent on hover: green (#10B981)

**Card 2: Financial Reports**
- Icon: Bank on navy circle
- Title: "Financial Reports"
- Description: "P&L statements, margin analysis, expense breakdown, cash flow detail"
- "8 reports"
- Quick links: "P&L by Class", "Expense Breakdown", "Cash Flow Detail"
- Top border accent: navy (#1B2A4A)

**Card 3: Client Reports**
- Icon: People on teal circle
- Title: "Client Reports"
- Description: "Client lifetime value, spend trajectory, retention, dormant analysis, concentration"
- "6 reports"
- Quick links: "Client Lifetime Value", "Concentration Analysis", "Dormant Clients"
- Top border accent: teal (#14B8A6)

**Card 4: Pipeline & Sales Reports**
- Icon: Funnel on blue circle
- Title: "Pipeline & Sales"
- Description: "Pipeline velocity, win/loss analysis, deal aging, team performance, forecasting"
- "7 reports"
- Quick links: "Pipeline Velocity", "Win/Loss Analysis", "Sales Team Scorecard"
- Top border accent: blue (#3B82F6)

**Card 5: Operations Reports**
- Icon: Gear on purple circle
- Title: "Operations Reports"
- Description: "Order fulfillment metrics, vendor scorecards, shipping costs, production timelines"
- "6 reports"
- Quick links: "Vendor Scorecard", "Shipping Cost Analysis", "Fulfillment Metrics"
- Top border accent: purple (#7C3AED)

**Card 6: Amazon / PPE Reports**
- Icon: Box on blue circle
- Title: "Amazon / PPE Reports"
- Description: "SKU performance, deployment history, DC distribution, IPF billing reconciliation"
- "6 reports"
- Quick links: "SKU Performance", "Deployment History", "IPF Reconciliation"
- Top border accent: blue (#3B82F6)

**Card 7: Marketing Reports**
- Icon: Megaphone on coral circle
- Title: "Marketing Reports"
- Description: "Channel ROI, lead attribution, campaign performance, content analytics"
- "5 reports"
- Quick links: "Channel ROI", "Lead Attribution", "Content Performance"
- Top border accent: coral (#F97066)

**Card 8: Custom Reports**
- Icon: Wrench on gray circle
- Title: "Custom Reports"
- Description: "Build your own reports with custom filters, metrics, and visualizations"
- "Create New Report" button (blue, primary)
- Top border accent: gray (#94A3B8)

**Below the grid:**
- "Recently Viewed" section: horizontal row of the last 5 reports the user accessed, shown as compact cards with title + last viewed date.
- "Scheduled Reports" link: "3 reports scheduled for email delivery" — links to a settings page where you can schedule automatic report delivery.

---

---

# CATEGORY 1: REVENUE REPORTS

When the user clicks into Revenue Reports, they see a sub-navigation within the content area (horizontal tabs or a left-side list) with the individual reports below.

## Sub-navigation (horizontal tabs at top of content area):
10-Year History | Monthly (YoY) | Monthly (MoM) | By Class | By Client | By Product Category | By Geography

---

## Report 1.1: 10-Year Revenue History

**Purpose:** The full story of the business in one chart. Shows the arc from startup through e-commerce peak, COVID boom, collapse, restructuring, and the Amazon-driven resurgence.

**Filter bar:** Date range (default: 2016-2026 YTD) | Annotation toggle (on/off — shows event labels on chart)

**Primary chart: Full-width line chart + bar chart combo**
- X-axis: Years (2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 YTD)
- Primary Y-axis (left): Revenue (bar chart, navy bars)
- Secondary Y-axis (right): Net Income (line chart, green when positive, red when negative)
- Bar values labeled on top of each bar: $4.2M, $922K, $2.98M, $8.96M, $11.34M, $3.69M, $3.97M, $1.78M, $2.84M, $7.9M, $1.82M YTD
- Net income line points labeled: +$500K, -$145K, +$65K, -$32K, +$575K, -$802K, -$229K, -$237K, +$190K, +$1.07M

**Annotations** (small callout labels on the chart):
- 2016: "WYD Vatican Deal"
- 2019: "Blissy/Invative e-comm peak"
- 2020: "COVID PPE boom"
- 2021: "E-commerce collapse"
- 2023: "Bottom — restructuring complete"
- 2024: "IPF/Amazon JV launches"
- 2025: "Amazon explosion — best year"

**Below the chart — Key Metrics Row (4 cards):**
- "Total Lifetime Revenue: $49.6M"
- "Best Revenue Year: $11.34M (2020)"
- "Best Profit Year: $1.07M (2025)"
- "CAGR (2023-2025): +111%"

**Data Table below:**
| Year | Revenue | COGS | Gross Profit | GP% | OpEx | Net Income | NI% | Client Count | Revenue/Client |
Full 10-year table with all data. Sortable columns. Highlight the 2023 row in light red (bottom year) and 2025 row in light green (best profit year).

---

## Report 1.2: Monthly Revenue — Year over Year Comparison

**Purpose:** See every month of the current year vs previous years. This is where you spot seasonal patterns, validate growth, and forecast.

**Filter bar:** Compare years (multi-select checkboxes: 2026, 2025, 2024, 2023) | Business line (All, Promo, PPE)

**Primary chart: Multi-line chart**
- X-axis: Months (Jan through Dec)
- Y-axis: Revenue
- One line per selected year, each a different color:
  - 2026: Green (bold, thicker line — current year emphasis)
  - 2025: Navy
  - 2024: Blue (lighter)
  - 2023: Gray (dashed)
- Data points are interactive — hover to see exact value
- Current month (March 2026) has a vertical dashed line marking "current"
- Future months of 2026 show as a lighter/projected extension of the green line

**Secondary chart below (stacked bar): Revenue Split by Class per Month**
- Same X-axis (months)
- Stacked bars: blue segment (PPE) + green segment (Promo)
- Labeled with totals above each bar
- This shows how the PPE/Promo mix changes month to month

**Data Table:**
| Month | 2026 | 2025 | 2024 | 2023 | 2026 vs 2025 | 2026 vs 2024 |
With dollar values and % change columns. Green text for positive variance, red for negative.

**Summary bar:** "2026 YTD: $1.82M | 2025 same period: $1.34M | Growth: +36% | Projected Full Year: $8.7M (based on current run rate)"

---

## Report 1.3: Monthly Revenue — Month over Month Trend

**Purpose:** See the sequential progression within the current year. Spot momentum or deceleration.

**Filter bar:** Year (2026 default) | Business line (All, Promo, PPE) | Rolling average toggle (3-month, 6-month)

**Primary chart: Bar chart with trend line**
- X-axis: Months (Jan through current)
- Y-axis: Revenue
- Bars colored by class: stacked blue (PPE) + green (Promo)
- Overlay: dashed line showing rolling 3-month average
- MoM % change labels between bars: "+12%", "-5%", "+28%", etc. — green when positive, red when negative

**Data Table:**
| Month | Total | PPE | Promo | MoM Change | MoM % | Running Total |

---

## Report 1.4: Revenue by Class (PPE vs Promo Deep Dive)

**Purpose:** Granular breakdown of how each business line is performing independently.

**Filter bar:** Date range | Metric toggle (Revenue, Gross Profit, Net Contribution)

**Two-column layout:**

**Left column: PPE / Amazon**
- Revenue trend line (12 months)
- Key metrics: Revenue MTD, YTD, Run Rate, Avg Monthly, Highest Month, Lowest Month
- Top 10 PPE products by revenue (horizontal bar chart)
- Revenue by program type: Deployment vs Inventory (pie chart)

**Right column: Promo**
- Revenue trend line (12 months)
- Key metrics: Revenue MTD, YTD, Run Rate, Avg Monthly, Highest Month, Lowest Month
- Top 10 Promo clients by revenue (horizontal bar chart)
- Revenue by sourcing method: Overseas vs Apparel vs Distributor (pie chart)

**Full-width below: Concentration Trend**
- Stacked area chart showing PPE % vs Promo % of total revenue over trailing 24 months
- Red dashed line at 50% labeled "Target: No single line >50%"
- Annotation at current point: "PPE: 77% — Target: <50% by EOY 2026"

---

## Report 1.5: Revenue by Client

**Purpose:** Understand client-level revenue in full detail. Who's growing, shrinking, new, gone.

**Filter bar:** Date range | Client status (All, Active, Declining, Dormant, New, Lost) | Business line | Minimum revenue threshold

**Primary view: Sortable data table (full width)**
| Rank | Client | 2022 | 2023 | 2024 | 2025 | 2026 YTD | Run Rate | YoY Change | Trend | Status |
- Full client roster, all years visible
- Trend column: sparkline mini chart (tiny 5-year line graph)
- Status column: colored badge — Active (green), Declining (yellow), Dormant (gray), New (blue), Lost (red)
- Rows color-tinted: light red for declining/lost, light green for growing 20%+
- Click any row to expand full client detail (order history, products purchased, margin)

**Above the table: 4 summary cards**
- "Active Clients: 87 | Growing: 34 | Flat: 28 | Declining: 15 | Dormant: 10"
- "Top Client Concentration: IPF 76% of 2025 revenue"
- "Client Revenue Growth (median): +12% YoY"
- "Estimated Uncaptured Wallet: $1.2M from top 20 accounts"

**Chart below table: Waterfall chart**
- Shows revenue bridge: "2025 Revenue ($7.9M)" → "Lost clients (-$337K Goliath, -$59K Pinnacle, etc.)" → "Declining clients (-$X)" → "Flat clients" → "Growing clients (+$X)" → "New clients (+$X)" → "2026 Projected Revenue"
- Green bars for additions, red for losses. Makes the growth/churn composition visually clear.

---

## Report 1.6: Revenue by Product Category

**Filter bar:** Date range | Business line

**Chart: Treemap visualization**
- Rectangles sized by revenue, colored by margin (deeper green = higher margin, yellow = low margin, red = negative)
- Major categories: PPE Gloves, PPE Sunscreen, PPE Thermal, PPE Holsters, Apparel (Polos/Jackets), Drinkware, Tech Accessories, Bags/Totes, Writing Instruments, Custom Packaging

**Data table below:**
| Category | Revenue | % of Total | COGS | Gross Margin | GM% | Orders | Avg Order Value | Top Client |

---

## Report 1.7: Revenue by Geography

**Filter bar:** Date range | Business line | Level (State, Region, City)

**Map visualization:** US heatmap shaded by revenue density. Clicking a state drills into city-level.

**Table below:**
| State/Region | Revenue | Clients | Orders | Avg Order | Growth vs LY |

---

---

# CATEGORY 2: FINANCIAL REPORTS

Sub-navigation: P&L Summary | P&L by Class | Expense Breakdown | Margin Analysis | Cash Flow Detail | AR Aging Detail | AP Detail | Budget vs Actual

---

## Report 2.1: P&L Summary

**Full income statement with comparison columns.**

**Filter bar:** Period (Monthly, Quarterly, Annual) | Compare to (Prior Period, Same Period Last Year, Budget)

**Primary view: P&L Statement formatted like an actual financial statement**

|  | Current Period | Prior Period | $ Change | % Change | Same Period LY | $ Change | % Change |
| **Revenue** | $583,000 | $547,000 | +$36,000 | +6.6% | $412,000 | +$171,000 | +41.5% |
| COGS | ($442,280) | ($415,720) | ... | ... | ... | ... | ... |
| **Gross Profit** | $140,720 | $131,280 | ... | ... | ... | ... | ... |
| Gross Margin % | 24.1% | 24.0% | +0.1 pts | | 25.2% | -1.1 pts | |
| --- | | | | | | | |
| Wages & Related | ($29,200) | ($28,500) | ... | | | | |
| Professional Fees | ($3,533) | ($3,533) | ... | | | | |
| Dues & Subscriptions | ($4,325) | ($4,325) | ... | | | | |
| Marketing | ($2,000) | ($2,000) | ... | | | | |
| Merchant Processing | ($3,425) | ($3,200) | ... | | | | |
| Rent & Facilities | ($3,500) | ($3,500) | ... | | | | |
| Shipping & Fulfillment | ($6,800) | ($5,900) | ... | | | | |
| Insurance | ($1,900) | ($1,900) | ... | | | | |
| Equipment Payments | ($20,000) | ($20,000) | ... | | | | |
| SBA EIDL | ($731) | ($731) | ... | | | | |
| Other | ($2,500) | ($2,100) | ... | | | | |
| **Total Operating Expenses** | ($77,914) | ($75,689) | ... | | | | |
| **Net Operating Income** | $62,806 | $55,591 | +$7,215 | +13.0% | | | |
| Interest & Other | ($741) | ($741) | | | | | |
| **Net Income** | $62,065 | $54,850 | +$7,215 | +13.2% | | | |
| Net Margin % | 10.6% | 10.0% | +0.6 pts | | | | |

- Negative variances highlighted in red text
- Material variances (>15%) have a small flag icon
- Each line item is clickable — drills into transaction-level detail
- "Download to Excel" button exports this in standard financial format

---

## Report 2.2: P&L by Class (PPE / Promo / Shared)

**The most important financial report once class separation is live.**

**Filter bar:** Period | Date range

**Three-column P&L format:**

|  | PPE | Promo | Shared | Total |
| Revenue | $448,000 | $135,000 | — | $583,000 |
| COGS | ($365,100) | ($77,180) | — | ($442,280) |
| **Gross Profit** | $82,900 | $57,820 | — | $140,720 |
| **Gross Margin %** | **18.5%** | **42.8%** | — | **24.1%** |
| Shared Allocation | ($42,380) (55%) | ($35,534) (45%) | ($77,914) | $0 |
| **Contribution Margin** | $40,520 | $22,286 | — | $62,806 |
| **Contribution %** | **9.0%** | **16.5%** | — | **10.8%** |

- PPE Gross Margin has an info icon: "Compressed by IPF billing structure. Actual economic margin is higher."
- Promo Gross Margin highlighted in green if above 35% target
- Shared allocation methodology shown in footnote: "Allocated by revenue weight (PPE 77%, Promo 23%) — methodology adjustable in settings"

**Below: Trend charts (3 side-by-side)**
- PPE Revenue & Margin trend (12 months) — bar + line combo
- Promo Revenue & Margin trend (12 months) — bar + line combo
- Contribution Margin trend by class (12 months) — stacked area

---

## Report 2.3: Expense Breakdown

**Filter bar:** Period | Category | Compare to prior period

**Primary chart: Donut chart showing expense composition**
- Segments: Wages (largest), Professional Fees, Tech/Subscriptions, Marketing, Merchant Processing, Rent/Facilities, Shipping/Fulfillment, Insurance, Debt Payments, Other
- Center: Total OpEx "$77,914/month"

**Secondary chart: Expense trend over 12 months**
- Stacked area chart showing each category's monthly spend
- Callout if any category is growing faster than revenue

**Data table:**
| Category | Current Month | Prior Month | MoM Change | Same Month LY | YoY Change | % of Revenue | Budget | Variance |
- Each row expandable to see individual transactions
- "Merchant Processing" row flagged with note: "$41.1K/yr — growing with revenue, evaluate Stripe alternatives"

---

## Report 2.4: Margin Analysis

**The deep-dive margin report — by client, by product, by vendor, by job.**

**Filter bar:** Dimension (By Client, By Product, By Vendor, By Job) | Date range | Business line | Min deal size

**By Client view:**
| Client | Revenue | COGS | Gross Profit | GM% | vs Average | Trend |
- Sorted by GM% ascending to surface margin problems first
- Average GM% line shown as reference
- Rows below average GM% tinted light red

**By Vendor view:**
| Vendor | Revenue (from their products) | COGS | Margin Generated | GM% | Orders | Notes |
- Shows which vendors produce the best/worst margins
- SC Promo row: "Net 90 terms offset lower margin — strategic value"

**By Job view (most granular):**
| Job # | Client | Product | Quoted Margin | Actual Margin | Variance | Quote Accuracy |
- Quote accuracy = how often actual cost matches quoted cost
- Jobs where actual margin < quoted margin by >5 pts flagged in red
- Summary: "Average quote accuracy: 88% | Jobs underquoted: 14%"

---

## Report 2.5: Cash Flow Detail

**Filter bar:** Period (Weekly, Monthly) | Date range

**Primary chart: Cash flow waterfall (monthly)**
- Starting cash → Operating inflows → Operating outflows → Debt payments → Net change → Ending cash
- Green bars for inflows, red for outflows
- Running balance line overlay

**13-Week Forecast Table (if weekly view):**
| Week | Starting Cash | Inflows | Outflows | Net Change | Ending Cash | Min Alert |
With confidence bands: High confidence (green), Medium (yellow), Low (orange)

**Cash Conversion Cycle Metrics:**
- "Average Days Sales Outstanding (DSO): 52 days (Promo) / 92 days (IPF)"
- "Average Days Payable Outstanding (DPO): 68 days"
- "Cash Conversion Cycle: [DSO - DPO] = X days"
- Trend chart showing CCC over 12 months

---

## Report 2.6: AR Aging Detail

**Filter bar:** Client | Business line | Aging bucket | Status

**Primary view: AR aging schedule (full detail)**
| Invoice # | Client | Amount | Invoice Date | Due Date | Days Outstanding | Aging Bucket | Status | Notes |
- Aging buckets: Current (0-30), 31-60, 61-90, 90+
- Row colors by aging: green (current), yellow (31-60), orange (61-90), red (90+)

**IPF/Amazon AR Section (separate panel with blue border):**
| Invoice # | Amount | Invoice Date | Expected Payment (Net 90) | Days Outstanding | Net 90 Progress Bar | Status |
- Progress bar visually shows how far through the Net 90 cycle each invoice is

**Summary cards:**
- "Total AR: $487,200 | IPF: $412,000 (84.6%) | Promo: $75,200"
- "DSO: 52 days (Promo) | 92 days (IPF)"
- "AR > 60 days: $76,600 (15.7% of total)"
- "Estimated bad debt exposure: $12,500 (invoices 90+ days)"

---

## Report 2.7: AP Detail

**Filter bar:** Vendor | Due date range | Status (All, Due, Overdue, Paid)

**Primary view: AP schedule**
| Invoice # | Vendor | Amount | Invoice Date | Due Date | Days Until Due | Status | Priority |
- Color coding: red (overdue), orange (due this week), yellow (due next week), green (due 15+ days)
- Priority flag: "Strategic Terms" badge on SC Promo invoices (protect Net 90 relationship)

**Payment Calendar: Visual timeline**
- Horizontal calendar showing the next 30 days with payment dots sized by amount
- Large dots for big payments (payroll, equipment, SC Promo)
- Hover to see detail

---

## Report 2.8: Budget vs Actual

**Filter bar:** Period (Monthly, Quarterly, YTD) | Category

**Primary view: Variance report**
| Category | Budget | Actual | $ Variance | % Variance | Status |
- Status: Green checkmark if within 5%, Yellow warning if 5-15% over, Red alert if >15% over
- Each row expandable
- Revenue and expense sections separated

**Chart: Monthly budget vs actual trend**
- Grouped bar chart: budget bar (gray) vs actual bar (green/red based on favorable/unfavorable)

---

---

# CATEGORY 3: CLIENT REPORTS

Sub-navigation: Lifetime Value | Spend Trajectory | Retention & Churn | Concentration Analysis | Dormant Clients | Client Segmentation

---

## Report 3.1: Client Lifetime Value (CLV)

**Filter bar:** Date range (lifetime) | Business line | Min orders

**Primary view: Scatter plot**
- X-axis: Tenure (months since first order)
- Y-axis: Total lifetime revenue
- Bubble size: number of orders
- Color: current status (green = active, yellow = declining, red = dormant/lost)
- Quadrants labeled: "High Value / Long Tenure" (top right, ideal), "High Value / New" (top left, promising), "Low Value / Long Tenure" (bottom right, underperforming), "Low Value / New" (bottom left, early stage)

**Data table:**
| Rank | Client | First Order | Last Order | Tenure | Lifetime Revenue | # Orders | Avg Order | Avg Annual | Status |
- Top 20 most valuable clients highlighted
- Bottom of table shows "Average CLV: $X | Median CLV: $X"

---

## Report 3.2: Client Spend Trajectory

**Purpose:** See each client's spending trend to predict who's growing and who's fading.

**Filter bar:** Client (search/select) | Date range

**When a single client is selected — Full client profile page:**
- Header: Client name, status badge, first order date, total lifetime spend
- Revenue chart: Monthly revenue for this client over the full relationship (bar chart)
- YoY comparison: This year vs last year by month
- Products purchased: Breakdown of what they buy (categories, individual products)
- Margin analysis: Average margin on this client's orders
- Order history: Full table of every order with date, product, value, margin
- Activity timeline: Key events — first order, largest order, last order, any gaps

**When no client selected — Overview grid:**
- Small multiples: tiny sparkline charts for every active client showing their 12-month revenue trend
- Organized into groups: "Growing" (sparkline going up), "Flat" (level), "Declining" (going down)
- Click any sparkline to open the full client profile

---

## Report 3.3: Retention & Churn Analysis

**Filter bar:** Cohort period (Annual, Quarterly) | Business line

**Primary chart: Cohort retention heatmap**
- Rows: Cohort year (2019, 2020, 2021, 2022, 2023, 2024, 2025)
- Columns: Year 1, Year 2, Year 3, Year 4, Year 5, Year 6, Year 7
- Cell value: % of cohort still active / purchasing in that year
- Color intensity: darker green = higher retention, lighter = lower, red = heavy churn
- Example: 2022 cohort started with 250 clients → 185 (74%) in 2023 → 96 (38%) in 2024 → 87 (35%) in 2025

**Revenue Retention chart:**
- Same cohort structure but tracking revenue instead of client count
- Shows whether revenue per retained client is growing (expansion revenue) or shrinking

**Churn Analysis:**
- "Clients lost (no order in 12+ months): 163"
- "Revenue lost from churned clients: ~$2.1M (estimated annual)"
- Top reasons for churn (if tracked): went to competitor, budget cuts, went out of business, relationship issue

---

## Report 3.4: Concentration Analysis

**Purpose:** Track and visualize concentration risk over time — the #1 strategic risk.

**Filter bar:** Date range | Level (Client, Channel, Industry)

**By Client concentration:**
- Pareto chart: Clients ranked by revenue on X-axis, cumulative % of revenue on Y-axis (the classic 80/20 curve)
- Line showing "Top 1 client = X% of revenue," "Top 5 = X%," "Top 10 = X%"
- Historical comparison: overlay the Pareto curve from 2023, 2024, 2025 to see if concentration is improving or worsening

**By Channel concentration:**
- Stacked area chart (trailing 24 months): PPE/Amazon % vs Promo % vs Other %
- Target line at 50% with annotation
- Summary: "Current: IPF 77% | Target: <50% by EOY 2026 | Required promo growth: $1.87M → $5M+"

**Risk scorecard:**
| Risk Factor | Current | Target | Status | Trend |
| Single client concentration | 76% (IPF) | <30% | Red | Worsening (was 36% in 2024) |
| Top 5 client concentration | 89% | <60% | Red | |
| Single channel concentration | 77% (PPE) | <50% | Red | |
| Client diversification (active) | 87 clients | 150+ | Yellow | |

---

## Report 3.5: Dormant Client Analysis

**Purpose:** The reactivation target list. 163+ clients who previously bought from Activate Swag but haven't in 6+ months.

**Filter bar:** Last order date range | Min historical spend | Industry | Source

**Primary view: Sortable table**
| Client | Industry | First Order | Last Order | Months Dormant | Lifetime Revenue | Peak Annual | # Orders | Last Product | Reactivation Priority |
- Reactivation Priority: calculated score based on historical spend, recency, industry growth, ease of re-engagement
- Priority badges: Hot (red — high spend, recently dormant), Warm (orange — moderate spend), Cool (blue — low spend or long dormant)

**Summary:**
- "Total dormant clients: 163 | Estimated addressable annual revenue: $2.1M"
- "By priority: 28 Hot | 45 Warm | 90 Cool"
- "Top 10 reactivation targets by potential value" — highlighted panel

---

## Report 3.6: Client Segmentation

**Filter bar:** Segmentation dimension (Industry, Size, Geography, Product Category, Revenue Tier)

**By Industry:**
- Horizontal bar chart showing revenue by industry: Healthcare, Hospitality, Technology, Education, Entertainment, Food & Beverage, Financial Services, Government, Other
- Table with client count, avg revenue, and growth rate per industry

**By Revenue Tier:**
- Tier definition and distribution:
  | Tier | Definition | Clients | Revenue | % of Total |
  | Enterprise | $100K+/year | 8 | $7.2M | 91% |
  | Mid-Market | $25K-$100K | 12 | $420K | 5% |
  | SMB | $5K-$25K | 35 | $240K | 3% |
  | Small | <$5K | 32 | $48K | 1% |

---

---

# CATEGORY 4: PIPELINE & SALES REPORTS

Sub-navigation: Pipeline Velocity | Win/Loss Analysis | Deal Aging | Sales Team Scorecard | Forecast | Lead Source Analysis | Quote Accuracy

---

## Report 4.1: Pipeline Velocity

**Purpose:** How fast deals move through each stage. Where they stall. Where they die.

**Filter bar:** Date range | Business line | Team member | Stage

**Primary chart: Funnel with velocity metrics**
- Vertical funnel visualization with each HubSpot stage
- For each stage: deal count, total value, average days in stage, conversion rate to next stage, drop-off rate
- Color coding: green if avg days < SLA target, yellow if at SLA, red if over SLA

**Velocity Trend (12 months):**
- Line chart showing average total sales cycle length (days from Lead Received to Closed Won) per month
- Target line at SLA goal
- Trend: improving, stable, or worsening?

**Stage Bottleneck Analysis:**
| Stage | Avg Days | SLA Target | Deals Over SLA | $ Value Over SLA | Bottleneck Score |
- Design Ready likely shows as the biggest bottleneck ($615K sitting, avg days highest)

---

## Report 4.2: Win/Loss Analysis

**Filter bar:** Date range | Business line | Reason | Team member

**Win/Loss ratio trend:**
- Line chart: Win rate % over 12 months
- Stacked bar chart below: Won vs Lost deal count per month

**Loss Reason Breakdown:**
- Donut chart: "Price" (X%), "Timing/Budget" (X%), "Went with competitor" (X%), "Went silent" (X%), "Project cancelled" (X%), "Other" (X%)
- Most common reason highlighted

**Competitive Intelligence:**
| Competitor | Deals Lost To | Total $ Lost | Win Rate vs Them | Notes |
- If competitor data is tracked

**Won Deal Analysis:**
| Metric | Value |
| Avg deal size (won) | $12,400 |
| Avg sales cycle (won) | 18 days |
| Avg margin (won) | 32% |
| Top product category (won) | Apparel |
| Top industry (won) | Healthcare |

---

## Report 4.3: Deal Aging Report

**Filter bar:** Age threshold | Stage | Team member

**Primary view: Every open deal ranked by age**
| Deal | Value | Stage | Owner | Days Open | Days in Current Stage | Last Activity | SLA Status | Next Action |
- Color coding: Green (<7 days in stage), Yellow (7-14), Orange (14-21), Red (21+)
- Deals with no activity in 7+ days flagged with warning icon
- "Stale deal" badge on anything 30+ days with no activity

**Aging distribution chart:**
- Histogram: # of deals in each age bucket (0-7 days, 7-14, 14-21, 21-30, 30-60, 60+)
- Overlay: $ value in each bucket

---

## Report 4.4: Sales Team Scorecard

**Filter bar:** Date range | Team member | Metric focus

**Per-person performance cards (side by side):**

**Tina Hunter:**
| Metric | MTD | Target | % | QTD | YTD |
| Revenue Closed | $68K | $80K | 85% | $204K | $612K |
| Deals Closed | 3 | 5 | 60% | 12 | 36 |
| Proposals Sent | 4 | 8 | 50% | 14 | 42 |
| Pipeline Generated | $142K | $100K | 142% | $380K | $1.1M |
| Avg Deal Size | $22.7K | $15K | 151% | | |
| Win Rate | 42% | 50% | | | |
Activity trend: 7-day sparkline of daily activity (emails, calls, proposals)

**Melody:**
| Metric | MTD | Target | % | QTD | YTD |
| Outreach Contacts | 119 | 150 | 79% | 340 | 980 |
| Leads Generated | 6 | 10 | 60% | 18 | 52 |
| Qualified Leads | 2 | 4 | 50% | 8 | 22 |
| Reactivation Contacts | 18 | 25 | 72% | 52 | 148 |
| Meetings Booked | 4 | 6 | 67% | 12 | 34 |

**Leaderboard (if team grows):**
| Rank | Person | Revenue Closed | Deals | Pipeline | Activity Score |
- Ranking by revenue closed with trend arrows

---

## Report 4.5: Revenue Forecast

**Filter bar:** Forecast period | Confidence methodology (Weighted, Best Case, Most Likely, Worst Case)

**Forecast chart:**
- X-axis: Next 6 months
- Bars: Committed (Closed Won + Pending Payment), Probable (Design Ready at 80%), Possible (Order Request at 50%), Stretch (Lead/Qualified at 20%)
- Stacked bar segments from dark green (committed) to light green (stretch)
- Monthly target line overlay
- Running total annotation

**Data table:**
| Month | Committed | Probable | Possible | Stretch | Total Weighted | Target | Gap |

---

## Report 4.6: Lead Source Analysis

**Filter bar:** Date range | Source

**Chart: Sankey/flow diagram**
- Left: Lead sources (Referral, Existing Client, Website, LinkedIn, The One Percent Media, Cold Outreach, Trade Show, Other)
- Middle: Pipeline stages
- Right: Outcomes (Won, Lost, Active)
- Width of flows = deal value

**Table:**
| Source | Leads | Pipeline $ | Won $ | Win Rate | Avg Deal Size | CAC | LTV | ROI |
- The One Percent Media row highlighted in red if ROI is negative
- Referral and Existing Client rows highlighted in green

**Bottom insight panel:**
- "Best ROI: Referrals ($0 CAC, $42K won) and Existing Client Upsell ($0 CAC, $68K won)"
- "Worst ROI: The One Percent Media ($2K/month, 1 lead, $0 won)"
- "Recommendation: Reallocate The One Percent Media budget to [recommended channel]"

---

## Report 4.7: Quote Accuracy Report

**Filter bar:** Date range | Team member | Client

**Purpose:** How often do actual job costs match quoted costs?

**Summary cards:**
- "Avg Quote Accuracy: 88%"
- "Jobs Underquoted (actual cost > quoted): 14%"
- "Avg Margin Erosion from Underquoting: -$1,200/job"
- "Total Margin Lost to Underquoting MTD: -$8,400"

**Data table:**
| Job # | Client | Quoted Cost | Actual Cost | Variance | Quoted Margin | Actual Margin | Margin Difference |
- Sorted by variance (worst first)
- Rows where actual margin < quoted margin by >5 pts: red tint

---

---

# CATEGORY 5: OPERATIONS REPORTS

Sub-navigation: Fulfillment Metrics | Vendor Scorecard | Shipping Cost Analysis | Production Timeline | Warehouse Utilization | Quality & Returns

---

## Report 5.1: Fulfillment Metrics

**Filter bar:** Date range | Business line | Order type

**KPI row:** On-Time Delivery %, Average Fulfillment Time, Orders Fulfilled, Perfect Order Rate

**Chart: On-time delivery trend (12 months)**
- Line chart with target line at 95%
- Split by: Promo (green line) and PPE (blue line)

**Table: Order fulfillment detail**
| Order # | Client | Type | Ordered | Promised | Shipped | Delivered | On Time? | Fulfillment Days | Notes |

---

## Report 5.2: Vendor Scorecard (Detailed)

**Filter bar:** Date range | Vendor | Metric

**Per-vendor profile page (when vendor selected):**
- Header: Vendor name, total spend (12 months), # orders, avg lead time, on-time %
- On-time trend chart (12 months)
- Quality issues log: list of every quality incident with date, description, resolution
- Lead time distribution: histogram showing the range of delivery times
- Cost trend: average unit cost over time (are they getting more expensive?)
- Payment history: payment dates, terms compliance

**Overview (all vendors):**
| Vendor | Spend (12mo) | Orders | On-Time % | Quality Issues | Avg Lead Time | Cost Trend | Overall Score |
- Overall Score: composite metric (on-time 40%, quality 30%, lead time 20%, cost 10%)
- Color-coded: green (A), yellow (B), orange (C), red (D/F)
- SC Promo likely scores C or D due to 75% on-time

---

## Report 5.3: Shipping Cost Analysis

**Filter bar:** Date range | Carrier | Business line | Route (Domestic, International)

**Summary:** "Total shipping spend: $421K (2025) | % of revenue: 5.3% | Avg cost per shipment: $X"

**Chart: Shipping cost trend (12 months)**
- Bar chart: monthly shipping spend
- Line overlay: shipping cost as % of revenue (should be declining as revenue grows)

**By Carrier:**
| Carrier | Spend | Shipments | Avg Cost | On-Time % | Damage Rate | Notes |
| Unishippers/UPS | $X | X | $X | X% | X% | Primary carrier |
| RIM Freight | $X | X | $X | X% | X% | International forwarding |
| LTL Freight | $X | X | $X | X% | X% | Amazon DC distribution |

**Cost per order analysis:**
- Scatter plot: Order value (X-axis) vs shipping cost (Y-axis)
- Trend line showing the cost-to-value ratio
- Outliers (high shipping cost relative to order value) flagged

---

## Report 5.4: Production Timeline Report

**Filter bar:** Date range | Status (All, On Track, At Risk, Delayed) | Business line

**Gantt chart view (primary):**
- Each row = one active order
- Horizontal bars showing planned timeline (sourcing → production → transit → QC → ship)
- Actual progress overlaid on planned timeline
- Green = on track, Yellow = at risk, Red = delayed
- Critical path highlighted

**Table view toggle:**
| Order # | Client | Product | Start Date | Planned Complete | Actual Status | Days Ahead/Behind | Risk Level |

---

## Report 5.5: Warehouse Utilization

**Filter bar:** Date range | Location (Airport Industrial, Turkana)

**Capacity trend (12 months):**
- Area chart: warehouse capacity usage over time
- Threshold line at 80% (approaching capacity warning) and 95% (critical)

**Current state:**
- Segmented bar: PPE Storage (40%) | Promo (20%) | Pick & Pack (18%) | Staging (10%) | Available (12%)
- Turkana overflow: units stored, pending repack jobs

**Throughput metrics:**
| Metric | This Month | Last Month | Change |
| Inbound shipments received | X | X | X |
| Orders picked & packed | X | X | X |
| Outbound shipments | X | X | X |
| Average dwell time (days in warehouse) | X | X | X |

---

## Report 5.6: Quality & Returns

**Filter bar:** Date range | Issue type | Vendor | Client

**Summary:** "Quality incidents MTD: X | Return rate: X% | Cost of quality (rework, replacements): $X"

**Table:**
| Date | Order # | Client | Issue Type | Vendor | Description | Resolution | Cost | Days to Resolve |
- Issue types: Misprint, Wrong Item, Defective, Short Ship, Damage in Transit

**By Vendor:**
| Vendor | Orders | Issues | Issue Rate | Avg Resolution Time | Trend |

---

---

# CATEGORY 6: AMAZON / PPE REPORTS

Sub-navigation: SKU Performance | Deployment History | DC Distribution | IPF Billing Reconciliation | Brand Performance | Inventory & Reorder

---

## Report 6.1: SKU Performance

**Filter bar:** Date range | Brand (All, Iron Bound Safety, Arctic Trax, Scan Sling) | Status (Active, Pending, Pipeline)

**Table:**
| SKU | Brand | Product | Amazon Price | Our Cost | Margin | Total Units Sold | Total Revenue | DCs Deployed | Status | Trend |
- Sortable by any column
- Revenue trend sparkline for each SKU

**Chart: Revenue by SKU (Pareto)**
- Horizontal bar chart, sorted by revenue
- Top 5 SKUs contribute X% of PPE revenue
- Long tail of smaller SKUs visible

---

## Report 6.2: Deployment History

**Filter bar:** Date range | PO status | Brand

**Table: Complete deployment log**
| PO # | SKU/Product | Units | Total Value | Order Date | Ship Date | DCs | Status | Lead Time (days) | On-Time? |
- Status: Completed (green), In Progress (blue), Delayed (red)
- Click any PO to see DC-level breakdown

**Deployment volume trend:**
- Bar chart: monthly deployment value and unit count
- Shows the scaling trajectory of the Amazon business

---

## Report 6.3: DC Distribution Tracker

**Filter bar:** PO # | DC | Date range

**Map visualization:** US map with pins at each Amazon DC that Activate Swag has shipped to. Pin size = total volume shipped to that DC. Pin color = last shipment status.

**Table:**
| DC Code | Location | Total Shipments | Total Units | Total Value | Last Ship Date | Avg Lead Time | Issues |

---

## Report 6.4: IPF Billing Reconciliation

**The most critical Amazon financial report. Tracks every dollar between Activate Swag, IPF, and Amazon.**

**Filter bar:** Date range | Status (All, Invoiced, Paid, Outstanding, Overdue)

**Table:**
| AS Invoice # | IPF PO | Amount Billed to IPF | Date Invoiced | Expected Payment (Net 90) | Actual Payment Date | Days Outstanding | Variance (days) | Amazon PO Ref | Status |

**Summary cards:**
- "Total Invoiced to IPF (YTD): $1.64M"
- "Total Collected (YTD): $1.12M"
- "Outstanding: $412K across X invoices"
- "Average Days to Payment: 94 days (target: 90)"
- "Longest Outstanding: X days (Invoice #X)"

**Payment trend chart:**
- Scatter plot: Each dot = one IPF payment. X-axis = invoice date. Y-axis = days to payment. Target line at 90.
- Shows whether IPF/Amazon is paying faster or slower over time

---

## Report 6.5: Brand Performance

**Filter bar:** Date range | Brand

**Per-brand dashboard:**
- Revenue trend (12 months)
- Units sold trend
- Gross margin
- Number of active SKUs
- Distribution: which customers/channels buy this brand (Amazon, Cintas, Amazon Business, Grainger, etc.)
- Pipeline: SKUs in development for this brand

**Comparative:**
| Brand | Revenue (12mo) | Units | SKUs | Avg Margin | Customers | Trend |
| Iron Bound Safety | $X | X | X | X% | Amazon, Cintas | Growing |
| Arctic Trax | $X | X | X | X% | Amazon | Growing |
| Scan Sling | $X | X | X | X% | Amazon | Stable |

---

## Report 6.6: Inventory & Reorder

**Filter bar:** Location | Brand | Reorder status

**Table:**
| SKU | Product | Location | Units on Hand | Units Reserved | Available | Reorder Point | Days of Supply | Status |
- Status: In Stock (green), Low Stock (yellow), Reorder Needed (orange), Out of Stock (red)
- "Days of Supply" = units on hand / avg daily demand

**Reorder Alerts:**
- List of SKUs approaching reorder point with recommended action and lead time consideration

---

---

# CATEGORY 7: MARKETING REPORTS

Sub-navigation: Channel ROI | Lead Attribution | Campaign Performance | Content Analytics | Marketing Spend

---

## Report 7.1: Channel ROI

**Filter bar:** Date range | Channel

**The definitive marketing accountability report.**

**Table:**
| Channel | Monthly Spend | Leads | Pipeline $ | Won $ | CAC | LTV (est.) | ROI | Payback Period |
| Referral | $0 | 4 | $86K | $42K | $0 | $45K | Infinite | 0 |
| Existing Client Upsell | $0 | 6 | $124K | $68K | $0 | $52K | Infinite | 0 |
| Website / Inbound | ~$200 | 3 | $28K | $0 | ~$67 | TBD | TBD | TBD |
| LinkedIn (organic) | $0 | 2 | $15K | $0 | $0 | TBD | TBD | TBD |
| The One Percent Media | $2,000 | 1 | $4K | $0 | $2,000 | TBD | -$2,000 | Never (so far) |
| Cold Outreach (Melody) | ~$1,500 | 3 | $12K | $0 | ~$500 | TBD | TBD | TBD |

**Chart: Channel comparison (bar chart)**
- Side by side: spend (red bars) vs revenue won (green bars) per channel
- Makes the ROI visually obvious — referrals and upsells have green bars with no red, The One Percent Media has a red bar with no green

**Trend: Monthly ROI by channel (12 months)**
- Line chart showing each channel's cumulative ROI over time

---

## Report 7.2: Lead Attribution

**Filter bar:** Date range | Source | Status

**Attribution funnel:**
- Sankey diagram: Source → Lead → Qualified → Won (with drop-offs shown)
- Width = deal value

**First-touch vs Last-touch comparison:**
| Deal | First Touch Source | Last Touch Source | Value | Takeaway |

---

## Report 7.3: Campaign Performance

**Filter bar:** Date range | Campaign type (Email, Social, Event)

**Email campaigns (Mailchimp):**
| Campaign | Date | Sent | Open Rate | Click Rate | Leads | Pipeline | Revenue |

**Social media (The One Percent Media):**
| Month | Posts | Impressions | Engagement | Leads Attributed | Revenue Attributed |

**Events:**
| Event | Date | Cost | Leads | Pipeline | Revenue | ROI |

---

## Report 7.4: Content Analytics

**Filter bar:** Date range | Content type | Platform

**Website traffic:**
- Sessions, unique visitors, bounce rate, avg time, top pages
- Organic search traffic trend
- Top keywords driving traffic

**Social metrics:**
- Followers growth, engagement rate, top posts
- LinkedIn vs Instagram vs other platforms

---

## Report 7.5: Marketing Spend

**Filter bar:** Date range

**Monthly marketing spend breakdown:**
| Category | Monthly | Annual | % of Revenue | Trend |
| The One Percent Media | $2,000 | $24,000 | 0.3% | Flat |
| BNI Membership | $117 | $1,398 | 0.02% | Flat |
| Events | Variable | ~$3,000 | 0.04% | |
| Total | ~$2,300 | ~$28,400 | 0.36% | |

**Benchmark callout:**
- "Marketing spend as % of revenue: 0.36%"
- "Industry average for growth companies: 5-10%"
- "If targeting $200M in 3 years, marketing investment needs to increase significantly"

**Chart: Marketing spend as % of revenue over time**
- Currently near-zero. Should be trending up if growth targets are serious.

---

---

# CATEGORY 8: CUSTOM REPORTS

## Report Builder Interface

**A drag-and-drop interface for creating custom reports.**

**Left panel:** Available metrics grouped by category (Revenue, Financial, Clients, Pipeline, Operations, Amazon)
- Drag metrics into the report canvas

**Center canvas:**
- Choose visualization: Table, Bar Chart, Line Chart, Pie/Donut, Scatter, Treemap
- Configure: X-axis, Y-axis, Group by, Filter by
- Preview in real-time

**Right panel:**
- Filter configuration
- Date range
- Save / Name report
- Schedule for email delivery
- Share with team members

**Saved custom reports** appear in a list below the builder with name, creator, last run date, and schedule status.

---

---

## Design Notes for the Entire Reports Module

- **Every report follows the same template:** Breadcrumb > Title + Date Range + Export > Filters > Charts > Data Tables > Summary. This consistency makes the module learnable — once you've used one report, you know how they all work.
- **Export is everywhere.** Every table supports CSV/Excel export. Every chart supports PNG/PDF export. Every full report can be exported as a formatted PDF.
- **Drill-down is everywhere.** Click any data point, table row, or chart element to drill into the underlying records. A client revenue bar should link to that client's orders. A vendor on-time stat should link to their specific late deliveries.
- **Comparison is everywhere.** Every metric should support vs prior period, vs same period last year, and vs target/budget. Growth context is what turns data into insight.
- **The IPF Reconciliation report (6.4)** is business-critical. With $6M+ flowing through IPF on Net 90, this is where cash flow lives and dies. It should feel elevated — maybe a slightly different card style or a blue header bar to distinguish it.
- **The 10-Year Revenue History (1.1)** with annotations tells the story of the business. It should be visually compelling — this is the report Patrick pulls up when talking to banks, investors, or potential partners.
- **Dormant Client Analysis (3.5)** is an actionable report, not just informational. It should feel like a to-do list with priority scores and "Contact" action buttons. This is where Melody lives.
- **The Marketing Spend report (7.5)** should make it visually jarring that marketing is 0.36% of revenue while the company targets $200M. The industry benchmark comparison is the most important element.
- **Table styling:** Alternating row backgrounds (#FFFFFF and #F8FAFC). Sortable columns with small up/down arrows. Sticky headers on scroll. Pagination: 25 rows default with option for 50, 100, All.
- **Charts:** All charts use the consistent color palette. Interactive tooltips on hover. Responsive — charts resize on window resize. Clean, minimal grid lines. No 3D effects.
- **Loading states:** Skeleton screens while data loads. Progress bar for large exports.
- **Empty states:** When a report has no data for the selected filters, show a friendly illustration + "No data found for this filter combination. Try adjusting your date range or filters."
- **Overall feel:** This module should feel like a professional business intelligence tool — think a simplified Looker or Tableau embedded inside the CRM. Clean, powerful, and fast. The CEO should be able to answer any question about the business by navigating to the right report.