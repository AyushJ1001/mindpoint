---
name: The Mind Point
description: A calm waterside learning sanctuary for accountable education workflows.
colors:
  deep-botanical: "#003f43"
  flow-teal: "#0c6f73"
  flow-teal-strong: "#07575b"
  ink: "#123f40"
  muted-ink: "#58706d"
  soft-sage: "#dcecea"
  mist: "#bcd8d3"
  warm-ivory: "#fffaf0"
  paper: "#eef5f1"
  panel-sage: "#e7f0eb"
  bank-sage: "#edf3ed"
  field: "#fffdf8"
  waterline: "rgba(7, 77, 79, 0.15)"
  focus-teal: "#2b8585"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 2
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  field: "14px"
  button: "16px"
  current-band: "18px"
  role-tab: "20px"
  shell: "24px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "40px"
  5xl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.flow-teal}"
    textColor: "{colors.warm-ivory}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.flow-teal-strong}"
    textColor: "{colors.warm-ivory}"
    rounded: "{rounded.button}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.flow-teal-strong}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "8px 16px"
    height: "36px"
  field-default:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.field}"
    padding: "8px 12px"
    height: "36px"
  role-tab-active:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.role-tab}"
    padding: "12px"
  status-chip:
    backgroundColor: "{colors.soft-sage}"
    textColor: "{colors.flow-teal-strong}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  work-shell:
    backgroundColor: "{colors.warm-ivory}"
    textColor: "{colors.ink}"
    rounded: "{rounded.shell}"
---

# Design System: The Mind Point

## Overview

**Creative North Star: "The Tidal Learning Sanctuary"**

The Mind Point feels like a calm body of knowledge with work moving through it in a clear, accountable current. Deep botanical teal establishes trust and direction; warm ivory holds focused work; sage surfaces form quiet banks around supporting context. The supplied TMP leaf mark and full wordmark anchor the experience in nature without turning the product into decoration.

The system is spacious, grounded, and operational. Editorial display type brings humane warmth to moments of orientation and reflection, while the sans-serif body face keeps tasks direct and legible. Fine waterline rules organize evidence and responsibility; state changes settle quickly, with a single slow shimmer reserved for progress.

**Key Characteristics:**

- Calm botanical color with warm, paper-like working surfaces
- One authoritative workspace framed by contextual banks
- Editorial Fraunces headings paired with direct Plus Jakarta Sans controls
- Ruled rows and tonal fields instead of generic dashboard-card grids
- Quiet flowing motion that respects reduced-motion preferences
- The supplied TMP leaf mark and full “The Mind Point” name as brand anchors

## Colors

The palette moves from deep water to pale shoreline: teal carries authority and action, sage holds context, and ivory protects concentration.

### Primary

- **Deep Botanical** (`deep-botanical`): The darkest brand current, used for the preview status band, high-authority framing, and display text that needs maximum gravity.
- **Flow Teal** (`flow-teal`): The principal action and progress color; it marks the current task, interactive commitment, and flowing completion state.
- **Deep Flow Teal** (`flow-teal-strong`): The hover, emphasized-link, and selected-detail tone.

### Secondary

- **Soft Sage** (`soft-sage`): Selected rows, status chips, and low-pressure active states.
- **Mist** (`mist`): Supporting text on deep teal and the lightest visible trace of the water motif.

### Neutral

- **Warm Ivory** (`warm-ivory`): The authoritative work canvas and shell surface.
- **Paper** (`paper`): The environmental page ground behind the application shell.
- **Panel Sage** (`panel-sage`): The Role rail and persistent navigational bank.
- **Bank Sage** (`bank-sage`): Contextual sidebars, queue headers, and supporting evidence areas.
- **Field** (`field`): Input and textarea fill, kept slightly brighter than the surrounding ivory.
- **Ink** (`ink`): Primary text, labels, and high-contrast icons.
- **Muted Ink** (`muted-ink`): Secondary metadata and explanations.
- **Waterline** (`waterline`): Fine dividers that structure rows and regions without hard boxing.
- **Focus Teal** (`focus-teal`): Keyboard focus emphasis.

### Named Rules

**The One Current Rule.** Flow Teal identifies the active path and primary commitment; keep it concentrated so the next valid action remains unmistakable.

**The Warm Work Rule.** Focused work lives on Warm Ivory or Field, while sage is reserved for navigation, context, and state.

## Typography

**Display Font:** Fraunces (with Georgia and serif fallbacks)  
**Body Font:** Plus Jakarta Sans (with system-ui and sans-serif fallbacks)  
**Label/Mono Font:** JetBrains Mono (with ui-monospace and monospace fallbacks)

**Character:** Fraunces makes learning feel reflective, grounded, and human. Plus Jakarta Sans keeps instructions and controls crisp; JetBrains Mono appears sparingly where counts, sequence, or waiting time should read as operational evidence.

### Hierarchy

- **Display** (semibold, fluid 36–48px, 1.08 line-height): Activity titles and the strongest reflective statement.
- **Headline** (semibold, 30px, 1.2 line-height): Workspace titles such as Review desk and Activity settings.
- **Title** (semibold, 24px, 1.5 line-height): Contextual headings and quotations.
- **Body** (regular, 16px, 2 line-height): Learning instructions and longer guidance, generally constrained to about 68 characters per line.
- **Label** (semibold, 12px, 0.02em letter-spacing): Controls, metadata, statuses, and compact navigation.
- **Data** (regular, 12px): Sequence numbers, counts, and elapsed time only.

