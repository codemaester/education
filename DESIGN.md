---
name: Education — Modern Classic
description: An editorial learning collection in warm paper, forest ink, and terracotta.
colors:
  paper: '#f8f6f0'
  surface: '#fffdf8'
  forest: '#263d35'
  forest-deep: '#1a3028'
  terracotta: '#b75b42'
  terracotta-dark: '#99452e'
  sage: '#cbd4c3'
  sage-light: '#e9ede3'
  sand: '#e4dbca'
  muted: '#59685e'
  rule: '#d5d8cc'
  correct: '#31654b'
  incorrect: '#a13e31'
  clay-surface: '#efe0d6'
  clay-ink: '#95482f'
  sand-surface: '#eee7d8'
  sand-ink: '#6c603f'
  ray-reflected: '#53765e'
  ray-outgoing: '#7c7054'
typography:
  display:
    fontFamily: '''Newsreader Variable'', Georgia, serif'
    fontSize: clamp(2.75rem, 6vw, 5.5rem)
    fontWeight: 450
    lineHeight: 1.05
    letterSpacing: -0.025em
  display-home:
    fontFamily: '''Newsreader Variable'', Georgia, serif'
    fontSize: clamp(3.75rem, 7vw, 6rem)
    fontWeight: 450
    lineHeight: 1.05
    letterSpacing: -0.025em
  display-course:
    fontFamily: '''Newsreader Variable'', Georgia, serif'
    fontSize: clamp(3rem, 5.5vw, 5.25rem)
    fontWeight: 450
    lineHeight: 1.02
    letterSpacing: -0.025em
  headline:
    fontFamily: '''Newsreader Variable'', Georgia, serif'
    fontSize: clamp(2rem, 3.5vw, 3.25rem)
    fontWeight: 450
    lineHeight: 1.05
    letterSpacing: -0.025em
  lesson-headline:
    fontFamily: '''Newsreader Variable'', Georgia, serif'
    fontSize: clamp(2rem, 3.2vw, 2.8rem)
    fontWeight: 450
    lineHeight: 1.12
    letterSpacing: -0.025em
  lesson-title:
    fontFamily: '''Newsreader Variable'', Georgia, serif'
    fontSize: 1.65rem
    fontWeight: 550
    lineHeight: 1.2
  body:
    fontFamily: '''Manrope Variable'', system-ui, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.7
  lesson-body:
    fontFamily: '''Manrope Variable'', system-ui, sans-serif'
    fontSize: 0.9rem
    fontWeight: 400
    lineHeight: 1.8
  button:
    fontFamily: '''Manrope Variable'', system-ui, sans-serif'
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.5
  subject-title:
    fontFamily: '''Newsreader Variable'', Georgia, serif'
    fontSize: 1.45rem
    fontWeight: 500
    lineHeight: 1.2
rounded:
  small: 6px
  panel: 14px
spacing:
  space-1: 0.25rem
  space-2: 0.5rem
  space-3: 0.75rem
  space-4: 1rem
  space-6: 1.5rem
  space-8: 2rem
  space-12: 3rem
  space-16: 4rem
components:
  button-primary:
    backgroundColor: '{colors.forest}'
    textColor: '{colors.paper}'
    typography: '{typography.button}'
    rounded: '{rounded.small}'
    padding: 0.75rem 1.2rem
  button-primary-hover:
    backgroundColor: '{colors.forest-deep}'
    textColor: '{colors.paper}'
  button-secondary:
    backgroundColor: transparent
    textColor: '{colors.forest}'
    typography: '{typography.button}'
    rounded: '{rounded.small}'
    padding: 0.75rem 1.2rem
  button-secondary-hover:
    backgroundColor: '{colors.sage-light}'
    textColor: '{colors.forest}'
  chapter-panel:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.forest}'
    rounded: '{rounded.panel}'
    padding: clamp(1.5rem, 3vw, 3rem)
  written-response:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.forest}'
    rounded: '{rounded.small}'
    padding: 0.85rem
  subject-symbol:
    backgroundColor: '{colors.sage-light}'
    textColor: '{colors.forest}'
    rounded: 50%
    width: 54px
    height: 54px
  assessment-option-selected:
    backgroundColor: '{colors.sage-light}'
    textColor: '{colors.forest}'
    rounded: '{rounded.small}'
    padding: 0.75rem 0.5rem
  live-badge:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.muted}'
    rounded: '{rounded.small}'
    padding: 6px 9px
