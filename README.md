# Expose

Expose transforms any photograph into a cinematic forensic narrative with synchronized Ken Burns camera motion, expressive voice narration, and era-appropriate ambient foley.

---

## Overview

Expose combines multimodal vision intelligence with procedural sound design and coordinate-driven cinematography:

1. **Forensic Clue Extraction:** Powered by Google Gemini 2.0 Flash-Lite. Extracts dynamic contextual mood tags, estimates time periods, and identifies 3 to 5 hyper-specific physical clues with normalized 2D bounding boxes (`[ymin, xmin, ymax, xmax]`).
2. **Grounded Narrative Engine:** Scripts are constructed strictly around the extracted physical evidence to eliminate generic AI tropes and clichés.
3. **Layered Sound Staging:** Dual-track Web Audio API mixer blending text-to-speech voice narration with ambient texture loops (noir rain, vinyl crackle, analog tape hiss, parlor clocks) and dynamic audio ducking.
4. **Semantic Ken Burns Director:** 60fps hardware-accelerated camera glides that smoothly pan and zoom directly into detected evidence coordinates in sync with narrative timestamps.
5. **Client-Side Social Export:** Zero-server-cost MP4 video generation via WebCodecs and HTML5 Canvas, rendered with kinetic subtitles ready for vertical video platforms.

---

## Directory Structure

```text
exposuresearch.com/
├── architecture.md                     # Complete technical specification and schemas
├── README.md                           # Project documentation
├── SKILL.md                            # Frontend design system rules and guidelines
├── assets/                             # Local creative workspace (gitignored)
│   ├── branding/                       # Logos, icons, typography, PSDs
│   └── audio/                          # Master sound library and uncompressed foley
│       ├── ambient/                    # Noir rain, vinyl, tape hiss loops
│       └── score/                      # Background score and mood stems
└── app/                                # Application codebase
    ├── package.json
    ├── vite.config.ts
    ├── public/
    │   ├── audio/ambient/              # Production web audio loops
    │   └── branding/                   # Web icons and vectors
    └── src/
        ├── types/                      # Forensic data contracts and types
        ├── services/                   # Gemini API client and prompt schemas
        ├── utils/                      # Coordinate math and canvas helpers
        ├── styles/                     # Darkroom design tokens and typography
        └── components/
            ├── Darkroom/               # Image dropzone and red safe-light scanner
            ├── EvidenceBoard/          # Clue cards and forensic timeline markers
            ├── KenBurnsPlayer/         # Coordinate-driven pan and zoom canvas
            ├── AudioMixer/             # Voice and foley dual-track controls
            └── ExportModal/            # Client-side MP4 video export
```

---

## Typography & Design System

The visual language follows a strict darkroom and forensic archive aesthetic:

* **Titles:** *Playfair Display*, Georgia, serif (italicized for primary titles; ampersands in bold italics with brand copper `#C89D7C` highlight).
* **Headings:** Archivo, sans-serif (bold grotesque style for section headers, clue titles, and dossier stamps).
* **Body & UI:** Inter, system sans-serif (clean neutral typography for buttons, inputs, and controls).
* **Forensic Metadata:** JetBrains Mono, monospace (timecodes, coordinate matrices, and confidence scores).

---

## Development Setup

### Prerequisites

* Node.js (v20+ recommended)
* Google AI Studio API Key (Tier 2 recommended)

### Getting Started

Clone the repository and install dependencies:

```powershell
git clone https://github.com/lewifi/exposuresearch-com.git
cd exposuresearch.com/app
npm install
```

Configure your environment variables:

```powershell
Copy-Item .env.example .env
```

Add your Gemini API key in `app/.env`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Start the local development server:

```powershell
npm run dev
```

---

## Attribution & License

* Made lovingly by [EPHIX PULSE](https://ephix.net)
* Version: `v1.0.0`
