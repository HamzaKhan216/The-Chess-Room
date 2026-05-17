# BrilliantChess — Analyze Tab Design System

## 1. Philosophy

BrilliantChess uses a **dark-first, navy-based** design. Every surface is a step in a brightness ladder — no box shadows on dark backgrounds. The **amber gold** accent (`#D4A843`) is reserved exclusively for interactive affordances: active states, primary CTAs, highlights, and borders on focus. It must never fill a large surface.

The analyze tab is the heart of the app. The board is always the visual hero. Every other element — sidebar, move list, evaluation bar, controls — exists to serve it.

---

## 2. Tailwind Token Reference

These are the **actual class names used in the codebase**. Always use these — never hardcode hex values in className strings.

### Surface / Background Tokens
| Tailwind Class | CSS Variable | Hex | Usage |
|---|---|---|---|
| `bg-background` / `bg-backgroundBoxDarker` | `--surface-0` | `#0D1117` | Root page background, "best move" bar |
| `bg-backgroundBox` | `--surface-1` | `#161B22` | Main panels, sidebar, nav, cards |
| `bg-backgroundBoxHover` | `--surface-2` | `#1C2333` | Hover states on panels |
| `bg-backgroundBoxBox` | `--surface-1` | `#161B22` | Inputs, dropdowns, nested card surfaces |
| `bg-backgroundBoxBoxHover` | `--surface-2` | `#1C2333` | Hover on nested surfaces |
| `bg-backgroundBoxBoxDisabled` | `rgba(36,48,72,0.2)` | — | Disabled/subtle inset areas |
| `bg-backgroundProfileBlack` | `--surface-1` | `#161B22` | Toggle-group pill wrapper, sub-containers |
| `bg-backgroundBoxBoxHighlighted` | `--accent` | `#D4A843` | **Primary CTA fill, active toggle state** |
| `bg-backgroundBoxBoxHighlightedHover` | `--accent-hover` | `#E8C060` | Primary CTA hover fill |

### Text Tokens
| Tailwind Class | CSS Variable | Hex | Usage |
|---|---|---|---|
| `text-foreground` | `--text-primary` | `#F0F6FC` | Primary content, headings, active elements |
| `text-foregroundGrey` | `--text-secondary` | `#8B949E` | Labels, secondary content, inactive moves |
| `text-foregroundHighlighted` | `--accent` | `#D4A843` | Active move in list, hover states, links |
| `text-foregroundBlack` | `--text-muted` | `#484F58` | Timestamps, disabled, hints |

### Border Tokens
| Tailwind Class | CSS Variable | Hex | Usage |
|---|---|---|---|
| `border-border` | `--border` | `#21262D` | Panel edges, input default state |
| `border-borderHighlighted` | `--accent` | `#D4A843` | Input focus, active depth button |
| `border-neutral-600` | — | `#525252` | Section divider `<hr>` elements |
| `border-neutral-700` | — | `#404040` | Secondary borders in modals |
| `border-neutral-800` | — | `#262626` | Subtle card outlines |
| `border-transparent` | — | transparent | Toggle-group pill wrapper (no visible border) |

### Radius Tokens
| Tailwind Class | CSS Variable | Value | Usage |
|---|---|---|---|
| `rounded-borderRoundness` | `--borderRoundness` | `4px` | Inputs, buttons, cards, move list items |
| `rounded-borderExtraRoundness` | `--borderExtraRoundness` | `8px` | Loading cards, modal panels |
| `rounded-lg` | — | `8px` | Toggle-group pill wrappers |
| `rounded-md` | — | `6px` | Individual toggle buttons inside pill |
| `rounded-full` | — | `9999px` | Toggle switches, spinner, avatars |

### Move Rating Color Tokens
| Tailwind Class | Hex | Move Type |
|---|---|---|
| `text-highlightBrilliant` | `#04b8ad` | Brilliant |
| `text-highlightGreat` | `#5c8bb0` | Great |
| `text-highlightBest` / `text-highlightExcellent` | `#96bc4b` | Best / Excellent |
| `text-highlightGood` | `#95af8a` | Good |
| `text-highlightBook` | `#a98866` | Book move |
| `text-highlightInaccuracy` | `#f7c045` | Inaccuracy |
| `text-highlightMistake` | `#e58f2a` | Mistake |
| `text-highlightMiss` | `#ee6b55` | Miss |
| `text-highlightBlunder` | `#ca3531` | Blunder |

