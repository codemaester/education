# Learning-page visual directions

Five exploratory image references for palette, typography and graphic language.
**Modern classic — Editorial Light** was selected for the learning website.
The other four images remain exploration references. The implemented system
is documented in `../../DESIGN.md` and `../THEME.md`.

The boards use common German learning-content samples, with optics as the
example subject. The identity should also support other subjects, chapter
navigation, interactive diagrams, video previews, quizzes and printable summaries.

| Direction | Visual character | Candidate type pairing | Reference image |
| --- | --- | --- | --- |
| Ultra-modern — Signal Lab | Dark charcoal, chartreuse, optical precision and geometric typography | Space Grotesk + Inter | [View board](01-ultra-modern.png) |
| Classic — Natural Philosophy | Ivory, navy, oxblood, book typography and engraved scientific figures | Libre Baskerville + Source Serif 4 | [View board](02-classic-scholarly.png) |
| Modern classic — Editorial Light | Warm white, forest green, terracotta and restrained editorial graphics | Newsreader + Manrope | [View board](03-modern-classic.png) |
| Gothic — Illuminated Knowledge | Charcoal, vellum, burgundy, Gothic display accents and architectural framing | UnifrakturCook + Source Sans 3 | [View board](04-gothic-manuscript.png) |
| Bauhaus-inspired — Learning Workshop | Warm white, primary colors, constructive shapes and experimental composition | Outfit + Atkinson Hyperlegible | [View board](05-bauhaus-workshop.png) |

## Palette specifications

Each row lists ground, primary ink, and supporting accent/surface colors.
The numeric values are the proposed specification for later implementation;
generated image colors and type are visual approximations.

- **Ultra-modern — Signal Lab:** `#101318`, `#F4F7F4`, `#D6FF3F`, `#A8D8FF`, `#6F7D88`.
- **Classic — Natural Philosophy:** `#F4ECDD`, `#172C42`, `#752E3D`, `#B29458`, `#756E62`.
- **Modern classic — Editorial Light:** `#F8F6F0`, `#263D35`, `#B75B42`, `#CBD4C3`, `#E4DBCA`.
- **Gothic — Illuminated Knowledge:** `#191B22`, `#EEE4CF`, `#6A263D`, `#A88F57`, `#607C73`.
- **Bauhaus-inspired — Learning Workshop:** `#F2EDDF`, `#202B31`, `#DF4C38`, `#2357B7`, `#E6B940`.

## Typography and learning materials

Font names are candidate pairings, not a claim that the raster image renders the
exact font files. A chosen pairing must be checked with real German text and
interactive controls when mockups become code. Gothic lettering is reserved for
short display accents; reading text and controls remain clear.

All directions must carry the same learning requirements in
[Anforderungen an Lernseiten](../LERNSEITEN_ANFORDERUNGEN.md).
A dark screen direction still needs a readable, ink-friendly A4 learning sheet.

## Using these references for page mockups

Choose a direction, then pass its board as an image reference when generating
page mockups. Keep its palette, type hierarchy, illustration treatment and
component language coherent across chapter overview, lesson, video, exercise
and learning-sheet views. Use real course content to test the visual system.
The reference is an art direction, not an instruction to copy its board layout
as a website.

## Generation record

Created with the built-in Imagegen tool. Exact generation prompts, palette
values and candidate font pairings are preserved in [prompts.json](prompts.json).
The prompts are also embedded in the delivered PNG files for reuse.
