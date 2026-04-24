# ACTIVATE SWAG — PRODUCT PROFILE PAGE REDESIGN
## Polish the layout, hierarchy, and information density of the product detail page

---

## CONTEXT

This is the product detail / sourcing page inside the Activate Swag CRM (Products → Pipeline → individual product). It powers our Amazon distribution business. The functionality is correct — what needs work is **layout, hierarchy, and visual consistency**. Apply the same dark-theme command center aesthetic used throughout the rest of the Activate Swag system.

The page should feel like a **product command center**, not a form. Every section should earn its space. Patrick's eye should immediately land on (1) what this product is, (2) how complete the sourcing workflow is, (3) the recommended vendor and landed cost, (4) what action is needed next.

---

## GLOBAL DESIGN CHANGES

1. **Apply dark theme throughout** — match the Import Cost Analysis card style across the entire page:
   - Background: `#0A0E1A`
   - Card surface: `#111726` with 1px `#1E2639` borders
   - Section headers in JetBrains Mono uppercase, body in Inter
   - Accent colors: green for cost wins, red for risks, blue for primary actions

2. **Kill the light/flat field cards.** Internal Information, Competitor Analysis, and Vendor Network should all live in the same dark visual system as the Import Cost Analysis card.

3. **Establish hierarchy.** Not every field is equal. The product image, product name, sourcing progress, and recommended landed cost are the hero. Internal admin fields (PM, SKU, HTS code) are reference data.

---

## NEW PAGE LAYOUT (top to bottom)

### 1. HERO BAR (full width, sticky on scroll)

A single dense top strip that consolidates the current scattered header:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Pipeline                                                         │
│                                                                            │
│ [PRODUCT IMAGE]   Barcode Scanner Harness + Lanyard                       │
│   (120x120        ADP-00001  ·  In Progress  ·  Customer: Amazon          │
│   thumbnail,      Vendor: SC Promo (Primary)  ·  PM: Patrick Lowenthal    │
│   click to                                                                 │
│   expand)         ┌──────────────────────────────────────────────────┐    │
│                   │ SOURCING PROGRESS                          0/19 │    │
│                   │ ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%  │    │
│                   │ Vendors 0/3 · Specs 0/4 · Packaging 0/4 · ...   │    │
│                   └──────────────────────────────────────────────────┘    │
│                                                                            │
│                                    [ Order Sample ]  [ Edit Product ]     │
└────────────────────────────────────────────────────────────────────────────┘
```

The product image is **bigger and meaningful**. The progress bar is **the most prominent thing on the page** — it's the single most important number for Patrick managing 100+ products. Sub-progress chips show which sections are blocking completion.

---

### 2. INTELLIGENCE STRIP (3 cards across, full width)

Three high-value summary cards that surface the punchline of the page above the fold. These replace nothing — they aggregate data from below into instant answers.

```
┌──────────────────────┬──────────────────────┬───────────────────────────┐
│ 🏆 RECOMMENDED       │ 💰 BEST LANDED COST  │ ⚠ NEXT ACTION            │
│                      │                      │                           │
│ Self-Import          │ $3.87 / unit         │ Order Sample              │
│ at 20,000 units      │ at 20,000 units      │ from SC Promo             │
│                      │                      │                           │
│ Save $0.71/unit vs   │ vs $25.35 competitor │ Sample not yet requested  │
│ vendor DDP           │ (84.7% margin)       │                           │
│                      │                      │                           │
│ [ View Analysis → ]  │ [ View Pricing → ]   │ [ Order Sample → ]        │
└──────────────────────┴──────────────────────┴───────────────────────────┘
```

These three cards turn the page from a database record into a decision-support tool. Patrick sees the recommendation, the cost win, and the next step in 3 seconds.

---

### 3. TWO-COLUMN MAIN LAYOUT

Below the intelligence strip, split the page into a 2-column grid (60% left / 40% right) instead of the current single-column stack. This gives the page much better information density.

#### LEFT COLUMN (60%)

##### Product Details Card
Replace the current scattered Internal Information grid with one consolidated card that uses **visual hierarchy** — important fields are big, admin fields are small.

```
┌──────────────────────────────────────────────────────┐
│ PRODUCT DETAILS                              [Edit]  │
│                                                      │
│ Barcode Scanner Harness + Lanyard                    │
│ Breakaway Design, Airprene Padding                   │
│                                                      │
│ ── Classification ──                                 │
│ Type: Both (Manufacturer + Distributor)              │
│ HTS Code: 6307.90.9891                               │
│ Duty Rate: 7% base + 25% Section 301 = 32.0%         │
│                                                      │
│ ── Variants ──                                       │
│ Sizes: [S] [L] [XL]                                  │
│                                                      │
│ ── Internal ──                                       │
│ SKU: Squids 3138 · PM: Patrick Lowenthal             │
│ Customer: Amazon · Status: In Progress               │
└──────────────────────────────────────────────────────┘
```

Group fields by purpose (Classification / Variants / Internal). Stop showing every field as an equal-weight card. The duty calculation should be **inline math**, not a separate sub-table.

##### Competitor Analysis Card (promoted)
Pull Competitor Analysis OUT of Internal Information and give it its own card with more depth.

```
┌──────────────────────────────────────────────────────┐
│ 🎯 COMPETITOR ANALYSIS                               │
│                                                      │
│ Ergodyne — Squids 3138                               │
│ Listed at $25.35  ·  ergodyne.com ↗                  │
│                                                      │
│ Our landed cost:    $3.87                            │
│ Competitor price:   $25.35                           │
│ Gross margin:       84.7%                            │
│ Markup multiple:    6.5x                             │
│                                                      │
│ [ Add Competitor ]                                   │
└──────────────────────────────────────────────────────┘
```

Show the math. This is one of the most valuable sections — surface the margin opportunity prominently.

##### Workflow Tabs (the existing tabs, restyled)
Below the two cards above, the existing tab bar — but **bigger, darker, more prominent**, with progress badges built in:

```
┌──────────────────────────────────────────────────────┐
│ [Vendors 0/3]  [Specs 0/4]  [Packaging 0/4]          │
│ [Samples 0/4]  [Files 0/4]  [Chat]  [Timeline]       │
└──────────────────────────────────────────────────────┘
```

Each tab shows its completion ratio inline. The active tab has a glowing accent underline.

---

#### RIGHT COLUMN (40%) — VENDOR & COST INTELLIGENCE

This entire column is dedicated to vendor intelligence. Stack:

##### Vendor Network Card
Compact version of the existing vendor list. Primary on top with star, backup below. Click a vendor → expands inline with pricing tiers + import cost analysis below it (no need for the awkward side-by-side detail panel that gets cut off).

```
┌──────────────────────────────────────────┐
│ VENDOR NETWORK              [+ Link]     │
│ ──────────────────────────────────────── │
│ ⭐ PRIMARY                                │
│ ┌──────────────────────────────────────┐ │
│ │ 🏭 SC Promo                          │ │
│ │ China · Manufacturer                 │ │
│ │                                      │ │
│ │ MOQ 1,000  ·  FOB $2.93  ·  43 days │ │
│ │                                      │ │
│ │ [ View Pricing ]  [ Unlink ]         │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ BACKUP                                   │
│ ┌──────────────────────────────────────┐ │
│ │ 🏢 Egrodyne                          │ │
│ │ United States · Distributor · DROP   │ │
│ │                                      │ │
│ │ [ View Pricing ]  [ Unlink ]         │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