---

# Design System: Education

## Overview

**Creative North Star: "Modern Classic"**

Modern Classic is the selected visual world: an inviting editorial learning collection, with warm paper, forest ink, a human serif, and restrained terracotta accents. It pairs spacious introductions with denser, clearly structured learning material. The approved brand board at `documentation/visual-directions/03-modern-classic.png` defines the visual identity; it is not a page-layout specification. The other exploration boards remain unselected alternatives.

The theme is shared by the home page, subject overviews, Optik and its study sheet, and the √2 mathematics lesson. Subject icons, visible names, and consistent navigation make it extensible across disciplines. The Optik illustration sets an editorial mood; exact scientific relationships remain the job of the diagrams and simulations. Mathematics adds a native vector course cover showing a square of area 2 and side length √2 within the same visual world. The home page presents the newest catalog courses in a reusable featured carousel while preserving this editorial composition.

**Key Characteristics:**

- Self-hosted Newsreader headings and italic accents with Manrope body text and controls.
- Warm paper and flat tonal surfaces, fine rules, and modest corner rounding.
- A lens brand mark and consistent line icons with visible subject names.
- Responsive subject directories, readable learning panels, and a separate ink-friendly print treatment.

## Colors

The normative palette is in the frontmatter and comes from the implemented styles, including the deliberately scoped icon and diagram colors.

### Primary

- **Forest / forest deep:** primary text, navigation, buttons, and their hover state. Paper supplies the button text.
- **Terracotta / dark terracotta:** the lens mark, diagram emphasis, and keyboard focus; the darker variant supplies small accent text and italic heading emphasis.

### Secondary

- **Sage / light sage:** selection, subject symbols, notes, selected answers, simulation surrounds, and the featured lesson composition.
- **Sand:** chapter numbers and simulation explanations.
- **Clay and sand icon pairs:** intentional tinted subject-symbol surfaces and matching darker ink; they do not replace the shared text palette.

### Neutral

- **Paper / surface:** the warm page and lighter chapter or diagram surfaces.
- **Muted / rule:** supporting text and single-pixel dividers.

Correct and incorrect are semantic feedback colors, accompanied by status text. Reflected and outgoing ray colors distinguish scientific paths alongside labels. The scoped Optik adapter also retains local warning tones and neutral diagram details; these are not additional brand accents. The `.sqrt2-page` adapter uses a local sage `#718971` for alternating parity cells, alongside shared sage and a terracotta remainder; this diagram treatment does not extend the global palette.

**The Shared World Rule.** Use the same core palette, type families, navigation, and control language across subjects; adapt the subject illustration and scientific diagrams.

## Typography

Newsreader Variable, with Georgia and serif fallbacks, supplies display headings and editorial titles. Manrope Variable, with system sans-serif fallbacks, supplies body text and controls. Both are self-hosted; Newsreader's italic face is loaded explicitly. Heading emphasis inherits the surrounding weight and uses dark terracotta.

The frontmatter records actual desktop roles rather than imposing a new uniform ramp. The global heading caps at 5.5rem; the home heading reaches 6rem and the Optik hero 5.25rem. Section headings start at 2rem. At 740px and below, the home heading uses `clamp(3.5rem, 11vw, 5rem)`, the course heading uses `clamp(2.9rem, 10vw, 4rem)`, and chapter headings become 2rem. These are intentional variants of the same family.

The √2 lesson retains scoped mathematical roles: its hero caps at 5.25rem, with `clamp(2.8rem, 10vw, 4rem)` below 600px; section headings use `clamp(2.2rem, 3.5vw, 3.25rem)` and become 2.15rem below 600px. Section leads use 0.95rem. Stacked fractions and lining, tabular numerals preserve the imported mathematical notation without introducing another font family.

Body copy starts at 1rem with a 1.7 line-height; Optik paragraphs use 0.9rem with a 1.8 line-height. Supporting metadata and navigation range from 0.65rem to 0.8rem; preserve their secondary role. Hero introductions typically use 39–50ch measures, with longer instructional introductions around 65–70ch. Subject names use medium serif titles; controls use semibold Manrope. Numerical simulation values use tabular numerals.

## Layout

The shared centered shell has a maximum width of 76rem and horizontal gutters of `clamp(1.25rem, 4vw, 3.5rem)`. The spacing tokens run from 0.25rem to 4rem; larger section separation and panel padding use the fluid values in the page styles.

