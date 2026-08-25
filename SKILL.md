---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when building web components, pages, mobile UIs, dashboards, React components, HTML/CSS layouts, or when styling any web/mobile UI. Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Mandatory Interface Rules

1. **ABSOLUTE RULE - NO EMOJIS**: Never use emojis anywhere in UI text, headings, badges, alerts, buttons, markdown, or comments.
2. **ABSOLUTE RULE - NO EM DASHES**: Never use em dashes anywhere. Use standard hyphens, colons, or clean typography.
3. **USE REACT LINE ICONS & MDI LIGHT ICONS**: Use React Line Icons (`lucide-react`, `lucide-react-native`, `@expo/vector-icons`, or `@mdi/react` with `@mdi/light-js`) for all icons. For mobile & desktop navigation menus, use `mdilHamburger` (3 flat lines) from `@mdi/light-js`.
4. **CHIP & ACTION BUTTON PLACEMENT RULE**: All filter chip buttons, category pills, and secondary action chips MUST be placed in the bottom chip bar row below the catalog header (e.g. `.shop-toolbar` or `.filters` row), EXCEPT where placing an action button in the upper header explicitly makes sense for top-level navigation (such as "Browse recipes", "View all recipes", or primary print buttons). Top navigation links that appear at the top of detail pages (such as "Back to master recipes" or "Back to menus") MUST use font-only text link styling (`.nav-back` / pure text link typography) with zero pill borders or background boxes.
5. **COPPER PRINT BUTTON STYLING RULE**: All print action buttons, print chips, and "Print / Save PDF" options across all pages (recipes, menus, shopping lists, run sheets) MUST be styled in brand copper (`.btn--copper` / `var(--copper)`) consistently.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it? look at the other .md files to get the tone.
- **Tone**: Pick a distinct direction: dark kitchen brutalist, editorial minimal, organic natural, industrial utilitarian, etc. Design one that is true to the aesthetic vision.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE?

Choose a clear conceptual direction and execute it with precision.

Implement working code (React Native, HTML/CSS/JS, React) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography System (MANDATORY)**:
  - **Headings & Subheadings**: Use `'Playfair Display', Georgia, serif` for all major headings (`<h1>`) and proportional smaller sizes for subheadings (`<h2>`, `<h3>`, `<h4>`).
  - **Ampersand (`&`) Rule (BOLD ITALICS MANDATORY)**: Always use `&` instead of `and` in headings, subheadings, recipe titles, course names, and menu labels. Whenever an ampersand is rendered in Playfair Display serif typography, it MUST be styled in bold italics (`font-weight: 700; font-style: italic;`) because non-italic Playfair Display ampersands visually resemble a face. In `h1` and `h2` headings (`<h1>`, `<h2>`, hero titles, recipe card titles, course names, menu headlines), style the Playfair Display ampersand in brand copper (`var(--copper)` / `#C89D7C`) for an elegant editorial flourish. Copper ampersands apply to `h1` and `h2` headings ONLY, not h3, h4, body text, or micro-copy.
  - **Body & UI Text**: Use clean sans-serif (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`) for all body text, UI buttons, badges, checkboxes, and metadata.
- **Color & Theme**: Commit to a cohesive aesthetic. Dominant dark themes with sharp accents outperform timid palettes.
- **Line Icons**: Use clean React line icons (`lucide-react-native` or `@expo/vector-icons`) with crisp stroke widths (1.5px to 2px).
- **Motion**: Use animations for effects and micro-interactions. Focus on high-impact moments: staggered reveals, smooth transitions, tactile touch feedback, and recipe photo focal-point zoom (1.4x in-place zoom within fixed `overflow: hidden` bounding box, tracking mouse hover position or touch press/hold with scroll lock on mobile).
- **Spatial Composition**: Unexpected layouts. Asymmetry. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth. Apply subtle noise textures, layered transparencies, dramatic shadows, and grain overlays.
- **Footer Attribution & Version Badge**: Left-hand footer attribution must link `Made lovingly by EPHIX PULSE (https://ephix.net)`. Right-hand footer must feature an explicit version number badge (`v1.0.0`, format `vMAJOR.FEATURE.BUG`) active in both dev and production environments.

NEVER use generic AI-generated aesthetics, overused font families, or cliché color schemes.
