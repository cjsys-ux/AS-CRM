# AS-CRM UI QA Fixer — Agent Memory

## Project Overview
- React + Vite + TypeScript SPA
- Styling: Tailwind CSS v4 (utility-first, no CSS Modules/BEM)
- Component library: shadcn/ui (Radix UI primitives) in src/components/ui/
- Animation: motion/react (Framer Motion)
- State: local useState, no global state manager
- Auth: Auth0 + local login hybrid
- Backend: Vercel serverless functions in /api/
- DB: MongoDB + S3 for files

## Design Token System
- CSS custom properties in src/styles/globals.css
- Key tokens: --background, --foreground, --primary (#030213), --secondary, --muted (#ececf0), --accent (#e9ebef), --destructive (#d4183d), --border (rgba 0,0,0,0.1), --radius (0.625rem)
- Sidebar tokens: --sidebar, --sidebar-foreground, --sidebar-primary, --sidebar-accent, --sidebar-border
- No named spacing tokens — uses Tailwind scale directly

## CSS Methodology
- Pure Tailwind utility classes throughout all components
- No BEM, no CSS Modules
- Inline style only used for backgroundImage (grid patterns) and recharts customization

## Breakpoints (Tailwind defaults)
- sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
- Mobile: 375px | Tablet: 768px | Desktop: 1280px+

## Recurring Bug Pattern (CRITICAL)
All module pages use a hardcoded `px-8` (32px) on every section div.
At 375px mobile, with the sidebar hidden and no `px-4 md:px-8` fallback,
content overflows horizontally or gets clipped.
FIX: Replace all module-level `px-8` with `px-4 md:px-8`.

## KPI Grid Pattern Bug
Several modules use `grid-cols-6` or `grid-cols-5` at md breakpoint.
At 768px, this creates columns ≈100px wide — too narrow for card content.
FIX: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` (or similar).

## Flex Header Bug
Module page headers use `flex items-center justify-between` with no `flex-wrap`.
On mobile, the CTA button gets hidden or causes overflow.
FIX: Add `flex-wrap` + `gap-4` to module page header flex containers.

## NaN Display Bug
Modules with empty data arrays (Customers, ProductionModule) compute
stats using `array.reduce() / array.length` without guarding for 0 length.
FIX: Guard with `array.length > 0 ? ... : 0` pattern.

## Module List (all affected by px-8 pattern)
Fixed in 2026-03-04 session:
- Dashboard, ProductPipeline, InventoryModule, ShipmentsModule
- Customers, PurchasingModule, ProductionModule, AnalyticsModule
- SettingsPage, ProfileSettings, VendorsPage, OrdersPage
- DesignLabModule, ContactsModule, ProductDatabaseModule, AmazonDistributionModule

Modules with existing responsive padding (already correct):
- ProductPipeline header (px-4 md:px-8 was already applied)
- PurchasingModule header

## High-Risk Components
- Sidebar.tsx — touching colors or layout could break the entire app chrome
- App.tsx — routing logic, do not alter without care
- src/styles/globals.css — global tokens, scoped fixes preferred

## Baseline / Screenshots
- No screenshot baseline directory exists yet (not configured)
- First audit: 2026-03-04, static code analysis only (no Playwright)

## Git Workflow
- Fix branch: `ui-fix/YYYY-MM-DD-short-slug`
- Never push to main/master
- Commit format: `fix(ui): [ISSUE-ID] description`
- Vercel auto-deploys preview from any pushed branch

## Known Needs-Human-Decision Issues
- None flagged yet in this session