The home pairs an editorial introduction with a featured-course carousel. Its slides overlap in one shared grid area, reserving the tallest composition so course changes keep a stable height. Carousel controls wrap and retain 44px minimum targets; at 740px and below, captions sit below the graphic so they cannot cover mathematical labels. The subject directory uses open rows with separators: three columns, two below 1050px, and one below 440px. Hero and featured compositions stack below 740px. Course lists become a vertical sequence at that breakpoint. Subject pages show their actual availability, including an honest empty state when no lessons exist.

The lesson uses a 210px chapter sidebar beside flexible content; below 1100px it becomes one column with the sticky chapter toolbar. Simulation controls respond to their own container at 720px and 480px. Preserve minimum widths of zero on flexible content and visible wrapping of labels. The shared header shrinks below 600px and wraps below 440px.

The √2 lesson has five sections and a wrapping sticky section navigation. Its hero and proof navigation stack at 910px; paired content becomes one column at 690px. Keep these local responsive rules within the mathematics scope. Its full-lesson print view shows the explanations and all proof steps, opens FAQ content, and omits interactive controls and the quiz; it is separate from the Optik study sheet.

The study sheet is a distinct two-page A4 layout with a 10mm print margin, white background, dark ink, no site navigation, and explicit page breaks. Its print body is 9.5pt/1.32 and section headings are 13pt. Screen presentation adapts below 720px; print dimensions must remain independent of screen stacking.

## Elevation & Depth

The museum number zoom pairs a fixed [1, 2] overview with a lens showing the
current exact interval and its 10ⁿ magnification. A flat terracotta selection
links both views; below 740px they stack. A 1250ms step holds the selected tenth
for 350ms, then expands it for 900ms with cubic deceleration. A short status
message identifies the selected tenth and confirms arrival in the new interval.
Ticks and the √2
marker share the camera; zooming out reverses the scale change. Subpixel
selections become a labelled location mark, never an inflated interval. Range
jumps, reset and interrupted steps settle immediately. Reduced motion removes
spatial movement while preserving all numerical feedback; initial load is static.

Ordinary surfaces are flat. Paper, surface, sage, sand, borders, and whitespace provide separation. The featured lesson is one contained composition; subject entries remain flat rows. The floating chapter picker uses a restrained forest-tinted shadow (`0 12px 28px rgba(38, 61, 53, 0.1)`). The inherited critical-angle marker retains its small indicator shadow (`0 2px 8px rgba(0,0,0,.18)`). These exceptions are functional rather than a general card style.

**The Flat Surface Rule.** Use spacing, rules, and tonal backgrounds for ordinary content; reserve shadows for floating controls and small functional indicators.

## Shapes

Small controls, notes, answer fields, and labels use the small radius; chapter panels, simulation frames, and editorial image containers use the panel radius. Fine borders organize dense learning content. Subject symbols are circular. The lens mark combines thin optical lines with a terracotta center; shared icons use rounded line caps and joins, a 24-unit view box, and a 1.6 stroke. Keep their accompanying text visible.

## Components

The infinite hotel uses small numbered gouache-painted people with paper grain
inside their transparent silhouettes for both existing and new guests. Forest doors and travelers identify existing guests; terracotta identifies
new arrivals. Two labelled rule blocks have a 2rem gap and stack below 740px;
an underline marks the active rule. Both one-guest and bus scenarios use the same
9.7s narrated sequence: 1.2s preparation, 0.7s exit, 0.9s aisle hold, 2.2s
relocation, 1.6s empty-room hold, 1.1s arrival explanation and 2s entry. Travelers leave
their actual doors, follow measured aisle paths across the responsive room rows,
and enter the assigned doors without fading. Each incoming image is decoded
before replacing the waiting figure, and the room receives it at matching size.
Narrower, knob-free active doors leave room for seven progressively compressed,
fading door silhouettes representing the infinite continuation. On narrow screens
this continuation follows below the two active room rows. It replaces the former
continuation sentence. Departing guests walk straight off the right
edge of their own aisle without a background tile or an early fade. A short
caption above the scene explains each transition, and Pause/Continue controls
both motion and explanatory holds. A waiting area shows the incoming guest or the
first four of infinitely many bus guests. Reset and mode changes cancel the
sequence; replay starts it again. Reduced motion, hidden or offscreen stages,
and size changes settle to the correct final occupancy without leftover figures.

