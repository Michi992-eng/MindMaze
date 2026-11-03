# MindMaze website — build prompt for Claude Code

Copy everything below the line into Claude Code (the `claude` terminal in VS Code), run from the `mindmaze-site` folder.

To look at the prototype yourself, serve the folder instead of double-clicking the file (browsers block the wood textures and logo on `file://`): run `npx serve .` inside `mindmaze-site` and open `http://localhost:3000/reference/`.

---

Build the MindMaze website as a production-ready **Next.js + React + TypeScript** project in this folder. All components are `.tsx`.

## What is already here

- `reference/index.html` is a **working single-file prototype** of the finished site. It is only a visual and behavioral reference, **not** part of the final project: read it to copy the exact look, copy (English and Mongolian), colors, spacing, and animation logic, then rebuild it as React components. When this prompt and the prototype disagree, follow the prototype.
- `assets/img/` holds every image the site uses. Move them to `public/img/` without renaming, re-cropping, or re-compressing.

## Stack

- **Next.js (App Router, latest stable) + React + TypeScript**, strict mode. Create it with `create-next-app` in this folder (TypeScript, App Router, ESLint, `src/` directory, no Tailwind).
- Styling: port the prototype's CSS into `src/app/globals.css` (design tokens, pattern, shared type) plus CSS Modules per component where it helps. Keep class behavior identical; no Tailwind or UI kits.
- Fonts with `next/font/google`: **DM Serif Display** (weight 400, headings) and **Instrument Serif** (400, normal + italic, body), exposed as the CSS variables `--display` and `--body`.
- 3D with the **`three`** npm package (current version, with `@types/three` if needed) inside a client component. Use `RoundedBoxGeometry` from `three/examples/jsm/geometries/RoundedBoxGeometry.js`. Do not add react-three-fiber unless it keeps the exact same behavior.
- Photos with `next/image` (give each its real width/height); the reel and decorative layers can use plain `<img>` if `next/image` gets in the way of the infinite loop.
- `npm run dev` must start it; `npm run build` must pass with no type errors; it must deploy to **Vercel** with zero config.

### Structure

```
src/
  app/
    layout.tsx          fonts, <html lang>, metadata (title "MindMaze", description)
    page.tsx            composes the sections in order
    globals.css
  components/
    LanguageProvider.tsx   'use client' context: lang, setLang, t(key); saves to localStorage, sets <html lang>
    Header.tsx             logo, nav with active section, EN/MN toggle, Contact, scroll progress bar
    Hero.tsx               pinned hero text + slot for the puzzle
    BurrPuzzle.tsx         'use client' three.js scene (load with next/dynamic, ssr:false)
    Games.tsx
    Schools.tsx
    MomentsReel.tsx        'use client' photo reel
    Edu.tsx                glance table, count-up stats, sliding panels
    Impact.tsx
    Footer.tsx             contact + copy button ('use client')
    MongolianPattern.tsx   fixed background pattern layer
  lib/
    i18n.ts             typed EN and MN dictionaries (copy every string from the prototype; MN from its MN object)
    useInView.ts        IntersectionObserver hook for entrances and count-ups
public/img/             all images
```

### React-specific rules

- Language switching goes through the `LanguageProvider` context and `t('key')`, not by rewriting DOM text. Use the same keys as the prototype's `data-i` attributes; type the keys so a missing translation is a compile error.
- All three.js setup and the animation loop live in one `useEffect` in `BurrPuzzle.tsx` with full cleanup on unmount (cancel `requestAnimationFrame`, remove listeners, dispose geometries, materials, textures and the renderer). It must survive React Strict Mode double-mounting without creating two canvases.
- Read scroll and pointer values in refs, not React state, so the 3D loop never causes re-renders.
- Newer three.js changed color and light handling compared with the prototype (r128): use `renderer.outputColorSpace = THREE.SRGBColorSpace`, set `texture.colorSpace = THREE.SRGBColorSpace` on the wood color map, and scale the prototype's light intensities by about `Math.PI` so the wood looks the same as in the reference.

## Brand (keep exactly)

Dark navy theme only, no light mode.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0d1324` | page background |
| `--bg-2` | `#141c33` | alternate bands |
| `--card` | `#151d33` | cards, panels |
| `--line` | `#26304a` | borders |
| `--pattern` | `#1f2a45` | Mongolian pattern |
| `--ink` | `#eef1f8` | text |
| `--ink-2` | `#a7b0c6` | muted text |
| `--blue` | `#5aa2f0` | headline accents, buttons, links |
| `--amber` | `#f0a447` | numbers, small markers, progress bar |

- Headings are UPPERCASE DM Serif Display. The second line of each heading is an `<em>` shown in blue as its own line (e.g. "THINK IN" / "MOVES.").
- Section labels ("eyebrows"): small uppercase, wide letter-spacing, a 13px hollow square before the text, a thin line under it.
- **Mongolian key pattern** behind the whole page: a fixed layer using the SVG meander tile from the prototype (`.khee`), 56px tiles rotated 45°, colored `--pattern`, with a radial fade so the center of the screen is calmer.
- Logo: `assets/img/logo.png` used as a CSS mask filled with `--ink`.

## Page order

