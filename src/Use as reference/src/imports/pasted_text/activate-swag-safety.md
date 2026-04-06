# ActivateSwag Command Center — Iron Bound Safety Dashboard + Customer Service Module

## Figma AI Prompt

Design two new views for the "Command Center" internal CRM platform for ActivateSwag, a B2B distribution company. These two additions complement the existing 5 dashboard views (Executive Overview, Sales, Operations, Customer Service, Finance) and existing modules (Reports, Sales Leads, CRM, Orders, Products, Order Flow, Warehouse, Billing, Email Templates).

Use the exact same design system as all existing views: dark navy sidebar (#1B2A4A), white/light gray content area (#F8FAFC), "ActivateSwag Command Center" branding, consistent typography (Inter or SF Pro), consistent card styling (white, 8px radius, soft shadow, 24px padding). Same color palette, same sidebar navigation, same top bar.

---

## Shared Design System Reference

### Layout
- Full-width, 1440px. Left sidebar: 240px. Main content: remaining width, 16px padding.
- Cards: white bg, 8px border-radius, box-shadow 0 1px 3px rgba(0,0,0,0.1), 24px internal padding.
- 16px gap between cards.
- Font: Inter or SF Pro.

### Left Sidebar
- Dark navy (#1B2A4A). Logo: "ActivateSwag" + "Command Center."
- Navigation items with icons: Dashboard, Reports, Sales Leads, CRM, Orders, Products, Order Flow, Warehouse, **Iron Bound Safety** (new — with a shield icon and blue accent), Billing, Email Templates, **Customer Service** (new — with a headset icon and coral accent).

### Top Bar
- "Command Center" title + subtitle "Real-time overview of your operations."
- Right side: view toggle/dropdown (for dashboard views), notification bell, user avatar "Patrick Lowenthal."
- Search bar.

### Color Palette
- Primary Navy: #1B2A4A
- Accent Green: #10B981 (positive, promo)
- Accent Blue: #3B82F6 (PPE/Amazon, Iron Bound Safety primary accent)
- Warning Orange: #F59E0B
- Alert Red: #EF4444
- Purple: #7C3AED (operations, production)
- Coral: #F97066 (customer service accent)
- Teal: #14B8A6 (QC, sourcing)
- Background: #F8FAFC
- Card Background: #FFFFFF
- Text Primary: #1E293B
- Text Secondary: #64748B
- Border/Divider: #E2E8F0

### Typography
- Page title: 28px bold
- Card titles: 16px semibold
- KPI values: 24px bold
- KPI labels: 12px uppercase, letter-spacing 0.5px, #64748B
- Table headers: 12px semibold uppercase
- Table body: 13px regular
- Status badges: 11px semibold, 4px radius, colored background
- Sub-labels: 12px regular, #64748B

---

---

# VIEW 1: IRON BOUND SAFETY — Distribution & PPE Dashboard

**This is a new dashboard view added to the Command Center dropdown. It also gets its own dedicated sidebar nav item ("Iron Bound Safety" with shield icon).**

**Dashboard toggle button color: Blue (#3B82F6)**

This dashboard is the dedicated command center for the PPE / Safety Equipment distribution business operated through IPF Sourcing. The company distributes safety products (gloves, thermal gear, holsters, sunscreen, blankets) to Amazon distribution centers, Cintas, and other enterprise buyers under three proprietary brands: Iron Bound Safety, Arctic Trax, and Scan Sling.

This view gives the CEO and PPE Project Manager (Truscott Miller) full visibility into: the SKU pipeline (from concept to approved), inventory across all locations, active and upcoming deployments, sample status, production progress, and financial performance of the PPE division. It answers: "What's the state of our entire safety distribution business right now?"

---

## Row 1 — Top KPI Cards (6 cards, equal width, horizontal)

Each card: white background, soft shadow, 8px radius. Icon on right side with colored circular background. Value is large (24px bold). Label in small gray text (12px uppercase).

**Card 1: Active SKUs**
- Label: "APPROVED SKUS"
- Value: "15" (large, bold)
- Sub-label: "Pipeline: 8 pending approval"
- Small text: "Target: 50+ by EOY 2026"
- Progress bar: 15/50 (30%) filled in blue
- Icon: Barcode icon on blue circle

**Card 2: Total Inventory Value**
- Label: "INVENTORY VALUE"
- Value: "$842,000" (large, bold)
- Sub-label: "Warehouse: $218K | Turkana: $485K | In Transit: $139K"
- Small text: green arrow + "Units on hand: 32,400"
- Icon: Box/inventory icon on purple circle

**Card 3: Active Deployments**
- Label: "ACTIVE DEPLOYMENTS"
- Value: "6" (large, bold)
- Sub-label: "Total deployment value: $423,000"
- Small text: "DCs awaiting shipment: 24 across all POs"
- Icon: Truck icon on blue circle

**Card 4: Revenue (MTD)**
- Label: "PPE REVENUE (MTD)"
- Value: "$448,000" (large, bold)
- Sub-label: green arrow + "vs LY March: $310K (+45%)"
- Small text: "YTD: $1.64M | Run rate: $6.56M"
- Icon: Dollar icon on green circle

**Card 5: Samples in Progress**
- Label: "SAMPLES & APPROVALS"
- Value: "11" (large, bold)
- Sub-label: "Pre-production: 4 | Amazon review: 5 | Factory sample: 2"
- Small orange text: "3 awaiting Amazon response >14 days"
- Icon: Flask/test tube icon on orange circle

**Card 6: Gross Margin (PPE)**
- Label: "GROSS MARGIN (PPE)"
- Value: "18.5%" (large, bold, blue)
- Sub-label: Info icon + "Compressed by IPF billing structure — actual economic margin higher"
- Small text: "Revenue to IPF: $448K | Cost: $365K | Profit share: $83K"
- Icon: Percentage icon on teal circle

---

## Row 2 — SKU Pipeline (Full Width, Kanban-style)

**The core strategic view — shows every SKU from idea to approved and selling.**

- Card title: "SKU Pipeline" with subtitle "Product lifecycle from concept to revenue"
- Filter bar: Brand filter pills ("All" selected, "Iron Bound Safety", "Arctic Trax", "Scan Sling", "New Brand") | Search field | "Add New SKU" button (blue, primary)

**Kanban board with 6 columns:**

Each column has a header with count. Cards inside represent individual SKUs.

**Column 1: Concept / Research**
- Header: "Concept" with badge "3 SKUs"
- Color accent: Gray top border (4px)

  Sample cards:
  - Card: "High-Vis Safety Vest IBS-3100" | Iron Bound Safety (blue brand tag) | "Researching Amazon demand + pricing competitive analysis" | Assigned: Truscott | Added: Mar 15
  - Card: "Insulated Work Gloves AT-2100" | Arctic Trax (teal brand tag) | "Evaluating 2 factories in China for thermal lining" | Assigned: Liz | Added: Mar 20
  - Card: "Knee Pad Insert KP-1000" | New Brand TBD | "Patrick evaluating new product category expansion" | Assigned: Patrick | Added: Mar 28

**Column 2: Sourcing / Quoting**
- Header: "Sourcing" with badge "4 SKUs"
- Color accent: Blue top border

  Sample cards:
  - Card: "Safety Vest IBS-3100" | Iron Bound Safety | "3 factory quotes received. SC Promo: $4.20, Factory B: $4.85, Factory C: $3.95" | Target margin: 22% | Assigned: Liz
  - Card: "Thermal Blanket AT-3050" | Arctic Trax | "KSE Supplies quote: $6.80/unit. Evaluating Indian alt." | Assigned: Truscott

**Column 3: Sample / Pre-Production**
- Header: "Sampling" with badge "4 SKUs"
- Color accent: Purple top border

  Sample cards:
  - Card: "Anti-Fog Safety Glasses IBS-4200" | Iron Bound Safety | "Factory sample received Mar 22 — QC passed" | Status: READY TO SUBMIT TO AMAZON (green badge) | Photo thumbnail of sample
  - Card: "Cut-Resistant Gloves IBS-2300" | Iron Bound Safety | "Pre-production sample shipped from SC Promo Mar 18" | ETA: Apr 2 | Status: IN TRANSIT (blue badge)
  - Card: "Scan Sling Pro SS-1200" | Scan Sling | "Amazon rejected first sample — too bulky. Revising design." | Status: REVISION NEEDED (red badge) | Assigned: Truscott

**Column 4: Amazon Approval**
- Header: "Awaiting Approval" with badge "5 SKUs"
- Color accent: Orange top border
- If any SKUs waiting >14 days, show red warning: "3 over 14 days"

  Sample cards:
  - Card: "Safety Vest IBS-3100" | Iron Bound Safety | "Submitted to Amazon Mar 10 — awaiting buyer review" | Days waiting: 26 | Status: PENDING (orange badge, pulsing) | Amazon contact: Sarah Kim
  - Card: "Thermal Gloves AT-2050" | Arctic Trax | "Submitted Mar 20" | Days waiting: 16 | Status: PENDING
  - Card: "Anti-Fog Glasses IBS-4200" | Iron Bound Safety | "Submitted Mar 25" | Days waiting: 11 | Status: PENDING — within normal window

**Column 5: Approved — Setting Up**
- Header: "Approved" with badge "3 SKUs"
- Color accent: Green top border

  Sample cards:
  - Card: "Sunscreen Packets CTX-100" | CoreTex | "Approved. Setting up pricing in Amazon system. Awaiting first PO." | Approved date: Mar 5 | Status: AWAITING FIRST PO
  - Card: "Thermal Socks AT-1050" | Arctic Trax | "Approved. First deployment PO expected Apr 15." | Status: PO EXPECTED

**Column 6: Active / Selling**
- Header: "Active SKUs" with badge "15 SKUs" (green badge)
- Color accent: Green top border (bold)
- This column shows a compact list (not full cards) since there are many:

  Compact list items (each ~40px tall):
  - "IBS-2240 — Iron Bound Safety Gloves" | Revenue MTD: $128K | Units: 4,200 | 🟢 Active
  - "IBS-2100 — Iron Bound Nitrile Gloves" | Revenue MTD: $85K | Units: 3,100 | 🟢 Active
  - "AT-1000 — Arctic Trax Thermal Gloves" | Revenue MTD: $62K | Units: 2,800 | 🟢 Active
  - "CTX-100 — CoreTex Sunscreen" | Revenue MTD: $48K | Units: 6,000 | 🟢 Active
  - "SS-1000 — Scan Sling Holster" | Revenue MTD: $35K | Units: 1,200 | 🟢 Active
  - [10 more rows scrollable]

  - "View all 15 SKUs →" link at bottom

**Kanban card design:**
- White bg, thin 3px left border color-coded by brand: Blue = Iron Bound Safety, Teal = Arctic Trax, Purple = Scan Sling, Gray = New/TBD
- Brand tag pills: small colored rounded badges
- Photo thumbnail (small, 40x40px) where sample photos exist
- Days waiting badge turns orange >7 days, red >14 days
- Hover: card elevates. Click: opens full SKU detail page.

---

## Row 3 — Two Panels Side by Side (55% / 45% split)

**Left Panel (55%): Active Deployments Tracker**

- Card title: "Active Deployments" with subtitle "All current Amazon PO shipments"
- Tabs: "In Progress" (selected) | "Upcoming" | "Completed (30d)"

**In Progress tab — Table:**
| PO # | Product / SKU | Brand | Total Units | DCs | Shipped | Remaining | Value | Status | ETA |
|------|-------------|-------|------------|-----|---------|-----------|-------|--------|-----|
| PO-4510 | Iron Bound Gloves IBS-2240 | IBS | 4,000 | 8 | 0/8 DCs | 4,000 | $72,000 | Waiting on Amazon DC schedule | — |
| PO-4508 | Arctic Trax Beanies AT-1020 | AT | 3,000 | 6 | 3/6 DCs | 1,500 | $45,000 | Partially shipped | Apr 5 |
| PO-4522 | Squincher Hydration | — | 6,000 | 12 | 0/12 DCs | 6,000 | $38,000 | In transit to Turkana for repack | Apr 8 |
| PO-4530 | Iron Bound Gloves IBS-2240 | IBS | 5,000 | 10 | 0/10 DCs | 5,000 | $128,000 | In production (60%) | May 10 |
| PO-4535 | CoreTex Sunscreen CTX-100 | CTX | 8,000 | 15 | 0/15 DCs | 8,000 | $85,000 | Packaging phase | Apr 20 |
| PO-4540 | KSE Thermal Blankets | KSE | 2,500 | 5 | 0/5 DCs | 2,500 | $55,000 | Manufacturing complete | Apr 25 |

- DC progress column: mini segmented bar where each segment = 1 DC. Green = shipped, gray = pending.
- Status badges: "Waiting on Amazon" (yellow), "Partially shipped" (blue), "In transit" (purple), "In production" (orange), "Manufacturing complete" (teal)
- Click any PO row to expand: shows DC-by-DC breakdown with individual tracking numbers, ship dates, delivery confirmation

**Upcoming tab:** POs expected in the next 30-60 days based on pipeline and reorder schedules
**Completed tab:** Recently finished deployments with final metrics (on-time %, units deployed, value)

- Bottom summary: "Total active deployment value: $423,000 | DCs pending shipment: 24 | Estimated completion: Apr 5 - May 15"

**Right Panel (45%): Inventory Overview**

- Card title: "Inventory Across All Locations" with subtitle "Real-time stock levels"
- Tabs: "All" (selected) | "Warehouse" | "Turkana" | "In Transit"

**Summary bar at top of panel:**
- "Total Units: 32,400 | Total Value: $842,000"
- Three mini cards inline: "Warehouse: 8,200 units ($218K)" | "Turkana: 18,400 units ($485K)" | "In Transit: 5,800 units ($139K)"

**Inventory table:**
| SKU | Product | Brand | Location | Units | Value | Days of Supply | Reorder Status |
|-----|---------|-------|----------|-------|-------|---------------|----------------|
| IBS-2240 | Iron Bound Gloves | IBS | Turkana | 6,200 | $124,000 | 42 days | 🟢 Stocked |
| IBS-2240 | Iron Bound Gloves | IBS | Warehouse | 1,800 | $36,000 | 12 days | 🟡 Low |
| IBS-2100 | Nitrile Gloves | IBS | Turkana | 4,100 | $82,000 | 35 days | 🟢 Stocked |
| AT-1000 | Thermal Gloves | AT | In Transit | 2,800 | $56,000 | — | 🔵 Incoming |
| CTX-100 | Sunscreen Packets | CTX | Turkana | 3,200 | $48,000 | 18 days | 🟢 Stocked |
| SS-1000 | Scan Sling Holster | SS | Warehouse | 800 | $24,000 | 22 days | 🟢 Stocked |
| AT-1020 | Arctic Trax Beanies | AT | Warehouse | 1,500 | $22,500 | 8 days | 🟠 Reorder Needed |

- Reorder Status: Green (>30 days supply), Yellow (15-30 days), Orange (<15 days — trigger reorder), Red (out of stock)
- "Days of Supply" = units on hand / average daily demand based on recent PO velocity
- Click any row to see full history: receiving log, outbound shipments, adjustment notes

---

## Row 4 — Three Panels (equal width, one-third each)

**Panel 1: Brand Performance**

- Card title: "Brand Revenue" with subtitle "MTD by brand"
- Three brand rows, each with:

  **Iron Bound Safety** (blue left border)
  - Revenue MTD: $285,000 | Units: 12,400
  - Active SKUs: 8 | Pipeline: 4
  - Customers: Amazon, Cintas
  - Mini sparkline: 6-month revenue trend (ascending)

  **Arctic Trax** (teal left border)
  - Revenue MTD: $108,000 | Units: 8,200
  - Active SKUs: 4 | Pipeline: 3
  - Customers: Amazon
  - Mini sparkline: 6-month trend

  **Scan Sling** (purple left border)
  - Revenue MTD: $55,000 | Units: 2,400
  - Active SKUs: 3 | Pipeline: 1
  - Customers: Amazon, Amazon Business
  - Mini sparkline: 6-month trend

- Bottom: "Total PPE Revenue MTD: $448,000 across 15 active SKUs"

**Panel 2: Sample & Approval Tracker**

- Card title: "Sample Status" with subtitle "All samples in progress"
- Color-coded timeline view — each sample is a horizontal row:

  **Factory Sampling (2):**
  - "Cut-Resistant Gloves IBS-2300" — SC Promo → Expected Apr 2 — 🔵 In Transit
  - "Insulated Gloves AT-2100" — Factory C → Expected Apr 10 — 🔵 In Production

  **Pre-Production Review (4):**
  - "Anti-Fog Glasses IBS-4200" — QC Passed ✅ — Ready to submit to Amazon
  - "Safety Vest IBS-3100" — Awaiting Patrick review — 3 days
  - "Thermal Socks AT-1060" — Minor color issue, revision requested — ⚠️
  - "Knee Pad KP-1000" — Design phase, no sample yet

  **Amazon Review (5):**
  - "Safety Vest IBS-3100" — Submitted Mar 10 — **26 days** 🔴 Overdue
  - "Thermal Gloves AT-2050" — Submitted Mar 20 — **16 days** 🟠
  - "Anti-Fog Glasses IBS-4200" — Submitted Mar 25 — 11 days 🟡
  - "Scan Sling Pro SS-1200" — **REJECTED** — Revision needed 🔴
  - "Hi-Vis Vest IBS-3200" — Submitted Mar 28 — 8 days 🟢

- Days waiting color: Green (<7), Yellow (7-14), Orange (14-21), Red (21+)
- Bottom: "Avg Amazon approval time: 18 days | Target: <14 days"

**Panel 3: IPF Financial Summary**

- Card title: "IPF / Amazon Financials" with subtitle "Billing & payment tracking"
- Blue-tinted background (#F0F7FF) — consistent with how Amazon content is styled throughout the platform

  **Key Metrics:**
  - "Invoiced to IPF (YTD): $1.64M"
  - "Collected (YTD): $1.12M"
  - "Outstanding AR: $412,000"
  - "Avg Days to Payment: 94 days" (orange — above 90 target)

  **Next Expected Payments:**
  - "Apr 15 — $210,000 (Inv #IPF-2026-018)" with green highlight
  - "Apr 30 — $85,000 (Inv #IPF-2026-019)"
  - "May 12 — $117,000 (Inv #IPF-2026-020)"

  **Net 90 Progress Bars:**
  - Three horizontal progress bars, one for each outstanding invoice, showing how far through the 90-day cycle each is
  - Labels: invoice number, amount, days remaining

  **Margin Note:**
  - Small info card: "IPF billing: Cost + 50% of gross profit. Reported margin on AS books is compressed. Actual economic margin is healthy."

- Bottom: "View full IPF reconciliation →" link to Reports module

---

## Row 5 — Full Width: Distribution Channel Status Bar

**Slim, full-width summary bar showing all distribution channels**

- Height: ~80px. White card, full width. Divided into 4 equal segments.

  **Amazon Direct:**
  - "15 Active SKUs | $448K MTD | 6 active deployments"
  - Status: 🟢 Active
  - "Next deployment: PO-4510 (awaiting DC schedule)"

  **Cintas:**
  - "2 Active SKUs | $38K MTD"
  - Status: 🟢 Active
  - "Opportunity: expand from 2 → 10+ SKUs"

  **Amazon Business (B2B Marketplace):**
  - "Onboarded | 5 SKUs listed | $12K MTD"
  - Status: 🟡 Growing
  - "Low volume — needs marketing push"

  **Grainger:**
  - "0 Active SKUs | $0 revenue"
  - Status: 🟠 Prospect
  - "Introduction made — needs follow-up"

---

---

# VIEW 2: CUSTOMER SERVICE MODULE — Full Working Interface

**This is NOT a dashboard view in the Command Center dropdown. This is a dedicated full-page module accessible from the sidebar navigation item "Customer Service" (headset icon, coral accent).**

**Purpose:** This is where a Customer Service representative (or anyone handling customer issues) actually works. It's not a summary dashboard — it's an operational workspace for managing, tracking, and resolving issues across both business lines (Promo and PPE/Amazon). Think Zendesk or Freshdesk but built specifically for a promotional products / PPE distribution company.

The module has its own sub-navigation and multiple views: Ticket Queue, Ticket Detail, Create Ticket, and CS Dashboard (the summary view).

---

## Page Header

- Breadcrumb: "Customer Service"
- Title: "Customer Service" (28px bold) with subtitle "Manage and resolve customer issues"
- Right side: "Create Ticket" button (coral, primary), notification badge showing unassigned tickets, "CS Dashboard" toggle to switch to summary view

## Sub-Navigation (horizontal tabs below header)

"My Tickets" (default for CS rep) | "All Tickets" | "Unassigned" (with red count badge) | "By Client" | "Amazon Issues" | "Promo Issues"

---

## View 2A: Ticket Queue (Main Working View)

**The primary view when a CS rep opens the module. Shows all tickets they own or need attention.**

### Left Panel (30% width): Ticket List

A vertical scrollable list of tickets, similar to an email inbox. Each ticket is a compact card (~80px tall):

**Ticket card layout:**
- Left edge: Priority color stripe (red = urgent, orange = high, blue = normal, gray = low)
- First line: Ticket # + Client name (bold) + Age badge
- Second line: Issue type + short description (truncated)
- Third line: Status badge + assigned to + business line tag (Promo green / Amazon blue)
- Right side: small timestamp of last activity

**Sample ticket list (scrollable):**

🔴 #CS-1247 | **Coca-Cola FL** | 1d
Misprint — Logo color mismatch on 500 polo shirts
`In Progress` · Tina · Promo
Last: 10:42 AM

🔴 #CS-1245 | **Amazon - DEN4** | 3d
DC Not Received — PO #4521 not received at Denver
`Investigating` · Michael · Amazon
Last: 10:15 AM

🔴 #CS-1244 | **Fairmont Hotels** | 2d
Lost Shipment — UPS delivered but client says not received
`Escalated` · Liz · Promo
Last: Yesterday

🟡 #CS-1248 | **Oscar Health** | 0d
Vendor OOS — SanMar out of stock Gildan 5000 Navy XL
`New` · Liz · Promo
Last: 9:30 AM

🟡 #CS-1246 | **Amazon - SBD1** | 2d
Short Shipment — Received 480 of 500 units
`In Progress` · Michael · Amazon
Last: Yesterday

🟡 #CS-1243 | **Securiti** | 5d
Production Delay — Embroidery 2 weeks late on 300 jackets
`Waiting on Vendor` · Tina · Promo
Last: 2 days ago

🔵 #CS-1249 | **U of Miami** | 0d
Wrong Address — Shipped to old campus address
`New` · Unassigned · Promo
Last: Just now

🔵 #CS-1242 | **Clear Spring** | 4d
Vendor OOS — Hit Promo discontinued item
`Sourcing` · Melody · Promo
Last: Yesterday

🔵 #CS-1241 | **Pinnacle Live** | 3d
Shipping Delay — UPS ETA pushed 3 days
`Monitoring` · Liz · Promo
Last: 2 days ago

- Clicking a ticket in the list opens it in the right detail panel
- Active/selected ticket has a blue left highlight
- Filter and sort controls at top of list: Filter by status, priority, business line, assigned to. Sort by: Priority, Age, Last Activity, Client.
- Search bar at very top of list: "Search tickets..."
- Unassigned tickets have a subtle red glow/tint

### Right Panel (70% width): Ticket Detail View

When a ticket is selected from the left list, the full detail opens here. This is where the CS rep does all their work.

**Ticket Detail Layout:**

**Header section:**
- Ticket #: "#CS-1247" (large, 18px bold)
- Status dropdown: "In Progress" (clickable to change — shows all status options)
- Priority dropdown: "Urgent" (clickable to change)
- Assigned to: "Tina Hunter" (clickable to reassign)
- Business line tag: "Promo" (green badge) or "Amazon" (blue badge)
- Created: "Mar 29, 2026 at 2:15 PM"
- Age: "1 day, 4 hours"
- SLA timer: "SLA: 12h remaining" (countdown, turns orange <6h, red when breached)

**Client & Order Info Section (gray background card):**
- Client: "Coca-Cola FL" (link to CRM profile)
- Contact: "Maria Rodriguez, Marketing Manager" | Email | Phone
- Related Order: "#ORD-2026-0847" (link to order detail)
- Order Value: $32,000
- Product: "500x Custom Polo Shirts — Gildan 64000, Navy, Embroidered Logo"
- Vendor: "SanMar (blank) + StitchDirect (embroidery)"
- Order Date: Mar 15, 2026 | Promised Delivery: Apr 1, 2026
- Shipping: UPS Ground via Unishippers | Tracking: 1Z999AA10123456784

**Issue Description Section:**
- Issue Type: "Misprint / Decoration Error" (categorized dropdown)
- Description (text block): "Client received 500 polo shirts and reports the logo color is mismatched — the navy blue appears as a dark purple. Client has rejected the entire delivery. Photos attached. Need resolution plan ASAP — these are for a company event on April 5."
- Attached files: 3 photos (clickable thumbnails showing the misprint), 1 PDF (client email)
- Impact: "Client event April 5 — 3 business days to resolve or client will be without merchandise for their event"

**Resolution Section:**
- Root cause dropdown: "Vendor error" / "Internal error" / "Shipping damage" / "Client miscommunication" / "Other"
- Resolution plan (editable text area): "Vendor (StitchDirect) is reprinting 500 units with corrected color profile. Rush production authorized. New ETA: April 4. UPS Next Day Air return label sent for original shipment. Patrick approved expedite cost ($1,200)."
- Financial impact:
  - Original order value: $32,000
  - Reprint cost: $8,500
  - Expedite shipping: $1,200
  - Credit/refund to client: $0 (pending — may need goodwill credit)
  - Net impact: -$9,700
- Resolution status: "Awaiting reprint completion"

**Activity Timeline (scrollable, newest first):**
This is the full history of everything that has happened on this ticket — notes, status changes, emails, calls.

- **Apr 1, 10:42 AM** — Tina Hunter added note:
  "Spoke with StitchDirect. They acknowledge the color mismatch was on their end — wrong Pantone profile loaded. Reprinting 500 units rush, ETA Apr 4. They are covering $3,000 of reprint cost."

- **Apr 1, 9:15 AM** — Status changed: New → In Progress (by Tina)

- **Mar 31, 4:30 PM** — Tina Hunter added note:
  "Sent return label to Maria at Coca-Cola. She confirmed they'll have the wrong shipment ready for pickup tomorrow."

- **Mar 31, 2:00 PM** — Patrick Lowenthal added note:
  "Approved $1,200 expedite cost. Priority is getting correct product to client before April 5 event. Discuss vendor credit with StitchDirect."

- **Mar 31, 11:00 AM** — Email sent to client:
  "Maria — we've identified the issue and are reprinting immediately. New delivery expected April 4 via overnight. We sincerely apologize for the error."

- **Mar 30, 3:15 PM** — Tina Hunter added note:
  "Received photos from client. Confirmed — the embroidery thread color is wrong. Navy should be PMS 289, was printed in PMS 2768 (purple tint). Contacting StitchDirect."

- **Mar 30, 2:15 PM** — Ticket created by Liz from client email.

**Activity timeline entry types:**
- Notes (speech bubble icon, gray background)
- Status changes (arrow icon, light blue background)
- Emails sent/received (mail icon, light green background for sent, white for received)
- Phone calls logged (phone icon)
- File attachments (paperclip icon)
- Approvals (checkmark icon, light green)
- Escalations (flag icon, light red background)

**Action Buttons (sticky at bottom of detail panel):**
- "Add Note" (text input expands on click)
- "Send Email" (opens email composer pre-filled with client contact)
- "Log Call" (opens call log form)
- "Attach File" (file upload)
- "Escalate" (changes priority + notifies manager)
- "Resolve" (opens resolution form and closes ticket)
- "Link Order" (associates additional orders)

---

## View 2B: Ticket Detail — Amazon-Specific Layout

When an Amazon/PPE ticket is selected, the detail view adds Amazon-specific fields:

**Amazon Info Section (blue-tinted background #F0F7FF):**
- DC: "DEN4 — Denver, CO"
- Amazon PO #: "PO-4521"
- Amazon Contact: "Sarah Kim (denver-dc@amazon.com)"
- IPF Reference: "IPF-2026-PO-0847"
- SKU: "IBS-2240 — Iron Bound Safety Gloves"
- Units affected: 500
- Impact level: "High — Amazon DC complaint could affect relationship"

**Amazon Resolution Protocol:**
- Step 1: File UPS claim (if shipping issue) — Status: ✅ Done
- Step 2: Contact Amazon DC with proof of delivery — Status: 🔄 In Progress
- Step 3: Ship replacement if needed — Status: ⏳ Pending
- Step 4: Update IPF/Anshu if escalation needed — Status: ⏳ Pending
- Step 5: Document resolution for future reference — Status: ⏳ Pending

**Risk Assessment:**
- "This DC has had 0 prior issues. Resolution within 48 hours recommended to maintain perfect track record."

---

## View 2C: Create Ticket Form

When "Create Ticket" button is clicked, a modal or full-page form appears:

**Form sections:**

**1. Classification:**
- Business line: Radio buttons — Promo | Amazon/PPE
- Priority: Dropdown — Urgent | High | Normal | Low
- Issue type: Dropdown — changes based on business line:
  - Promo: Vendor Out of Stock, Shipping Delay, Production Delay, Misprint/Error, Wrong Item, Wrong Address, Damage in Transit, Client Complaint, Billing Issue, Other
  - Amazon: DC Not Received, Short Shipment, Wrong Item, Damaged, Late Delivery, Quality Complaint, Return/Replacement, Other

**2. Client & Order:**
- Client: Search/autocomplete field (pulls from CRM)
- Contact: Auto-fills from CRM, editable
- Related Order #: Search/autocomplete (pulls from Orders module)
- Related PO # (Amazon only): Search field

**3. Issue Details:**
- Subject line: Text input (required)
- Description: Rich text area
- Attachments: Drag-and-drop file upload (photos, PDFs, emails)
- Amazon DC (if Amazon): Dropdown of known DCs

**4. Assignment:**
- Assign to: Dropdown of team members (or "Unassigned")
- SLA target: Auto-calculated based on priority (Urgent: 4h, High: 24h, Normal: 48h, Low: 72h)

**5. Submit:** "Create Ticket" button → redirects to ticket detail view

---

## View 2D: CS Dashboard (Summary View)

When "CS Dashboard" is toggled on from the header, the view switches from the working queue to a summary dashboard — this is similar to the existing Customer Service dashboard from the Command Center but more detailed, intended for a CS manager reviewing team performance.

**Row 1 — KPI Cards (5 cards):**
- Open Tickets: 14 (Promo 9, Amazon 5)
- Urgent: 3 (with pulsing red dot)
- Avg Resolution Time: 2.4 days
- Resolved This Week: 8 of 12 target
- SLA Compliance: 87% (target 95%)

**Row 2 — Two charts:**
- Left: Ticket volume trend (8 weeks) — Opened vs Resolved lines
- Right: Resolution time by issue type (horizontal bar chart)

**Row 3 — Team Performance:**
| Team Member | Open | Resolved (7d) | Avg Resolution | SLA % | Workload |
| Michael Roos | 4 | 3 | 2.1 days | 91% | 🟡 High |
| Tina Hunter | 3 | 2 | 2.8 days | 85% | 🟢 Normal |
| Liz | 4 | 2 | 2.5 days | 88% | 🟡 High |
| Melody | 2 | 1 | 3.2 days | 75% | 🟢 Normal |
| Truscott Miller | 1 | 0 | — | — | 🟢 Low |
| Unassigned | 3 | — | — | — | 🔴 Assign Now |

**Row 4 — Issue Category Breakdown + SLA Breach Log:**
- Left: Donut chart of open tickets by category
- Right: Table of recent SLA breaches with ticket #, issue, assigned to, how long past SLA

---

## Design Notes for Both Views

**Iron Bound Safety Dashboard:**
- This view should feel distinct from the general Operations dashboard. The Operations dashboard shows all orders across both business lines. This view is ONLY PPE/safety distribution — it's the dedicated workspace for Truscott Miller and Patrick to manage the Amazon/IPF side.
- The SKU Pipeline kanban (Row 2) is the hero section — it tells the story of the product lifecycle from idea to revenue. This is what no one in the company can currently see at a glance.
- Blue (#3B82F6) is the dominant accent color — consistent with how PPE/Amazon content is styled throughout the entire platform.
- Brand color coding (blue for Iron Bound Safety, teal for Arctic Trax, purple for Scan Sling) should be consistent everywhere brands are referenced.
- The Inventory panel should make it immediately obvious when something needs reordering — the color-coded Days of Supply is the critical metric.

**Customer Service Module:**
- This is a WORKING TOOL, not a dashboard. The left panel ticket list + right panel detail view is the core experience. A CS rep should be able to spend their entire day in this module without switching to another tool.
- The Activity Timeline on the ticket detail is the most important element — it's the complete history of everything that happened on an issue. It should feel chronological, scannable, and complete.
- Coral (#F97066) is the accent color for Customer Service — consistent with the existing Customer Service dashboard.
- The Amazon-specific ticket layout (blue-tinted background, resolution protocol checklist) is critical — Amazon issues carry disproportionate business risk and need a structured resolution process.
- The Create Ticket form should be fast — a CS rep should be able to create a ticket in under 60 seconds.
- SLA timers should be visually prominent — countdown format, color-changing as deadline approaches.
- The module should handle both sides of the business seamlessly — the same interface for Promo and Amazon issues, with contextual fields that appear based on business line selection.
- Think of this as a lightweight Zendesk built specifically for a promotional products / PPE distribution company. Every field, category, and workflow reflects the actual issues this business faces — not generic customer service patterns.