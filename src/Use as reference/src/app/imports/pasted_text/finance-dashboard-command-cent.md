Figma AI Prompt — Finance Dashboard (Command Center)
Copy everything below this line into Figma AI:

Design a Finance Dashboard called "Command Center" for a B2B distribution company's internal CRM platform. The dashboard serves a CEO/Owner who needs daily visibility into cash position, receivables, payables, revenue by business line, margins, and debt paydown. The design should be clean, modern, data-dense but not cluttered, using a dark navy sidebar (#1B2A4A) with white/light gray main content area. Use the existing brand: "ActivateSwag" with green accent color for the logo area.
Layout Specifications
Overall: Full-width dashboard, 1440px wide. Left sidebar navigation (240px). Main content area with 16px padding. Cards use soft shadows, 8px border radius, white backgrounds. Font: Inter or SF Pro.
Left Sidebar (already exists, keep consistent):

Logo: "ActivateSwag" with subtitle "Command Center"
Navigation items with icons: Dashboard, Analytics, Sales Leads, CRM, Orders, Products, Order Flow, Warehouse, Amazon Distribution, Billing, Email Templates
Active state: highlighted background with white text
Dark navy background (#1B2A4A)

Top Bar:

"Command Center" title with subtitle "Real-time overview of your operations"
Right side: Finance toggle/dropdown button (green, currently selected), notification bell, user avatar with "Patrick Lowenthal" and "patrick@activateswag.com"
Search bar: "Search anything..." with magnifying glass icon


Row 1 — Top KPI Cards (5 cards, equal width, horizontal)
Each card: white background, soft shadow, 8px radius, ~60px height. Icon on right side with colored circular background. Value is large (24px bold). Label above in small gray text (12px). Sub-label below value in smaller text.
Card 1: Cash Balance

Label: "CASH BALANCE"
Value: "$142,350" (large, black, bold)
Sub-label: green arrow up icon + "+$18,200 vs last week" in green text
Icon: Bank/wallet icon on green circle

Card 2: Accounts Receivable

Label: "TOTAL AR OUTSTANDING"
Value: "$487,200" (large, black, bold)
Sub-label: "IPF/Amazon: $412,000 | Promo: $75,200" in gray text
Icon: Invoice/document icon on blue circle

Card 3: AP Due (30 Days)

Label: "AP DUE NEXT 30 DAYS"
Value: "$215,800" (large, black, bold)
Sub-label: "Due this week: $68,400" in orange text
Icon: Calendar/clock icon on orange circle

Card 4: Revenue MTD

Label: "REVENUE (MTD)"
Value: "$583,000" (large, black, bold)
Sub-label: Two small colored pills/badges: "PPE $448,000" in blue pill, "Promo $135,000" in green pill
Icon: Dollar/chart icon on green circle

Card 5: Net Cash Forecast (30d)

Label: "30-DAY CASH FORECAST"
Value: "$94,750" (large, black, bold)
Sub-label: If positive show green text "Sufficient runway". If the value were low, it would show red "WARNING: Below $50K threshold"
Icon: Crystal ball/forecast icon on purple circle


Row 2 — Two Charts Side by Side (equal width)
Left Chart: Cash Flow Forecast (13 Weeks)

Card title: "Cash Flow Forecast" with subtitle "13-week forward projection"
Small toggle in top-right of card: "Weekly | Monthly"
Chart type: Combined bar chart + line overlay
X-axis: Week labels (W1, W2, W3... W13) with month labels below (Apr, May, Jun)
Bars: Green bars for projected inflows (above zero line), Red/coral bars for projected outflows (below zero line)
Line: Dashed blue line overlaying the chart showing projected cash balance (right Y-axis)
A horizontal dashed red line at $50,000 labeled "Minimum threshold"
Key data callout: Small badge on the chart where the biggest Amazon payment is expected, labeled "IPF Payment Expected: $210K"
Legend at bottom: green square "Inflows", red square "Outflows", blue dashed line "Cash Balance"

Right Chart: Revenue by Class (MTD)

Card title: "Revenue by Class" with subtitle "Month-to-date breakdown"
Chart type: Donut chart (center shows total "$583K" in large text with "Total MTD" below)
Two segments: Blue segment for "PPE / Amazon — $448,000 (77%)" and Green segment for "Promo — $135,000 (23%)"
Below the donut: A small "Concentration Alert" banner in light orange/yellow background with warning icon: "PPE at 77% of revenue — Target: <50% by EOY"
Below that: small comparison text "vs. Last Month: PPE 74% | Promo 26%"


Row 3 — Two Data Panels Side by Side (equal width)
Left Panel: AR Aging

Card title: "Accounts Receivable Aging" with a small "View All" link in top-right
Horizontal stacked bar at top showing the aging visually (green for current, yellow for 31-60, orange for 61-90, red for 90+)
Below the bar, a clean table/list:

BucketAmountInvoices% of TotalCurrent (0-30 days)$312,4001864%31-60 days$98,200720%61-90 days$64,100413%90+ days$12,50023%

Separator line
Special callout section with blue/navy background: "IPF/Amazon Receivables"

"Outstanding: $412,000"
"Next Expected Payment: $210,000 on April 15"
"Days Until Payment: 17"
Small progress bar showing how far through the Net 90 cycle



Right Panel: AP Schedule

Card title: "Accounts Payable Schedule" with a small "View All" link in top-right
Three time-bucket sections with amounts:
Due This Week (with red left border accent)

Payroll: $22,400
Parents (Equipment): $20,000
SBA EIDL: $731

Due Next Week (with orange left border accent)

SC Promo Inv: $38,200
Unishippers (UPS): $12,400

Due in 15-30 Days (with gray left border accent)

Turkana Tools: $45,000
SanMar: $8,900
Other vendors: $14,200


Bottom summary bar: "Total Due 30 Days: $215,800" in bold


Row 4 — Two Panels Side by Side (equal width)
Left Panel: Gross Margin by Class

Card title: "Gross Margin by Class" with subtitle "MTD vs Target"
Two horizontal gauge/progress bars:
Promo Gross Margin:

Large percentage: "34.2%" in green
Progress bar filled to 34.2% with a target marker line at 35% labeled "Target: 35%"
Small text below: "vs. Last Month: 33.8% (+0.4 pts)"

PPE Gross Margin:

Large percentage: "18.7%" in blue
Progress bar filled to 18.7%
Small info icon with tooltip text: "Compressed by IPF billing structure. Actual economic margin is higher."
Small text below: "vs. Last Month: 19.1% (-0.4 pts)"

Blended:

"Blended GM%: 24.3%" in gray text, smaller
Small text: "Note: Blended margin declines as PPE grows as % of revenue. Track Promo GM% as the primary health metric."


Below: Small 6-month sparkline chart showing Promo GM% trend (green line) and PPE GM% trend (blue line)

Right Panel: Equipment Debt Tracker

Card title: "Equipment Debt Paydown" with subtitle "Goal: Clear by December 2026"
Large circular progress ring (like a fitness tracker):

Shows 25% complete (visually ~quarter filled in green)
Center text: "$179,000" with "remaining" below
Below the ring: "of $239,000 original balance"


Key stats below the ring in a clean grid:

"Paid to Date: $60,000" with green checkmark
"Monthly Payment: $20,000"
"Projected Payoff: December 2026"
"Months Remaining: 9"


Small progress timeline at bottom showing months (Apr, May, Jun... Dec) with dots, filled dots for completed payments, empty for future


Color Palette

Primary Navy: #1B2A4A (sidebar, headers)
Accent Green: #10B981 (positive values, promo metrics)
Accent Blue: #3B82F6 (PPE metrics, links)
Warning Orange: #F59E0B (AP due soon, caution alerts)
Alert Red: #EF4444 (overdue, negative values, critical alerts)
Purple: #8B5CF6 (forecast/projection elements)
Background: #F8FAFC (main content area)
Card Background: #FFFFFF
Text Primary: #1E293B
Text Secondary: #64748B
Border/Divider: #E2E8F0

Typography

Dashboard title: 28px bold
Card titles: 16px semibold
KPI values: 24px bold
KPI labels: 12px uppercase, letter-spacing 0.5px, color #64748B
Table text: 14px regular
Sub-labels: 12px regular, color #64748B

Design Notes

All cards have: white background, border-radius 8px, box-shadow 0 1px 3px rgba(0,0,0,0.1)
Consistent 16px gap between cards
24px padding inside cards
Interactive elements (View All links, toggles) use the blue accent color
Hover states on table rows with light gray background (#F8FAFC)
The overall feel should be executive-level — not flashy, but confident and data-rich. Think Bloomberg terminal meets modern SaaS dashboard.