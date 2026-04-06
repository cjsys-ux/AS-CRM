# Figma AI Prompt — Operations Dashboard (Command Center)

## Copy everything below this line into Figma AI:

---

Design an Operations Dashboard view for the "Command Center" of an internal CRM platform for a B2B distribution company that operates two distinct business lines: (1) Promotional Products — corporate branded merchandise with shorter production cycles and domestic fulfillment, and (2) PPE/Safety Equipment — sourced primarily from overseas (China, India) for Amazon distribution center deployments with complex multi-stage production and logistics spanning 8-16 weeks. The company has a small 3,000 sq ft warehouse and also uses a large third-party fulfillment center (Turkana Tools) for big Amazon deployments.

The Operations dashboard serves the CEO and Director of Operations who need to see the full supply chain picture: what's being sourced, what's in production, what's in transit, what's in the warehouse, what's shipping out, and where the bottlenecks are — across both business lines simultaneously. The Amazon/PPE side is particularly complex because it involves overseas factories, freight forwarding, customs, multi-DC distribution schedules, and Net 90 payment cycles that create cash flow pressure.

Keep the existing design system: dark navy sidebar (#1B2A4A), white/light gray content area, "ActivateSwag Command Center" branding. Use a purple accent (#7C3AED) for the "Operations" toggle button to distinguish from Finance (green) and Customer Service (coral).

## Layout Specifications

**Overall:** Full-width dashboard, 1440px wide. Left sidebar navigation (240px). Main content area with 16px padding. Cards use soft shadows, 8px border radius, white backgrounds. Font: Inter or SF Pro.

**Left Sidebar (consistent across all views):**
- Logo: "ActivateSwag" with subtitle "Command Center"
- Same navigation: Dashboard, Analytics, Sales Leads, CRM, Orders, Products, Order Flow, Warehouse, Amazon Distribution, Billing, Email Templates
- Dark navy background (#1B2A4A)

**Top Bar:**
- "Command Center" title with subtitle "Real-time overview of your operations"
- Right side: "Operations" dropdown button in purple (#7C3AED), notification bell, user avatar "Patrick Lowenthal"
- Search bar: "Search anything..."

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

**This is the most important section of the Operations dashboard.**

- Card title: "Production Pipeline" with subtitle "All active orders by stage"
- Filter bar at top: Toggle pills for "All" (selected), "Promo Only", "Amazon Only" | Sort: "By Due Date" dropdown | Search field
- Right side of title bar: "View Gantt" button (links to the Gantt chart module) and "View List" toggle

**Kanban board with 6 columns, horizontal scroll if needed:**

Each column has a header with count and total value. Cards inside each column represent individual orders.

**Column 1: Sourcing / Quoting**
- Header: "Sourcing" with badge "5 orders | $87K"
- Color accent: Light gray top border

  Sample cards (each card is a mini card ~120px tall):
  - Card: "Oscar Health — Custom Jackets" | $18,500 | Promo | Assigned: Liz | "Awaiting vendor quotes" | Due: Apr 28
  - Card: "Amazon — New SKU: Safety Vest IBS-3100" | $42,000 | PPE (blue tag) | Assigned: Liz | "Sampling 3 factories" | Due: May 15
  - Card: "Securiti — Tech Kit Bundles" | $8,200 | Promo | Assigned: Tina | "Pricing from Hit Promo" | Due: Apr 18

**Column 2: Sample / Approval**
- Header: "Sample / Approval" with badge "4 orders | $156K"
- Color accent: Blue top border

  Sample cards:
  - Card: "Amazon — Arctic Trax Thermal Gloves" | $95,000 | PPE (blue tag) | Assigned: Truscott | "Sample shipped to Amazon for approval" | Due: May 30 | "Sample ETA: Apr 8"
  - Card: "Coca-Cola FL — Summer Event Kit" | $32,000 | Promo | Assigned: Tina | "Client reviewing mockups" | Due: Apr 22

**Column 3: In Production**
- Header: "In Production" with badge "8 orders | $412K"
- Color accent: Orange top border
- If any cards are behind schedule, column header shows red warning: "3 delayed"

  Sample cards:
  - Card: "Amazon — Iron Bound Safety Gloves PO#4530" | $128,000 | PPE (blue tag) | Assigned: Truscott | Vendor: SC Promo | "Production 60% complete" with small progress bar | Due: May 10 | Status: ON TRACK (green badge)
  - Card: "Amazon — CoreTex Sunscreen Deploy" | $85,000 | PPE (blue tag) | Assigned: Michael | Vendor: CoreTex | "Packaging phase" | Due: Apr 20 | Status: ON TRACK (green badge)
  - Card: "Fairmont Hotels — Robes & Amenities" | $24,000 | Promo | Assigned: Tina | Vendor: SanMar + decorator | "Embroidery in progress" | Due: Apr 15 | Status: DELAYED (red badge) "Decorator behind 5 days"
  - Card: "Amazon — KSE Thermal Blankets PO#4525" | $48,000 | PPE (blue tag) | Assigned: Truscott | Vendor: KSE Supplies (India) | "Manufacturing complete, preparing shipment" | Due: Apr 25 | Status: ON TRACK

**Column 4: In Transit / Shipping**
- Header: "In Transit" with badge "6 orders | $284K"
- Color accent: Purple top border

  Sample cards:
  - Card: "Amazon — Iron Bound Gloves PO#4518" | $62,000 | PPE (blue tag) | Via: Ocean (SC Promo → RIM Freight) | "Departed Ningbo 3/20, ETA Long Beach 4/12" | Tracking: RIM-44521 | Status: ON SCHEDULE
  - Card: "Amazon — Squincher Hydration PO#4522" | $38,000 | PPE (blue tag) | Via: Turkana (domestic) | "Shipped via UPS Ground 3/28" | Tracking: 1Z999... | Status: IN TRANSIT
  - Card: "U of Miami — Event Swag" | $12,000 | Promo | Via: UPS Ground (Unishippers) | "Shipped 3/27, ETA 3/31" | Status: ARRIVING TODAY (green pulse)

**Column 5: Receiving / QC**
- Header: "Receiving / QC" with badge "3 orders | $94K"
- Color accent: Teal top border

  Sample cards:
  - Card: "Amazon — PGK Scan Slings PO#4515" | $52,000 | PPE (blue tag) | "Received at Turkana 3/26 — QC in progress" | "480/500 units inspected, 2 defects found"
  - Card: "Coca-Cola FL — Q2 Drinkware" | $28,000 | Promo | "Received at warehouse 3/28 — checking quantities"

**Column 6: Ready to Ship / Distribute**
- Header: "Ready to Ship" with badge "7 orders | $198K"
- Color accent: Green top border

  Sample cards:
  - Card: "Amazon — Iron Bound Gloves PO#4510" | $72,000 | PPE (blue tag) | "At Turkana — awaiting Amazon DC distribution schedule" | Ship to: 8 DCs per Amazon spreadsheet | Status: WAITING ON AMAZON
  - Card: "Oscar Health — Welcome Kits" | $14,000 | Promo | "Packed at warehouse — pickup scheduled 3/31" | Via: Unishippers
  - Card: "Amazon — Arctic Trax Beanies PO#4508" | $45,000 | PPE (blue tag) | "At warehouse — 3 of 6 DCs shipped, 3 remaining" | Status: PARTIALLY SHIPPED (yellow badge) with progress "3/6 DCs"

**Card design notes for the Kanban:**
- Each card: white bg, thin left border color-coded by business line (green = Promo, blue = PPE/Amazon)
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

  Status icons: 🟢 On track (green dot), 🟡 Attention (yellow dot — customs, weather delay), 🔴 Delayed (red dot)

  **Outbound tab would show:** shipments going to promo clients and individual Amazon DCs with tracking numbers and delivery confirmation status.

  **Amazon DC Distribution tab would show:** a deployment-specific view — PO number, total units, how many DCs, units shipped per DC, units remaining, with a progress visualization.

- Bottom of panel: "Total value in transit: $238,200" | "Avg transit time: 18 days (overseas) / 3 days (domestic)"

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
- SC Promo at 75% on-time is highlighted in red row tint — this matches the known visibility issues with this vendor
- Trend arrows: green down = improving (getting faster), red up = worsening (getting slower)
- Click any vendor row to see detailed order history
- Bottom summary: "Avg on-time across all vendors: 88% | Target: 95%"

---

## Row 4 — Three Panels (equal width, one-third each)

**Panel 1: Amazon Deployment Schedule**
- Card title: "Amazon Deployments" with subtitle "Upcoming distribution schedule" and blue left border accent
- List of upcoming Amazon deployments in chronological order:

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
  - Visual floor plan style graphic or a segmented bar showing space allocation:
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
  - "Carlos Jiron — on site" (if still warehouse)

  **Turkana Overflow:**
  - "Items at Turkana: 14,200 units"
  - "Pending repack jobs: 2"
  - "Scheduled outbound: 3 Amazon deployments"

**Panel 3: At-Risk Orders**
- Card title: "At-Risk Orders" with red left border accent and subtitle "Requires attention"
- List of orders flagged as behind schedule, delayed, or at risk:

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

## Color Palette (consistent with other dashboards)
- Primary Navy: #1B2A4A (sidebar, headers)
- Operations Accent: #7C3AED (purple — used for Operations toggle and production elements)
- Promo Tag: #10B981 (green — promo order cards left border and tags)
- Amazon/PPE Tag: #3B82F6 (blue — PPE order cards left border and tags)
- On Track: #10B981 (green)
- At Risk / Attention: #F59E0B (orange/yellow)
- Delayed / Critical: #EF4444 (red)
- In Transit: #8B5CF6 (purple)
- Receiving / QC: #14B8A6 (teal)
- Ready to Ship: #10B981 (green)
- Background: #F8FAFC (main content area)
- Card Background: #FFFFFF
- Kanban Column Backgrounds: #F8FAFC with colored top border (4px) per stage
- Text Primary: #1E293B
- Text Secondary: #64748B
- Border/Divider: #E2E8F0

## Typography (consistent with other dashboards)
- Dashboard title: 28px bold
- Card titles: 16px semibold
- KPI values: 24px bold
- KPI labels: 12px uppercase, letter-spacing 0.5px, color #64748B
- Kanban column headers: 14px semibold with badge count
- Kanban card title: 13px semibold
- Kanban card details: 12px regular, color #64748B
- Table headers: 12px semibold uppercase
- Table body: 13px regular
- Status badges: 11px semibold, 4px radius, colored background
- Sub-labels: 12px regular, color #64748B

## Design Notes
- All cards: white background, border-radius 8px, box-shadow 0 1px 3px rgba(0,0,0,0.1)
- 16px gap between cards, 24px padding inside cards
- **The Production Pipeline Kanban (Row 2) is the hero section** — it should take up the most vertical space (~400px) and feel like the operational nerve center. Each column should be scrollable if cards overflow.
- Kanban cards have a thin 3px left border: green for Promo, blue for PPE/Amazon
- Delayed cards in the Kanban use a subtle red background tint (#FEF2F2)
- "View Gantt" button in the Kanban header should be prominent — this links to the detailed Gantt chart production module being built separately
- The Amazon Deployment panel uses a blue-tinted background (#F0F7FF) consistent with how Amazon content is styled on the Customer Service dashboard
- Progress bars for Amazon DC distribution: segmented bar where each segment = one DC, filled green when shipped, empty when pending
- Vendor Performance table: row background tints red if on-time <80%, yellow if 80-90%
- At-Risk Orders panel: each order card has either red (behind schedule) or yellow (at risk) left border and matching subtle background tint
- Hover states on all interactive elements
- The overall feel should be like a supply chain control tower — you should be able to see every order, every shipment, every bottleneck at a glance. Think logistics command center that a Director of Operations (Michael Roos) would live in all day.