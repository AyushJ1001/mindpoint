---
name: The Mind Point
description: Psychology learning, practice, and care with a coastal editorial identity.
colors:
  primary: "#0f4d4d"
  ink: "#123f3d"
  coastal-ink: "#173f3d"
  background: "#fbfaf6"
  card: "#fffdf8"
  ivory: "#faf8f3"
  secondary: "#e7f1ee"
  muted: "#f0ede4"
  muted-foreground: "#5e706d"
  accent: "#dcebea"
  border: "#cdd9d5"
  input: "#f7f5ef"
  ring: "#69a7a6"
  sea-glass: "#8ec1c3"
  sea-glass-light: "#9fd0cf"
  sea-glass-highlight: "#b9dedd"
  warm-sand: "#d9c6ae"
  gold: "#b79755"
  portal: "#0b3f3e"
  portal-body: "#d2e1de"
  portal-diagram: "#f8f5ee"
  dark-background: "#102f2e"
  dark-foreground: "#f7f3ea"
  dark-secondary: "#1d4947"
  dark-muted: "#1a4442"
  dark-muted-foreground: "#c4d2cf"
  dark-accent: "#245451"
  dark-border: "#35615f"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(3.25rem, 8vw, 7.5rem)"
    fontWeight: 500
    lineHeight: 0.88
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 700
    letterSpacing: "0.24em"
rounded:
  selection: "0.75rem"
  field: "0.875rem"
  card: "1.15rem"
  panel: "1.5rem"
  image: "2rem"
  pill: "999px"
spacing:
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  6: "1.5rem"
  7: "1.75rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
  32: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.pill}"
    padding: "0.875rem 1.75rem"
  button-primary-hover:
    backgroundColor: "{colors.coastal-ink}"
  button-inverse:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "0.875rem 1.75rem"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
  input:
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  navigation:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
  batch-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.card}"
    rounded: "{rounded.selection}"
    padding: "1rem 1.25rem"
  program-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
  portal-journey:
    textColor: "{colors.ivory}"
    padding: "2rem"
  portal-diagram:
    backgroundColor: "{colors.portal-diagram}"
    textColor: "{colors.coastal-ink}"
    padding: "1.75rem"
  portal-promo:
    backgroundColor: "{colors.portal}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.panel}"
    padding: "2rem"
---

# Design System: The Mind Point

## Overview

**Creative North Star: "The Coastal Psychology Journal"**

The Mind Point pairs Cormorant Garamond headlines with Manrope text, coastal photography, and a deep-teal, sea-glass, sand, and ivory palette. The botanical TMP mark and the promise "Learn · Grow · Heal · Belong" connect education and personal support.

The public site uses the pacing of a psychology journal: generous section spacing, large serif headings, numbered pathway rows, and short blocks of explanatory text. Course selection and learner actions use clearer, denser controls within the same palette. Deep-teal sections give the Learning Portal and key calls to action a distinct place in that sequence.

This name describes the implemented direction; it is not a separately approved brand tagline. Extracted from `app/brand-refresh.css`, `app/brand.css`, the current public routes, and shared components. The import order in `app/layout.tsx` is globals, brand, then brand-refresh. Later route-specific styles can refine those defaults.

**Key Characteristics:**

- Botanical identity and coastal photography.
- Cormorant headlines with italic emphasis; Manrope for reading and controls.
- Ivory pages, teal actions, sea-glass panels, and small gold details.
- Editorial rows for explanation; structured cards for choosing programs.

## Colors

The palette uses deep teal for reading and action, with ivory pages and sea-glass sections. Token values above are normative.

### Primary

`primary` is the main action color. `ink` is the current semantic foreground, while `coastal-ink` remains in the photography-led marketing sections. `portal` is the darker background shared by the Learning Portal hero and promotional panel.

### Secondary

`sea-glass` and its light variants support imagery, icons, and italic emphasis on dark sections. `secondary` and `accent` provide quiet section fills and selected or hovered states. Use `portal-body` for longer copy inside the fixed dark portal panel.

### Tertiary

`warm-sand` softens background treatments. `gold` marks a short rule, an editorial numeral, or a restrained quotation ornament. It is not the default action color.

### Neutral

`background` is the semantic page canvas, `card` the panel fill, and `ivory` the established photographic and dark-section foreground. `muted-foreground` carries supporting copy; `border` separates content; `input` and `ring` serve form states.

The dark theme maps background to `dark-background`, foreground to `dark-foreground`, card to `coastal-ink`, primary to `sea-glass-light`, and primary text to `dark-background`. Secondary, muted, accent, and borders use their named dark counterparts. The source also contains deliberately fixed light and dark marketing sections; those are authored color pairs rather than a universal theme inversion.

