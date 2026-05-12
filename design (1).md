# Knight's Court — Design System

## Overview

**Knight's Court** is a dark-first chess platform built around cool charcoal-gray surfaces and a deep emerald-green accent. The palette lives in the same family as chess.com — greens and grays — but pulls in the opposite direction on every slider: surfaces are cool-toned charcoal instead of warm brown, the accent is a rich teal-emerald instead of chess.com's yellow-green, and board squares use a deep forest green paired with a cool slate-white instead of the classic olive/cream combo. The result is immediately familiar to chess players, but unmistakably its own identity.

---

## Colors

### Brand & Accent
| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#2DB87A` | Primary CTA buttons, active move highlights, interactive teal-green |
| `--accent-hover` | `#38D68E` | Hover state — brighter, slightly more cyan |
| `--accent-muted` | `#1E8055` | Disabled accent, secondary use |
| `--accent-glow` | `rgba(45,184,122,0.15)` | Focus halos on inputs, active square glow |

> **vs. chess.com:** Their accent is `#81B64C` — a warm yellow-green. Ours is `#2DB87A` — a cooler teal-emerald, rotated ~40° on the hue wheel. Both are greens. They read as completely different.

### Surfaces (Dark-First, Cool Charcoal)
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#161817` | Root background — near-black with a faint green undertone |
| `--surface-0` | `#161817` | Base: main page background |
| `--surface-1` | `#1D211F` | Cards, sidebar panels, topnav |
| `--surface-2` | `#252B28` | Dropdowns, hovered panels, inputs |
| `--surface-3` | `#2E3531` | Modals, context menus, overlays |
| `--surface-4` | `#38403B` | Tooltips, topmost floating elements |

> Surfaces carry a very subtle green cast (hue ~150°). They don't read as green — they read as "rich dark charcoal" — but they harmonize with the green accent rather than clashing. This is the opposite of chess.com's warm brown cast.

### Board Square Colors
| Token | Hex | Role |
|---|---|---|
| `--sq-light` | `#CDD5CC` | Light squares — cool slate-white, slight gray-green tint |
| `--sq-dark` | `#3E6B52` | Dark squares — deep forest green |
| `--sq-highlight-from` | `rgba(45,184,122,0.50)` | Last-move source square |
| `--sq-highlight-to` | `rgba(45,184,122,0.30)` | Last-move destination square |
| `--sq-selected` | `rgba(45,184,122,0.65)` | Selected piece square |
| `--sq-legal-move` | `rgba(0,0,0,0.22)` | Legal move dot on empty squares |
| `--sq-legal-capture` | `rgba(45,184,122,0.40)` | Legal capture ring on occupied squares |
| `--sq-check` | `rgba(215,48,48,0.60)` | King in check overlay |
| `--sq-premove` | `rgba(90,140,255,0.35)` | Pre-move source and destination |

> **Board comparison:**
> - Chess.com dark squares: `#769656` — olive, warm yellow-green
> - Knight's Court dark squares: `#3E6B52` — deep forest green, darker and cooler
> - Chess.com light squares: `#EEEED2` — warm cream with yellow cast
> - Knight's Court light squares: `#CDD5CC` — cool gray-green slate, no yellow

### Text
| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#E8EDE9` | Headings, player names, primary labels |
| `--text-secondary` | `#8F9E94` | Move notation, ratings, metadata |
| `--text-muted` | `#505A54` | Timestamps, disabled labels |
| `--text-accent` | `#2DB87A` | Active player name, current move highlight |

### Functional
| Token | Hex | Usage |
|---|---|---|
| `--border` | `#2A302C` | Panel edges, card dividers |
| `--border-subtle` | `#1E2420` | Hairline internal dividers |
| `--success` | `#2DB87A` | Win result — reuses accent |
| `--warning` | `#E0A040` | Low time, offline mode |
| `--error` | `#D94040` | Loss, errors, disconnection |
| `--info` | `#5A9FD4` | Draw offers, system notices |

---

## Typography

**Import from Google Fonts:**
```
Playfair Display — logo, result screens, modal titles only
DM Sans — all UI chrome, labels, sidebar text
JetBrains Mono — clocks, move notation, board coordinates
```

