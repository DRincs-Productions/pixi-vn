# Pixi'VN UI: Game UI / UX design

Part of the `pixi-vn-ui` skill — read `SKILL.md` first for the plumbing (HTML/PixiJS layers,
routing, storage). This file is about **design**: how a 2D game interface should look, move,
sound and behave. It is not about a specific technology and not about visual novels.

**Forget the visual novel for this file.** Pixi'VN is often used for VNs, but the principles here
apply to any 2D game: menus, HUDs, inventories, shops, maps, dialogue, settings, pause screens,
result screens, minigames. Design the interface the way a game designer would, then implement it
with whatever `SKILL.md`/`pixijs.md` describes.

## A game, not a website

The two best references for interface craft an AI agent can learn from are web-oriented:

- **Emil Kowalski** — [emilkowal.ski](https://emilkowal.ski) (articles such as
  [7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips) and
  [You Don't Need Animations](https://emilkowal.ski/ui/you-dont-need-animations)), the
  [animations.dev](https://animations.dev) course and his agent skills
  ([emilkowalski/skills](https://github.com/emilkowalski/skills)). Motion with purpose, the right
  easing, speed, frequency-aware restraint.
- **Impeccable** by Paul Bakaus — [impeccable.style](https://impeccable.style) and its
  [AI-slop catalog](https://impeccable.style/slop) ([pbakaus/impeccable](https://github.com/pbakaus/impeccable)).
  Typography, color, spacing, hierarchy, and a vocabulary of commands (`critique`, `audit`,
  `polish`, `distill`, `bolder`, `quieter`, `delight`, `animate`, `typeset`, `layout`, `harden`,
  `clarify`, `adapt`, ...) for steering and reviewing a design.

Use them — their rules about craft, restraint, readability and performance transfer almost
entirely. But **their default target is a website or a SaaS product, and a game UI must not look
like one.** A game interface is part of the experience, not a container for it: it has a fiction,
a material, a voice and a sense of touch. If the result could be dropped into a dashboard
unchanged, it is wrong for a game.

If the project has these skills installed (`npx skills@latest add emilkowalski/skills`,
`npx impeccable install`), use them — Emil's `animate`, `choreograph`, `review-animations`,
`remove-animations`, `break-ui`; Impeccable's `critique`, `audit`, `polish`, `delight`, `animate`
— but read their verdicts through the tables below.

### Every game screen has a mode

Impeccable picks a **mode** per surface, not per product — and a game contains all of them. Decide
the mode of each screen before designing it:

| Mode | Game screens | What ambition looks like |
| --- | --- | --- |
| **Experience** — the player is inside the work | title screen, gameplay HUD, cutscene overlays, the world map | the art leads; UI recedes or becomes part of the world |
| **Persuade** — the player decides and commits | reward/level-up, character select, shop offers, results | one authored, bold, celebratory moment |
| **Operate** — the player completes a task | inventory, equipment, settings, save/load, crafting | precision, scanability, speed, consistency; personality lives in details (sounds, materials, press feel) |
| **Read** — the player understands something | codex, tutorial pages, quest log, credits | comprehension first, then a reading experience worth staying in |

A shop or inventory is an *Operate* screen that happens to be in a game: it should be as fast and
legible as a great tool, dressed in the game's material — not a celebration on every click.

### What transfers and what flips

| Web rule (Emil / Impeccable) | In a game |
| --- | --- |
| Animate with a purpose; "sometimes the best animation is no animation." | **Same.** Every motion must acknowledge, explain, orient, warn or celebrate. Purpose just includes *fun* more often. |
| Frequency decides: things used hundreds of times a day get little or no animation. | **Same, and critical.** Menu navigation, inventory scrolling, "next" presses: instant response. Save the big moments for rare events (level up, reward, boss, unlock). |
| Never animate keyboard-initiated actions. | **Partly flips.** In a game the keyboard/gamepad *is* the main input, so the response to it must exist — but be instant: the focus highlight jumps immediately and carries at most a ≤100 ms flourish; holding a direction to scroll a list disables even that. Shortcuts to frequent screens (`I` for inventory, `Esc` for pause) open with little or no animation. |
| Enter/exit with **ease-out**, never ease-in; keep UI motion **under ~300 ms** (modals/drawers up to ~500 ms). | **Same for anything blocking input.** Rare, celebratory, non-blocking moments may run longer (a reward reveal of 600–1500 ms), but must be skippable. |
| Never start from `scale(0)`; start from ~0.9–0.97 with opacity. Press feedback `scale(0.95–0.98)`. | **Pushed further.** Pressed buttons may squash to 0.92–0.95; pop-ins may start at 0.8 and overshoot. Still never from 0 — nothing in a believable world appears from nothing. |
| Impeccable flags **bounce/elastic easing** "by reflex" as slop; Emil keeps spring `bounce` at 0.1–0.3 and "for playful interactions". | **Flips for the right element.** Game UI *is* a playful interaction: springs and overshoot are *juice* on icons, coins, badges, counters, reward popups, a selected card (bounce 0.3–0.5 for rare celebratory moments). Keep them off things the player waits on (opening the pause menu, confirm dialogs, settings). |
| "One authored moment", not scattered effects or the same entrance on every section (Impeccable). | **Same, per screen.** Each screen gets at most one focal motion (the item reveal, the title logo); everything else is quiet supporting feedback. Ten things bouncing at once is noise, not juice. |
| `transform-origin` at the trigger; modals stay centered. | **Same.** A tooltip grows from the slot, a context menu from the cursor, a dropdown from its button. |
| Avoid gradient text, glow, glassmorphism, pulsing dots, hard offset shadows. | **Context decides.** These are slop when they are *defaults*. In a game they're legitimate if the art direction calls for them (a glowing rare item, a hard drop shadow on a cartoon UI). They are still slop when used by reflex. |
| Body text ≈ 16 px, line length 65–75 ch, line height ~1.5. | **Bigger, shorter.** Players read at distance and mid-action: see "Typography". Long prose belongs only in codex/lore screens. |
| Inter / Geist / system font everywhere; cream or purple-gradient palettes are "AI defaults". | **Doubly wrong in games.** Pick display type and palette from the game's fiction. A neutral sans is acceptable only for small numeric/body text, never as the game's voice. |
| Cards, nested cards, identical card grids. | **Panels, frames, slots, plates, ribbons.** Game UI uses objects (wood, metal, paper, glass, pixels, ink) with a consistent shape language, not floating white rectangles. |
| Hover states, gated behind `@media (hover: hover) and (pointer: fine)`; the hovered element stays still and a child carries the motion. | **Hover is a bonus, not a requirement.** Gamepad and touch have no hover: focus/selection is the primary state. Keep the gating and the "child moves, hit area stays" rule — a slot that lifts out from under the cursor flickers. |
| Theme the browser surfaces nobody drew: selection, caret, scrollbars, focus rings (Impeccable's craft floor). | **Even more critical** — these are what instantly reveal "this is a web page": the default arrow cursor, blue text selection on a double-click, the right-click context menu, the ghost image when dragging a sprite, native scrollbars, the blue focus ring, the tap-highlight flash on mobile. Replace or disable every one of them. |
| No emoji or Unicode glyphs as an icon system; no system display font (Impact, Arial Black) as the voice. | **Same.** Icons are drawn in one consistent style (from the game's art or a real icon set); the display face is sourced and bundled, never "the closest installed font". |
| Toasts in a corner. | **Toasts are events.** They have sound, an entry direction that matches their exit, a queue, and they never cover critical info. |

## Start from the player loop

Every screen serves one loop:

> game state → perceivable information → player decision → input → state change → feedback

Before decorating anything, find the missing link. For each substantial screen, write down (in
code comments or a design note, never in the UI): the player's task, the state they need, the
primary action, what is uncertain, which inputs are supported, and the tone.

Separate **intended difficulty** (the challenge) from **interface difficulty** (finding,
reading or operating controls). The second kind is always a bug.

Inventory the data before layout: for every piece of information, how often it changes, how urgent
it is, and whether the player needs it *during* action or only between actions. That table decides
what lives on the HUD, what lives in menus, and what only appears on change.

## HUD

- **The HUD is the smallest set of elements the player cannot play without.** Everything else goes
  to menus, tooltips, or on-demand overlays (hold a button to show the full stats).
- **Position by frequency and urgency.** Constant urgent info near the action or in a corner the
  player already watches; keep it **spatially stable** — a value that moves is a value that has to
  be searched for. Respect genre conventions the audience already knows.
- **Show on change.** Non-urgent values (currency, collectibles, quest tracker) fade in when they
  change and fade out after a few seconds.
- **Protect the world.** During action the player looks at the playfield, not the HUD. Critical
  warnings must be readable in peripheral vision: size, motion, position and sound, not just color.
- **Diegetic UI** (health shown on the character, ammo on the weapon, a map the character holds) is
  a stylistic choice that costs readability. Use it when it serves the fiction; keep a
  non-diegetic fallback for anything critical.
- **Values that belong together stay visible together** (cost next to currency, HP next to max HP).

## Composition and visual language

- **Compose around the focal object** — the board, the hand of cards, the character, the map, the
  item being inspected. UI frames it, it doesn't compete with it.
- **Every element earns its place**: action, state, comparison, orientation, learning, recovery or
  deliberate expression. If it's none of those, delete it.
- **Group with spacing and alignment before boxes; build hierarchy with scale and contrast before
  headings.** Use one spacing unit (e.g. 4 or 8 px at reference resolution) and vary the gaps
  deliberately — Impeccable's "monotonous spacing" applies to games too.
- **Derive the style from the game**: fiction, camera, art, pacing, audience. Define once and reuse:
  type roles, semantic colors, shape/material language (corner radius or cut corners, borders,
  textures), icon style, depth (shadows, outlines), the focus/selection treatment, and the
  motion/sound personality.
- **Consistency is what separates "amateur" from "shipped"**: one panel style (9-slice), one button
  family, one font pair, one corner treatment, one spacing scale.
- **One depth system.** Declare elevation once — outline, drop shadow, or bevel — and use it
  everywhere; shadows have an offset and a direction consistent with the game's light. A hard,
  unblurred offset shadow is fine when the world is cartoon/neobrutalist by choice, not by default.
- **Dark or light comes from the scene, not the genre**: where and when the game is played, and what
  the art underneath looks like.
- **The strongest visual treatment goes to the most important current event** — not to the logo,
  not to a decorative frame.
- **Always test over real gameplay**, ideally the brightest and busiest scene, never over a flat
  background.
- When unsure, mock up **two or three structurally different layouts**, not three recolors.

## Typography

- **Two roles, minimum:** an expressive **display** face (titles, damage numbers, reward text —
  this is the game's voice) and a highly legible **reading** face for body text, stats and long
  strings. A third, monospaced or tabular, can serve numbers.
- **Numbers that change use tabular figures** (`font-variant-numeric: tabular-nums` in CSS) so
  counters and timers don't jitter.
- **Minimum sizes at 1080p reference:** ~18 px for PC, ~26 px for TV/console/handheld distance
  (Xbox Accessibility Guideline 101; double at 4K). Mobile: never below the platform minimum.
  Text should scale to 200% without losing content.
- **Short lines.** Tooltips: name, one-line effect, then numbers in a fixed order — not prose.
- **Readable over anything:** outline, drop shadow or a dark scrim behind text that sits on the
  playfield. Cheapest fix first: outline/scrim/spacing before new art.
- **Leave room for localization** — German is often ~30% longer than English. Size containers to
  content, never to the English string.
- **Pixel fonts** need integer scale and no smoothing, or they blur.

## Color and contrast

- **Semantic colors, reserved for UI**: e.g. one "danger", one "rare/legendary", one "positive",
  one "focus". Don't reuse them for decoration.
- **Never color alone.** Add an icon, shape, number, position, pattern, or text. A low-health
  warning is a vignette *and* a pulse *and* a sound *and* a number.
- **Contrast:** gameplay-relevant text ≥ 4.5:1, large text and key visuals ≥ 3:1, measured against
  the worst background it can appear over.
- Saturated, playful palettes are welcome — but with a clear value hierarchy. Squint at the screen:
  the important thing must still pop in grayscale.

## Widgets and states

Every interactive element needs **every** state, visually distinct:

`default` · `hover` (pointer only) · `focused` (keyboard/gamepad) · `pressed` · `selected` ·
`equipped/active` · `disabled/unavailable` · `pending` · `success` · `failure`

- **Focus must be unmistakable** and distinct from hover — scale, outline, glow, cursor, a bobbing
  arrow. It is the primary state for gamepad players.
- **Unavailable explains itself**: "Requires 2 energy — you have 1", not a grey button with no
  reason.
- **Acknowledge input immediately, confirm completion separately.** Press feedback is instant; the
  result (purchase done, save written) gets its own feedback. Block duplicate commits.
- **Previews must match the real rules** (damage preview, stat comparison, cost) and never leak
  hidden state.
- Cover the edges: empty list, full inventory, one item, 999 items, very long names, filtered to
  nothing, failed action, a 9 999 999 score, a translated label twice as long. Feed worst-case data
  on purpose (Emil's `break-ui` does exactly this) instead of designing for the happy path.
- Preserve selection by **stable id**, not list index, across sort/filter.
- A minimal widget kit for a game: 9-slice panel, button, icon button, bar (HP/progress), slider,
  toggle, list row/slot, tab, tooltip, modal.

## Motion and juice

Game UI should feel **tactile**: things have weight, respond to touch, and react to each other.
That is where it differs most from web UI — but the discipline is the same.

**Should it animate at all?** Emil's frequency gate, translated to games — answer it before picking
any curve:

| How often the player sees it | Game examples | Decision |
| --- | --- | --- |
| Hundreds of times per session | focus moving in a menu, "next"/advance, scrolling a list, opening inventory/pause by shortcut | instant; at most a ≤100 ms highlight, plus a sound |
| Tens of times per session | button press, tab switch, tooltip, picking up an item, a counter ticking | short and subtle (100–250 ms) |
| Occasionally | opening a submenu/modal, a quest update, a notification, a scene/screen transition | standard animation (200–500 ms) |
| Rarely / once | level up, rare drop, unlock, boss intro, title screen, game over, first-time tutorial | the delight budget lives here — bold, authored, skippable |

**Then name its purpose**: feedback, spatial consistency, state indication, preventing a jarring
change, explanation — or *delight*, which is only allowed in the rare tier. "It looks cool" on a
frequent element is a reason to stop.

**Rules (Emil Kowalski and Impeccable, adapted):**

- **Routine input never waits for ornamental animation.** Acknowledge input on the same frame;
  stagger and entrances never block interaction.
- **Easing by situation**: entering, exiting or responding → ease-out; moving/morphing on screen →
  ease-in-out; color/hover changes → ease; constant motion (loading bars, marquees) → linear.
  **Never ease-in on UI.** The built-in CSS curves are too weak — use strong ones and define them
  once as tokens:

  ```css
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);       /* entrances, responses */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* on-screen movement */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* sheets, sliding panels */
  ```

  Don't hand-roll curves: take them from [easing.dev](https://easing.dev) or
  [easings.co](https://easings.co).
- **Springs for things that should feel alive** — Motion's `{ type: "spring", duration: 0.5,
  bounce: 0.2 }` (`motion` is a Pixi'VN peer dependency, and `canvas.animate` accepts its options).
  Bounce 0.1–0.3 for tactile UI, up to ~0.5 for rare celebratory pops, 0 for anything the player
  waits on.
- **Interruptible.** A new input retargets the current animation from where it is; it never
  restarts from zero or queues behind it. In CSS this means transitions, not keyframes, for anything
  that can fire rapidly; springs carry velocity through an interruption.
- **Exits are faster than entrances** (~70–80% of the entry duration), and leave the way they came:
  something that slides in from the right leaves to the right; a submenu pushes in the direction of
  navigation and back reverses it.
- **Asymmetric timing where the player decides.** Hold-to-confirm (skip cutscene, delete save,
  sell a rare item) fills slowly and linearly (~1–2 s) and snaps back fast (~200 ms ease-out) on
  release.
- **Origin-aware.** Popovers, tooltips and radial menus grow from their trigger; centered modals
  stay centered.
- **Cheap properties.** Animate `transform`/`opacity` (PixiJS: `position`, `scale`, `rotation`,
  `alpha`), not layout. No `transition: all`. Blur is a legitimate crossfade mask (`blur(2px)`), but
  keep it under ~20 px and scoped — in PixiJS every filter is an extra render pass.
- **Loading screens stay smooth with CSS.** Games load assets while they animate; main-thread/rAF
  animation drops frames during heavy loading, while CSS `transform`/`opacity` animations run on the
  compositor. Use CSS (or WAAPI) for spinners and loading bars on HTML layers.

**Suggested timings (starting points, tune by feel):**

| Interaction | Duration | Notes |
| --- | --- | --- |
| Button press | 100–160 ms | squash to ~0.93–0.97, spring back with a little overshoot |
| Focus/selection move | 0–100 ms | instant if the player holds a direction to scroll |
| Tooltip | 125–200 ms after a short open delay | siblings open instantly, with no animation, once one is open |
| Panel / submenu in | 150–300 ms | `--ease-out` or a stiff spring; from 0.95 scale or a short slide |
| Modal / full-screen overlay in | 200–400 ms | centered; dim the background at the same time |
| Exit of any of the above | ~70–80% of the entry | exits are faster than entrances |
| Bar change (HP, XP) | 200–400 ms | instant main fill + delayed "ghost" chunk that drains after |
| Counter roll-up (score, coins) | 300–800 ms | skippable; tabular figures |
| Reward / level-up / unlock | 600–1500 ms | rare, celebratory, always skippable |

**Juice vocabulary** (use sparingly, on the right elements): squash & stretch, overshoot and
settle, anticipation (a tiny wind-up before a big pop), staggered entrance of list items
(30–80 ms apart, slightly non-uniform, total capped so the last item isn't late — one entrance per
container, not per scrolled section), screen-space particles on rewards, a short
shake on error (a few px, ~200 ms), a flash on hit/damage, number pop-ups, icons that fly to their
counter (a coin flies to the coin total, which then bumps).

**Sound is half the feedback.** Every meaningful interaction has a sound: focus tick, confirm,
cancel/back, error, open/close panel, reward. Keep routine sounds short and soft, pitch-vary
repeated ones slightly, and route them through a UI channel the player can mute separately
(see `pixi-vn-sound`).

**Celebration is proportional to frequency and consequence** (Impeccable's `delight`). A routine
save should simply feel *certain*; a rare drop can explode. Juice must still feel good on the
hundredth repetition — if it gets tiring, cut it down or move it to a rarer event. Never fake waiting
or delay a result to stage a flourish.

**Reduced motion** (`prefers-reduced-motion` or an in-game setting) means *fewer and gentler*
animations, not zero: drop movement, shake, zoom and parallax; keep opacity and color transitions
and every piece of feedback that confirms an action. Avoid full-screen flashes for photosensitivity
regardless of the setting.

**Judge motion in motion.** A screenshot can't show timing. Play animations at 2–5× duration or
frame by frame (Chrome DevTools' Animations panel for HTML layers), check gestures on a real
device, and look again the next day with fresh eyes.

## Menus and navigation

- **Screens are a stack.** Push an overlay, pop on back; only the top screen takes input; the
  screen below regains focus where it left off. Don't model it with booleans (`isPaused`,
  `inSettings`).
- **Back/cancel always works** and always goes to the same place: the same button (Esc, B/Circle,
  right-click, Android back) everywhere.
- **Every screen is fully usable with keyboard, gamepad, mouse and touch**, unless the target
  platform genuinely excludes one. Something is focused the moment a screen opens; focus is trapped
  inside modals; when the mouse moves, focus may follow the pointer but the screen is never left
  with nothing selected once input switches back.
- **No mandatory hover-only or drag-only interactions** — offer a button/press alternative.
- **Show input prompts for the device in use** (keyboard keys vs. gamepad glyphs), and switch when
  the player switches.
- **Confirm only the irreversible** (delete save, sell a rare item, quit without saving) and make
  the destructive option not the default focus. Prefer undo over confirmation where possible.
- **Few clicks to play.** Title → game in one press when a save exists ("Continue" is the default
  focus).
- **Pause means pause**: the game behind stops (timers, sounds that should stop, animations), but
  menu animations still run.

## Copy

- **Delete what restates the title.** "Inventory — Manage your inventory" → "Inventory".
- **Verbs on buttons that describe what happens**: "Equip", "Buy for 120", "Overwrite save" — not
  "OK", "Continue", "Submit".
- **No fabricated success toasts** for every routine action; persistent local feedback (the slot
  now shows the item as equipped) is better than "Item equipped successfully!".
- No filler eyebrow labels, taglines or decorative subheadings ("Strategic Overview"). One title per
  screen at most; functional text (costs, warnings, prompts, errors, captions) stays attached to
  what it describes.
- Write in the game's voice — but clarity first. A joke on a "delete save" dialog is a bug.

## Scaling, safe areas and resolution

- **Design at one reference resolution** (commonly 1920×1080, or the game's native pixel-art
  resolution) and scale from it with one policy: expand (HUD anchored to corners/edges, more world
  visible) or letterbox (fixed frame). The canvas size is set in `Game.init` — see `pixi-vn`.
- **Anchor to edges and corners, never hard-code absolute positions** for HUD elements.
- **Keep critical UI inside the safe area** (~90% of the screen for TV, plus device notches on
  mobile — CSS `env(safe-area-inset-*)`). Decorative art may bleed.
- **Pixel art:** integer scale steps only, nearest-neighbour sampling, snap to whole pixels, pixel
  fonts at native size multiples.
- **Test a size sweep**: at least a 16:9 (1280×720), an ultrawide (2560×1080) and a tall phone
  (1080×2340), plus 200% text scale.

## Accessibility (baseline, not extra)

- Remappable controls; hold/toggle options for held inputs; no required rapid button mashing.
- Text size option and subtitles/captions for meaningful audio.
- Never color alone (see above); offer colorblind-safe palettes for critical semantic colors.
- Separate volume sliders (music, SFX, UI, voice).
- Reduced motion / no screen shake / no flashes options.
- Enough time: timed UI (QTEs, choice timers) can be extended or disabled.

## Anti-patterns

**Web defaults in a game ("SaaS slop"):** white rounded cards on a gray background; Inter/system
font as the game's voice; a top navbar with text links; a hamburger menu; generic modal dialogs
with "OK/Cancel"; form-style settings with native browser controls; spinners instead of themed
loading; scrolling pages instead of screens.

**AI slop that also hits games** (from Impeccable's catalog): purple-to-blue gradients and cyan
glow by default, gradient text, glassmorphism everywhere, nested panels in panels, identical tile
grids, eyebrow/kicker labels above headings, a colored stripe down one side of a rounded panel, a
1px border under a wide soft shadow, gray text on colored backgrounds, emoji as icons, content stuck
at `opacity: 0` because an entrance animation never ran (the default state must be visible).

**Game-specific failures:**

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| UI looks amateur | mixed fonts, inconsistent spacing, missing states | one font pair, one spacing scale, full state kit |
| HUD unreadable in action | no contrast over bright/busy scenes | outline or scrim; reserved UI colors |
| Low-health warning missed | color-only signal | vignette + pulse + sound + number |
| Cluttered screen | everything always visible | show on change, fade the rest, move detail to menus |
| Feels sluggish | long or ease-in animations on frequent actions; input waits for animation | shorter ease-out, interruptible, instant input |
| Feels dead | no press feedback, no sound, values snap | press squash, UI sounds, tweened bars/counters |
| Feels fussy | bounce on everything | springs only on celebratory/tactile elements |
| Feels like a web page | default cursor, text selection, context menu, native scrollbars/focus ring | custom cursor, `user-select: none`, block the context menu, themed scrollbars and focus |
| Animation stutters while loading | rAF/JS animation during asset loading | CSS/WAAPI `transform`/`opacity` on the loading screen |
| Gamepad stuck | nothing focused on open, focus escapes modal | default focus per screen, focus trap, focus restore |
| Breaks at other resolutions | absolute pixel positions | anchors + margins, one scaling policy |
| Blurry pixel UI | fractional scale, smoothing | integer scale, nearest-neighbour, pixel snapping |
| Tooltip nobody reads | prose | name, one-line effect, fixed-order numbers |

## Review checklist

Review each screen in five separate passes (and run Impeccable's `critique`/`audit` and Emil's
`review-animations` if installed — interpreted through "What transfers and what flips"):

1. **Truth** — values, costs, previews and states match the real game rules; no fabricated success.
2. **Operation** — every action reachable with every supported input; back/cancel works; focus on
   open, trapped in modals, restored on close; rapid input and interrupted/failed actions behave.
3. **Access** — readable sizes and contrast over the busiest scene; never color alone; text scale;
   reduced motion; safe area; localization length.
4. **Identity** — it looks and sounds like *this* game, not a website and not a generic template;
   one consistent visual language; juice where it matters.
5. **Restraint** — remove redundant labels, badges, decorations and animations on frequent actions;
   keep all information the player needs.

A screenshot only proves visual claims. Responsiveness, timing, feel and controller behavior must
be exercised in a running build (in this repository, the playground — see `AGENTS.md`; in a game,
`pixi-vn-testing`).

## Related

- `SKILL.md` (this folder) — mounting the UI, routing, connecting to game data.
- `pixijs.md` (this folder) — building UI from PixiJS components (where tweens/filters give juice
  that HTML can't).
- `pixi-vn-canvas` — `canvas.animate`, transitions and effects for in-world feedback.
- `pixi-vn-sound` — UI sound channel, volume settings.
- `pixi-vn-minigames` — HUDs for interactive minigames.
