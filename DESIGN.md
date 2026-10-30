---
name: Education
description: Minimal Hello World scaffold for a collection of learning pages.
colors:
  paper: "#faf8f3"
  ink: "#253b32"
  muted: "#53665c"
  accent: "#235c42"
  accent-hover: "#17442f"
  rule: "#cbd2c8"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(3rem, 9vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.75rem, 4vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.1
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.9rem"
    lineHeight: 1.65
rounded:
  button: "6px"
spacing:
  small: "0.5rem"
  medium: "1rem"
  paragraph: "1.5rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
---

# Design System: Education

## Overview

A small, text-led Hello World page serves as a build, publishing, and JavaScript smoke test. Cream paper, green ink, and serif headings give the current scaffold a quiet, readable appearance; this records the shipped interface rather than establishing a larger brand.

**Key Characteristics:**
- Warm paper background and one green accent.
- Serif headings paired with system sans-serif text.
- Responsive shared header and footer, with a native counter button.
- No imagery or animated transitions in the current page.

## Colors

The frontmatter contains the exact palette used by the shared stylesheet.

### Primary
- **Accent:** links, button background, selection background, and keyboard focus outlines.
- **Accent hover:** interactive hover color.

### Neutral
- **Paper:** page background and button text.
- **Ink:** primary text.
- **Muted:** introduction, header, and footer text.
- **Rule:** fine separators between page regions.

## Typography

Georgia with Times New Roman and serif fallbacks supplies the display and section headings. System sans-serif supplies body text, links, labels, and the button. Headings use regular weight and balanced wrapping; the introduction scales from 1.15rem to 1.4rem. Paragraphs have a maximum measure of 65ch, and the introduction uses 42ch. The counter uses tabular numerals.

## Layout

The centered body has a maximum width of 68rem, including responsive horizontal padding of `clamp(1.25rem, 5vw, 4rem)`. A vertical flex layout keeps the footer below the expanding main region. Main padding scales from 3.5rem to 7rem.

Header, footer, and counter controls wrap naturally without breakpoint rules. Header and footer distribute their contents across the available width; the counter button and result share a wrapping row. Thin rules separate the header, counter section, and footer.

## Elevation & Depth

The current interface is flat: no shadows or raised surfaces. Spacing and rules distinguish regions.

## Shapes

The button has gently rounded corners using the frontmatter radius. Page regions remain open, with straight, single-pixel separators.

## Components

- **Primary button:** native button, minimum height 48px, semibold inherited text, and the primary/hover variants above. Disabled state uses 0.55 opacity and a not-allowed cursor. It starts disabled and becomes available after the counter script initializes.
- **Links and shared navigation:** green links with an underline offset of 0.25em. The header's Education home link is bold, 1.15rem, and unadorned; footer links retain their underline.
- **Keyboard access:** a 3px accent outline with 5px offset marks visible focus. The skip link appears on focus and targets the main content.
- **Counter result:** a polite, atomic live status announces the updated count. A noscript message explains how to enable the counter. The current interface has no animated state transitions.

## Do's and Don'ts

### Do:
- Do use the shared palette, layout, and typography recorded here when maintaining the scaffold.
- Do preserve visible keyboard focus and the native button's accessible status feedback.

### Don't:
- Don't describe unimplemented learning-page features as part of this design system.
