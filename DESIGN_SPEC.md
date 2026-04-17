# DESIGN_SPEC — ProductDetails (reference → target)

This spec is derived 1:1 from the reference project at `src/Use as reference/`
so the target `src/components/ProductDetails.tsx` can match it exactly.

All paths below are relative to repo root (`/home/user/AS-CRM/`).

---

## 1. Fonts — families, weights, file paths

### Font families

No custom/webfonts are loaded. The reference relies on **Tailwind v4 defaults**
(system stack). There are **no** `@font-face` rules, **no** `<link>` to Google
Fonts, and **no** font files shipped.

From `src/Use as reference/src/index.css` (4 lines import Tailwind v4; `@source` tells it to scan all tsx/jsx):

```
@import 'tailwindcss' source(none);
@source './**/*.{js,ts,jsx,tsx}';
@import 'tw-animate-css';
@import './styles/globals.css';
```

From `src/Use as reference/index.html` — no font preloads/links.

Resolved stacks (Tailwind v4 defaults, applied via `font-sans` / `font-mono`):

| Token         | Value                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `--font-sans` | `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"` |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` |

Body inherits `font-sans` via `@apply bg-background text-foreground` — see
`src/Use as reference/src/styles/globals.css:128`.

### Font weights

Defined in `src/Use as reference/src/styles/globals.css:25-26` and `:64-65`:

| CSS var                | Value |
| ---------------------- | ----- |
| `--font-weight-normal` | `400` |
| `--font-weight-medium` | `500` |

Used weights (classes actually present in reference `ProductDetails.tsx`):

| Class           | Weight |
| --------------- | ------ |
| `font-normal`   | 400    |
| `font-medium`   | 500    |
| `font-semibold` | 600    |
| `font-bold`     | 700    |

### Base typography (applied to untagged elements)

From `src/Use as reference/src/styles/globals.css:137-181` — a `:where(:not(:has([class*=' text-']), :not(:has([class^='text-']))))` guard auto-styles plain `h1..h4`, `label`, `button`, `input`:

| Element         | Size          | Weight | Line-height |
| --------------- | ------------- | ------ | ----------- |
| `h1`            | `text-2xl`    | 500    | 1.5         |
| `h2`            | `text-xl`     | 500    | 1.5         |
| `h3`            | `text-lg`     | 500    | 1.5         |
| `h4`, `label`, `button` | `text-base` | 500 | 1.5       |
| `input`         | `text-base`   | 400    | 1.5         |

> Important: this guard means any element that has a `text-*` class (even on an
> ancestor) bypasses the auto-styling. ProductDetails uses explicit `text-xs`,
> `text-sm`, etc. everywhere, so these defaults don't apply to it — but they
> still govern untouched elements.

### Root font-size

`src/Use as reference/src/styles/globals.css:4` → `--font-size: 16px`
`src/Use as reference/src/styles/globals.css:183-185` → `html { font-size: var(--font-size); }`

So `1rem = 16px`.

---

## 2. Spacing / sizing scale

Tailwind v4 default scale: `1 = 0.25rem = 4px`. **No customizations** to the
spacing scale are present in the reference.

Scale steps actually used in reference `ProductDetails.tsx`:

| Class  | rem     | px  |
| ------ | ------- | --- |
| `0.5`  | 0.125   | 2   |
| `1`    | 0.25    | 4   |
| `1.5`  | 0.375   | 6   |
| `2`    | 0.5     | 8   |
| `2.5`  | 0.625   | 10  |
| `3`    | 0.75    | 12  |
| `3.5`  | 0.875   | 14  |
| `4`    | 1       | 16  |
| `5`    | 1.25    | 20  |
| `6`    | 1.5     | 24  |
| `7`    | 1.75    | 28  |
| `8`    | 2       | 32  |
| `9`    | 2.25    | 36  |
| `12`   | 3       | 48  |
| `14`   | 3.5     | 56  |
| `16`   | 4       | 64  |
| `20`   | 5       | 80  |
| `96`   | 24      | 384 |

### Arbitrary sizes used (outside default scale)

| Location                                   | Value       |
| ------------------------------------------ | ----------- |
| Progress % number                          | `text-[8px]`  |
| Priority badge label                       | `text-[9px]`  |
| Tab progress badge, small meta text        | `text-[10px]` |
| Progress items text                        | `text-[11px]` |

### Radius scale

From `src/Use as reference/src/styles/globals.css:33, 108-111`:

| Token         | Computed | px  |
| ------------- | -------- | --- |
| `--radius`    | 0.625rem | 10  |
| `--radius-sm` | calc(10 - 4) | 6   |
| `--radius-md` | calc(10 - 2) | 8   |
| `--radius-lg` | 10           | 10  |
| `--radius-xl` | calc(10 + 4) | 14  |

Radius classes used: `rounded` (4px), `rounded-md`, `rounded-lg`, `rounded-xl`,
`rounded-2xl` (16px), `rounded-full`.

### Font-size scale (Tailwind v4 defaults; none overridden)

| Class     | px  | line-height   |
| --------- | --- | ------------- |
| `text-xs` | 12  | 16 (1.333)    |
| `text-sm` | 14  | 20 (1.429)    |
| `text-base` | 16 | 24 (1.5)     |
| `text-lg` | 18  | 28 (1.556)    |
| `text-xl` | 20  | 28 (1.4)      |
| `text-2xl`| 24  | 32 (1.333)    |

### Shadows used

`shadow`, `shadow-sm`, `shadow-lg`, `ring-1`, `ring-2` (Tailwind v4 defaults).

---

## 3. Color tokens

### Design tokens (from `src/Use as reference/src/styles/globals.css:3-42`, light mode)

| Token                   | Value                       |
| ----------------------- | --------------------------- |
| `--background`          | `#ffffff`                   |
| `--foreground`          | `oklch(0.145 0 0)` ≈ `#252525` |
| `--card`                | `#ffffff`                   |
| `--card-foreground`     | `oklch(0.145 0 0)`          |
| `--popover`             | `oklch(1 0 0)` = `#ffffff`  |
| `--popover-foreground`  | `oklch(0.145 0 0)`          |
| `--primary`             | `#030213`                   |
| `--primary-foreground`  | `oklch(1 0 0)` = `#ffffff`  |
| `--secondary`           | `oklch(0.95 0.0058 264.53)` |
| `--secondary-foreground`| `#030213`                   |
| `--muted`               | `#ececf0`                   |
| `--muted-foreground`    | `#717182`                   |
| `--accent`              | `#e9ebef`                   |
| `--accent-foreground`   | `#030213`                   |
| `--destructive`         | `#d4183d`                   |
| `--destructive-foreground` | `#ffffff`                |
| `--border`              | `rgba(0, 0, 0, 0.1)`        |
| `--input`               | `transparent`               |
| `--input-background`    | `#f3f3f5`                   |
| `--switch-background`   | `#cbced4`                   |
| `--ring`                | `oklch(0.708 0 0)`          |
| `--chart-1`             | `oklch(0.646 0.222 41.116)` |
| `--chart-2`             | `oklch(0.6 0.118 184.704)`  |
| `--chart-3`             | `oklch(0.398 0.07 227.392)` |
| `--chart-4`             | `oklch(0.828 0.189 84.429)` |
| `--chart-5`             | `oklch(0.769 0.188 70.08)`  |
| `--sidebar`             | `oklch(0.985 0 0)`          |
| `--sidebar-foreground`  | `oklch(0.145 0 0)`          |
| `--sidebar-primary`     | `#030213`                   |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)`   |
| `--sidebar-accent`      | `oklch(0.97 0 0)`           |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)`    |
| `--sidebar-border`      | `oklch(0.922 0 0)`          |
| `--sidebar-ring`        | `oklch(0.708 0 0)`          |