##### Selected Vendor Detail (expands inline below the network)
When a vendor card is clicked/expanded, the pricing tiers AND the Import Cost Analysis appear directly below it — same dark style, full width of the right column. No more disconnected scrolling between vendor → pricing → import analysis.

Keep the existing Import Cost Analysis card design **exactly as-is** — it's the best part of the current page. Just attach it to the selected vendor visually so the relationship is obvious.

---

### 4. STICKY ACTION BAR (bottom of page)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Sourcing Progress: 0/19  ·  Recommended: Self-Import @ $3.87/unit          │
│                                       [ Order Sample ]  [ Save & Continue ]│
└────────────────────────────────────────────────────────────────────────────┘
```

A persistent footer so Patrick always knows the recommendation and next action regardless of scroll position.

---

## SPECIFIC FIXES

1. **Image** — make it 200x200 minimum, click to expand to lightbox. Stop putting it in a giant empty white container.
2. **Progress meter** — promote from corner badge to full-width hero element with sub-section breakdown.
3. **HTS Duty Rate** — collapse into one inline line: `7% base + 25% Section 301 = 32.0%`. No separate row table needed for 3 numbers.
4. **Size Variants** — keep as chips, but inline with classification, not its own card.
5. **Competitor Analysis** — give it its own card with margin calculation, don't bury inside Internal Info.
6. **Vendor pricing table column overflow** — currently the SHIP column gets cut off. Stack the right column wider (40%) so it fits cleanly.
7. **Tabs** — add completion badges inline, increase prominence, dark theme with glowing active state.
8. **Add a Sticky Action Bar** at the bottom with Order Sample / next action.
9. **Consolidate sample order CTA** — currently "Order Sample" appears in the top right but it's the most important action and should also be in the Intelligence Strip and Sticky Bar.
10. **Add an "AI Sourcing Assistant" inline note** somewhere on the right column — something like:
    > 🤖 **APEX:** *"This product is 6.5x markup at recommended landed cost. Strong margin profile. Sample not yet ordered — recommend ordering before locking SC Promo as primary."*

This makes the page feel intelligent, not just a form.

---

## KILL LIST

- ❌ Light/cream backgrounds on info cards
- ❌ Equal-weight field grid for Internal Information
- ❌ Tiny progress circle in the corner
- ❌ Empty white box around the small product image
- ❌ Competitor Analysis buried inside Internal Information
- ❌ Single-column scroll layout
- ❌ Side-by-side vendor list + detail panel that cuts off the pricing table
- ❌ Disconnected Import Cost Analysis card floating below everything

---

## SUMMARY OF CHANGES

| Change | Impact |
|--------|--------|
| Dark theme across entire page | Visual consistency with Import Cost Analysis card |
| Hero bar with big image + prominent progress | Instant orientation, sourcing status visible |
| Intelligence Strip (3 cards) | Decision support above the fold |
| 2-column layout (60/40) | Better density, vendor intel always visible |
| Vendor card → expand inline with pricing + import analysis | Eliminates disconnected scrolling |
| Competitor Analysis promoted to own card | Surfaces margin opportunity |
| Sticky action bar | Always-visible recommendation + next action |
| APEX AI assistant note | Page feels intelligent, not static |

The functionality stays — this is purely a layout, hierarchy, and visual consistency upgrade. Same data, dramatically better page.

---

*Activate Swag — Product Profile Page Redesign v1.0*