# Figma AI Prompt — Sales Dashboard (Command Center)

## Copy everything below this line into Figma AI:

---

Design a Sales Dashboard view for the "Command Center" of an internal CRM platform for a B2B distribution company that sells promotional products (corporate branded merchandise) and PPE/safety equipment to Amazon. The company did $7.9M in 2025 revenue and is targeting aggressive growth. The Sales dashboard serves the CEO and sales team — it needs to show real-time pipeline health, how the current month/quarter/year is pacing against last year, where deals are stalling, which clients are growing vs declining, and what the sales team is actually doing day-to-day. The CEO's philosophy: existing clients are the easiest next sale, so client retention and upsell visibility are just as important as new business.

The company has a small sales team: one Account Executive (Tina), one inside sales/biz dev person in the Philippines (Melody), and an external marketing firm. There is no sales leadership — this dashboard IS the sales management layer. It needs to hold the team accountable and surface problems before they become lost revenue.

Keep the existing design system: dark navy sidebar (#1B2A4A), white/light gray content area, "ActivateSwag Command Center" branding. Use a green accent (#10B981) for the "Sales" toggle button.

## Layout Specifications

**Overall:** Full-width dashboard, 1440px wide. Left sidebar navigation (240px). Main content area with 16px padding. Cards use soft shadows, 8px border radius, white backgrounds. Font: Inter or SF Pro.

**Left Sidebar (consistent across all views):**
- Logo: "ActivateSwag" with subtitle "Command Center"
- Same navigation structure
- Dark navy background (#1B2A4A)

**Top Bar:**
- "Command Center" title with subtitle "Real-time overview of your operations"
- Right side: "Sales" dropdown button in green (#10B981), notification bell, user avatar "Patrick Lowenthal"
- Search bar: "Search anything..."

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
- Card title: "Revenue Pacing" with subtitle "2026 vs 2025 — monthly comparison"
- Toggle in top-right: "Total" (selected) | "Promo Only" | "PPE Only"
- Chart type: Grouped bar chart with line overlay
- X-axis: Months (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)
- Two bar groups per month:
  - Dark navy bar: 2025 actual revenue for that month
  - Green bar: 2026 actual revenue (filled for completed months, lighter/projected for future months)
- Line overlay: Dashed line showing 2026 monthly target
- Visual distinction: Completed months have solid green bars, future months have faded/hatched green bars showing projection
- Annotation on current month (March): small callout "On track +41% vs LY"
- For months where 2026 exceeds 2025, show a small green delta label above the bar pair
- Legend: navy square "2025 Actual" | green square "2026 Actual" | light green square "2026 Projected" | dashed line "2026 Target"
- Y-axis: Revenue in $K ($0 to $1.2M range based on Amazon deployment months being high)

**Right Chart: Pipeline by Stage (Funnel)**
- Card title: "Pipeline by Stage" with subtitle "Current active deals"
- Chart type: Horizontal funnel visualization (widest at top, narrowing down)
- Each stage is a horizontal bar with count, value, and conversion rate to next stage:

  | Stage | Deals | Value | Conversion → |
  | Lead Received | 19 | $42,000 | 47% → |
  | Qualified | 8 | $86,000 | 75% → |
  | Order Request (Quoting) | 15 | $189,000 | 80% → |
  | Design Ready (Mockups) | 21 | $615,000 | 85% → |
  | Pending Payment | 6 | $38,000 | 92% → |
  | Closed Won (MTD) | 12 | $318,000 | — |

- Funnel bars color-coded: gradient from light blue (top) to green (bottom/won)
- Conversion rate arrows between each stage
- Highlight problem areas: "Lead Received: 19 deals at $42K — most unsized at $0" with small orange warning icon
- "Design Ready: $615K — largest concentration" with small info icon
- Click any stage to drill into deals

---

## Row 3 — Two Panels Side by Side (55% / 45% split)

**Left Panel (55%): Client Revenue Dashboard**
- Card title: "Client Performance" with subtitle "Top accounts — this year vs last year"
- Filter tabs: "Active Clients" (selected) | "Declining" | "Dormant" | "New"
- Sort dropdown: "Sort by: 2026 Revenue" with options for Revenue, Growth %, Last Order Date

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

  - "Run Rate" = YTD annualized (YTD revenue ÷ months elapsed × 12)
  - Trend arrows: green up = growing, yellow sideways = flat, red down = declining
  - Pinnacle Live row highlighted in light red — hasn't ordered since November, flagged for intervention
  - Securiti row in light yellow — trending down

  **Declining tab would show:** clients with negative YoY trend requiring attention
  **Dormant tab would show:** clients from 2022-2024 who haven't ordered in 6+ months — the reactivation target list (163+ historical clients)
  **New tab would show:** clients who made their first purchase in 2026

- Bottom summary bar: "Active clients: 87 | Growing: 34 | Flat: 28 | Declining: 15 | Dormant (6mo+): 10"
- "Total addressable wallet" callout: "Estimated uncaptured spend from top 20 clients: $1.2M" (the upsell opportunity)

**Right Panel (45%): Top Deals to Watch**
- Card title: "Top Deals in Pipeline" with subtitle "Highest value open opportunities"
- List of top 8-10 deals, sorted by value:

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

  [3-5 more deals following same format]

- Each deal card: white with thin left border (green = promo, blue = PPE)
- Weighted pipeline total at bottom: "Weighted pipeline: $412,000"

---

## Row 4 — Three Panels (equal width, one-third each)

**Panel 1: Sales Team Activity**
- Card title: "Team Activity" with subtitle "Last 7 days"
- Two person sections:

  **Tina Hunter — Account Executive**
  - Small avatar or initials circle
  - Activity metrics in a mini grid:
    - "Emails sent: 28"
    - "Calls logged: 12"
    - "Proposals sent: 4"
    - "Deals closed: 3 ($68K)"
    - "Follow-ups due today: 5" (orange if overdue)
  - Activity sparkline: small 7-day bar chart showing daily activity volume
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

- Bottom: "Unassigned leads: 3" in red text with "Assign Now" button
- "Overdue follow-ups: 7" in orange text

**Panel 2: Lead Source Performance**
- Card title: "Lead Sources" with subtitle "MTD — where are leads coming from?"
- Horizontal bar chart with metrics:

  | Source | Leads | Pipeline $ | Won $ | CAC | ROI |
  | Referral | 4 | $86K | $42K | $0 | ∞ |
  | Existing Client (upsell) | 6 | $124K | $68K | $0 | ∞ |
  | Website / Inbound | 3 | $28K | $0 | ~$200* | TBD |
  | LinkedIn (organic) | 2 | $15K | $0 | $0 | TBD |
  | The One Percent Media | 1 | $4K | $0 | $2,000 | -$2,000 |
  | Cold Outreach (Melody) | 3 | $12K | $0 | ~$500** | TBD |

  *Website CAC estimated from hosting/maintenance
  **Melody CAC = salary / leads generated

- The One Percent Media row highlighted in red tint — $2K/month spend, only 1 lead generated, $0 won. Clear underperformance.
- Referral and Existing Client rows highlighted in green — $0 CAC, highest conversion
- Bottom insight text: "Highest ROI channels: Referrals & Existing Client Upsell. The One Percent Media needs ROI review."

**Panel 3: Monthly Targets & Scorecard**
- Card title: "March Scorecard" with subtitle "Monthly targets vs actual"
- Visual: Series of horizontal progress bars with target markers:

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
- Overall month grade at bottom: large letter grade "B-" in a circle with color (yellow) and text: "On track for revenue but behind on new business and reactivation"

---

## Row 5 — Full Width: Stalled Deals Alert Bar

**This is a slim, full-width alert section — not a full card, more like a notification bar**

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
- Deals stalled >14 days have red text, 7-14 days have orange text
- Total: "5 stalled deals worth $54,500 — these need attention today"

---

## Color Palette (consistent with other dashboards)
- Primary Navy: #1B2A4A (sidebar, headers)
- Sales Accent: #10B981 (green — Sales toggle, won metrics, growth indicators)
- Promo Tag: #10B981 (green)
- Amazon/PPE Tag: #3B82F6 (blue)
- Pipeline Blue: #3B82F6 (pipeline coverage, funnel chart)
- Warning Yellow/Orange: #F59E0B (behind target, stalled deals)
- Alert Red: #EF4444 (declining clients, missed targets, underperforming channels)
- Purple: #7C3AED (deal size, weighted pipeline)
- Won Green: #059669 (darker green for closed won emphasis)
- Background: #F8FAFC
- Card Background: #FFFFFF
- Stalled Deals Bar: #FFFBEB background with #F59E0B left border
- Text Primary: #1E293B
- Text Secondary: #64748B
- Border/Divider: #E2E8F0

## Typography (consistent with other dashboards)
- Dashboard title: 28px bold
- Card titles: 16px semibold
- KPI values: 24px bold
- KPI labels: 12px uppercase, letter-spacing 0.5px, color #64748B
- Comparison text (vs last year): 12px, green/red based on positive/negative
- Table headers: 12px semibold uppercase
- Table body: 13px regular
- Deal card titles: 14px semibold
- Deal card details: 12px regular
- Monthly grade: 48px bold in colored circle
- Sub-labels: 12px regular, color #64748B

## Design Notes
- All cards: white background, border-radius 8px, box-shadow 0 1px 3px rgba(0,0,0,0.1)
- 16px gap between cards, 24px padding inside cards
- **Every KPI card has a "vs last year same period" comparison line.** This is the defining feature of the Sales dashboard — Patrick wants to see growth against 2025 at all times. Green text if positive, red if negative.
- **The Revenue Pacing chart (Row 2 left) is the most important chart on this dashboard.** It should feel prominent and immediately answer "are we ahead or behind last year?" The current month should be visually highlighted.
- The funnel visualization should clearly show where deals are concentrating ($615K in Design Ready is the bottleneck) and conversion rates between stages
- Client Performance table rows are clickable — each row links to full client history
- Pinnacle Live and declining clients should have subtle red row tints to draw attention
- The "Dormant" tab on Client Performance is strategically important — this is the 163+ client reactivation opportunity that APEX (CRO agent) identified as the fastest ROI growth play
- The Lead Source panel should make it visually obvious that The One Percent Media ($2K/month) is underperforming compared to zero-cost channels like referrals and upsells
- The Monthly Scorecard letter grade is a motivational element — it gamifies monthly performance
- The Stalled Deals bar at the bottom is designed to create urgency — these are deals dying from neglect
- Hover states on all interactive elements
- The overall feel should be competitive and performance-driven — like a sales floor leaderboard meets executive dashboard. The team should feel accountable when looking at this.