Dark-mode overrides live in `.dark { ... }` at `globals.css:44-79`.

### Token → Tailwind mapping

`globals.css:81-120` declares an `@theme inline { ... }` block exposing every
var above as a `--color-*` theme token (e.g. `--color-primary: var(--primary)`),
and also `--radius-sm/md/lg/xl`. Tailwind v4 thus generates `bg-primary`,
`text-muted-foreground`, `rounded-lg`, etc. from these.

### Palette colors used in reference `ProductDetails.tsx`

All standard Tailwind v4 palette (defaults — nothing overridden):

| Family   | Shades used                                       |
| -------- | ------------------------------------------------- |
| slate    | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900    |
| blue     | 50, 100, 200, 300, 400, 500, 600, 700              |
| green    | 100, 400, 500, 600, 700                            |
| emerald  | 50, 200, 500, 600                                   |
| red      | 50, 100, 200, 400, 500, 600, 700                   |
| orange   | 400, 500, 600                                       |
| amber    | 50, 200, 500, 700                                   |
| purple   | 50, 100, 500, 600                                   |
| indigo   | 100, 200, 700                                       |

Plus `white`, `black/50` (modal overlay).

Gradients used: `from-slate-50 via-white to-blue-50/30` (page bg),
`from-slate-100 to-slate-50` (image card), `from-slate-700 to-slate-600`
(vendor avatar), `from-blue-600 to-blue-500` (primary badge),
`from-slate-600 to-slate-500` / `from-slate-500 to-slate-400` (backup badges),
`from-green-500 to-emerald-500`, `from-green-400 to-green-500`,
`from-orange-400 to-amber-500`, `from-red-400 to-red-500` (progress bar).