### Scale
| Name | Font | Size / Line Height | Weight | Notes |
|---|---|---|---|---|
| Logo | Playfair Display | 26px / 32px | 700 | Italic optional |
| Hero | Playfair Display | 48px / 56px | 700 | Result screens |
| Modal Title | Playfair Display | 28px / 36px | 700 | |
| Section Title | DM Sans | 18px / 26px | 700 | `-0.01em` tracking |
| Card Title | DM Sans | 15px / 22px | 700 | |
| Body | DM Sans | 14px / 22px | 400 | |
| Body Small | DM Sans | 12px / 18px | 400 | |
| Label | DM Sans | 11px / 16px | 700 | `0.08em` tracking, uppercase |
| Move Notation | JetBrains Mono | 13px / 20px | 400 | Column-aligned |
| Clock | JetBrains Mono | 36px / 40px | 600 | `0.02em` tracking |
| Coordinates | JetBrains Mono | 10px / 10px | 400 | `--text-muted` color |

---

## Layout & Structure

```
┌────────────────────────────────────────────────┐
│  Topnav (56px, --surface-1)                    │
├───────────────────────────┬────────────────────┤
│                           │                    │
│   BOARD AREA              │   SIDEBAR (320px)  │
│   (square, flex-center)   │                    │
│                           │  ┌─ Opponent ────┐ │
│                           │  ├─ Clock ───────┤ │
│                           │  ├─ Move List ───┤ │
│                           │  ├─ Controls ────┤ │
│                           │  └─ You ─────────┘ │
│                           │                    │
└───────────────────────────┴────────────────────┘
```

- **Topnav**: 56px, `--surface-1`, `1px --border` bottom.
- **Board Area**: Remaining width minus sidebar. Board is always a perfect square, max 640px, centered both axes.
- **Sidebar**: 320px fixed, `--surface-1`, flex column. Move list scrolls in the middle.
- **Coordinates**: `JetBrains Mono 10px --text-muted`, just outside board edges.

---

## Board

### Rendering
- 8×8 CSS grid of `<div>` squares with `--sq-light` / `--sq-dark` backgrounds.
- Pieces are SVG, 88% of square size, centered, `pointer-events: none`.
- `box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12)` on each square to prevent visual bleed.

### Piece Style
- White pieces: `#EEE8DC` fill, `#1A1A1A` stroke, `filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45))`.
- Black pieces: `#222220` fill, `#0A0A0A` stroke, same shadow.
- Dragging: scale `1.12`, `cursor: grabbing`, no transition during drag.
- Server-received moves: `transition: transform 110ms ease-out`.

### Interaction States
| State | Visual |
|---|---|
| Hover | Square lightens ~6% |
| Selected | `--sq-selected` teal-green overlay (65% opacity) |
| Legal move (empty) | Dark dot, 20% of square width, centered |
| Legal capture (occupied) | Teal ring, 4px, inset at square edge |
| Last move source | `--sq-highlight-from` overlay |
| Last move dest | `--sq-highlight-to` overlay |
| Check | `--sq-check` red overlay + `check-pulse` animation |
| Pre-move | `--sq-premove` blue-violet overlay |

---

## Components