The portal walkthrough keeps its light canvas in dark appearance. Pair `background`, `muted`, and `secondary` fills with fixed `coastal-ink` headings, `primary` accents, and `muted-foreground` descriptions. The enrollment diagram uses the fixed `portal-diagram` fill and dark teal text. Do not apply a theme-responsive pale foreground to these fixed light panels.

**The Semantic Controls Rule.** New reusable controls use semantic variables so their hover, selected, and focus states follow the active theme.

## Typography

Cormorant Garamond supplies display, headline, title, and italic emphasis. Manrope supplies paragraphs, metadata, labels, and controls. JetBrains Mono remains available for technical content, but the current public brand overrides course labels to Manrope. The legacy variable `--font-syne` actually loads Cormorant Garamond; do not infer the font family from that variable name.

The display token records the catalog heading. The coastal home hero is intentionally smaller, starting at 2.25rem and reaching 4.4rem. Course detail titles use `clamp(3.1rem, 6vw, 6.4rem)` with a 0.92 line height. The portal hero title starts at 3.75rem, reaches 4.5rem at the small breakpoint, and uses 5.75rem on desktop, with a 0.9 line height. Reuse the role that fits the content rather than putting the largest scale on every page.

Headlines begin at 3rem and commonly increase to 3.75rem. Program-card titles use the compact title token; editorial pathway titles may be larger. Body copy uses 1rem with generous leading, while introductory paragraphs commonly use 1.125rem or 1.25rem with 2rem to 2.25rem leading. Existing hero copy stays within 27rem to 42rem depending on the layout.

Uppercase labels identify sections or short facts. Keep long instructions in sentence case. Tight display leading belongs to short headings; descriptions, prices, form errors, and course titles must remain readable when they wrap.

## Layout

Public `.container` elements have an 82rem maximum width. Most bespoke marketing sections use an 80rem content width, 1.5rem mobile gutters, 2.5rem small-screen gutters, and 7vw desktop gutters. Shared container gutters are 1rem, 1.5rem, and 2rem. These are two existing layout families; choose one per section sequence.

Standard public section padding is fluid from 4.5rem to 7.5rem. Spacious home sections use 6rem on mobile and 8rem on desktop. Portal sections commonly use 5rem, growing to 7rem. Its hero uses 4rem on mobile, 7rem at the small breakpoint, and 8rem on desktop. Use the shorter rhythm for course selection and forms.

At 640px, actions and supporting information can split into columns. At 1024px, navigation becomes horizontal and editorial sections use unequal two-column grids. Keep primary actions full-width or wrapped naturally at narrow widths. The home hero reserves room for its coastal image below the copy on mobile; its text and focal point share the frame on desktop.

The portal hero puts its heading and description first, then Find your program and Open My Learning, then the supporting checklist, and finally the enrollment diagram. Keep that DOM and reading order on mobile so visitors reach the actions before the longer explanation. The homepage three-step journey stacks vertically and becomes three columns at 640px. The dedicated four-step walkthrough uses one column, two columns at 768px, and four at 1280px.

Pathway rows use a numeral, heading, explanation, and arrow. Program collections use responsive grids. Course details group the title, format, schedule, price, batch selection, and enrollment action before the longer curriculum. Preserve that information relationship when changing a layout.

## Elevation & Depth

The public page is flat at the canvas level. Thin teal borders, alternating ivory and sea-glass fills, and deliberate dark sections provide most separation. Program cards use broad, faint shadows, with a stronger border and shadow on hover. Large decorative circles belong to selected heroes and portal panels. Keep them behind text and out of the accessibility tree.

The sidecar records exact shadow and motion values. Navigation uses a translucent canvas with backdrop blur. Card transitions last 260ms; shared controls use 300ms. Honor the global reduced-motion rule, which suppresses animation and transition duration.

**The Quiet Canvas Rule.** Keep the main reading background free of the retired page-wide grid and lavender glow; use local decoration where the current design already establishes it.

## Shapes

Primary calls to action are pills. Program cards have moderate rounding, broad promotional panels use the panel radius, and large editorial images use the image radius. Course batch selectors and metadata chips use the tighter selection radius. Inputs retain the shared field radius.

A few route-specific catalog styles retain larger cards. Treat those as local variants, not a reason to change the shared scale. Borders are thin and low contrast. The botanical mark keeps its natural proportions and uses `object-contain`.

## Components

### Buttons