Progress ring stroke colors (inline in `ProductDetails.tsx:437`): `#22c55e`
(green), `#f97316` (orange), `#ef4444` (red), track `#e2e8f0`.

### ActivateSwag scrollbar accents

From `src/Use as reference/src/styles/globals.css:192-335`:

| Element | Gradient / color |
| ------- | ---------------- |
| Default thumb | `linear-gradient(180deg, #475569 0%, #334155 100%)` |
| Default thumb hover | `linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%)` |
| Default thumb active | `linear-gradient(180deg, #22d3ee 0%, #60a5fa 100%)` |
| Sidebar thumb | `rgba(148, 163, 184, 0.25)`, hover `rgba(6, 182, 212, 0.5)` |
| Drawer thumb | `linear-gradient(180deg, #94a3b8 0%, #64748b 100%)` |
| Dropdown thumb | `#cbd5e1`, hover `#06b6d4` |
| Table thumb track | `#f1f5f9` |

Checkbox (same file, lines 340-410) — 18px, 5px radius, 1.5px `#cbd5e1`
border; checked gradient `linear-gradient(135deg, #0e7490 0%, #0891b2 100%)`.

---

## 4. Container max-widths

Used in reference `ProductDetails.tsx`:

| Where                              | Class        | px     |
| ---------------------------------- | ------------ | ------ |
| Main content wrapper (line 490)    | `max-w-7xl`  | 1280   |
| Empty-state copy (lines 744, 923)  | `max-w-sm`   | 384    |
| Unlink confirm modal (line 1062)   | `w-96`       | 384    |

No custom container config — all defaults.

---

## 5. Breakpoints

Tailwind v4 defaults (no overrides in `globals.css`):

| Name  | Min-width |
| ----- | --------- |
| `sm`  | 640px     |
| `md`  | 768px     |
| `lg`  | 1024px    |
| `xl`  | 1280px    |
| `2xl` | 1536px    |

Actually referenced in `ProductDetails.tsx`: **`sm:`**, **`md:`**, **`lg:`**
(no `xl:` / `2xl:` usage). Most responsive rules flip at `sm` and `md`.

Layout pivots:
- Image/Info grid: `grid-cols-1 md:grid-cols-12` (image = `md:col-span-3`, info = `md:col-span-9`).
- Info field cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Page padding: `px-4 sm:px-8 py-4 sm:py-6` (header) / `p-4 sm:p-8` (content).

---

## 6. Tailwind / CSS config

### Tailwind version

`src/Use as reference/package.json:60-63`:

```
"@tailwindcss/vite": "4.1.12",
"tailwindcss": "4.1.12",
"tw-animate-css": "^1.3.8"
```

### Vite plugin

`src/Use as reference/vite.config.ts:20` wires Tailwind via
`@tailwindcss/vite` (not PostCSS):

```ts
plugins: [react(), tailwindcss(), figmaAssetResolver()]
```

### CSS entry & source directive

`src/Use as reference/src/index.css` (all 7 lines):