### Functional Colors
| Tailwind Class | CSS Variable | Hex | Usage |
|---|---|---|---|
| `bg-winGreen` | `--success` | `#3FB950` | Win result indicator |
| `bg-lossRed` | `--error` | `#DA3633` | Loss result indicator, error toasts |
| `text-warning` | `--warning` | `#D29922` | Warning toasts |
| `fill-backgroundBoxBoxHighlighted` | `--accent` | `#D4A843` | SVG fills (lens icon, arrows) |

---

## 3. Layout & Breakpoints

### Breakpoints (from `tailwind.config.ts`)
| Name | px | Effect |
|---|---|---|
| `navTop` | 516px | Nav moves from side to top |
| `vertical` | 1100px | Board + sidebar go side-by-side |
| `reduceNav` | 1280px | Nav shows text labels |
| `reduceSummary` | 1669px | Summary switches to compact layout |

### Overall Structure (≥ 1100px `vertical`)
```
┌─────────────────────────────────────────────────────┐
│  NAV (left sidebar, flex-col, bg-backgroundBox)     │
├───────────────────────┬─────────────────────────────┤
│                       │                             │
│   GAME AREA           │   MENU PANEL                │
│   (board + eval bar)  │   max-w-[500px]             │
│                       │   min-w-[400px]             │
│                       │   bg-backgroundBox          │
│                       │                             │
└───────────────────────┴─────────────────────────────┘
```

### Menu Panel Inner Structure (top → bottom)
```
┌─────────────────────────────┐
│  TAB BAR (menu tabs)        │
├─────────────────────────────┤
│  TAB CONTENT (scrollable)   │
│  - Form / SelectGame        │
│  - Loading                  │
│  - Summary / Moves          │
├─────────────────────────────┤
│  GAME BUTTONS (nav strip)   │
└─────────────────────────────┘
```

---

## 4. Component Patterns

### 4.1 Primary CTA Button
Used for: **"Analyze"**, **"List Games"**, **"Get AI Insights"**

```tsx
<input
  type="submit"
  className="w-[85%] h-16 cursor-pointer rounded-borderExtraRoundness text-2xl
             bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover
             transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted"
/>
// OR as <button>:
<button className="w-full bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover
                   shadow-md font-bold py-3 px-4 rounded-borderRoundness
                   transition-all duration-150 ease-out flex flex-row justify-center
                   items-center gap-2 active:scale-[0.98]">
```