Use a teal pill with ivory text on light backgrounds and an ivory pill with teal text on dark backgrounds. The home hero uses sentence-case Manrope text; portal and utility CTAs use short uppercase labels. Shared public buttons have a minimum height of 2.75rem; portal actions use 3rem. Keep one visually dominant action in a local action group.

Secondary controls use an outline or a text link. Hover darkens the primary or lightens the inverse action. Keyboard focus must remain visible: public links and buttons receive a two-pixel ring with a four-pixel offset. Use real links for destinations and buttons for state changes. Disabled controls retain the existing disabled behavior and visible state.

### Chips

Metadata chips summarize course facts. Batch selectors are interactive controls with names, timing, and availability. Selected batches use the primary fill and its foreground; unavailable batches retain their disabled status. Do not rely on color alone to communicate availability or selection.

### Cards / Containers

Program cards place the course image, title, key facts, price or offer, and action in a consistent order. Keep imagery within the card crop and preserve data-backed badges. Standard card padding is 1.5rem. Editorial home pathways and portal benefits use ruled rows or grids rather than separate floating cards.

### Inputs / Fields

Shared inputs have a thin border, modest rounding, and a three-pixel translucent focus ring. They start at 1rem text on mobile and may use 0.875rem at medium widths. Retain associated labels, error messages, invalid states, and disabled semantics. A placeholder does not replace a label.

### Navigation

The sticky header has a small Learning Portal announcement link above the botanical logo and grouped navigation. Desktop navigation appears at the large breakpoint. Smaller screens use the existing mobile menu. Preserve account and cart access, active-page semantics, keyboard operation, and labelled icon buttons. The public primary groups are Discover, Learn, and Practise & Support.

### Learning Portal promotion

Use the shared `LearningPortalPromo` component for repeat appearances. It combines a deep-teal panel, large Cormorant heading with sea-glass italic emphasis, plain explanatory copy, and an ivory action. Its compact version fits course pages; the full version adds supporting benefits and a ruled three-step ordered list: Choose, Enroll, Learn. Pair italic serif numerals with a short heading and one sentence of explanation. The primary link reads See how the portal works and opens `/learning-portal`.

The dedicated portal page expands the sequence into four steps: Choose your program, Complete your enrollment, Enter your learning space, and Keep moving forward. These form an ordered grid with thin teal rules. Follow it with the existing benefits and before, during, and later learning rows. Keep the journey explanatory and preserve the actual enrollment and account destinations.

The hero includes a factual enrollment diagram. A warm light panel contains a heading and three numbered rows for program choice, account enrollment, and returning through My Learning. Each row pairs a teal circular icon with a plain label and description. This explains a supported route through the site; it is not a dashboard preview. Do not add fabricated course progress, lesson players, calendars, completion rates, or account data to this illustration.

Public messaging presents the portal as an active part of TMP. The page links to `/courses` through Find your program, followed by `/account` through Open My Learning. On mobile these actions precede the checklist and diagram. The final section repeats both program exploration and existing-learner access. Describe the course journey, resources, and progress without inventing product screens or implementation guarantees. This file records public marketing patterns, not a verified LMS dashboard specification.

### Photography and brand mark

Preserve `public/tmp-botanical-mark.webp` and `public/tmp-coastal-hero.webp`. The home hero uses the coastal asset with a mobile overlay that protects text contrast and leaves the image visible below it. Use descriptive alternative text for meaningful images and empty alternative text for decoration. Remote UploadThing images follow the repository's `next/image` and `unoptimized` rule.

## Do's and Don'ts

### Do:

- Do keep the portal hero actions before its checklist and enrollment diagram on mobile.
- Do preserve the botanical mark, coastal imagery, and "Learn · Grow · Heal · Belong" brand promise.
- Do use semantic CSS variables for new reusable controls and verify both light and dark states.
- Do give each section a clear next action, with program exploration and learner access labelled by destination.
- Do keep dates, prices, batch availability, and enrollment controls readable when text wraps.
- Do retain visible keyboard focus, meaningful link names, reduced-motion support, and labelled form fields.
- Do use repository-backed claims and preserve course, payment, authentication, and account behavior.

### Don't:

- Don't mix theme-responsive pale text with the portal's fixed light panels.
- Don't treat the older lavender declarations or unused hero components as the current public identity.
- Don't use sea-glass or gold for small text on ivory without checking contrast.
- Don't turn every paragraph into a rounded card; retain the existing open rows and ruled sections.
- Don't market the Learning Portal as a waitlist or an upcoming launch.
- Don't invent learner metrics, dashboard screenshots, testimonials, or guarantees.
- Don't copy hardcoded light-page colors into controls that must respond to the dark theme.
