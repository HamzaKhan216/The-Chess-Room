# Knight's Court — Design System

## Overview

**Knight's Court** is a dark-first chess platform designed around the feeling of playing under a single lamp in a quiet room — intimate, focused, and a little dramatic. The aesthetic departs from chess.com's warm walnut-brown palette entirely, instead using **deep midnight navy** surfaces with **amber/gold** accents. The result feels like a high-end leather-bound chess set rather than a digital game lobby. Every surface, interaction, and piece of typography serves the board — which is always the visual hero.

The layout structure mirrors chess.com closely (board center-left, sidebar right, move list, clocks, controls) but the visual language is wholly distinct: no brown, no green squares, no earth tones.

---

## Colors

### Brand & Accent
| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#D4A843` | Primary CTA buttons, active move highlights, interactive gold |
| `--accent-hover` | `#E8C060` | Hover state — slightly warmer/brighter |
| `--accent-muted` | `#A07830` | Disabled accent, secondary decorative use |
| `--accent-glow` | `rgba(212,168,67,0.18)` | Glowing halos on active squares, focused inputs |

> **Why amber, not green?** Chess.com owns the green-board-green-button combination. Amber reads as prestige, chess clocks, and old tournament halls — it's thematically grounded and visually distinct.

### Surfaces (Dark-First, Navy-Based)
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#0D1117` | Root background — deep midnight, near-black navy |
| `--surface-0` | `#0D1117` | Base: main page background |
| `--surface-1` | `#161B22` | Cards, sidebar panels, game lobby rows |
| `--surface-2` | `#1C2333` | Dropdowns, hovered panels, secondary cards |
| `--surface-3` | `#243048` | Modals, overlays, active context menus |
| `--surface-4` | `#2D3A55` | Tooltips, focused input backgrounds |

> Elevation is communicated through **surface brightness steps**, never shadows on dark. Each step increases brightness by approximately 8–10 lightness units.

### Board Square Colors
| Token | Hex | Role |
|---|---|---|
| `--sq-light` | `#E8DCC8` | Light board squares — aged parchment, ivory |
| `--sq-dark` | `#4A6FA5` | Dark board squares — steel blue, like fine lacquered wood |
| `--sq-highlight-from` | `rgba(212,168,67,0.55)` | Last-move source square |
| `--sq-highlight-to` | `rgba(212,168,67,0.35)` | Last-move destination square |
| `--sq-selected` | `rgba(212,168,67,0.7)` | Currently selected piece square |
| `--sq-legal-move` | `rgba(0,0,0,0.2)` | Legal move dot overlay on empty squares |
| `--sq-legal-capture` | `rgba(212,168,67,0.45)` | Legal capture ring overlay |
| `--sq-check` | `rgba(220,50,50,0.65)` | King-in-check highlight |

> **Board identity is critical.** The `#4A6FA5` steel-blue dark square is the single biggest visual differentiator from chess.com. Light squares use aged parchment (`#E8DCC8`) instead of pure cream. The combination reads as refined and immediately unique.

### Text
| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#F0F6FC` | Headings, player names, primary content |
| `--text-secondary` | `#8B949E` | Move notation, ratings, metadata |
| `--text-muted` | `#484F58` | Timestamps, disabled labels, hints |
| `--text-accent` | `#D4A843` | Active player name, current move in notation |

### Functional
| Token | Hex | Usage |
|---|---|---|
| `--border` | `#21262D` | Panel separators, card edges |
| `--border-subtle` | `#161B22` | Hairline dividers inside components |
| `--success` | `#3FB950` | Win result, connection OK |
| `--warning` | `#D29922` | Low time warning, flagging |
| `--error` | `#DA3633` | Loss by checkmate/resign, disconnection |
| `--info` | `#4A9EDB` | Draw offer, system messages |

---

## Typography

**Import from Google Fonts:**
```
Playfair Display — display headlines only
DM Sans — all UI text, labels, moves
JetBrains Mono — move notation, clock, coordinates
```

### Rationale
- **Playfair Display** brings editorial prestige to game result screens, modal headings, and the app logo. It has the gravitas of a chess book. Do not use it for body text.
- **DM Sans** (from Green Deck) handles all UI chrome — clean, geometric, highly legible at 12–14px on dark backgrounds.
- **JetBrains Mono** is used exclusively for the move list notation (1. e4 e5), clocks (03:42), and coordinate labels (a–h, 1–8). The monospaced column alignment is functionally essential.