- **Fill**: `bg-backgroundBoxBoxHighlighted` (#D4A843 gold)
- **Hover fill**: `bg-backgroundBoxBoxHighlightedHover` (#E8C060)
- **Text**: inherits white (do NOT add `text-surface-0` or dark text)
- **Active**: `active:scale-[0.98]`
- **Disabled**: use `disabled` attribute; no extra class needed

### 4.2 Toggle Segment Group (segmented control)
Used for: **BEGINNER/ADVANCED**, **GROQ/GEMINI**

```tsx
{/* Pill wrapper */}
<div className="flex flex-row gap-2 bg-backgroundProfileBlack p-1 rounded-lg border border-transparent">
  <button
    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-150 ease-out active:scale-95 ${
      isActive
        ? "bg-backgroundBoxBoxHighlighted shadow-md"
        : "text-foregroundGrey hover:text-white hover:bg-white/[0.04]"
    }`}
  >
    LABEL
  </button>
</div>
```

- Wrapper: `bg-backgroundProfileBlack p-1 rounded-lg border border-transparent`
- Active segment: `bg-backgroundBoxBoxHighlighted shadow-md` (no explicit text color)
- Inactive segment: `text-foregroundGrey hover:text-white hover:bg-white/[0.04]`
- **Never add a visible border to the wrapper** — use `border-transparent`

### 4.3 Standard Input / Textarea
Used for: **PGN/FEN input**, **username input**, **API key fields**

```tsx
<textarea
  className="w-[85%] px-2 py-[13px] text-xl font-bold rounded-borderRoundness
             border-border hover:border-borderHighlighted focus:border-borderHighlighted
             border-solid border-[1px] bg-backgroundBoxBox outline-none
             placeholder:text-placeholder placeholder:font-normal resize-none
             transition-colors"
/>
// Compact variant (settings):
<input
  className="bg-backgroundProfileBlack text-white p-2 rounded-borderRoundness text-sm
             outline-none border border-transparent focus:border-backgroundBoxBoxHighlighted
             transition-colors"
/>
```

- Rest border: `border-border` (#21262D)
- Hover/focus border: `border-borderHighlighted` = `border-backgroundBoxBoxHighlighted` (#D4A843)
- Background: `bg-backgroundBoxBox` (panels) or `bg-backgroundProfileBlack` (settings)
- No focus glow ring — border color change only
- `outline-none` always

### 4.4 Dropdown / Format Selector Button
Used for: **format picker** (Chess.com / Lichess / PGN / FEN)

```tsx
<button
  className="flex flex-row gap-1 items-center justify-center w-full h-14
             rounded-borderRoundness text-xl bg-backgroundBoxBox
             hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted
             transition-colors font-bold relative"
>
```

- Height: `h-14` (56px) for main selector
- Grid items: `h-12` (48px), `text-md`, same hover pattern
- Active depth: `border-[2px] border-backgroundBoxBoxHighlighted` (no background change)

### 4.5 Toggle Switch (boolean)
Used for: **Auto AI Review**

```tsx
<div
  onClick={toggle}
  className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200 ${
    isOn
      ? 'bg-backgroundBoxBoxHighlighted shadow-sm shadow-backgroundBoxBoxHighlighted/30'
      : 'bg-white/[0.06] hover:bg-white/[0.1]'
  }`}
>
  <div className={`absolute top-[4px] w-3 h-3 rounded-full bg-white transition-all duration-200 ${isOn ? 'left-[24px]' : 'left-[4px]'}`} />
</div>
```

- Track on: `bg-backgroundBoxBoxHighlighted`
- Track off: `bg-white/[0.06]` (no border)
- Knob: `w-3 h-3 rounded-full bg-white` — `top-[4px]`, `left-[4px]` off / `left-[24px]` on

### 4.6 Menu Tab Bar
Used for: **Analyze / Choose Game / Summary / Moves** tabs

```tsx
<button
  className={`w-full flex flex-col gap-1 group items-center py-2 text-sm outline-none ${
    isSelected
      ? 'text-foreground'
      : 'bg-backgroundBoxBoxDisabled text-foregroundGrey cursor-pointer transition-colors hover:text-foregroundHighlighted'
  }`}
>
  {icon} {label}
</button>
```

- Active tab: `text-foreground`, no background (transparent = same as panel)
- Inactive tab: `bg-backgroundBoxBoxDisabled text-foregroundGrey`
- Icon: `fill-foreground` active / `fill-foregroundGrey group-hover:fill-foregroundHighlighted` inactive
- No border, no underline — background contrast creates the active state

### 4.7 Section Divider
```tsx
<hr className="border-neutral-600 w-[85%]" />
```
Always `border-neutral-600`, always `w-[85%]` for section breaks inside panels.

### 4.8 Panel / Card Container
Used for: **AI Settings**, any grouped section

```tsx
<div className="flex flex-col gap-3 p-3 bg-backgroundBox rounded-borderRoundness border border-neutral-800">
  <span className="font-bold text-foregroundGrey text-sm uppercase tracking-wider">Section Title</span>
  {/* content */}
</div>
```

- Background: `bg-backgroundBox`
- Border: `border-neutral-800` (subtle, not accent)
- Title: `font-bold text-foregroundGrey text-sm uppercase tracking-wider`

### 4.9 Move List Row
```tsx
<li className="flex flex-row text-foregroundGrey items-center w-full">
  <span className="font-bold w-[33px]">{n}.</span>
  <div className="flex flex-row text-lg font-extrabold flex-grow">
    {/* each half-move: */}
    <button
      className={`rounded-borderRoundness outline-none border-b-2 text-left px-2 w-fit
        ${isSelected ? 'bg-backgroundBoxBox border-backgroundBoxBoxHover' : 'border-transparent'}
        ${ratingColorClass}`}
    >
      {san}
    </button>
  </div>
</li>
```

- Move number column: `w-[33px] font-bold text-foregroundGrey`
- Selected move: `bg-backgroundBoxBox border-b-2 border-backgroundBoxBoxHover`
- Unselected: `border-transparent`
- Rating colors: use `text-highlight*` tokens (see §2)
- Active (not rated, just current): `text-foregroundHighlighted`

### 4.10 "Best Move" Bar
Shown above the move list when a better move exists.

```tsx
<div className="bg-backgroundBoxDarker w-full">
  <div className="w-[85%] font-extrabold text-highlightBest mx-auto flex flex-row items-center gap-2 py-2">
    <FormatEval best smaller ... />
    <RatingSVG rating="best" size={22} />
    {bestMoveSan} is best
  </div>
</div>
```

- Background: `bg-backgroundBoxDarker` (darkest surface, one level below panels)
- Text: `text-highlightBest` (#96bc4b)

### 4.11 Game Control Buttons (navigation strip)
```tsx
<div className="w-[85%] rounded-borderRoundness p-3 flex flex-row justify-around items-center">
  <SkipGame class="h-[45px] rotate-180 fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
  <NextMove class="h-[25px] rotate-180 fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
  {/* play/pause */}
  <NextMove class="h-[25px] fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
  <SkipGame class="h-[45px] fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
</div>
```

- All icons: `fill-foregroundGrey` at rest, `fill-foregroundHighlighted` on hover
- Transition: `transition-colors` (no duration class needed)
- No button background — icon-only ghost style

---

## 5. Loading States

### 5.1 Stockfish Analysis Loading (loading.tsx)
```tsx
<div className="flex flex-col flex-grow">
  {/* header strip */}
  <div className="text-lg font-bold text-foregroundGrey px-5 pb-5 w-full">
    Analyzing{ellipsis}
  </div>
  <hr className="border-neutral-600" />
  {/* centered card */}
  <div className="flex-grow flex flex-col justify-center items-center relative">
    <div className="w-[70%] bg-backgroundBox relative overflow-hidden
                    rounded-borderExtraRoundness text-lg text-foregroundGrey
                    flex flex-col gap-14 pb-4 pt-14 items-center">
      <div className="w-48 flex flex-col items-center gap-4 text-center">
        <Lens class="animate-[pulse_1.25s_...] fill-backgroundBoxBoxHighlighted" size={60} />
        <span className="text-xl text-foreground font-bold">{format}</span>
        <span className="w-full whitespace-nowrap">Analyzing Game{ellipsis}</span>
      </div>
      <button className="hover:text-foreground transition-colors">Cancel</button>
      <LoadingBar progress={progress} />
    </div>
  </div>
</div>
```

- **`whitespace-nowrap` is mandatory on animated text** — prevents layout shift as dots animate
- Container: `w-48` minimum, `text-center` on the inner flex column
- Icon: gold pulse (`fill-backgroundBoxBoxHighlighted`)
- Card: `w-[70%] bg-backgroundBox rounded-borderExtraRoundness`

### 5.2 API Fetch Loading (selectChessCom.tsx `Loading`)
```tsx
<div className="w-56 flex flex-col items-center gap-4 text-center">
  <Files className="animate-[pulse_...]" size={60} />
  <span className="text-xl text-foreground font-bold">{whatIsLoading}</span>
  <span className="w-full whitespace-nowrap">Fetching api{ellipsis}</span>
</div>
```

- Same pattern as above: `w-56`, `text-center`, `whitespace-nowrap`

### 5.3 Inline Loading (`SimpleLoading`)
```tsx
<div className="font-extrabold text-2xl animate-[pulse_...] w-56 my-4 m-auto whitespace-nowrap text-center">
  Loading {whatIsLoading}{ellipsis}
</div>
```

- `whitespace-nowrap` is mandatory
- `w-56` minimum width to fit the longest animated string

---

## 6. Toast Notifications (PageErrors)

Toasts appear **bottom-right**, stacked, auto-dismiss after 7.5s.

```tsx
<div
  style={{ backgroundColor: type === 'error' ? 'var(--error)' : type === 'warning' ? 'var(--warning)' : 'var(--highlightBrilliant)' }}
  className="p-3 text-xl select-text z-[999] text-white font-bold
             rounded-borderRoundness hover:scale-105 will-change-transform
             transition-all max-w-96"
>
  {title}
  <div className="text-base opacity-85 mt-2">{description}</div>
</div>
```

- **All toast text is always `text-white`** — no matter the background
- Error background: `var(--error)` = `#DA3633`
- Warning background: `var(--warning)` = `#D29922`
- Success background: `var(--highlightBrilliant)` = `#04b8ad` (teal)
- Description: `text-base opacity-85 mt-2`
- z-index: `z-[999]`
- Hover: `hover:scale-105`

---

## 7. Typography

Fonts are configured via Next.js `next/font` and exposed as CSS variables:
- `var(--font-display)` → Playfair Display (display/serif)
- `var(--font-sans)` → DM Sans (body/UI)
- `var(--font-mono)` → JetBrains Mono (notation/clocks)

### Usage Rules
| Element | Font | Class |
|---|---|---|
| App logo, major headings | Playfair Display | `font-display` or `h1/h2/h3` |
| All UI text, labels, buttons | DM Sans | default (`body` inherits it) |
| Move notation, clocks, evals | JetBrains Mono | `font-mono` or `.monospace` |

### Text Size Patterns
| Role | Classes |
|---|---|
| Section label | `text-sm font-bold text-foregroundGrey uppercase tracking-wider` |
| Field label | `text-[10px] font-bold text-foregroundGrey uppercase` |
| Primary button | `text-2xl font-extrabold` |
| Secondary button | `text-xs font-bold` |
| Move notation | `text-lg font-extrabold` |
| Body/description | `text-sm text-foregroundGrey` |
| Small label | `text-[10px]` or `text-xs` |

---

## 8. Transitions & Animation

| Pattern | Classes |
|---|---|
| Color changes (hover) | `transition-colors` |
| All properties | `transition-all duration-150 ease-out` |
| Button press | `active:scale-95` or `active:scale-[0.98]` |
| CTA hover lift | `hover:shadow-shadowBoxBoxHighlighted` |
| Animated spinner | `animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full` |
| Pulsing icon | `animate-[pulse_1.25s_cubic-bezier(0.4,_0,_0.6,_1)_infinite;]` |

---

## 9. The Nav Sidebar

```tsx
<nav className="flex flex-col navTop:h-screen navTop:w-max w-screen relative">
  <div className="navTop:pt-1 navTop:pb-6 navTop:h-full w-full overflow-y-auto
                  bg-backgroundBox flex navTop:flex-col flex-row justify-between
                  select-none navTop:items-start items-stretch">
```

- Background: `bg-backgroundBox` (surface-1)
- Nav links: `text-lg font-bold navTop:px-3 navTop:py-2 p-1.5 hover:bg-backgroundBoxHover hover:text-foregroundHighlighted transition-colors`
- Active page link — no special active class; use next/link, router detects it
- Icon images: `opacity-70 group-hover:opacity-100 transition-colors`

---

## 10. Game Selection (Chess.com / Lichess)

### Archive List Button
```tsx
<button
  className={`${isHovered || isSelected ? 'text-foregroundHighlighted' : 'text-foregroundGrey'}
    hover:bg-backgroundBoxHover w-full tracking-wide transition-colors
    text-2xl px-8 py-4 flex flex-row justify-between items-center`}
>
```

### Game Row (table)
```tsx
<tr className="border-b-[1px] cursor-pointer select-none border-border
               transition-colors hover:bg-backgroundBoxHover">
```

- Username link: `text-backgroundBoxBoxHighlightedHover text-3xl font-bold hover:underline`
- Result indicator square: `h-4 w-4 rounded-borderRoundness` with `bg-winGreen` / `bg-lossRed` / `bg-foregroundGrey`

---

## 11. Modals (Perspective Picker)

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div className="bg-backgroundProfileBlack border border-neutral-700 p-6 rounded-lg shadow-xl w-80 text-center">
    <h3 className="text-white font-bold mb-4">...</h3>
    {/* White option */}
    <button className="bg-white text-black py-2 rounded-md font-bold hover:bg-gray-200">
    {/* Black option */}
    <button className="bg-neutral-800 text-white py-2 rounded-md font-bold border border-neutral-600 hover:bg-neutral-700">
    {/* Cancel */}
    <button className="mt-2 text-foregroundGrey hover:text-white text-sm">
  </div>
</div>
```

- Overlay: `fixed inset-0 z-50 bg-black bg-opacity-50`
- Panel: `bg-backgroundProfileBlack border border-neutral-700 rounded-lg p-6 shadow-xl`
- z-index: `z-50` for modals (toasts use `z-[999]`)

---

## 12. AI Settings Panel (aiSettings.tsx)

```tsx
<div className="flex flex-col gap-3 p-3 bg-backgroundBox rounded-borderRoundness border border-neutral-800">
  <span className="font-bold text-foregroundGrey text-sm uppercase tracking-wider">AI Coach Settings</span>

  {/* Provider / Coaching Mode toggles — use the Toggle Segment Group pattern (§4.2) */}

  {/* API Key input */}
  <input
    type="password"
    className="bg-backgroundProfileBlack text-white p-2 rounded-borderRoundness text-sm
               outline-none border border-transparent focus:border-backgroundBoxBoxHighlighted transition-colors"
  />

  {/* Auto AI Review toggle — use the Toggle Switch pattern (§4.5) */}
</div>
```

---

## 13. Critical Rules

**Always do:**
- Use `whitespace-nowrap` on any text that animates or appends characters (ellipsis effects)
- Use `transition-colors` for hover color changes, `transition-all duration-150 ease-out` for transforms
- Keep `border-transparent` on toggle-group wrappers — never a visible border
- Use `text-white` on all toast text regardless of background color
- Use `w-[85%]` for content within the menu panel (consistent inset)
- Use `outline-none` on all interactive elements that have custom focus styles

**Never do:**
- Never hardcode hex colors in className — always use a Tailwind token from §2
- Never add visible borders to toggle-group pill wrappers
- Never use `text-surface-0` or dark text on gold (`bg-backgroundBoxBoxHighlighted`) buttons
- Never add a `border-neutral-850` class — it doesn't exist
- Never use amber/gold as a large background fill — it's always a highlight or accent
- Never use green, brown, or earth tones as UI surfaces
- Never put box-shadows on dark surface cards — elevation = brightness step only
- Never skip `whitespace-nowrap` on animating text elements

**Consistency checklist for any new component:**
1. Does it use only tokens from §2?
2. If it's a CTA, does it use the §4.1 pattern?
3. If it's a segmented toggle, does it use the §4.2 pattern?
4. If it contains animated text, does it have `whitespace-nowrap`?
5. Are all toast messages using `text-white`?
6. Is the container width `w-[85%]` for menu panel content?

---

## 14. Puzzle & Blitz Tab Design System (Unique Elements)

The Puzzle & Blitz page shares the global layout layout structure but features highly interactive overlays and specialized stats layouts. **Where design details or color themes conflict between tabs, the Analyze Tab's Knight's Court design system tokens always take priority.**

### 14.1 Interactive Board Overlays
Used to show feedback directly on the chess board.

* **Feedback Flashes (Green/Red):**
  * Green flash (Correct Move): `absolute inset-0 bg-green-500/30 z-[110] pointer-events-none animate-pulse`
  * Red flash (Incorrect Move): `absolute inset-0 bg-red-500/30 z-[110] pointer-events-none animate-pulse`
* **Ping Hint Indicator:**
  * Displays a yellow ring animation centered on the source square of the correct move.
  * Class: `absolute z-[105] bg-yellow-400/40 rounded-full border-4 border-yellow-400 animate-ping pointer-events-none`
* **Victory / Success Badge:**
  * A bouncing message overlayed at the top of the board container when solved.
  * Container: `absolute top-[-50px] z-[100] animate-bounce`
  * Text Badge: `bg-winGreen text-white px-6 py-2 rounded-full font-bold text-xl shadow-lg border-2 border-white/20`

### 14.2 Solution Progress Tracker (Steps Indicator)
Shows the player how many correct moves they have played vs how many are remaining.

```tsx
<div className="flex gap-2 mt-4">
  {puzzle.solution.map((_, i) => (
    <div
      key={i}
      className={`w-3 h-3 rounded-full ${
        i < currentMoveIndex ? 'bg-green-500' : 'bg-gray-600'
      }`}
    />
  ))}
</div>
```
* Solved steps: `bg-green-500`
* Remaining steps: `bg-gray-600` (subtle gray)

### 14.3 Specialized Action Buttons
* **Hint Button:**
  * Class: `flex items-center justify-center gap-2 bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover text-white py-4 rounded-borderRoundness font-bold transition-all disabled:opacity-50 border-border border-[1px] hover:text-foregroundHighlighted`
* **Give Up Button (Dark Red Style):**
  * Class: `flex items-center justify-center gap-2 bg-[#2a1a1a] hover:bg-[#3d1a1a] text-lossRed py-4 rounded-borderRoundness font-bold transition-all disabled:opacity-50 border-lossRed border-[1px]`
* **Next Puzzle Button (Pulses Gold):**
  * Class: `w-full bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover text-white py-4 rounded-borderRoundness font-extrabold text-xl transition-all animate-pulse shadow-shadowBoxBoxHighlighted`

### 14.4 Progress & Statistics Cards (Grid Layout)
Progress details and stats are shown in a two-column card layout.

```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="bg-backgroundBoxBox p-4 rounded-borderRoundness flex flex-col gap-1 border-border border-[1px]">
    <span className="text-xs font-bold text-foregroundGrey flex items-center gap-1">
      {/* SVG Icon */}
      SOLVED TODAY
    </span>
    <span className="text-2xl font-extrabold text-white">{solvedCount}</span>
  </div>
</div>
```
* **Stat Cards:**
  * Box styling: `bg-backgroundBoxBox p-4 rounded-borderRoundness border-border border-[1px]`
  * Labels: `text-xs font-bold text-foregroundGrey`
  * Values: `text-2xl font-extrabold` with color mapping matching status (Streak uses `text-highlightBest`, Accuracy uses `text-winGreen`, Totals use `text-white`).

### 14.5 Theme & Tag Chips
Used to label the attributes or tactical motifs of puzzles.

```tsx
<span className="bg-backgroundBoxBoxHover text-foregroundGrey px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
  {themeName}
</span>
```
* Class: `bg-backgroundBoxBoxHover text-foregroundGrey px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider`

### 14.6 Theme Conflict & Dropdown Override Rules
> [!IMPORTANT]
> **Priority Rule:** In the legacy puzzle layout, some filters and popover menus used to employ warm brown backgrounds (such as `bg-[#262421]`). 
> Under Knight's Court, **dropdowns and floating menus MUST ALWAYS inherit the deep navy palette** instead of the brown theme.
> * Dropdown lists must use `bg-backgroundBox` (`--surface-1` or `#161B22`) or `bg-backgroundBoxBoxHover` (`--surface-2` or `#1C2333`).
> * Dropdown item buttons must use `text-white` with `hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted`.
> * NEVER introduce new warm brown `bg-[#262421]`, `bg-[#312E2B]` or light gray panels in any part of the puzzle or game tabs. Keep it Intimate, Focused, Slate Blue, and Gold!

