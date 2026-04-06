Figma AI Prompt — Customer Service Dashboard (Command Center)
Copy everything below this line into Figma AI:

Design a Customer Service Dashboard view for the "Command Center" of an internal CRM platform for a B2B distribution company that handles both promotional products (corporate branded merchandise) and PPE/safety equipment for Amazon distribution centers. The dashboard serves a CEO and operations team who need to see all open issues, their severity, resolution progress, and any escalations — especially for high-value Amazon/PPE accounts where service failures can jeopardize the entire business relationship.
Keep the existing design system: dark navy sidebar (#1B2A4A), white/light gray content area, "ActivateSwag Command Center" branding, same navigation structure, and a "Customer Service" toggle button in the top-right (coral/red-orange accent color to distinguish from the green Finance view).
Layout Specifications
Overall: Full-width dashboard, 1440px wide. Left sidebar navigation (240px). Main content area with 16px padding. Cards use soft shadows, 8px border radius, white backgrounds. Font: Inter or SF Pro.
Left Sidebar (consistent across all dashboard views):

Logo: "ActivateSwag" with subtitle "Command Center"
Navigation items with icons: Dashboard (active), Analytics, Sales Leads, CRM, Orders, Products, Order Flow, Warehouse, Amazon Distribution, Billing, Email Templates
Dark navy background (#1B2A4A)

Top Bar:

"Command Center" title with subtitle "Real-time overview of your operations"
Right side: "Customer Service" dropdown button in coral/red-orange (#F97066), notification bell with red badge showing "3", user avatar with "Patrick Lowenthal"
Search bar: "Search anything..."


Row 1 — Top KPI Cards (5 cards, equal width, horizontal)
Each card: white background, soft shadow, 8px radius. Icon on right side with colored circular background. Value is large (24px bold). Label above in small gray text (12px uppercase). Sub-label below in smaller text with context.
Card 1: Open Tickets

Label: "OPEN TICKETS"
Value: "14" (large, black, bold)
Sub-label: Two small pills: "Promo: 9" in green pill, "Amazon: 5" in blue pill
Small red text below pills: "3 unassigned" with warning icon
Icon: Ticket/support icon on coral circle

Card 2: Urgent / Critical

Label: "URGENT ISSUES"
Value: "3" (large, red #EF4444, bold)
Sub-label: "1 Amazon DC complaint • 1 misprint • 1 lost shipment"
Subtle pulsing red dot animation next to the value to draw attention
Icon: Alert/fire icon on red circle

Card 3: Avg Resolution Time

Label: "AVG RESOLUTION TIME"
Value: "2.4 days" (large, black, bold)
Sub-label: green arrow down + "Improved from 3.1 days last month" in green text
Icon: Clock/timer icon on green circle

Card 4: Resolved This Week

Label: "RESOLVED THIS WEEK"
Value: "8" (large, black, bold)
Sub-label: "Promo: 5 | Amazon: 3" in gray text
Below that: small bar showing weekly target progress — "8 of 12 target" with a 67% filled progress bar
Icon: Checkmark/circle icon on green circle

Card 5: SLA Compliance

Label: "SLA COMPLIANCE (MTD)"
Value: "87%" (large, bold — in orange because it's below 95% target)
Sub-label: "Target: 95% — 2 tickets breached SLA this month"
Small progress ring instead of icon: 87% filled ring in orange on white
Icon: Shield/compliance icon on orange circle


Row 2 — Two Charts Side by Side (equal width)
Left Chart: Tickets by Category

Card title: "Open Tickets by Category" with subtitle "Current active issues"
Chart type: Horizontal bar chart, sorted by count descending
Two color groups — green-toned bars for Promo issues, blue-toned bars for Amazon issues
Categories and sample counts:
Promo Issues (green tones):

Vendor Out of Stock / Item Replacement: 3 (bar label: "Need alt sourcing")
Shipping Delay: 2
Production Delay: 2
Misprint / Decoration Error: 1
Wrong Item Delivered: 1

Amazon Issues (blue tones):

DC Order Not Received: 2
Short / Missing Units: 2
Wrong Item Received: 1


Each bar is clickable (show pointer cursor hint)
Legend at bottom: green square "Promo" | blue square "Amazon/PPE"

Right Chart: Ticket Trend (8 Weeks)

Card title: "Ticket Volume Trend" with subtitle "Last 8 weeks — opened vs resolved"
Chart type: Line chart with two lines
Green line: "Resolved" (trending upward)
Coral/red line: "Opened" (relatively flat or slightly declining)
Area fill under each line with low opacity
X-axis: Week labels (W1 through W8 with date ranges)
Y-axis: Ticket count (0 to 20)
The goal is for the green line to consistently be above the red line (resolving more than opening)
If green is above red, show a small "Trending positive" badge in green in top-right of chart
Small annotation on the chart where there was a spike: "Amazon deployment week — higher volume expected"


Row 3 — Two Panels Side by Side (60% / 40% split)
Left Panel (60%): Active Tickets

Card title: "Active Tickets" with filter chips: "All" (selected), "Promo", "Amazon", "Urgent Only"
Sort dropdown in top-right: "Sort by: Priority" with options for Priority, Age, Client
Table with the following columns:
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
Priority indicators: Red circle = Urgent, Yellow circle = High, Blue circle = Normal, Gray circle = Low
Status badges with colored backgrounds: "New" (blue), "In Progress" (yellow), "Investigating" (purple), "Escalated" (red), "Waiting on Vendor" (orange), "Sourcing" (teal), "Monitoring" (gray)
Row hover: light gray background
Click arrow on each row to expand details
Bottom of table: pagination "Showing 9 of 14 tickets" with page controls

Right Panel (40%): Amazon Issues — Priority View

Card title: "Amazon / PPE Issues" with a red accent left border and subtitle "These impact the IPF relationship — resolve with urgency"
This panel isolates Amazon-specific issues because they carry disproportionate business risk
Card style: slightly different from other cards — has a very subtle blue-tinted background (#F0F7FF) to distinguish
List of Amazon issues only, in priority order, with more detail:
Issue 1: (Red urgent badge)

"DEN4 — PO #4521 Not Received"
"Shipped 3/15 via UPS • Tracking: 1Z999AA10123456784"
"Amazon contact: Sarah Kim (denver-dc@amazon.com)"
"Owner: Michael Roos"
"Action needed: File UPS claim, provide Amazon with proof of delivery"
Age badge: "3 days" in red

Issue 2: (Yellow high badge)

"SBD1 — Short Shipment (20 units)"
"PO #4518 • Iron Bound Safety Gloves SKU IBS-2240"
"Received 480 of 500"
"Owner: Michael Roos"
"Action needed: Ship replacement 20 units within 48 hours"
Age badge: "2 days" in yellow

Issue 3: (Yellow high badge)

"ONT6 — Wrong Item Received"
"PO #4512 • Ordered Arctic Trax thermal, received Scan Sling holsters"
"Owner: Truscott Miller"
"Action needed: Arrange return pickup, expedite correct shipment"
Age badge: "1 day" in yellow


Bottom of panel: summary stats in a small gray bar:

"5 Amazon issues MTD | Avg resolution: 3.2 days | 0 unresolved past SLA"




Row 4 — Three Small Panels (equal width, one-third each)
Panel 1: Team Workload

Card title: "Team Workload"
Visual: Small horizontal bar chart or avatar + count list

Michael Roos: 4 tickets (bar filled, showing capacity)
Tina Hunter: 3 tickets
Liz (PH): 4 tickets
Melody (PH): 2 tickets
Truscott Miller: 1 ticket
Unassigned: 3 tickets (shown in red)


Capacity indicator: If someone has 5+ tickets, show orange "At capacity" tag
"Unassigned: 3" should be highlighted in red with a "Assign Now" action button

Panel 2: Resolution by Issue Type

Card title: "Resolution Rates by Type" with subtitle "Last 30 days"
Visual: Small table or mini horizontal bars
| Issue Type | Resolved | Avg Time | Trend |
| Vendor OOS | 6 | 3.1 days | ↓ improving |
| Shipping Delay | 5 | 1.8 days | → stable |
| Production Delay | 3 | 5.2 days | ↑ worsening |
| Misprint/Error | 2 | 4.0 days | → stable |
| Amazon DC Issues | 4 | 2.8 days | ↓ improving |
Trend arrows: green down arrow = improving, gray arrow = stable, red up arrow = worsening
"Production Delay" row highlighted in light red because it's worsening

Panel 3: Recent Activity Feed

Card title: "Activity Log" with subtitle "Latest updates"
Scrollable feed of recent actions, newest first:

"10:42 AM — Tina added note to #CS-1247: 'Vendor reprinting 500 units, new ETA April 4'"
"10:15 AM — Michael escalated #CS-1245 to UPS claims department"
"9:30 AM — Liz created ticket #CS-1248: Oscar Health — SanMar out of stock"
"9:12 AM — Melody resolved #CS-1238: Replacement item approved by client"
"Yesterday 4:45 PM — Truscott assigned to #CS-1246: Amazon SBD1 short shipment"
"Yesterday 2:30 PM — System alert: SLA breach on #CS-1240 (resolved 6 hours late)"


Each entry has a small avatar/icon for the person, timestamp, and action text
SLA breach entries highlighted in light red background
"View full log" link at bottom


Color Palette (consistent with Finance dashboard)

Primary Navy: #1B2A4A (sidebar, headers)
Customer Service Accent: #F97066 (coral/red-orange — used for the dashboard toggle and urgent elements)
Accent Green: #10B981 (resolved, improving, positive)
Accent Blue: #3B82F6 (Amazon/PPE issues, normal priority, info)
Warning Orange: #F59E0B (high priority, at capacity, SLA risk)
Alert Red: #EF4444 (urgent, overdue, SLA breach, unassigned)
Purple: #8B5CF6 (investigating status)
Teal: #14B8A6 (sourcing status)
Background: #F8FAFC (main content area)
Amazon Panel Background: #F0F7FF (subtle blue tint)
Card Background: #FFFFFF
Text Primary: #1E293B
Text Secondary: #64748B
Border/Divider: #E2E8F0

Typography (consistent with Finance dashboard)

Dashboard title: 28px bold
Card titles: 16px semibold
KPI values: 24px bold
KPI labels: 12px uppercase, letter-spacing 0.5px, color #64748B
Table headers: 12px semibold uppercase, color #64748B
Table body: 13px regular
Status badges: 11px semibold, 4px border-radius, colored background with white or dark text
Activity feed: 13px regular, timestamps in 12px color #94A3B8
Sub-labels: 12px regular, color #64748B

Design Notes

All cards have: white background, border-radius 8px, box-shadow 0 1px 3px rgba(0,0,0,0.1)
Consistent 16px gap between cards
24px padding inside cards
The Amazon Issues panel has a 3px left border in #3B82F6 (blue) and a subtle blue-tinted background to visually separate it as the highest-priority section
Urgent KPI card (#2) should feel slightly more prominent — could use a very subtle red-tinted background (#FEF2F2) or a thin red top border
Priority circles in the table: 🔴 = 10px filled circle in #EF4444, 🟡 = #F59E0B, 🔵 = #3B82F6, ⚪ = #94A3B8
Status badges should use colored backgrounds with rounded corners: New (#DBEAFE blue bg, #1E40AF text), In Progress (#FEF3C7 yellow bg, #92400E text), Investigating (#EDE9FE purple bg, #5B21B6 text), Escalated (#FEE2E2 red bg, #991B1B text), Waiting on Vendor (#FFEDD5 orange bg, #9A3412 text), Sourcing (#CCFBF1 teal bg, #115E59 text), Monitoring (#F1F5F9 gray bg, #475569 text)
The Activity Log should have a max-height with scroll, showing about 6 entries visible
Hover states on table rows with light gray background
The overall feel should be operationally urgent but organized — a command center where nothing slips through the cracks. Think air traffic control for customer issues.