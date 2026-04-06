# ActivateSwag Command Center — Complete Dashboard System

## Figma AI Prompt

Design a complete multi-view dashboard system called "Command Center" for an internal CRM platform for a B2B distribution company called ActivateSwag. The company does ~$8M in annual revenue across two business lines: Promotional Products (corporate branded merchandise) and PPE/Safety Equipment distributed through Amazon distribution centers. The CEO is scaling from $8M to $200M+ in 3 years with a lean team across the US and Philippines.

The dashboard system has 5 views, selectable from a toggle/dropdown in the top bar. All views share a common sidebar, top bar, color palette, typography, and card styling. Each view is described in detail below.

---

## Global Design System

### Overall Layout
- Full-width dashboard, 1440px wide
- Left sidebar navigation: 240px wide
- Main content area: remaining width with 16px padding
- Cards: soft shadows, 8px border radius, white backgrounds
- Font: Inter or SF Pro

### Left Sidebar (same across ALL views)
- Background: Dark navy (#1B2A4A)
- Logo: "ActivateSwag" with subtitle "Command Center" (green accent for logo area)
- Navigation items with icons:
  - Dashboard (links to Executive Overview)
  - Analytics
  - Sales Leads
  - CRM
  - Orders
  - Products
  - Order Flow
  - Warehouse
  - Amazon Distribution
  - Billing
  - Email Templates
- Active state: highlighted background with white text
- Inactive: muted text on navy

### Top Bar (same across ALL views, except toggle button)
- "Command Center" title with subtitle "Real-time overview of your operations"
- Right side: Dashboard view toggle/dropdown button (color changes per view), notification bell, user avatar with "Patrick Lowenthal" and "patrick@activateswag.com"
- Search bar: "Search anything..." with magnifying glass icon

### Color Palette (shared)
- Primary Navy: #1B2A4A (sidebar, headers)
- Accent Green: #10B981 (positive values, promo metrics, growth)
- Accent Blue: #3B82F6 (PPE/Amazon metrics, links, info)
- Warning Orange: #F59E0B (attention needed, caution alerts)
- Alert Red: #EF4444 (urgent, overdue, negative values, critical)
- Purple: #7C3AED (operations, production, projections)
- Coral: #F97066 (customer service accent)
- Teal: #14B8A6 (sourcing, QC)
- Dark Blue: #1E40AF (executive view accent)
- Won Green: #059669 (darker green for closed/completed emphasis)
- Background: #F8FAFC (main content area)
- Card Background: #FFFFFF
- Text Primary: #1E293B
- Text Secondary: #64748B
- Border/Divider: #E2E8F0

### Typography (shared)
- Dashboard title: 28px bold
- Card titles: 16px semibold
- KPI values: 24px bold (28px on Executive view)
- KPI labels: 12px uppercase, letter-spacing 0.5px, color #64748B
- Table headers: 12px semibold uppercase, color #64748B
- Table body: 13px regular
- Status badges: 11px semibold, 4px border-radius, colored background
- Sub-labels: 12px regular, color #64748B

### Card Styling (shared)
- White background
- Border-radius: 8px
- Box-shadow: 0 1px 3px rgba(0,0,0,0.1)
- 16px gap between cards
- 24px padding inside cards
- Hover states on table rows: light gray background (#F8FAFC)
- Interactive elements (View All links, toggles) use blue accent color

---

---

# VIEW 1: FINANCE DASHBOARD

**Toggle button color: Green (#10B981)**

The Finance dashboard gives the CEO daily visibility into cash position, receivables, payables, revenue by business line, margins, and debt paydown. The biggest concern: Amazon pays Net 90, so cash flow is existential — not academic.

---

## Row 1 — Top KPI Cards (5 cards, equal width, horizontal)

Each card: white background, soft shadow, 8px radius, ~60px height. Icon on right side with colored circular background. Value is large (24px bold). Label above in small gray text (12px). Sub-label below value in smaller text.

**Card 1: Cash Balance**
- Label: "CASH BALANCE"
- Value: "$142,350" (large, black, bold)
- Sub-label: green arrow up icon + "+$18,200 vs last week" in green text
- Icon: Bank/wallet icon on green circle

**Card 2: Accounts Receivable**
- Label: "TOTAL AR OUTSTANDING"
- Value: "$487,200" (large, black, bold)
- Sub-label: "IPF/Amazon: $412,000 | Promo: $75,200" in gray text
- Icon: Invoice/document icon on blue circle

**Card 3: AP Due (30 Days)**
- Label: "AP DUE NEXT 30 DAYS"
- Value: "$215,800" (large, black, bold)
- Sub-label: "Due this week: $68,400" in orange text
- Icon: Calendar/clock icon on orange circle

**Card 4: Revenue MTD**
- Label: "REVENUE (MTD)"
- Value: "$583,000" (large, black, bold)
- Sub-label: Two small colored pills/badges: "PPE $448,000" in blue pill, "Promo $135,000" in green pill
- Icon: Dollar/chart icon on green circle

**Card 5: Net Cash Forecast (30d)**
- Label: "30-DAY CASH FORECAST"
- Value: "$94,750" (large, black, bold)
- Sub-label: If positive show green text "Sufficient runway". If the value were low, it would show red "WARNING: Below $50K threshold"
- Icon: Crystal ball/forecast icon on purple circle

---

## Row 2 — Two Charts Side by Side (equal width)

**Left Chart: Cash Flow Forecast (13 Weeks)**
- Card title: "Cash Flow Forecast" with subtitle "13-week forward projection"
- Small toggle in top-right of card: "Weekly | Monthly"
- Chart type: Combined bar chart + line overlay
- X-axis: Week labels (W1, W2, W3... W13) with month labels below (Apr, May, Jun)
- Bars: Green bars for projected inflows (above zero line), Red/coral bars for projected outflows (below zero line)
- Line: Dashed blue line overlaying the chart showing projected cash balance (right Y-axis)
- A horizontal dashed red line at $50,000 labeled "Minimum threshold"
- Key data callout: Small badge on the chart where the biggest Amazon payment is expected, labeled "IPF Payment Expected: $210K"
- Legend at bottom: green square "Inflows", red square "Outflows", blue dashed line "Cash Balance"

**Right Chart: Revenue by Class (MTD)**
- Card title: "Revenue by Class" with subtitle "Month-to-date breakdown"
- Chart type: Donut chart (center shows total "$583K" in large text with "Total MTD" below)
- Two segments: Blue segment for "PPE / Amazon — $448,000 (77%)" and Green segment for "Promo — $135,000 (23%)"
- Below the donut: A small "Concentration Alert" banner in light orange/yellow background with warning icon: "PPE at 77% of revenue — Target: <50% by EOY"
- Below that: small comparison text "vs. Last Month: PPE 74% | Promo 26%"

---

## Row 3 — Two Data Panels Side by Side (equal width)

**Left Panel: AR Aging**
- Card title: "Accounts Receivable Aging" with a small "View All" link in top-right
- Horizontal stacked bar at top showing the aging visually (green for current, yellow for 31-60, orange for 61-90, red for 90+)
- Below the bar, a clean table/list:

| Bucket | Amount | Invoices | % of Total |
|--------|--------|----------|------------|
| Current (0-30 days) | $312,400 | 18 | 64% |
| 31-60 days | $98,200 | 7 | 20% |
| 61-90 days | $64,100 | 4 | 13% |
| 90+ days | $12,500 | 2 | 3% |

- Separator line
- Special callout section with blue/navy background: "IPF/Amazon Receivables"
  - "Outstanding: $412,000"
  - "Next Expected Payment: $210,000 on April 15"
  - "Days Until Payment: 17"
  - Small progress bar showing how far through the Net 90 cycle

**Right Panel: AP Schedule**
- Card title: "Accounts Payable Schedule" with a small "View All" link in top-right
- Three time-bucket sections with amounts:

  **Due This Week** (with red left border accent)
  - Payroll: $22,400
  - Parents (Equipment): $20,000
  - SBA EIDL: $731

  **Due Next Week** (with orange left border accent)
  - SC Promo Inv: $38,200
  - Unishippers (UPS): $12,400

  **Due in 15-30 Days** (with gray left border accent)
  - Turkana Tools: $45,000
  - SanMar: $8,900
  - Other vendors: $14,200

- Bottom summary bar: "Total Due 30 Days: $215,800" in bold

---

## Row 4 — Two Panels Side by Side (equal width)

**Left Panel: Gross Margin by Class**
- Card title: "Gross Margin by Class" with subtitle "MTD vs Target"
- Two horizontal gauge/progress bars:

  **Promo Gross Margin:**
  - Large percentage: "34.2%" in green
  - Progress bar filled to 34.2% with a target marker line at 35% labeled "Target: 35%"
  - Small text below: "vs. Last Month: 33.8% (+0.4 pts)"

  **PPE Gross Margin:**
  - Large percentage: "18.7%" in blue
  - Progress bar filled to 18.7%
  - Small info icon with tooltip text: "Compressed by IPF billing structure. Actual economic margin is higher."
  - Small text below: "vs. Last Month: 19.1% (-0.4 pts)"

  **Blended:**
  - "Blended GM%: 24.3%" in gray text, smaller
  - Small text: "Note: Blended margin declines as PPE grows as % of revenue. Track Promo GM% as the primary health metric."

- Below: Small 6-month sparkline chart showing Promo GM% trend (green line) and PPE GM% trend (blue line)

**Right Panel: Equipment Debt Tracker**
- Card title: "Equipment Debt Paydown" with subtitle "Goal: Clear by December 2026"
- Large circular progress ring (like a fitness tracker):
  - Shows 25% complete (visually ~quarter filled in green)
  - Center text: "$179,000" with "remaining" below
  - Below the ring: "of $239,000 original balance"

- Key stats below the ring in a clean grid:
  - "Paid to Date: $60,000" with green checkmark
  - "Monthly Payment: $20,000"
  - "Projected Payoff: December 2026"
  - "Months Remaining: 9"

- Small progress timeline at bottom showing months (Apr, May, Jun... Dec) with dots, filled dots for completed payments, empty for future

---

---

# VIEW 2: CUSTOMER SERVICE DASHBOARD

**Toggle button color: Coral (#F97066)**

The Customer Service dashboard tracks all open issues across both business lines. Amazon/PPE issues carry disproportionate business risk because losing the IPF relationship means losing 76% of revenue. Promo issues involve vendor stock-outs, shipping delays, misprints, and delivery errors.

---

## Row 1 — Top KPI Cards (5 cards, equal width, horizontal)

Each card: white background, soft shadow, 8px radius. Icon on right side with colored circular background. Value is large (24px bold). Label above in small gray text (12px uppercase). Sub-label below in smaller text with context.

**Card 1: Open Tickets**
- Label: "OPEN TICKETS"
- Value: "14" (large, black, bold)
- Sub-label: Two small pills: "Promo: 9" in green pill, "Amazon: 5" in blue pill
- Small red text below pills: "3 unassigned" with warning icon
- Icon: Ticket/support icon on coral circle

**Card 2: Urgent / Critical**
- Label: "URGENT ISSUES"
- Value: "3" (large, red #EF4444, bold)
- Sub-label: "1 Amazon DC complaint • 1 misprint • 1 lost shipment"
- Subtle pulsing red dot animation next to the value to draw attention
- Icon: Alert/fire icon on red circle

**Card 3: Avg Resolution Time**
- Label: "AVG RESOLUTION TIME"
- Value: "2.4 days" (large, black, bold)
- Sub-label: green arrow down + "Improved from 3.1 days last month" in green text
- Icon: Clock/timer icon on green circle

**Card 4: Resolved This Week**
- Label: "RESOLVED THIS WEEK"
- Value: "8" (large, black, bold)
- Sub-label: "Promo: 5 | Amazon: 3" in gray text
- Below that: small bar showing weekly target progress — "8 of 12 target" with a 67% filled progress bar
- Icon: Checkmark/circle icon on green circle

**Card 5: SLA Compliance**
- Label: "SLA COMPLIANCE (MTD)"
- Value: "87%" (large, bold — in orange because it's below 95% target)
- Sub-label: "Target: 95% — 2 tickets breached SLA this month"
- Small progress ring instead of icon: 87% filled ring in orange on white
- Icon: Shield/compliance icon on orange circle

---

## Row 2 — Two Charts Side by Side (equal width)

**Left Chart: Tickets by Category**
- Card title: "Open Tickets by Category" with subtitle "Current active issues"
- Chart type: Horizontal bar chart, sorted by count descending
- Two color groups — green-toned bars for Promo issues, blue-toned bars for Amazon issues
- Categories and sample counts:

  Promo Issues (green tones):
  - Vendor Out of Stock / Item Replacement: 3 (bar label: "Need alt sourcing")
  - Shipping Delay: 2
  - Production Delay: 2
  - Misprint / Decoration Error: 1
  - Wrong Item Delivered: 1

  Amazon Issues (blue tones):
  - DC Order Not Received: 2
  - Short / Missing Units: 2
  - Wrong Item Received: 1

- Each bar is clickable (show pointer cursor hint)
- Legend at bottom: green square "Promo" | blue square "Amazon/PPE"

**Right Chart: Ticket Trend (8 Weeks)**
- Card title: "Ticket Volume Trend" with subtitle "Last 8 weeks — opened vs resolved"
- Chart type: Line chart with two lines
- Green line: "Resolved" (trending upward)
- Coral/red line: "Opened" (relatively flat or slightly declining)
- Area fill under each line with low opacity
- X-axis: Week labels (W1 through W8 with date ranges)
- Y-axis: Ticket count (0 to 20)
- The goal is for the green line to consistently be above the red line (resolving more than opening)
- If green is above red, show a small "Trending positive" badge in green in top-right of chart
- Small annotation on the chart where there was a spike: "Amazon deployment week — higher volume expected"

---

## Row 3 — Two Panels Side by Side (60% / 40% split)

**Left Panel (60%): Active Tickets**
- Card title: "Active Tickets" with filter chips: "All" (selected), "Promo", "Amazon", "Urgent Only"
- Sort dropdown in top-right: "Sort by: Priority" with options for Priority, Age, Client

- Table with the following columns:
  | Priority | Ticket # | Issue Type | Client | Description | Assigned To | Age | Status |

  Sample rows:

  | 🔴 Urgent | #CS-1247 | Misprint | Coca-Cola FL | Logo color mismatch on 500 polo shirts — client rejected delivery | Tina | 1d | In Progress |
  | 🔴 Urgent | #CS-1245 | DC Not Received | Amazon - DEN4 | Denver DC reports PO #4521 not received — shipped 3/15 via UPS | Michael | 3d | Investigating |
  | 🔴 Urgent | #CS-1244 | Lost Shipment | Fairmont Hotels | UPS shows delivered but client says not received — 200 tote bags | Liz | 2d | Escalated |
  | 🟡 High | #CS-1248 | Vendor OOS | Oscar Health | SanMar out of stock on Gildan 5000 in Navy XL — need alternative | Liz | 0d | New |
  | 🟡 High | #CS-1246 | Short Shipment | Amazon - SBD1 | San Bernardino DC received 480 of 500 units — 20 short | Michael | 2d | In Progress |
  | 🟡 High | #CS-1243 | Production Delay | Securiti | Embroidery vendor behind schedule — 2 weeks late on 300 jackets | Tina | 5d | Waiting on Vendor |
  | 🔵 Normal | #CS-1249 | Wrong Address | U of Miami | Shipped to old campus address — need redirect or reship | Liz | 0d | New |
  | 🔵 Normal | #CS-1242 | Vendor OOS | Clear Spring | Hit Promo discontinued item #P4320 — sourcing replacement | Melody | 4d | Sourcing |
  | 🔵 Normal | #CS-1241 | Shipping Delay | Pinnacle Live | Unishippers shows delay — ETA pushed 3 days | Liz | 3d | Monitoring |

- Priority indicators: Red circle = Urgent, Yellow circle = High, Blue circle = Normal, Gray circle = Low
- Status badges with colored backgrounds: "New" (blue bg #DBEAFE, text #1E40AF), "In Progress" (yellow bg #FEF3C7, text #92400E), "Investigating" (purple bg #EDE9FE, text #5B21B6), "Escalated" (red bg #FEE2E2, text #991B1B), "Waiting on Vendor" (orange bg #FFEDD5, text #9A3412), "Sourcing" (teal bg #CCFBF1, text #115E59), "Monitoring" (gray bg #F1F5F9, text #475569)
- Row hover: light gray background
- Click arrow on each row to expand details
- Bottom of table: pagination "Showing 9 of 14 tickets" with page controls

**Right Panel (40%): Amazon Issues — Priority View**
- Card title: "Amazon / PPE Issues" with a red accent left border and subtitle "These impact the IPF relationship — resolve with urgency"
- This panel isolates Amazon-specific issues because they carry disproportionate business risk
- Card style: slightly different — has a very subtle blue-tinted background (#F0F7FF) to distinguish

- List of Amazon issues only, in priority order, with more detail:

  **Issue 1:** (Red urgent badge)
  - "DEN4 — PO #4521 Not Received"
  - "Shipped 3/15 via UPS • Tracking: 1Z999AA10123456784"
  - "Amazon contact: Sarah Kim (denver-dc@amazon.com)"
  - "Owner: Michael Roos"
  - "Action needed: File UPS claim, provide Amazon with proof of delivery"
  - Age badge: "3 days" in red

  **Issue 2:** (Yellow high badge)
  - "SBD1 — Short Shipment (20 units)"
  - "PO #4518 • Iron Bound Safety Gloves SKU IBS-2240"
  - "Received 480 of 500"
  - "Owner: Michael Roos"
  - "Action needed: Ship replacement 20 units within 48 hours"
  - Age badge: "2 days" in yellow

  **Issue 3:** (Yellow high badge)
  - "ONT6 — Wrong Item Received"
  - "PO #4512 • Ordered Arctic Trax thermal, received Scan Sling holsters"
  - "Owner: Truscott Miller"
  - "Action needed: Arrange return pickup, expedite correct shipment"
  - Age badge: "1 day" in yellow

- Bottom of panel: summary stats in a small gray bar:
  - "5 Amazon issues MTD | Avg resolution: 3.2 days | 0 unresolved past SLA"

---

## Row 4 — Three Small Panels (equal width, one-third each)

**Panel 1: Team Workload**
- Card title: "Team Workload"
- Visual: Small horizontal bar chart or avatar + count list

  - Michael Roos: 4 tickets (bar filled, showing capacity)
  - Tina Hunter: 3 tickets
  - Liz (PH): 4 tickets
  - Melody (PH): 2 tickets
  - Truscott Miller: 1 ticket
  - Unassigned: 3 tickets (shown in red)

- Capacity indicator: If someone has 5+ tickets, show orange "At capacity" tag
- "Unassigned: 3" should be highlighted in red with a "Assign Now" action button

**Panel 2: Resolution by Issue Type**
- Card title: "Resolution Rates by Type" with subtitle "Last 30 days"
- Visual: Small table or mini horizontal bars

  | Issue Type | Resolved | Avg Time | Trend |
  | Vendor OOS | 6 | 3.1 days | ↓ improving |
  | Shipping Delay | 5 | 1.8 days | → stable |
  | Production Delay | 3 | 5.2 days | ↑ worsening |
  | Misprint/Error | 2 | 4.0 days | → stable |
  | Amazon DC Issues | 4 | 2.8 days | ↓ improving |

- Trend arrows: green down arrow = improving, gray arrow = stable, red up arrow = worsening
- "Production Delay" row highlighted in light red because it's worsening

**Panel 3: Recent Activity Feed**
- Card title: "Activity Log" with subtitle "Latest updates"
- Scrollable feed of recent actions, newest first:

  - "10:42 AM — Tina added note to #CS-1247: 'Vendor reprinting 500 units, new ETA April 4'"
  - "10:15 AM — Michael escalated #CS-1245 to UPS claims department"
  - "9:30 AM — Liz created ticket #CS-1248: Oscar Health — SanMar out of stock"
  - "9:12 AM — Melody resolved #CS-1238: Replacement item approved by client"
  - "Yesterday 4:45 PM — Truscott assigned to #CS-1246: Amazon SBD1 short shipment"
  - "Yesterday 2:30 PM — System alert: SLA breach on #CS-1240 (resolved 6 hours late)"

- Each entry has a small avatar/icon for the person, timestamp, and action text
- SLA breach entries highlighted in light red background
- Max-height with scroll, about 6 entries visible
- "View full log" link at bottom

---

---

# VIEW 3: OPERATIONS DASHBOARD

**Toggle button color: Purple (#7C3AED)**

The Operations dashboard is the supply chain control tower. It serves the CEO and Director of Operations who need to see the full picture: what's being sourced, what's in production, what's in transit, what's in the warehouse, what's shipping out, and where the bottlenecks are — across both Promo (domestic, shorter cycles) and PPE/Amazon (overseas factories, freight forwarding, customs, multi-DC distribution, 8-16 week cycles) simultaneously.

---

## Row 1 — Top KPI Cards (6 cards, equal width, horizontal)

Each card: white background, soft shadow, 8px radius. Icon on right side with colored circular background. Value is large (24px bold). Label in small gray text (12px uppercase). Sub-labels provide split context.

**Card 1: Active Orders**
- Label: "ACTIVE ORDERS"
- Value: "34" (large, black, bold)
- Sub-label: Two pills: "Promo: 21" in green pill, "Amazon: 13" in blue pill
- Icon: Shopping bag icon on purple circle

**Card 2: In Production**
- Label: "IN PRODUCTION"
- Value: "18" (large, black, bold)
- Sub-label: "Overseas: 8 | Domestic: 10"
- Small orange text: "3 behind schedule" with warning icon
- Icon: Factory/gear icon on orange circle

**Card 3: In Transit**
- Label: "IN TRANSIT"
- Value: "11" (large, black, bold)
- Sub-label: "Ocean: 4 | Air: 2 | Ground: 5"
- Small text: "Est. value in transit: $284,000"
- Icon: Truck/ship icon on blue circle

**Card 4: Ready to Ship**
- Label: "READY TO SHIP"
- Value: "7" (large, black, bold)
- Sub-label: "Warehouse: 4 | Turkana: 3"
- Small green text: "2 shipping today"
- Icon: Box/package icon on green circle

**Card 5: Warehouse Utilization**
- Label: "WAREHOUSE CAPACITY"
- Value: "68%" (large, bold — orange because approaching capacity)
- Sub-label: "Airport Industrial: 2,040 / 3,000 sq ft"
- Visual: tiny progress bar below the value, filled 68% in orange
- Icon: Warehouse icon on orange circle

**Card 6: Shipments This Week**
- Label: "SHIPMENTS THIS WEEK"
- Value: "12" (large, black, bold)
- Sub-label: "Completed: 8 | Pending: 4"
- Small text: "On-time rate: 91%"
- Icon: Delivery checkmark icon on green circle

---

## Row 2 — Full Width: Production Pipeline (Kanban-style horizontal swim lanes)

**This is the most important section of the Operations dashboard — the hero section. It should take up the most vertical space (~400px) and feel like the operational nerve center.**

- Card title: "Production Pipeline" with subtitle "All active orders by stage"
- Filter bar at top: Toggle pills for "All" (selected), "Promo Only", "Amazon Only" | Sort: "By Due Date" dropdown | Search field
- Right side of title bar: "View Gantt" button (prominent, links to Gantt chart module) and "View List" toggle

**Kanban board with 6 columns, horizontal scroll if needed:**

Each column has a header with count and total value. Cards inside each column represent individual orders. Each column should be scrollable if cards overflow.

**Column 1: Sourcing / Quoting**
- Header: "Sourcing" with badge "5 orders | $87K"
- Color accent: Light gray top border (4px)

  Sample cards (each ~120px tall):
  - Card: "Oscar Health — Custom Jackets" | $18,500 | Promo (green tag) | Assigned: Liz | "Awaiting vendor quotes" | Due: Apr 28
  - Card: "Amazon — New SKU: Safety Vest IBS-3100" | $42,000 | PPE (blue tag) | Assigned: Liz | "Sampling 3 factories" | Due: May 15
  - Card: "Securiti — Tech Kit Bundles" | $8,200 | Promo (green tag) | Assigned: Tina | "Pricing from Hit Promo" | Due: Apr 18

**Column 2: Sample / Approval**
- Header: "Sample / Approval" with badge "4 orders | $156K"
- Color accent: Blue top border (4px)

  Sample cards:
  - Card: "Amazon — Arctic Trax Thermal Gloves" | $95,000 | PPE (blue tag) | Assigned: Truscott | "Sample shipped to Amazon for approval" | Due: May 30 | "Sample ETA: Apr 8"
  - Card: "Coca-Cola FL — Summer Event Kit" | $32,000 | Promo (green tag) | Assigned: Tina | "Client reviewing mockups" | Due: Apr 22

**Column 3: In Production**
- Header: "In Production" with badge "8 orders | $412K"
- Color accent: Orange top border (4px)
- If any cards are behind schedule, column header shows red warning: "3 delayed"

  Sample cards:
  - Card: "Amazon — Iron Bound Safety Gloves PO#4530" | $128,000 | PPE (blue tag) | Assigned: Truscott | Vendor: SC Promo | "Production 60% complete" with small progress bar | Due: May 10 | Status: ON TRACK (green badge)
  - Card: "Amazon — CoreTex Sunscreen Deploy" | $85,000 | PPE (blue tag) | Assigned: Michael | Vendor: CoreTex | "Packaging phase" | Due: Apr 20 | Status: ON TRACK (green badge)
  - Card: "Fairmont Hotels — Robes & Amenities" | $24,000 | Promo (green tag) | Assigned: Tina | Vendor: SanMar + decorator | "Embroidery in progress" | Due: Apr 15 | Status: DELAYED (red badge) "Decorator behind 5 days" — card has subtle red-tinted background (#FEF2F2)
  - Card: "Amazon — KSE Thermal Blankets PO#4525" | $48,000 | PPE (blue tag) | Assigned: Truscott | Vendor: KSE Supplies (India) | "Manufacturing complete, preparing shipment" | Due: Apr 25 | Status: ON TRACK

**Column 4: In Transit / Shipping**
- Header: "In Transit" with badge "6 orders | $284K"
- Color accent: Purple top border (4px)

  Sample cards:
  - Card: "Amazon — Iron Bound Gloves PO#4518" | $62,000 | PPE (blue tag) | Via: Ocean (SC Promo → RIM Freight) | "Departed Ningbo 3/20, ETA Long Beach 4/12" | Tracking: RIM-44521 | Status: ON SCHEDULE
  - Card: "Amazon — Squincher Hydration PO#4522" | $38,000 | PPE (blue tag) | Via: Turkana (domestic) | "Shipped via UPS Ground 3/28" | Tracking: 1Z999... | Status: IN TRANSIT
  - Card: "U of Miami — Event Swag" | $12,000 | Promo (green tag) | Via: UPS Ground (Unishippers) | "Shipped 3/27, ETA 3/31" | Status: ARRIVING TODAY (green pulse)

**Column 5: Receiving / QC**
- Header: "Receiving / QC" with badge "3 orders | $94K"
- Color accent: Teal top border (4px)

  Sample cards:
  - Card: "Amazon — PGK Scan Slings PO#4515" | $52,000 | PPE (blue tag) | "Received at Turkana 3/26 — QC in progress" | "480/500 units inspected, 2 defects found"
  - Card: "Coca-Cola FL — Q2 Drinkware" | $28,000 | Promo (green tag) | "Received at warehouse 3/28 — checking quantities"

**Column 6: Ready to Ship / Distribute**
- Header: "Ready to Ship" with badge "7 orders | $198K"
- Color accent: Green top border (4px)

  Sample cards:
  - Card: "Amazon — Iron Bound Gloves PO#4510" | $72,000 | PPE (blue tag) | "At Turkana — awaiting Amazon DC distribution schedule" | Ship to: 8 DCs per Amazon spreadsheet | Status: WAITING ON AMAZON
  - Card: "Oscar Health — Welcome Kits" | $14,000 | Promo (green tag) | "Packed at warehouse — pickup scheduled 3/31" | Via: Unishippers
  - Card: "Amazon — Arctic Trax Beanies PO#4508" | $45,000 | PPE (blue tag) | "At warehouse — 3 of 6 DCs shipped, 3 remaining" | Status: PARTIALLY SHIPPED (yellow badge) with progress "3/6 DCs"

**Kanban card design notes:**
- Each card: white bg, thin 3px left border color-coded by business line (green = Promo, blue = PPE/Amazon)
- Tags: "Promo" in small green rounded pill, "PPE" in small blue rounded pill
- Delayed/at-risk cards: subtle red-tinted background (#FEF2F2) with red status badge
- Progress bars on production cards: thin bar showing % complete
- Due dates turning red if within 5 days and status is not "Ready to Ship"
- Hover: card slightly elevates with deeper shadow
- Click: expands to full detail view

---

## Row 3 — Two Panels Side by Side (55% / 45% split)

**Left Panel (55%): Logistics Tracker**
- Card title: "Active Shipments" with subtitle "All inbound and outbound in transit"
- Tabs at top: "Inbound to Warehouse" (selected) | "Outbound to Clients" | "Amazon DC Distribution"

  **Inbound tab — Table:**
  | Shipment | Origin | Carrier | ETD/ETA | Status | Value |
  |----------|--------|---------|---------|--------|-------|
  | SC Promo → RIM → Warehouse | Ningbo, China | Ocean / RIM Freight | Departed 3/20 → ETA 4/12 | In Transit 🟢 | $62,000 |
  | KSE Supplies → Turkana | Mumbai, India | Air Freight | Departed 3/25 → ETA 4/2 | In Transit 🟢 | $48,000 |
  | PGK Solutions → Warehouse | Shenzhen, China | Ocean / Unishippers | Departed 3/15 → ETA 4/8 | Customs Clearance 🟡 | $35,000 |
  | SanMar → Warehouse | Domestic | UPS Ground | Shipped 3/28 → ETA 3/31 | Arriving Today 🟢 | $8,200 |
  | CoreTex → Turkana | Domestic | Freight | Shipped 3/26 → ETA 4/1 | In Transit 🟢 | $85,000 |

  Status icons: 🟢 On track (green dot), 🟡 Attention (yellow dot), 🔴 Delayed (red dot)

  **Outbound tab would show:** shipments going to promo clients and individual Amazon DCs with tracking numbers and delivery confirmation status
  **Amazon DC Distribution tab would show:** deployment-specific view — PO number, total units, DCs, units shipped per DC, units remaining, progress visualization

- Bottom: "Total value in transit: $238,200" | "Avg transit time: 18 days (overseas) / 3 days (domestic)"

**Right Panel (45%): Vendor Performance Scorecard**
- Card title: "Vendor Performance" with subtitle "Last 90 days"
- Table with key vendors:

  | Vendor | Orders | On-Time % | Quality Issues | Avg Lead Time | Trend |
  |--------|--------|-----------|---------------|---------------|-------|
  | SC Promo Inv | 12 | 75% | 1 | 42 days | 🔴 ↑ slower |
  | Turkana Tools | 8 | 94% | 0 | 5 days | 🟢 stable |
  | CoreTex Products | 3 | 100% | 0 | 12 days | 🟢 ↓ faster |
  | KSE Supplies | 4 | 88% | 0 | 28 days | 🟡 stable |
  | SanMar | 15 | 97% | 0 | 3 days | 🟢 stable |
  | PGK Solutions | 5 | 80% | 1 | 38 days | 🟡 ↑ slower |
  | Hit Promo | 9 | 92% | 0 | 4 days | 🟢 stable |

- On-Time % color-coded: green >90%, yellow 80-90%, red <80%
- SC Promo at 75% on-time highlighted in red row tint
- Trend arrows: green down = improving (faster), red up = worsening (slower)
- Click any vendor row to see detailed order history
- Bottom: "Avg on-time across all vendors: 88% | Target: 95%"

---

## Row 4 — Three Panels (equal width, one-third each)

**Panel 1: Amazon Deployment Schedule**
- Card title: "Amazon Deployments" with subtitle "Upcoming distribution schedule" and blue left border accent

  **Next 7 Days:**
  - "PO#4510 — Iron Bound Gloves → 8 DCs"
    - "Status: Ready at Turkana — awaiting DC schedule from Amazon"
    - "Units: 4,000 | Ship method: LTL Freight to each DC"
    - Progress: "0/8 DCs shipped" with empty progress bar
    - Flag: "WAITING ON AMAZON" yellow badge

  - "PO#4508 — Arctic Trax Beanies → 6 DCs"
    - "Status: Partially shipped"
    - "Units: 3,000 | 1,500 shipped, 1,500 remaining"
    - Progress: "3/6 DCs shipped" with half-filled progress bar (green)

  **Next 14 Days:**
  - "PO#4522 — Squincher Hydration → 12 DCs"
    - "Status: In transit to Turkana for repack"
    - "Units: 6,000"
    - Progress: "0/12 DCs" with empty bar
    - "ETA to Turkana: Apr 2 → Ship to DCs: Apr 5-8"

  **Next 30 Days:**
  - "PO#4530 — Iron Bound Gloves (new batch) → 10 DCs"
    - "Status: In Production at SC Promo (60%)"
    - "Units: 5,000"
    - "Factory completion: ~Apr 15 → Ocean transit: Apr 15-May 5 → Ship to DCs: ~May 10"

- Bottom: "Total deployment value (next 30 days): $423,000"

**Panel 2: Warehouse Operations**
- Card title: "Airport Industrial — 3,000 sq ft"

  **Capacity Visualization:**
  - Segmented bar showing space allocation:
    - PPE Storage: 1,200 sq ft (40%) — blue segment
    - Promo Inventory: 600 sq ft (20%) — green segment
    - Pick & Pack Area: 540 sq ft (18%) — purple segment
    - Staging / Shipping: 300 sq ft (10%) — orange segment
    - Available: 360 sq ft (12%) — light gray segment

  **Activity Today:**
  - "Inbound receiving: 2 shipments expected"
  - "Orders to pick & pack: 4"
  - "Outbound pickups scheduled: 2 (UPS 2:00 PM, Freight 4:00 PM)"

  **Team:**
  - "Xerixes Guzman — on site"
  - "Carlos Jiron — on site"

  **Turkana Overflow:**
  - "Items at Turkana: 14,200 units"
  - "Pending repack jobs: 2"
  - "Scheduled outbound: 3 Amazon deployments"

**Panel 3: At-Risk Orders**
- Card title: "At-Risk Orders" with red left border accent and subtitle "Requires attention"

  **Behind Schedule (red background tint):**
  - "Fairmont Hotels — Robes & Amenities"
    - "$24,000 | Due: Apr 15 | Delayed 5 days"
    - "Reason: Decorator behind on embroidery"
    - "Impact: Client event is Apr 18 — 3 day buffer remaining"
    - "Owner: Tina | Action: Call decorator for expedite"

  - "Amazon PO#4515 — PGK Scan Slings"
    - "$52,000 | Due: Apr 10 | QC found 2 defects"
    - "Reason: 2 of 500 units defective during inspection"
    - "Impact: Low — can ship 498 units, reorder 2"
    - "Owner: Truscott | Action: Approve partial ship"

  **At Risk (yellow background tint):**
  - "SC Promo — Ocean Shipment RIM-44521"
    - "$62,000 | ETA: Apr 12 | Weather delays possible"
    - "Reason: Pacific weather advisory — potential 2-3 day delay"
    - "Impact: Pushes Amazon deployment PO#4530 back"
    - "Owner: Michael | Action: Monitor daily, prep backup plan"

  - "Securiti — Tech Kit Bundles"
    - "$8,200 | Due: Apr 18 | Vendor slow to quote"
    - "Reason: Hit Promo hasn't returned pricing in 5 days"
    - "Impact: Can't create order in CommonSKU without pricing"
    - "Owner: Liz | Action: Escalate to vendor rep"

- Bottom: "4 at-risk orders | Total value: $146,200 | Avg days overdue: 2.3"

---

---

# VIEW 4: SALES DASHBOARD

**Toggle button color: Green (#10B981)**

The Sales dashboard shows real-time pipeline health, how the current period is pacing against last year, where deals are stalling, which clients are growing vs declining, and what the sales team is actually doing. The company has no sales leadership — this dashboard IS the sales management layer. It needs to hold the team accountable and surface problems before they become lost revenue. The CEO's philosophy: existing clients are the easiest next sale. Every KPI has a "vs last year same period" comparison.

---

## Row 1 — Top KPI Cards (6 cards, equal width, horizontal)

Each card: white background, soft shadow, 8px radius. Icon on right side with colored circular background. Value is large (24px bold). Label in small gray text (12px uppercase). Each card has a "vs last year same period" comparison line.

**Card 1: Revenue MTD**
- Label: "REVENUE (MTD)"
- Value: "$583,000" (large, black, bold)
- Sub-label: Two small pills: "PPE: $448K" blue pill, "Promo: $135K" green pill
- Comparison line: green arrow up + "vs $412K last March (+41%)" in green text
- Icon: Dollar sign icon on green circle

**Card 2: Revenue YTD**
- Label: "REVENUE (YTD)"
- Value: "$1.82M" (large, black, bold)
- Sub-label: "Target: $2.1M | Pacing: 87%"
- Comparison line: green arrow up + "vs $1.34M last year YTD (+36%)" in green text
- Small progress bar below showing 87% of YTD target filled
- Icon: Trending up icon on green circle

**Card 3: Pipeline Value**
- Label: "ACTIVE PIPELINE"
- Value: "$847,000" (large, black, bold)
- Sub-label: "34 active deals"
- Comparison line: "Pipeline coverage: 3.2x monthly target" in blue text (healthy if 3x+)
- Icon: Funnel icon on blue circle

**Card 4: Won MTD**
- Label: "WON (MTD)"
- Value: "$318,000" (large, black, bold)
- Sub-label: "12 deals closed"
- Comparison line: green arrow up + "vs $245K last March (+30%)" in green text
- Icon: Trophy/checkmark icon on green circle

**Card 5: Avg Deal Size**
- Label: "AVG DEAL SIZE"
- Value: "$12,400" (large, black, bold)
- Sub-label: "Promo: $8,200 | PPE: $34,500"
- Comparison line: green arrow up + "vs $9,800 last year (+27%)" in green text
- Icon: Bar chart icon on purple circle

**Card 6: Win Rate**
- Label: "WIN RATE (MTD)"
- Value: "42%" (large, black, bold)
- Sub-label: "12 won / 29 decisions"
- Comparison line: "vs 38% last March (+4 pts)" in green text
- Small semicircle gauge filled to 42% with target marker at 50%
- Icon: Target icon on orange circle

---

## Row 2 — Two Charts Side by Side (equal width)

**Left Chart: Revenue Pacing — This Year vs Last Year**
This is the most important chart on the Sales dashboard. It should feel prominent and immediately answer "are we ahead or behind last year?"

- Card title: "Revenue Pacing" with subtitle "2026 vs 2025 — monthly comparison"
- Toggle in top-right: "Total" (selected) | "Promo Only" | "PPE Only"
- Chart type: Grouped bar chart with line overlay
- X-axis: Months (Jan through Dec)
- Two bar groups per month:
  - Dark navy bar: 2025 actual revenue
  - Green bar: 2026 actual (solid for completed months, lighter/projected for future)
- Line overlay: Dashed line showing 2026 monthly target
- Current month (March) highlighted with a subtle background band
- Delta labels on each month pair: "+41%", "+36%", etc. in green when positive
- For future months, 2026 projection shown as faded green bars
- Legend: navy square "2025 Actual" | green square "2026 Actual" | light green square "2026 Projected" | dashed line "2026 Target"
- Y-axis: Revenue in $K

**Right Chart: Pipeline by Stage (Funnel)**
- Card title: "Pipeline by Stage" with subtitle "Current active deals"
- Chart type: Horizontal funnel visualization (widest at top, narrowing down)
- Each stage is a horizontal bar with count, value, and conversion rate:

  | Stage | Deals | Value | Conversion → |
  | Lead Received | 19 | $42,000 | 47% → |
  | Qualified | 8 | $86,000 | 75% → |
  | Order Request (Quoting) | 15 | $189,000 | 80% → |
  | Design Ready (Mockups) | 21 | $615,000 | 85% → |
  | Pending Payment | 6 | $38,000 | 92% → |
  | Closed Won (MTD) | 12 | $318,000 | — |

- Funnel bars: gradient from light blue (top) to green (bottom/won)
- Conversion rate arrows between each stage
- Problem highlights: "Lead Received: 19 deals at $42K — most unsized at $0" with orange warning icon
- "Design Ready: $615K — largest concentration" with info icon
- Click any stage to drill into deals

---

## Row 3 — Two Panels Side by Side (55% / 45% split)

**Left Panel (55%): Client Revenue Dashboard**
- Card title: "Client Performance" with subtitle "Top accounts — this year vs last year"
- Filter tabs: "Active Clients" (selected) | "Declining" | "Dormant" | "New"
- Sort dropdown: "Sort by: 2026 Revenue"

  **Active Clients tab — Table:**
  | Client | 2025 Revenue | 2026 YTD | Run Rate | vs LY | Trend | Last Order |
  |--------|-------------|----------|----------|-------|-------|------------|
  | IPF Sourcing (Amazon) | $6,034,000 | $1,640,000 | $6.56M | +9% | 🟢 ↑ | Mar 22 |
  | Coca-Cola FL | $306,000 | $92,000 | $368K | +20% | 🟢 ↑ | Mar 18 |
  | Fairmont Hotels | $196,000 | $68,000 | $272K | +39% | 🟢 ↑ | Mar 10 |
  | Oscar Health | $193,000 | $48,000 | $192K | ~0% | 🟡 → | Feb 28 |
  | Securiti | $138,000 | $32,000 | $128K | -7% | 🟡 ↓ | Feb 15 |
  | Clear Spring Healthcare | $131,000 | $41,000 | $164K | +25% | 🟢 ↑ | Mar 5 |
  | U of Miami | $73,000 | $18,000 | $72K | ~0% | 🟡 → | Jan 30 |
  | Pinnacle Live | $68,000 | $0 | $0 | -100% | 🔴 ↓ | Nov 2025 |

  - "Run Rate" = YTD annualized (YTD ÷ months elapsed × 12)
  - Pinnacle Live row highlighted in light red — hasn't ordered since November
  - Securiti row in light yellow — trending down
  - **Declining tab:** clients with negative YoY trend requiring attention
  - **Dormant tab:** clients from 2022-2024 who haven't ordered in 6+ months — the reactivation target list (163+ historical clients). This is strategically important — APEX identified dormant reactivation as the fastest ROI growth play.
  - **New tab:** clients who made their first purchase in 2026

- Bottom summary bar: "Active clients: 87 | Growing: 34 | Flat: 28 | Declining: 15 | Dormant (6mo+): 10"
- "Total addressable wallet" callout: "Estimated uncaptured spend from top 20 clients: $1.2M"

**Right Panel (45%): Top Deals to Watch**
- Card title: "Top Deals in Pipeline" with subtitle "Highest value open opportunities"
- List of top 8-10 deals sorted by value:

  **Deal 1:**
  - "Amazon — New SKU Deployment (Safety Vests)" | **$142,000** | PPE (blue tag)
  - Stage: "Sample / Approval" (blue badge)
  - Owner: Truscott | Age: 18 days
  - "Amazon reviewing sample — decision expected Apr 10"
  - Probability: 70% | Weighted: $99,400

  **Deal 2:**
  - "TX Oscar Project for OMG" | **$75,000** | Promo (green tag)
  - Stage: "Order Request" (yellow badge)
  - Owner: Tina | Age: 12 days | In Hands: Mar 31
  - "Quote sent, awaiting client approval"
  - Probability: 60% | Weighted: $45,000

  **Deal 3:**
  - "Coca-Cola FL — Summer Campaign" | **$52,000** | Promo (green tag)
  - Stage: "Design Ready" (teal badge)
  - Owner: Tina | Age: 8 days
  - "Shannon completing mockups — 3 options"
  - Probability: 80% | Weighted: $41,600

  **Deal 4:**
  - "Amazon — Squincher Replenishment PO" | **$48,000** | PPE (blue tag)
  - Stage: "Order Request" (yellow badge)
  - Owner: Michael | Age: 5 days
  - "Inventory program — auto-reorder trigger from 3 DCs"
  - Probability: 90% | Weighted: $43,200

  **Deal 5:**
  - "Securiti — Annual Rebrand Kit" | **$38,000** | Promo (green tag)
  - Stage: "Lead Received" (gray badge)
  - Owner: Tina | Age: 3 days
  - "Securiti exploring full rebrand — this could be $100K+ if we win apparel"
  - Probability: 30% | Weighted: $11,400
  - Small green "Upsell opportunity" tag

- Each deal card: white with thin left border (green = promo, blue = PPE)
- Weighted pipeline total at bottom: "Weighted pipeline: $412,000"

---

## Row 4 — Three Panels (equal width, one-third each)

**Panel 1: Sales Team Activity**
- Card title: "Team Activity" with subtitle "Last 7 days"

  **Tina Hunter — Account Executive**
  - Small avatar or initials circle
  - Activity metrics in a mini grid:
    - "Emails sent: 28"
    - "Calls logged: 12"
    - "Proposals sent: 4"
    - "Deals closed: 3 ($68K)"
    - "Follow-ups due today: 5" (orange if overdue)
  - Activity sparkline: small 7-day bar chart
  - Status: "Top deal: Coca-Cola FL $52K"

  **Melody — Inside Sales / Biz Dev**
  - Small avatar or initials circle
  - Activity metrics:
    - "Outreach emails: 85"
    - "LinkedIn messages: 34"
    - "Leads generated: 6"
    - "Qualified leads: 2"
    - "Reactivation contacts: 18"
  - Activity sparkline
  - Status: "Focus: Dormant client outreach"

- Bottom: "Unassigned leads: 3" in red with "Assign Now" button
- "Overdue follow-ups: 7" in orange text

**Panel 2: Lead Source Performance**
- Card title: "Lead Sources" with subtitle "MTD — where are leads coming from?"
- Horizontal bar chart with metrics:

  | Source | Leads | Pipeline $ | Won $ | CAC | ROI |
  | Referral | 4 | $86K | $42K | $0 | ∞ |
  | Existing Client (upsell) | 6 | $124K | $68K | $0 | ∞ |
  | Website / Inbound | 3 | $28K | $0 | ~$200 | TBD |
  | LinkedIn (organic) | 2 | $15K | $0 | $0 | TBD |
  | The One Percent Media | 1 | $4K | $0 | $2,000 | -$2,000 |
  | Cold Outreach (Melody) | 3 | $12K | $0 | ~$500 | TBD |

- The One Percent Media row highlighted in red tint — $2K/month spend, only 1 lead, $0 won. Clear underperformance.
- Referral and Existing Client rows highlighted in green — $0 CAC, highest conversion
- Bottom insight: "Highest ROI channels: Referrals & Existing Client Upsell. The One Percent Media needs ROI review."

**Panel 3: Monthly Targets & Scorecard**
- Card title: "March Scorecard" with subtitle "Monthly targets vs actual"
- Series of horizontal progress bars with target markers:

  **Revenue Target: $650K**
  - Progress bar: $583K filled (90%) in green
  - "On track — $67K remaining, 2 days left"

  **New Clients Target: 4**
  - Progress bar: 2 filled (50%) in yellow
  - "Behind — need 2 more new clients"

  **Promo Revenue Target: $180K**
  - Progress bar: $135K filled (75%) in yellow
  - "Behind — $45K gap. Focus on Design Ready deals."

  **Proposals Sent Target: 20**
  - Progress bar: 16 filled (80%) in green
  - "On track"

  **Reactivated Clients Target: 5**
  - Progress bar: 1 filled (20%) in red
  - "Behind — Melody has 18 contacts in progress"

  **Avg Deal Size Target: $15K**
  - Progress bar: $12.4K filled (83%) in yellow
  - "Below target — too many small deals"

- Color coding: green if >85% of target, yellow if 60-85%, red if <60%
- Overall month grade at bottom: large letter grade "B-" in a circle (yellow) with text: "On track for revenue but behind on new business and reactivation"

---

## Row 5 — Full Width: Stalled Deals Alert Bar

**Slim, full-width alert section — more like a notification bar than a full card**

- Background: Light yellow (#FFFBEB) with left orange border
- Title: "Stalled Deals — No Activity in 7+ Days" with warning icon
- Horizontal scrollable list of stalled deal cards (compact):

  | Deal | Value | Stage | Last Activity | Days Stalled | Owner |
  | Pinnacle Live — Annual Event | $18,000 | Design Ready | Feb 28 | 30 days | Tina |
  | Securiti — Tech Kit Bundles | $8,200 | Lead Received | Mar 20 | 10 days | Liz |
  | Clear Spring — Q2 Order | $22,000 | Design Ready | Mar 15 | 15 days | Tina |
  | UOnline Swag | $3,500 | Order Request | Mar 20 | 10 days | Tina |
  | Small Biz Corp — Promo Starter | $2,800 | Qualified | Mar 12 | 18 days | Melody |

- Each stalled deal shows a small red "days stalled" badge
- "Action" button on each: "Send Follow-up" or "Reassign"
- Deals stalled >14 days: red text. 7-14 days: orange text.
- Total: "5 stalled deals worth $54,500 — these need attention today"

---

---

# VIEW 5: EXECUTIVE OVERVIEW DASHBOARD

**Toggle button color: Dark Blue (#1E40AF)**

The Executive Overview is the CEO's morning command view — the single screen that answers "What's the state of my entire business right now?" It pulls the most critical metrics from Finance, Sales, Operations, and Customer Service into one unified view. It does NOT duplicate the detail of those individual dashboards — it surfaces highlights and decisions requiring the CEO's attention.

---

## Row 1 — Business Health Score Bar (Full Width, Slim)

**Unique to this dashboard — a slim horizontal bar for instant pulse check.**

- Height: ~60px. White card with soft shadow. Full content width.
- 5 mini health indicators in a horizontal row, evenly spaced:

  **Cash Health:** Green circle + "Cash: Strong" + "$142K balance, 30-day forecast positive"
  **Revenue Pace:** Green circle + "Revenue: +41% vs LY" + "$583K MTD"
  **Pipeline:** Yellow circle + "Pipeline: Adequate" + "3.2x coverage but 3 leads unassigned"
  **Operations:** Yellow circle + "Ops: 3 delays" + "18 in production, 3 behind schedule"
  **Service:** Orange circle + "Service: 3 urgent" + "1 Amazon DC issue needs escalation"

- Traffic light colors: Green = healthy, Yellow = attention, Orange = action required, Red = critical
- Takes 3 seconds to scan the entire state of the business

---

## Row 2 — Top KPI Cards (4 cards, equal width)

The four numbers that matter most to a CEO. Each represents a different dimension of business health.

**Card 1: Cash Position**
- Label: "CASH POSITION"
- Value: "$142,350" (large, black, bold)
- Sub-metrics stacked below:
  - "AR Outstanding: $487K" in blue text
  - "AP Due (30d): $216K" in orange text
  - "Net Working Capital: $497K" in black text
- Comparison: green arrow + "+$18K vs last week"
- Micro sparkline: 8-week cash balance trend (tiny line chart, 40px tall)
- Icon: Bank icon on green circle

**Card 2: Revenue (MTD)**
- Label: "REVENUE (MTD)"
- Value: "$583,000" (large, black, bold)
- Sub-metrics:
  - Visual split bar: blue "PPE $448K (77%)" | green "Promo $135K (23%)"
  - "vs LY March: $412K (+41%)" in green text
  - "YTD: $1.82M (87% of target)" with thin progress bar
- Micro sparkline: 12-month revenue trend
- Icon: Trending up icon on green circle

**Card 3: Active Orders**
- Label: "ACTIVE ORDERS"
- Value: "34" (large, black, bold)
- Sub-metrics:
  - "In Production: 18" with small orange dot if any delayed
  - "In Transit: 11"
  - "Ready to Ship: 7"
  - "Behind schedule: 3" in red text with warning icon
- Icon: Package icon on purple circle

**Card 4: Open Issues**
- Label: "OPEN ISSUES"
- Value: "14" (large, black, bold)
- Sub-metrics:
  - "Urgent: 3" in red text with pulsing dot
  - "Amazon-related: 5" in blue text
  - "SLA compliance: 87%" in orange text
  - "Avg resolution: 2.4 days"
- Icon: Alert icon on coral circle

---

## Row 3 — Two Charts Side by Side (equal width)

**Left Chart: Revenue Pacing — Monthly (This Year vs Last Year)**
- Card title: "2026 vs 2025 Revenue" with subtitle "Monthly pacing"
- Chart type: Grouped bar chart
- X-axis: All 12 months (Jan through Dec)
- Two bars per month: navy bar (2025 actual), green bar (2026 actual for completed months, light green/projected for future)
- Dashed line: 2026 monthly target
- Current month (March) highlighted with subtle background band
- Delta labels: "+41%", "+36%", etc. in green when positive
- Bottom summary: "2026 YTD: $1.82M | 2025 YTD: $1.34M | Growth: +36%"
- Toggle: "Total" | "Promo" | "PPE" filter pills

**Right Chart: Revenue Concentration & Diversification**
- Card title: "Revenue Concentration" with subtitle "Diversification tracking"
- Chart type: Stacked area chart showing composition of revenue over trailing 12 months
- Two colored areas: Blue (PPE/Amazon) and Green (Promo)
- Horizontal dashed red line at 50% mark labeled "Target: No single channel >50%"
- Blue (PPE) area clearly above 50%, making concentration visually obvious
- Annotation: "IPF/Amazon: 77% of MTD revenue" in blue, "Target: <50% by EOY" in red
- Below chart: "Promo must grow from $1.87M to $5M+ to reach 50/50 balance"
- This chart visualizes the #1 business risk and tracks diversification progress

---

## Row 4 — Three Domain Summary Panels (equal width, one-third each)

Curated highlights from each domain — NOT mini-dashboards. 3-4 metrics plus 2-3 alerts each.

**Panel 1: Finance Summary**
- Card title: "Finance" with small "View Full →" link
- Navy top border accent (2px)

  Key Metrics:
  - "Cash: $142,350" with green dot
  - "30-day forecast: $94,750" with green dot
  - "Equipment debt: $179K remaining" with progress mini-bar (25% paid)
  - "DSO: 52 days" with yellow dot (target <45)

  Alerts:
  - "IPF payment of $210K expected April 15" (blue info banner)
  - "3 promo invoices over 60 days ($22K)" (orange warning)

  Monthly P&L Snapshot:
  - "Revenue: $583K | GP: $141K (24.2%) | Net: $68K"
  - "Net margin: 11.7% vs 13.5% target"

**Panel 2: Sales Summary**
- Card title: "Sales" with small "View Full →" link
- Green top border accent (2px)

  Key Metrics:
  - "Won MTD: $318K (12 deals)" with green dot
  - "Pipeline: $847K (34 deals)" with green dot
  - "Win rate: 42%" with yellow dot (target 50%)
  - "New clients MTD: 2" with yellow dot (target 4)

  Alerts:
  - "5 deals stalled 7+ days ($54K)" (orange warning)
  - "$615K sitting in Design Ready — follow-up needed" (yellow info)
  - "The One Percent Media: 1 lead in March for $2K spend" (red warning)

  Team:
  - "Tina: 3 deals closed, 5 follow-ups due today"
  - "Melody: 6 leads generated, 18 reactivation contacts"

**Panel 3: Operations Summary**
- Card title: "Operations" with small "View Full →" link
- Purple top border accent (2px)

  Key Metrics:
  - "In production: 18 orders" with green dot
  - "In transit: 11 shipments ($284K)" with green dot
  - "On-time rate: 91%" with yellow dot (target 95%)
  - "Warehouse: 68% capacity" with yellow dot

  Alerts:
  - "3 orders behind schedule (Fairmont, SC Promo, PGK)" (red warning)
  - "Amazon PO#4510 — waiting on DC distribution schedule" (blue info)
  - "SC Promo on-time at 75% — vendor performance concern" (orange warning)

  Amazon Deployments:
  - "Next 7 days: 2 deployments ($117K)"
  - "Next 30 days: 4 deployments ($423K)"

---

## Row 5 — Two Panels Side by Side (60% / 40% split)

**Left Panel (60%): CEO Action Items**
- Card title: "Requires Your Attention" with red left border accent
- Subtitle: "Items that need Patrick's decision or input"
- Total count: "6 items requiring attention — 1 critical, 3 high, 2 normal"

  **Critical (red left border, #FEE2E2 background):**
  1. "Amazon DEN4 — PO not received (3 days)"
     - "Denver DC reports PO#4521 not received. UPS shows delivered. Michael is filing a claim but Amazon may need a call from you if not resolved by tomorrow."
     - Action button: "Review Details"

  **High Priority (orange left border, #FFF7ED background):**
  2. "LOC Decision: Schedule bank meetings?"
     - "Equipment debt at $179K, 9 months to payoff. Should we start bank conversations now with the 2024-2025 growth narrative, or wait for 2026 year-end financials?"
     - Action buttons: "Start Now" | "Defer to Q4"

  3. "The One Percent Media Performance Review"
     - "$2K/month, 1 lead generated in March, $0 closed. Referrals and upsells outperform at $0 cost. Recommend restructuring or replacing."
     - Action buttons: "Schedule Review" | "Continue as-is"

  4. "Fairmont Hotels — Embroidery Delay"
     - "Client event is April 18, decorator is 5 days behind. Tina needs authorization to expedite at additional $1,200 cost."
     - Action buttons: "Approve Expedite" | "Discuss with Tina"

  **Normal (blue left border, #EFF6FF background):**
  5. "Iron Bound Safety — Trademark Attorney Budget"
     - "Legal structure for brand contracts was a 2026 priority. Need to allocate budget and select attorney. Estimated $15-25K."
     - Action button: "Schedule for April"

  6. "Hire Decision: Additional 1099 Sales Reps"
     - "APEX recommends testing 2-3 independent reps in Q2. Zero fixed cost, commission only. Need your approval on commission structure and territories."
     - Action button: "Review Proposal"

- Items expandable on click for full context

**Right Panel (40%): Key Dates & Milestones**
- Card title: "Upcoming" with subtitle "Next 30 days"
- Calendar-style list, grouped by week:

  **This Week (Mar 30 - Apr 5):**
  - "Mar 31 — TX Oscar Project IHD (in-hands date)" | $75K | flag if at risk
  - "Apr 1 — Payroll" | $22.4K
  - "Apr 1 — Equipment payment to parents" | $20K
  - "Apr 1 — SBA EIDL payment" | $731
  - "Apr 2 — KSE Supplies shipment arrives at Turkana"
  - "Apr 3 — The One Percent Media monthly review"

  **Next Week (Apr 6 - 12):**
  - "Apr 8 — Arctic Trax sample ETA at Amazon for approval"
  - "Apr 10 — Amazon SKU decision expected (Safety Vests, $142K)"
  - "Apr 12 — SC Promo ocean shipment ETA Long Beach"

  **Apr 13 - 30:**
  - "Apr 15 — IPF payment expected: $210,000" (highlighted in green — big cash inflow)
  - "Apr 15 — Estimated sales tax filing"
  - "Apr 18 — Fairmont Hotels event (embroidery must arrive by Apr 16)"
  - "Apr 20 — CoreTex sunscreen deployment ship date"
  - "Apr 25 — KSE thermal blankets ship to Amazon DCs"
  - "Apr 30 — March financial close (Omar Consulting)"

- Cash events: green tint for inflows, orange tint for outflows >$10K
- At-risk dates: red text if associated order is behind schedule
- Milestone events: blue dot indicator
- Click any date to expand details

---

## Row 6 — Full Width: Business Scorecard (Slim bar)

**Compact monthly/quarterly scorecard — the business "grade"**

- Height: ~80px. White card, full width. Divided into 6 equal segments.
- Each segment shows a key goal with progress:

  | Goal | Target | Actual | Status |
  | Monthly Revenue | $650K | $583K | 🟡 90% |
  | Promo Revenue | $180K | $135K | 🟡 75% |
  | New Clients | 4 | 2 | 🔴 50% |
  | Equipment Payoff | $20K/mo | $20K | 🟢 On track |
  | Concentration (PPE%) | <65% | 77% | 🔴 Above |
  | On-Time Delivery | 95% | 91% | 🟡 Below |

- Each segment: metric name (12px gray) at top, actual value large in center, small progress bar, colored status dot
- Green = on/above target, Yellow = within 15%, Red = more than 15% below
- Instant "are we winning?" view — like a car dashboard

---

## Overall Design Philosophy

The entire Command Center should feel like a world-class operating system. Think Bloomberg terminal meets modern SaaS dashboard — executive-level, data-rich but not cluttered, confident but not flashy. Each view should be scannable in 60 seconds or deep-diveable for 10 minutes. The color-coded toggle buttons in the top bar (Green for Finance/Sales, Coral for Customer Service, Purple for Operations, Dark Blue for Executive) provide instant orientation. Everything is designed for a CEO scaling from $8M to $200M+ who values directness over vanity metrics.