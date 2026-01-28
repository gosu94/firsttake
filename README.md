# FirstTake

**FirstTake** is an AI-powered **pre-production tool for short-form video**.

It helps creators, marketers, and teams plan videos *before* production by generating:
- structured scripts,
- scene descriptions,
- narration (TTS),
- visual assets (images & video),
  all organized on a **timeline of beats**.

FirstTake is **not** a one-click video generator.  
It is intentionally designed to be **low cognitive load**, **text-first**, and **export-friendly**, so users keep creative control and finish videos in their own editors.

---

## Core Product Philosophy

### What FirstTake is
- AI **pre-production** for short-form video (ads, TikToks, explainers, intros).
- A **planning and asset-generation layer**, not a final editor.
- A tool that outputs **real assets** (audio, images, video clips), not locked projects.

### What FirstTake is NOT
- ❌ Not a full video editor
- ❌ Not template-driven
- ❌ Not “one-click publish”
- ❌ Not storage for user media (we store URLs only)

---

## Mental Model

### Timeline of Beats
The entire app revolves around a **timeline of beats**.

Each beat represents:
- one narration sentence,
- one scene prompt,
- one optional visual asset (image or video),
- optional narration audio.

Beats are:
- editable as plain text,
- individually generatable,
- independently costed (coins),
- exportable as assets.

This model intentionally mirrors how real ads and short-form videos are planned.

---

## User Workflow (Happy Path)

1. User opens FirstTake → starts with a **new draft project**
2. Enters a high-level idea + tone + voice style
3. Clicks **Generate Script**
4. Receives a timeline of beats (script + scene prompts)
5. Edits text freely (manual or AI edits)
6. Chooses which beats to generate assets for
7. Generates narration, images, or videos
8. Previews assets inline via embedded URLs
9. Exports a ZIP with all assets + manifest
10. Finishes video in their own editor

---

## Projects & Sessions

- Users can have **multiple projects**
- Each browser session starts with a **clean draft project**
- Drafts are not auto-saved as permanent projects
- User must explicitly **Save** a project
- Projects can be:
    - loaded
    - edited
    - deleted
    - exported
- Deleting beats **does NOT delete assets**
- Deleting a project deletes all its beats and assets

---

## Gallery Model

- Gallery is **project-first**, not asset-first
- Default gallery view shows projects as folders
- Clicking a project shows its assets
- Assets are previewed via:
    - `<audio>` for narration
    - `<video>` for clips
    - `<img>` for images
- Assets are stored as **remote URLs only**

---

## Coin System (Economics)

FirstTake uses a **coin-based pricing model** (no mandatory subscription).

### Coin philosophy
- Coins represent **compute cost**
- Expensive operations are intentionally expensive
- Cheap text operations encourage iteration
- Video generation has strong friction by design

### Coin value
- **1 coin ≈ $0.01 user-facing value**
- Free signup bonus: **25 coins** (enough for script only)

### Current pricing (MVP)

| Action | Coins |
|------|------|
| Generate full script | 20 |
| AI edit sentence | 2 |
| Scene prompt regenerate | 3 |
| Narration (6s beat) | 4 |
| Image (per beat) | 25 |
| Video (6s beat, with sound via Veo) | 1000 |

Video uses **Veo3 Fast** with sound:
- ~\$2.40 real cost per clip
- ~76% gross margin

---

## Voice Style Presets

Narration uses **voice direction presets**, not just voices.

Presets describe **delivery**, not character:
- pacing
- pauses
- emphasis
- energy curve

Example presets:
- Blockbuster Trailer
- Energetic Social Ad
- Professional Commercial
- Calm Explainer
- Friendly Conversational
- Inspirational / Motivational
- Urgent / Limited Time

Presets are implemented as detailed natural-language prompts passed to TTS.

---

## Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security (prepared for email + Google OAuth)
- PostgreSQL
- Flyway migrations

### Frontend
- React / Next.js
- Static export (`yarn export`)
- Served by Spring Boot
- Dark, modern, glossy UI
- Text-first, timeline-based dashboard

### AI Services (already implemented)
- **OpenRouterService** — LLM for scripts & scene prompts
- **TtsService** — OpenAI TTS
- **NanoBananaService** — image generation (~$0.04/image)
- **Veo3FastService** — video generation (6s clips with sound)

---

## Storage Strategy

- **No permanent media storage**
- Only store:
    - asset URLs
    - metadata (type, duration, provider)
- ZIP export downloads remote assets on-demand
- Assets may expire upstream — export is encouraged

---

## Database Model (Simplified)

Core entities:
- `app_user`
- `project`
- `timeline_beat`
- `generated_asset`

Supporting entities:
- auth providers (email, google)
- coin ledger
- subscriptions (scaffold)
- password reset / verification tokens

Assets are tied to **project**, not destroyed with beats.

---

## Auth & Security (Current State)

- DEV mode:
    - default user auto-logged-in
- Prepared for:
    - email/password auth
    - Google OAuth2/OIDC
    - SendGrid emails (verification, password reset)
- Auth is intentionally **not blocking MVP iteration**

---

## Export Formats

### ZIP Export
Contains:
- audio files
- images
- video clips
- `manifest.json` with:
    - project metadata
    - beats
    - asset mapping

### Planned JSON Project Export
- Portable `.json` snapshot
- Assets referenced by URL
- Intended for:
    - backup
    - import/export
    - templates
    - versioning

---

## Design Principles

- **Low cognitive load beats feature richness**
- **Text is the primary interface**
- **Users stay in control**
- **AI assists, never overrides**
- **Transparency over magic**
- **Export > lock-in**

---

## Positioning Summary

> **FirstTake is AI pre-production for short-form video.**  
> Plan scripts, scenes, and assets — then export and finish it your way.

---

## Non-Goals (Important)

- Real-time collaboration (for now)
- Full video editing
- Long-term media hosting
- Social publishing
- Template marketplaces (for now)

---

## How to Talk to an LLM About This Repo

When asking an LLM for help:
- Assume it knows this README
- Refer to “beats”, “projects”, “draft project”, “gallery”, “coins”
- Avoid framing tasks as “video generation”
- Emphasize **pre-production**, **structure**, and **export**

---

## Status

This is an **active MVP under heavy iteration**.
Correctness, clarity, and economics matter more than polish.