```css
@import 'tailwindcss' source(none);
@source './**/*.{js,ts,jsx,tsx}';
@import 'tw-animate-css';
@import './styles/globals.css';

@layer base {
  html, body, #root { min-height: 100vh; height: 100%; margin: 0; }
}
```

- `source(none)` disables default auto-scan; `@source './**/*.{js,ts,jsx,tsx}'`
  restricts class scanning to the project's own TSX/JSX files.
- No `tailwind.config.{ts,js,cjs,mjs}` file exists — **all** theme extension is
  inline via `@theme inline { ... }` in `globals.css:81-120`.
- Dark mode: custom variant `@custom-variant dark (&:is(.dark *));`
  (`globals.css:1`).

### Base layer rules

`globals.css:122-131`:

```css
@layer base {
  * { @apply border-border outline-ring/50; }
  body {
    @apply bg-background text-foreground;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

### Theme tokens exposed to utilities (summary)

Colors (inline theme): `background, foreground, card, card-foreground, popover,
popover-foreground, primary, primary-foreground, secondary,
secondary-foreground, muted, muted-foreground, accent, accent-foreground,
destructive, destructive-foreground, border, input, input-background,
switch-background, ring, chart-1..5, sidebar, sidebar-foreground,
sidebar-primary, sidebar-primary-foreground, sidebar-accent,
sidebar-accent-foreground, sidebar-border, sidebar-ring`.

Radii (inline theme): `sm 6px, md 8px, lg 10px, xl 14px`.

### Animations

Provided by `tw-animate-css` (imported in `index.css`). `ProductDetails.tsx`
itself uses `motion/react` (Framer Motion) for hover / layout transitions — no
CSS keyframes are declared in this component.

---

## 7. Current project divergence (for context — not to be changed yet)

- `/home/user/AS-CRM/vite.config.ts` does **not** include `@tailwindcss/vite`;
  Tailwind is not wired as a build plugin. `package.json` has neither
  `tailwindcss` nor `@tailwindcss/vite` as dependencies.
- `/home/user/AS-CRM/src/index.css` is a **6240-line prebuilt Tailwind v4
  stylesheet** (checked in rather than compiled at build time).
- `/home/user/AS-CRM/src/styles/globals.css` is **identical** to the reference
  globals.css (same 410 lines, same tokens, same scrollbar/checkbox rules) — so
  the design tokens already exist in the target, but are not reachable through
  normal `@theme inline` compilation.
- `/home/user/AS-CRM/index.html` lacks the small reset (`<style>html, body {
  height: 100%; margin: 0; } #root { height: 100%; }</style>`) the reference
  inlines.
- `/home/user/AS-CRM/src/components/ProductDetails.tsx` exists but is 996 lines
  vs the reference's 1118 — content will need cross-checking section by section
  during the match pass.

---

## 8. Summary: what a 1:1 UI match requires

1. Keep default Tailwind v4 font stacks — **do not** introduce any webfont.
2. Ensure `--font-size: 16px` is active on `html` (it already is via the shared
   `globals.css`).
3. Preserve the inline theme tokens in `globals.css` (colors + radii).
4. Match every class string in the reference `ProductDetails.tsx` verbatim,
   including the arbitrary `text-[8px]|[9px]|[10px]|[11px]` sizes, the
   `from-*/via-*/to-*` gradient tuples, and the inline stroke colors on the SVG
   progress ring.
5. Layout skeleton:
   - Outer: `flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden`.
   - Header: `bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6 flex-shrink-0`.
   - Body: `flex-1 overflow-y-auto p-4 sm:p-8` → `max-w-7xl mx-auto space-y-4 sm:space-y-6`.
   - Overview grid: `grid-cols-1 md:grid-cols-12`, image `md:col-span-3`, info card `md:col-span-9`.
   - Info fields: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`.
   - Tabs strip: `border-b border-slate-200 px-4 sm:px-6 overflow-x-auto` with `flex gap-4 sm:gap-6 min-w-max`.
   - Tab content: `p-3 sm:p-6`.
6. Ensure the target build actually compiles Tailwind (reference uses
   `@tailwindcss/vite` 4.1.12) — otherwise none of the token-based classes
   (`bg-background`, `text-muted-foreground`, `rounded-xl`, …) will resolve.
   This is a build-wiring prerequisite, not a visual change.