The museum circle walkers keep each step-size select centered below its own
circle. Their shared 1–60 steps/s tempo slider (default 2) displays the current
value alongside Start/Stop and the manual actions in one wrapping control row.
The slider fills the remaining row width through the right content edge and
occupies the full line when the controls wrap.
Changing tempo preserves the running experiment; narrow screens wrap controls
and stack the two circles using the existing museum breakpoints.

- **Buttons:** forest on paper for primary actions, transparent with a rule border for secondary actions; both use the small radius, 48px minimum height, and arrow icons where appropriate. Primary hover deepens the forest; secondary hover adds light sage. Shared keyboard focus is a 3px terracotta outline with a 4px offset. Scoped imported learning controls retain their forest focus treatment.
- **Navigation:** the lens and serif Education wordmark lead home; Manrope links guide to subjects and Optik. Current lesson navigation uses dark terracotta, with selected chapter links on light sage. The skip link becomes visible on focus. The compact chapter picker is a native disclosure.
- **Subject directory:** circular line-icon symbols, serif names, muted descriptions, truthful availability, and a trailing arrow. Hover adds a light sage surface. Avoid presenting unavailable lessons as working course links.
- **Course illustration:** `CourseImage` chooses its subject-specific cover from the catalog: `optics` uses `src/assets/optics-editorial.png` with responsive Astro WebP sizes; `sqrt-two` uses the native SVG in `MathCourseArt`. Crop editorial artwork responsively and keep its caption separate from scientific instruction. The Optik generation prompt is recorded with the source asset and in the visual-directions documentation.
- **Featured courses:** `FeaturedCourses` takes its title, artwork, subject, level, description, features, and chapter or section label from the catalog. Show at most five courses in descending `addedOrder` (currently √2 mathematics, then Optik). Previous/next, Pause/Start, a counter, and direct subject-icon buttons with visible short titles provide navigation. Hover temporarily pauses rotation; focus, touch, and manual selection stop it until explicit Start. An offscreen carousel or hidden tab suspends the timer. Inactive slides are inert and hidden from assistive technology; only manual changes are announced, and selection never moves keyboard focus. Without JavaScript, the newest slide remains accessible and controls stay hidden. Omit controls for one course and the entire block for none.
- **Learning panels:** light surface chapters, sand chapter numbers, sage notes, and flat nested content establish hierarchy. Simulation frames use sage surrounds with lighter stages. Narrow-SVG labels receive readable text sizing and repositioning without changing ray geometry; native static sketches remain available without JavaScript.
- **Mathematics experiments and proof:** four approximation choices and six parity choices use forest pressed states; seven proof steps remain fully readable beside a current-step navigator. The three-question quiz provides explicit feedback and reset. JavaScript-dependent controls remain disabled until initialization; the explanation and proof remain readable without JavaScript. Catalog metadata can use `chapterLabel` to distinguish “Abschnitte” from chapters.
- **Fields and assessment:** native sliders, selects, radio controls, and resizable paper textareas retain labels. Selected final-assessment options use light sage; explicit evaluation adds correctness text, explanations, and repetition links. Disabled submission is dimmed. Chapter results, the final assessment, and the ungraded transfer response remain distinct.
- **Video and print:** forest video artwork shares the panel radius and visible playback controls. The study sheet uses the same fonts and dark accents while keeping print surfaces white and omitting screen navigation and video controls.

Buttons and subject rows transition background and text color for 160ms with ease-out only when reduced motion is not requested. Featured courses rotate every eight seconds with a 250ms fade. Reduced motion starts the carousel static and removes its transition; deliberate Start can enable timed changes without animation. Imported beam flow runs for 1.15s linearly and stops for reduced motion. Do not add ambient page motion.

## Do's and Don'ts

### Do:

- Do reuse the shared theme and base layout when adding a subject or learning page.
- Do use dark terracotta for small accent text and pair feedback colors with explicit status text.
- Do preserve visible keyboard focus, native controls, and the static learning alternatives without JavaScript.
- Do check diagram labels at narrow widths and the study sheet as a two-page A4 printout after relevant changes.

### Don't:

- Don't treat an exploration board as a page-layout template or promote the unselected directions into the active identity.
- Don't replace the flat subject directory with a grid of raised cards.
- Don't use the editorial illustration as a substitute for a scientifically accurate diagram.
- Don't let imported styles escape their `.optics-page`, `.study-sheet-page`, or `.sqrt2-page` scopes.