### Scale
| Name | Font | Size / Line Height | Weight | Tracking |
|---|---|---|---|---|
| Logo | Playfair Display | 28px / 32px | 700 | -0.02em |
| Hero | Playfair Display | 48px / 56px | 700 | -0.03em |
| Modal Title | Playfair Display | 28px / 36px | 700 | -0.02em |
| Section Title | DM Sans | 18px / 26px | 700 | -0.01em |
| Card Title | DM Sans | 15px / 22px | 700 | 0 |
| Body | DM Sans | 14px / 22px | 400 | 0 |
| Body Small | DM Sans | 12px / 18px | 400 | 0 |
| Label | DM Sans | 11px / 16px | 700 | 0.08em (uppercase) |
| Move Notation | JetBrains Mono | 13px / 20px | 400 | 0 |
| Clock | JetBrains Mono | 36px / 40px | 600 | 0.02em |
| Coordinates | JetBrains Mono | 10px / 10px | 400 | 0 |

---

## Layout & Structure

### Overall Grid
```
┌─────────────────────────────────────────────┐
│  Topnav (56px, --surface-1)                 │
├──────────────────────────┬──────────────────┤
│                          │                  │
│   BOARD AREA             │   SIDEBAR        │
│   (square, flex-center)  │   (320px fixed)  │
│                          │                  │
│                          │  ┌─ Clock ─────┐ │
│                          │  ├─ Move List ─┤ │
│                          │  ├─ Controls ──┤ │
│                          │  └─ Chat ──────┘ │
│                          │                  │
└──────────────────────────┴──────────────────┘
```

- **Topnav**: 56px height, `--surface-1` background, logo left, nav links center, avatar/buttons right.
- **Board Area**: takes remaining width minus sidebar. Board is always a perfect square, centered both axes, max 640px, min 320px.
- **Sidebar**: 320px fixed width, `--surface-1` background, flex column with scrollable move list.
- **Board coordinates** (a–h, 1–8): rendered in `JetBrains Mono 10px`, `--text-muted`, positioned outside the board edge.

### Sidebar Sections (top → bottom)
1. **Opponent info bar** — avatar (40px circle), name, rating, flag, captured pieces
2. **Clock** — large JetBrains Mono, changes color below 10s to `--warning`, below 5s pulses `--error`
3. **Move list** — scrollable, 2-column (white/black), alternating row shading, active move amber-highlighted
4. **Control strip** — icon buttons: ⟨⟨ First | ⟨ Prev | ⟩ Next | ⟩⟩ Last | ⚑ Resign | ½ Offer Draw
5. **Your info bar** — mirrors opponent bar, always at bottom of sidebar

---

## Board

### Rendering
- Board is an **8×8 CSS grid** (no canvas unless performance requires it).
- Each square is a `<div>` with the appropriate `--sq-light` or `--sq-dark` background.
- Pieces are SVG images, 88% of square size, centered, `pointer-events: none`.
- **Coordinate labels** sit just outside the board edges: file letters along the bottom (`a–h`), rank numbers along the left (`1–8`), rendered in `JetBrains Mono 10px --text-muted`.
- A subtle `box-shadow: inset 0 0 0 1px rgba(0,0,0,0.15)` on each square prevents visual bleed between adjacent squares at low resolutions.

### Piece Style
- Use **Staunton SVG pieces** in two-tone style: White pieces are `#F5F0E8` fill with `#1A1A1A` stroke. Black pieces are `#2A2A2A` fill with `#0D0D0D` stroke.
- Drop shadow on each piece: `filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4))`.
- Dragging a piece: scale to `1.15`, slight `z-index` lift, cursor becomes `grabbing`.

### Interaction States
| State | Visual |
|---|---|
| Hover (empty square) | Very subtle `--sq-light`/`--sq-dark` lightening by 8% |
| Square selected | `--sq-selected` overlay (amber 70% opacity) |
| Legal move dot | Small dark circle (20% of square) centered on empty square |
| Legal capture ring | Amber ring at square edge (4px wide) |
| Last move from | `--sq-highlight-from` amber glow |
| Last move to | `--sq-highlight-to` amber glow |
| King in check | `--sq-check` red overlay, subtle pulse animation |
| Pre-move | Purple overlay `rgba(128,0,255,0.35)` on both source and destination |

---

## Components