### Buttons
- **Primary** — `--accent` (#2DB87A) fill, `#000000` text, 32px height, 20px horizontal padding, `9999px` radius (pill), DM Sans 13px weight 700, uppercase `0.06em` tracking. Hover: `--accent-hover` + `scale(1.03)`.
- **Secondary** — `1px --border` stroke, transparent fill, `--text-primary` text. Hover: `--surface-2` background.
- **Ghost** — text-only, `--text-secondary`. Hover: `--text-primary`.
- **Icon Button** — 36px square, `--surface-2` bg, 6px radius. Hover: `--surface-3`.
- **Danger** — `--error` fill, white text. Used for Resign only.

### Clocks
- `--surface-2` background, 8px radius, 16px/8px padding.
- Font: JetBrains Mono 36px weight 600, `--text-primary`.
- **Active clock**: `--surface-3` background + `2px solid --accent` border.
- **Inactive clock**: `--surface-1` background, text `--text-muted`.
- **≤ 10s**: text → `--warning` (#E0A040).
- **≤ 5s**: text → `--error`, border pulses: `animation: pulse-border 0.5s ease-in-out infinite`.

### Move List
- Container: `--surface-1` background, scrollable, `--border` right divider.
- Row: 28px height, JetBrains Mono 13px.
- Move number: `--text-muted` weight 400. Move text: `--text-secondary`.
- **Active move row**: `rgba(45,184,122,0.12)` background, text → `--accent`.
- Even rows: `rgba(255,255,255,0.02)` tint.
- Columns: `40px` (number) | `50%` (white move) | `50%` (black move).
- Check `+` and mate `#` symbols: `--accent` color.

### Player Info Bar
- 48px height, `--surface-1` bg.
- Avatar: 36px circle, `2px solid --border`. Online dot: 8px, `--success`.
- Name: DM Sans 14px weight 700, `--text-primary`.
- Rating: DM Sans 13px `--text-secondary`.
- Captured pieces: 16px SVG icons, `-4px` overlap, flex row.
- Material advantage: `+N` in DM Sans 12px `--text-accent`.

### Game Lobby Cards
- `--surface-1` bg, 12px radius. Hover: `--surface-2` + `translateY(-2px)` 200ms ease.
- Time control label: DM Sans 16px weight 700 `--text-primary`.
- Sublabel: DM Sans 13px `--text-secondary`.
- Active/selected card: `2px solid --accent` border.

### Game Result Modal
- Backdrop: `rgba(22,24,23,0.88)` + `backdrop-filter: blur(8px)`.
- Panel: `--surface-3` bg, 16px radius, max-width 440px.
- Headline: Playfair Display 36px:
  - Win → `--success` (#2DB87A)
  - Loss → `--error` (#D94040)
  - Draw → `--warning` (#E0A040)
- Sub-text: DM Sans 14px `--text-secondary`.
- Actions stacked: "New Game" (primary), "Rematch" (secondary), "Analysis" (ghost).

### Topnav
- 56px, `--surface-1`, `1px --border` bottom.
- Logo: knight SVG in `--accent` + "Knight's Court" Playfair Display 22px `--text-primary`.
- Nav links: DM Sans 14px weight 700 `--text-secondary`. Active: `--text-primary` + `2px --accent` underline.
- Right: avatar 32px circle with `2px --accent` ring when game is active.

### Inputs
- 40px height, `--surface-2` bg, 6px radius, 12px padding.
- Placeholder: `--text-muted`. Input text: `--text-primary`.
- Rest state: no border. Focus: `1.5px solid --accent` + `box-shadow: 0 0 0 3px var(--accent-glow)`.

### Chips / Filter Pills
- `--surface-2` bg, 9999px radius, DM Sans 13px, `--text-secondary`, 4px/12px padding.
- Selected: `--accent` bg, `#000` text.

### Tooltips
- `--surface-4` bg, `--text-primary`, 4px radius, DM Sans 12px, 8px/12px padding.
- Shadow: `0 4px 12px rgba(0,0,0,0.5)`. Delay 150ms before show.

---

## Spacing

- **Base unit**: 8px
- **Scale**: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
- **Component padding**: 12px compact · 16px standard · 24px spacious
- **Section gaps**: 24px between sidebar sections
- **Board-to-sidebar gap**: 24px
- **Sidebar width**: 320px fixed

---

## Border Radius

| Value | Where used |
|---|---|
| 4px | Small badges, board-adjacent elements |
| 6px | Icon buttons, chips, info bars |
| 8px | Clocks, move list, small cards |
| 12px | Lobby cards, modals, player panels |
| 9999px | Pill buttons, search bar, avatars |

---

## Elevation System

No shadows. Elevation = surface brightness.

| Level | Token | Hex | Example |
|---|---|---|---|
| 0 | `--surface-0` | `#161817` | Page background |
| 1 | `--surface-1` | `#1D211F` | Sidebar, topnav |
| 2 | `--surface-2` | `#252B28` | Inputs, hover panels |
| 3 | `--surface-3` | `#2E3531` | Modals, overlays |
| 4 | `--surface-4` | `#38403B` | Tooltips |

---

## Motion & Animation

- **Default easing**: `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Duration scale**: 100ms micro · 200ms component · 350ms modal/page.
- **Piece moves** (server): `transition: transform 110ms ease-out`. No transition on user drag.
- **Clock pulse** (≤ 5s): `@keyframes pulse-border` — 0.5s cycle, accent → transparent → accent.
- **Check flash**: `@keyframes check-flash` — red opacity 0→0.65→0.65→0 over 400ms.
- **Card hover lift**: `translateY(-2px)` + surface brighten, 200ms ease.
- **Modal entry**: `scale(0.95) → 1.0` + `opacity 0 → 1`, 300ms.
- **Move list**: `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` on active move change.

---

## Responsive Behavior

| Breakpoint | Layout |
|---|---|
| `> 1100px` | Full two-column (board + sidebar) |
| `768–1100px` | Sidebar narrows to 260px; clocks inline above/below board |
| `< 768px` | Single column; board full-width; sidebar panels stack below |
| `< 480px` | Coordinates hidden; controls become floating bottom bar |

---

## CSS Variables — Full Root Block

```css
:root {
  /* Accent */
  --accent:              #2DB87A;
  --accent-hover:        #38D68E;
  --accent-muted:        #1E8055;
  --accent-glow:         rgba(45, 184, 122, 0.15);

  /* Surfaces */
  --bg:                  #161817;
  --surface-0:           #161817;
  --surface-1:           #1D211F;
  --surface-2:           #252B28;
  --surface-3:           #2E3531;
  --surface-4:           #38403B;

  /* Text */
  --text-primary:        #E8EDE9;
  --text-secondary:      #8F9E94;
  --text-muted:          #505A54;
  --text-accent:         #2DB87A;

  /* Board */
  --sq-light:            #CDD5CC;
  --sq-dark:             #3E6B52;
  --sq-highlight-from:   rgba(45, 184, 122, 0.50);
  --sq-highlight-to:     rgba(45, 184, 122, 0.30);
  --sq-selected:         rgba(45, 184, 122, 0.65);
  --sq-legal-move:       rgba(0, 0, 0, 0.22);
  --sq-legal-capture:    rgba(45, 184, 122, 0.40);
  --sq-check:            rgba(215, 48, 48, 0.60);
  --sq-premove:          rgba(90, 140, 255, 0.35);

  /* Borders */
  --border:              #2A302C;
  --border-subtle:       #1E2420;

  /* Functional */
  --success:             #2DB87A;
  --warning:             #E0A040;
  --error:               #D94040;
  --info:                #5A9FD4;
}
```

---

## Side-by-Side: Knight's Court vs. Chess.com

| Element | Chess.com | Knight's Court | Difference |
|---|---|---|---|
| Background | Warm brown `#312E2B` | Cool charcoal `#161817` | Same dark family, opposite temperature |
| Surfaces | Brown-gray `#272522` | Cool gray-green `#1D211F` | Green undertone vs brown undertone |
| Accent | Yellow-green `#81B64C` | Teal-emerald `#2DB87A` | ~40° hue shift, much cooler |
| Dark squares | Olive `#769656` | Forest `#3E6B52` | Darker, cooler, less yellow |
| Light squares | Warm cream `#EEEED2` | Cool slate `#CDD5CC` | Gray-green vs yellow-white |
| Highlights | Yellow tint | Teal tint | Matches accent, not clashing |

---

## Do's and Don'ts

**Do:**
- Keep the board the biggest element — everything else is supporting cast.
- Use `--accent` only for interactive states: buttons, selected squares, active move, active clock border.
- Use JetBrains Mono strictly for data that must align: clocks, notation, coordinates.
- Use Playfair Display only for high-drama moments: logo, result headline, modal title.
- Let surface elevation do the work — no box-shadow to communicate hierarchy.

**Don't:**
- Don't use warm brown or yellow tones anywhere — that's chess.com's territory.
- Don't use `--accent` as a fill for large surface areas — highlight, never canvas.
- Don't animate pieces during user drag — only animate moves arriving from the server.
- Don't use light mode. Dark-first, no light theme variant.
- Don't render move notation in a proportional font — column alignment requires monospace.
- Don't put UI chrome over the board surface — no floating toolbars, no overlaid menus.