### Named Rules

**The Reflective Voice Rule.** Use Fraunces for meaning, orientation, and moments of contemplation; use Plus Jakarta Sans for every instruction, action, and operational fact.

## Layout

The application sits inside a centered 1600px maximum-width field with 12px mobile gutters, expanding to 20px from 640px upward. A compact status current precedes one rounded work shell. Desktop establishes a narrow 220px Role rail; each role then owns a dominant central canvas with a 290–360px contextual bank where needed.

At the 1024px structural breakpoint, Role choices move into a three-column row, secondary columns collapse into the reading order, and the work canvas leads. At 640px, the header stacks while preserving the full brand name, Course identity, avatar, and all three Role choices without horizontal scrolling. Interior spacing follows a steady 8px base rhythm, with 24–40px separating sections and up to 56px around long-form learning content.

**The One Basin Rule.** Compose a single authoritative work surface with rails, ruled regions, and contextual banks; do not fragment the interface into a grid of detached cards.

## Elevation & Depth

Depth is ambient rather than structural. The page background uses a pale botanical wash, the deep current band floats with a restrained teal shadow, and the main ivory shell receives the broadest low-opacity lift. Inside the shell, surfaces remain flat and are distinguished by tone and waterline rules. Active Role tabs receive a small local shadow so selection feels settled above its bank.

### Shadow Vocabulary

- **Current Float** (`0 14px 36px rgba(0, 62, 65, 0.16)`): The deep status current above the shell.
- **Sanctuary Lift** (`0 20px 55px rgba(0, 62, 65, 0.11)`): The full application shell only.
- **Role Rest** (`0 8px 24px rgba(49, 37, 63, 0.08)`): The active Role tab against its sage rail.

### Named Rules

**The Flat Within Rule.** Keep working regions flat at rest; use tonal layering and fine rules for structure, reserving shadows for the outer shell and the active Role choice.

## Shapes

The form language is softly eroded and generous: the main shell uses a 24px radius, the status current uses 18px, Role selections use 20px, and buttons settle at 16px. Fields are gently curved at 14px, while status chips and progress tracks are fully pill-shaped. Borders are quiet, translucent teal waterlines; hard black outlines and ornamental containers do not belong.

**The River-Stone Rule.** Larger enclosing surfaces receive the larger curve; small state markers become pills; row structure stays ruled rather than individually rounded.

## Components

### Buttons

- **Shape:** Soft, substantial corners (16px) with compact 36px default height; small controls use a 32px height.
- **Primary:** Flow Teal with Warm Ivory text and 8px by 16px padding.
- **Hover / Focus:** Hover deepens to Deep Flow Teal and lifts by 2px; keyboard focus uses a visible three-pixel pale-teal outline with a three-pixel offset. State transitions use the settling curve documented in the sidecar.
- **Outline / Ghost:** Outline actions use transparent or paper-like fills, a teal waterline, and Deep Flow Teal text. Ghost filters use Soft Sage for hover or selection.

### Chips

- **Style:** Fully pill-shaped Soft Sage fields with Deep Flow Teal text and 4px by 12px padding.
- **State:** Use for compact current-state language such as “In progress,” not as a substitute for buttons.

### Cards / Containers

- **Corner Style:** The single work shell uses a generous 24px corner; its internal regions are not separately rounded.
- **Background:** Warm Ivory for work, Panel Sage for persistent navigation, and Bank Sage for context.
- **Shadow Strategy:** Only the outer shell uses Sanctuary Lift; internal hierarchy is tonal and ruled.
- **Border:** Fine Waterline dividers between regions and rows.
- **Internal Padding:** 24px on compact regions, increasing through 32px and 40px for focused work.

### Inputs / Fields

- **Style:** Bright Field fill, Ink text, a subtle teal border, and a gentle 14px curve.
- **Focus:** A visible Focus Teal border/ring treatment; never rely on a color shift alone.
- **Error / Disabled:** Disabled controls remain legible at half opacity and cannot imply an available action. Error treatment should preserve the same field silhouette and add explicit text.

### Navigation

Role navigation is a persistent left bank on desktop and a three-column row on mobile. The active Role rests on white with Ink text and a local shadow; inactive Roles use Muted Ink and may wash toward white on hover. Activity navigation uses full-width ruled rows, Soft Sage for the current item, and explicit complete, available, or locked marks.

### Progress Current

The progress track is a quiet white pill on sage. Flow Teal fills it, while one slow ivory shimmer travels across the current on a 4.8-second cadence. Disable the shimmer under reduced-motion preferences.

## Do's and Don'ts

### Do:

- **Do** use the exact full name “The Mind Point” and the supplied TMP leaf mark or full wordmark as the visual anchor.
- **Do** place the next valid action in Flow Teal and keep supporting actions quieter.
- **Do** separate work, navigation, and context with tonal banks and fine waterline rules.
- **Do** preserve generous breathing room and a clear reading measure around reflective learning content.
- **Do** keep keyboard focus visible and provide a reduced-motion path for every moving treatment.

### Don't:

- **Don't** return to the generic lavender dashboard palette or detached dashboard-card grids.
- **Don't** use sage as a competing primary action color; it is a contextual and state-bearing field.
- **Don't** multiply shadows inside the shell or box every section in its own rounded container.
- **Don't** turn the nature metaphor into decorative waves, vague copy, or ornamental clutter.
- **Don't** abbreviate the brand name in product-facing identity text.