1. **Sticky header**: logo · nav (PUZZLES, GAMES, EDU, IMPACT; active link turns blue with underline) · EN/MN toggle · blue "Contact" pill · thin amber scroll-progress bar on its bottom edge.
2. **Hero with the 3D puzzle** (details below). Left: eyebrow "01 — Traditional puzzles", H1 "Think in / moves.", one lede paragraph. Right: the 3D puzzle and the hint "Scroll to assemble · drag to turn". **No buttons, no stats, no counter, no big background wordmark.**
3. **Games** — "02 — Mongolian puzzles", "Games our / ancestors played.", 6 warm wood-colored cards (star, cross, crosslock, oyun-tulkhuur, bugj, snowflake) with Interlocking / Disentangling tags. On hover the picture lifts and tilts.
4. **Schools** — "03 — Schools", "Curriculum adopted / in 3 schools.", 3 photo cards with captions, then "Next partner schools" as 4 small cards.
5. **Moments from the classroom** — photo reel (details below).
6. **MindMaze EDU** — "Puzzles in the classroom", intro text, the animated illustration (3 stacked images; the head gently sways). Below it two panels side by side: **At a glance** (table) and **Impact so far** (78%, 64%, 91% count up from 0 when visible). The panel headings are medium-size uppercase serif with a small amber square and a thin blue underline. The two panels slide up and scale in smoothly when scrolled into view.
7. **Impact** — "What a puzzle / leaves behind.", paragraph, 6 skill pills (hover turns blue). No eyebrow label on this section.
8. **Footer / contact** — "Ready for the / first piece?" (second line amber), "Write to us", the email `hello@mindmaze.mn` as selectable text with a **Copy** button (uses the Clipboard API, falls back to selecting the text), © line.

## The 3D puzzle (most important part)

A classic **six-piece wooden burr**, same logic as the 3D script in the prototype (it goes in `BurrPuzzle.tsx`):

- 6 sticks, `RoundedBoxGeometry(7, 2, 2, 4, 0.22)`, in three perpendicular pairs: two along X at z=±1, two along Y at x=±1, two along Z at y=±1.
- Material: `MeshStandardMaterial` with `wood.jpg` as map and `wood-bump.jpg` as bump (bumpScale 0.012), roughness 0.62, warm tint via HSL(0.075, 0.5, 0.80–0.85). Each piece offsets the texture differently so no two look alike.
- Lights: hemisphere (0xfff3e0 / 0x6b4a2a, 0.75), key directional (0xfff1dc, 1.5) top-left-front, rim directional (0xffe0b8, 0.5) back-right. ACES filmic tone mapping, sRGB output.
- One full-screen fixed transparent `<canvas>` with `pointer-events:none`. Each frame, place the puzzle over the hero's `.slot` element (convert its screen rect to world units) so it lines up with the layout at any size.
- Soft oval contact shadow under the puzzle that gets darker as more pieces are placed.

**Build sequence (it must build only once):**

- When the page loads, the hero shows **only the first piece**, which flies in over about 1.6 s.
- The hero section is about **280vh tall** with a sticky inner stage, so the first screen stays pinned while you scroll. Scrolling through it brings the other 5 pieces in **one at a time** (order `[2,3,4,0,1,5]`), finishing at 6/6 before the pinned section releases.
- Each piece starts off-screen near the camera (alternating left/right, top/bottom), **tumbles** while flying, turns to line up with its slot about 62% of a stick-length out along its own axis, then **slides straight in** along its length.
- Progress only ever increases: scrolling back up never takes the puzzle apart, and the puzzle does not appear anywhere else on the page.
- Ease each piece toward its target so motion is smooth, never jumpy.
- Always on: slow idle spin, extra yaw tied to build progress, gentle float when complete, slight tilt toward the mouse, **drag to rotate with inertia** (pointer events on the slot; `touch-action: pan-y` so phones can still scroll).
- Hide the canvas when the hero is off-screen (save battery).
- `prefers-reduced-motion`: show the finished puzzle, no flying or spinning.
- If WebGL fails, show `cross.webp` in the slot instead.

## Photo reel ("Moments from the classroom")

- Heading: eyebrow "MindMaze in class", "Moments from / the classroom.", lede "Snapshots from MindMaze sessions across our partner schools, where children and mentors solve traditional puzzles side by side."
- **One** horizontal row, full width, edges fading out with a mask.
- 20 photos `class-1` … `class-20` in this order: 16, 9, 1, 10, 13, 3, 18, 11, 5, 14, 7, 12, 15, 2, 20, 6, 17, 4, 19, 8. Keep each photo's own aspect ratio; height `clamp(220px, 27vw, 380px)`, 20px rounded corners, slight alternating tilt (−1.2° / +1° with a small vertical offset).
- Infinite loop: render the set twice (second copy `aria-hidden`) and translate the track −50% over **160 s**, linear.
- Hover pauses the reel; the hovered photo straightens, scales to 1.04 and gets a 2px blue ring.
- Scrolling the page briefly speeds the reel up, then it settles back.
- Write a meaningful `alt` for every photo (see the prototype); the duplicate set gets empty alts.

## Language toggle

- Every translatable element has `data-i="key"`. English is read from the HTML; Mongolian comes from the `MN` object in the prototype — copy it **exactly**, including the `m_*` keys for the photo section and `cap`.
- Remember the choice in `localStorage` (wrap in try/catch) and set `<html lang>`.

## Responsive and accessibility

- Must work from 360px phones to wide desktops with no horizontal scroll.
- Under 860px: nav links hide; hero stacks puzzle above text and drops the eyebrow; grids go to 2 then 1 column.
- Real `<button>`/`<a>` elements, visible focus ring in `--blue`, alt text on content images, `prefers-reduced-motion` respected everywhere (reel stops and becomes horizontally scrollable).
- Lazy-load all photos below the hero.

## Done when

- `npm run dev` shows a page that matches `reference/index.html` side by side (serve the reference with `npx serve .` and open `/reference/`).
- On load only one piece is visible; scrolling assembles 6/6 once and it stays assembled.
- EN/MN switches every label, including the photo section, and the choice survives a reload.
- No hydration warnings in the console; `npm run build` passes with zero TypeScript errors.
- Lighthouse accessibility score ≥ 90.

Afterwards, tell me how to run it and how to deploy it to Vercel.