### Buttons
- **Primary** — `--accent` fill (#D4A843), `#000000` text, 32px height, 20px horizontal padding, `9999px` border-radius (pill), DM Sans 13px weight 700, uppercase tracking 0.06em. Hover: `--accent-hover` fill + scale 1.03.
- **Secondary** — `1px --border` stroke, transparent fill, `--text-primary` text. Hover: `--surface-2` background.
- **Ghost** — text-only, `--text-secondary` color, hover: `--text-primary`.
- **Icon Button** (control strip) — 36px square, `--surface-2` background, 6px border-radius, `--text-secondary` icon. Hover: `--surface-3`, icon turns `--text-primary`.
- **Danger** — `--error` fill, white text. Used for Resign.

### Clocks
```
┌─────────────────────┐
│  03:42              │
└─────────────────────┘
```
- `--surface-2` background, 8px border-radius, 16px/8px padding.
- Font: JetBrains Mono 36px weight 600.
- **Active player clock**: `--surface-3` background + `2px solid --accent` border, text in `--text-primary`.
- **Inactive clock**: `--surface-1` background, text in `--text-muted`.
- **Low time warning** (≤ 10s): text turns `--warning`.
- **Critical time** (≤ 5s): text turns `--error`, border pulses with `animation: pulse-border 0.5s ease-in-out infinite`.

### Move List
- Container: scrollable, `--surface-1` background, `--border` right divider.
- Row: 28px height, DM Sans 13px. Move number in `--text-muted` weight 400. White move text-left, black move text-left in right column.
- **Current move row**: `--accent-glow` background, move text turns `--accent`.
- Alternating rows: even rows use `rgba(255,255,255,0.02)` tint.
- Column widths: `40px` (move number) | `50%` (white) | `50%` (black).
- Special moves (castling O-O, check +, checkmate #) render the symbol in `--accent`.

### Player Info Bar
- 48px height, `--surface-1` background.
- **Avatar**: 36px circle, `2px solid --border` ring. Online indicator: 8px dot, `--success`.
- **Name**: DM Sans 14px weight 700, `--text-primary`.
- **Rating**: DM Sans 13px, `--text-secondary`, in parentheses or after `·` separator.
- **Captured pieces**: miniature SVG piece icons, 16px each, displayed in a flex row with `-4px` overlap (like stacked cards).
- **Material advantage**: `+N` in DM Sans 12px `--text-accent` next to captured pieces if positive.

### Game Lobby Cards (pre-game)
- `--surface-1` background, 12px border-radius, no border.
- Hover: background lightens to `--surface-2`, `transform: translateY(-2px)`, 250ms ease.
- Time control icon (bullet ⚡, blitz 🔥, rapid ⏱, classical ♟) in `--accent`, 24px.
- Label in DM Sans 16px weight 700 `--text-primary`.
- Sub-label (e.g. "1 min") in DM Sans 13px `--text-secondary`.

### Modals (Game Result)
- Overlay: `rgba(13,17,23,0.85)` backdrop, `backdrop-filter: blur(8px)`.
- Panel: `--surface-3` background, 16px border-radius, max-width 440px, centered.
- **Result headline**: Playfair Display 36px, color based on outcome:
  - Win → `--success` (#3FB950)
  - Loss → `--error` (#DA3633)
  - Draw → `--accent` (#D4A843)
- Sub-text (e.g. "by checkmate"): DM Sans 14px `--text-secondary`.
- Buttons stacked vertically: "New Game" (primary), "Rematch" (secondary), "Analysis" (ghost).

### Navigation Topbar
- 56px height, `--surface-1` background, `1px solid --border` bottom.
- **Logo**: "♟ Knight's Court" — knight SVG icon `--accent` + Playfair Display 22px `--text-primary`.
- Nav links: DM Sans 14px weight 700 `--text-secondary`. Active link: `--text-primary` + `2px --accent` underline.
- Right side: XP/streak badge, notification bell, avatar (32px circle with amber ring if in active game).

### Inputs & Search
- 40px height, `--surface-2` background, 6px border-radius, 12px padding.
- `--text-muted` placeholder, `--text-primary` input text.
- No border at rest. Focus: `1.5px solid --accent`.
- Focus glow: `box-shadow: 0 0 0 3px --accent-glow`.

### Tooltips
- `--surface-4` background, `--text-primary` text, 4px border-radius, 8px/12px padding, DM Sans 12px.
- Shadow: `0 4px 12px rgba(0,0,0,0.5)`.
- Appear on 150ms delay to avoid flicker on fast hovers.

---

## Spacing

- **Base unit**: 8px
- **Scale**: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96
- **Component internal padding**: 12px compact, 16px standard, 24px spacious.
- **Section gaps**: 24px between sidebar sections, 40px between major layout zones.
- **Board-to-sidebar gap**: 24px.
- **Sidebar width**: 320px (fixed). Collapses to 0 on mobile (board takes full width, move list goes below).

---

## Border Radius

| Value | Where used |
|---|---|
| 4px | Inputs, individual board-adjacent elements, badges |
| 6px | Icon buttons, chips, info bars |
| 8px | Clocks, move list container, small cards |
| 12px | Modals, lobby cards, player panels |
| 9999px | Pill buttons, avatars, time-control selector |

---

## Elevation System

No shadows on dark surfaces. Elevation = surface brightness.

| Level | Token | Hex | Example |
|---|---|---|---|
| 0 | `--surface-0` | `#0D1117` | Page background |
| 1 | `--surface-1` | `#161B22` | Sidebar, topnav, panels |
| 2 | `--surface-2` | `#1C2333` | Hover state panels, inputs |
| 3 | `--surface-3` | `#243048` | Modals, result overlays |
| 4 | `--surface-4` | `#2D3A55` | Tooltips, top-of-stack elements |

---

## Motion & Animation

- **Default easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out).
- **Duration scale**: 100ms (micro) · 200ms (component) · 350ms (page/modal).
- **Piece movement**: CSS `transition: transform 120ms ease-out` when the board updates from a remote move. User-dragged pieces have no transition.
- **Clock tick** (critical): `@keyframes pulse-border` — 0.5s cycle, amber → transparent → amber on the clock container border.
- **Check flash**: King square gets `@keyframes check-flash` — red opacity 0→0.65→0.65→0 over 400ms on check.
- **Card hover lift**: `transform: translateY(-2px)` + surface brighten, 200ms ease.
- **Modal entry**: `transform: scale(0.95) → 1.0` + `opacity: 0 → 1`, 300ms snappy ease-out.
- **Move list scroll**: Auto-scroll to active move using `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`.

---

## Responsive Behavior

| Breakpoint | Layout change |
|---|---|
| `> 1100px` | Full two-column layout (board + sidebar) |
| `768–1100px` | Sidebar narrows to 260px; clocks shown inline above/below board |
| `< 768px` | Single column: board full-width, sidebar panels collapse below |
| `< 480px` | Coordinates hidden; control strip becomes floating bottom bar |

---

## CSS Variable Reference (Root)

```css
:root {
  /* Accent */
  --accent:           #D4A843;
  --accent-hover:     #E8C060;
  --accent-muted:     #A07830;
  --accent-glow:      rgba(212, 168, 67, 0.18);

  /* Surfaces */
  --bg:               #0D1117;
  --surface-0:        #0D1117;
  --surface-1:        #161B22;
  --surface-2:        #1C2333;
  --surface-3:        #243048;
  --surface-4:        #2D3A55;

  /* Text */
  --text-primary:     #F0F6FC;
  --text-secondary:   #8B949E;
  --text-muted:       #484F58;
  --text-accent:      #D4A843;

  /* Board */
  --sq-light:         #E8DCC8;
  --sq-dark:          #4A6FA5;
  --sq-highlight-from: rgba(212, 168, 67, 0.55);
  --sq-highlight-to:   rgba(212, 168, 67, 0.35);
  --sq-selected:       rgba(212, 168, 67, 0.70);
  --sq-legal-move:     rgba(0, 0, 0, 0.20);
  --sq-legal-capture:  rgba(212, 168, 67, 0.45);
  --sq-check:          rgba(220, 50, 50, 0.65);

  /* Borders */
  --border:           #21262D;
  --border-subtle:    #161B22;

  /* Functional */
  --success:          #3FB950;
  --warning:          #D29922;
  --error:            #DA3633;
  --info:             #4A9EDB;
}
```

---

## Key Differentiators from Chess.com

| Element | Chess.com | Knight's Court |
|---|---|---|
| Dark square color | `#769656` (green) | `#4A6FA5` (steel blue) |
| Light square color | `#EEEED2` / `#F0D9B5` | `#E8DCC8` (aged parchment) |
| Background tone | Warm brown `#312E2B` | Deep navy `#0D1117` |
| Primary accent | Green `#81B64C` | Amber gold `#D4A843` |
| Highlight squares | Green/yellow tints | Amber tints |
| Display font | Proprietary / none | Playfair Display |
| Body font | Source Sans / system | DM Sans |
| Notation font | Monospace generic | JetBrains Mono |
| Surface palette | Brown-gray family | Navy-slate family |
| Button style | Green rounded-rect | Amber pill |

---

## Do's and Don'ts

**Do:**
- Always keep the board the largest, most prominent element on screen.
- Use Playfair Display exclusively for "moment" typography — results, titles, the logo.
- Reserve `--accent` (amber) for interactive affordances only: buttons, active states, selected squares.
- Keep the sidebar minimal — it should feel like a scoresheet, not a control panel.
- Use JetBrains Mono strictly for data that must align: clocks, move notation, coordinates.
- Apply `--sq-check` pulse sparingly — the king in check is the most emotionally important visual event.

**Don't:**
- Don't use brown, tan, beige, or green as any UI surface color — those belong to chess.com.
- Don't use amber for large fills or backgrounds — it should always feel like a highlight, never the canvas.
- Don't use light mode. This is a dark-first system; there is no light theme.
- Don't render move notation in a proportional font — column alignment in the move list requires monospace.
- Don't animate pieces during user drag — only animate opponent moves that arrive from the server.
- Don't overcrowd the board with UI chrome — no floating toolbars over the board surface.
