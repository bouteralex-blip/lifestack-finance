# AGENTS.md

## Repository expectations

- Work in the existing architecture. Do not restructure the codebase unless explicitly instructed.
- Prefer incremental PRs over large rewrites.
- Reuse existing shared components and utilities before creating new ones.
- Keep changes scoped to the requested tabs/modules unless shared components must be updated.
- Do not add production dependencies, secrets, or deployment changes unless explicitly instructed.
- Run the relevant checks before opening a PR.
- Return a concise summary of:
  1. what changed
  2. files changed
  3. checks run
  4. blockers/risks
  5. next best step

## Product and UI rules

- Horizon UI is the structural donor, not the visual law.
- Apply liquid glass to tiles/cards/panels second.
- Dense data surfaces must stay readable and use quieter glass treatment.
- Preserve existing data flow and do not break non-target tabs.
- Prefer production-safe polish over visual experimentation.

## Finance module guidance

- First implementation scope is:
  - T1 Executive Summary
  - T2 Structure & Concentration
  - T3 Performance & Attribution
- Do not modify other Finance tabs unless required for shared styling/components.
- Preserve metric integrity and chart logic.
- Use the repo as source of truth for code, and attached docs as design/spec guidance.

## Working style

- Inspect the repo before making changes.
- Follow existing patterns for routing, state, styling, and component structure.
- Keep shared abstractions minimal.
- Prefer PR-ready results over broad speculative rewrites.
- Do not merge to main without approval.

## Pull request expectations

- Create a branch for each scoped task.
- Open a PR and preview first.
- Do not merge directly to main.
- Summarize what came from:
  - Horizon structure
  - LifeStack glass system
  - repo-native implementation decisions

## Design references

Use these as implementation guidance when they are available in the repo or attached task context:

- LifeStack_OS_Design_System_v1.docx
- liquid_glass_ui_playbook_for_product_design.pdf
- snippet_chapter_4_7.css
- Finance_Module_Master_Metric_Guide_v2.pdf
- LifeStack_Finance_Update_Prompt.md
- Sprint A baby-steps.pdf
- Horizon UI Pro zip
- supplied UI reference images

## Glass implementation rules

- Glass is structure-first, effect-second.
- Use shell + inner plate + content + state layering.
- Apply glass first to:
  - KPI tiles
  - summary cards
  - chart cards
  - callout panels
  - drawers/overlays if touched
- Do not apply heavy glass to every dense table region.
- Focus, pressed, disabled, and error states must remain obvious.
- Keep one light model and one token baseline.

## Locked visual baseline

Use near-equivalents if the repo technically requires them:

- glass background: rgba(255,255,255,0.05)
- blur: 20px
- border: 1px solid rgba(255,255,255,0.08)
- radius: 16px
- internal padding: 20px
- card gap: 16px
- shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 80px rgba(0,0,0,0.15)
