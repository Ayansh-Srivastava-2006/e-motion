---
name: Engineering Simulation UI
colors:
  surface: '#081425'
  surface-dim: '#081425'
  surface-bright: '#2f3a4c'
  surface-container-lowest: '#040e1f'
  surface-container-low: '#111c2d'
  surface-container: '#152031'
  surface-container-high: '#1f2a3c'
  surface-container-highest: '#2a3548'
  on-surface: '#d8e3fb'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d8e3fb'
  inverse-on-surface: '#263143'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#adc6ff'
  on-tertiary: '#002e6a'
  tertiary-container: '#00163a'
  on-tertiary-container: '#357df1'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#081425'
  on-background: '#d8e3fb'
  surface-variant: '#2a3548'
typography:
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  headline-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 12px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.125rem
  space-sm: 0.25rem
  space-md: 0.5rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers a high-performance, professional engineering-software interface tailored for precise automotive simulation. The design philosophy merges **Minimalism** with a **Corporate / Modern** utilitarian structure, prioritizing data density, legibility, and zero visual friction.

### Target Audience & Persona
- **Users:** Automotive engineers, simulation specialists, and technical leads operating complex CAD and CAE software.
- **Environment:** High-focus, multi-monitor workstations where tools are used continuously over extended shifts.

### Emotional Response & Narrative
The interface evokes absolute precision, reliability, and cognitive calm. By anchoring the workspace in deep charcoal and dark navy tones with stark, high-contrast structural lines and electric blue/cyan engineering accents, the UI instills confidence during critical simulation analysis. Every element is designed to recede, ensuring telemetry, stress-mesh models, and fluid-dynamics outputs remain the undisputed focal point.

## Colors

The palette is engineered specifically for long-duration technical work in low-light or studio environments. The base utilizes deep charcoal and slate navy tones to reduce eye strain, while precision blue and cyan accents denote active states, telemetry vectors, and interactive controls.

- **Primary Canvas:** Deep charcoal and slate navy (`#0F172A` to `#1E293B`) establish a stable, non-fatiguing background for dense data visualization.
- **Engineering Accents:** Vibrant cyan (`#00E5FF`) and technical blue (`#3B82F6`) highlight active toolpaths, cursor positions, and critical simulation parameters.
- **Surface Panels:** Crisp, high-contrast white and light-slate panels organize complex tooling hierarchies without muddying the viewport.
- **Functional Semantics:** Muted status indicators use precise red, amber, and green tones reserved strictly for error warnings, threshold alerts, and converged simulation states.

## Typography

The typography system pairs a hyper-legible geometric sans-serif for tabular data and general reading with a precise monospace font for numerical coordinates, timeline markers, and telemetry readouts. 

- **Scale & Hierarchy:** Font sizes are tightly bound to ensure high information density. Headings never exceed standard desktop tooling limits, avoiding unnecessary visual weight.
- **Numerical Alignment:** Monospaced styles must be enforced for all coordinate systems, stress values, and vector readings to prevent layout jitter during real-time simulation updates.

## Layout & Spacing

The workspace operates on a high-density **Fixed Grid** model with collapsible docking panels, optimized for multi-pane engineering viewports.

- **Spacing Rhythm:** Built on a tight 4px baseline grid to support micro-alignments in property inspectors and parameter trees.
- **Dividers & Gutters:** Panels are separated by ultra-thin 1px technical borders rather than heavy whitespace, maximizing the screen real estate dedicated to 3D CAD/CAE viewports.
- **Responsiveness:** Designed strictly for desktop workstations (minimum 1920x1080). Panels dock, snap, and resize dynamically without reflowing core engineering controls.

## Elevation & Depth

Depth is conveyed through **Low-contrast outlines** and subtle tonal shifts rather than heavy drop shadows, preserving the flat, technical drafting aesthetic.

- **Surfaces:** Hierarchy is established through crisp, single-pixel borders (`#334155`) and precise background luminance steps between toolbars, panels, and viewports.
- **Overlays:** Floating inspection windows and context menus employ a minimal backdrop filter with a crisp boundary outline, avoiding decorative blurs in favor of immediate legibility.

## Shapes

The design system enforces strict **Sharp** geometry (`0px` roundedness) across all UI elements. 

- **Rationale:** Sharp 90-degree corners align with precision engineering conventions, technical drawing standards, and high-density grid layouts. Rounded elements are strictly prohibited to maintain an uncompromising, professional instrumental tone.

## Components

All components are engineered for rapid execution, high information density, and absolute clarity.

- **Buttons:** Primary actions utilize solid engineering cyan (`#00E5FF`) with dark charcoal labels and zero border-radius. Secondary actions are styled as ghost buttons with 1px technical outlines.
- **Input Fields:** Rendered as crisp, recessed data-entry boxes featuring an active cyan focus border and integrated unit labels (e.g., `MPa`, `m/s`, `mm`).
- **Checkboxes & Radio Buttons:** Designed as sharp square and diamond geometric indicators that illuminate instantly upon selection.
- **Chips & Badges:** Compact status tags used for material properties, mesh states, and simulation iteration counts, rendered with thin structural borders.
- **Lists & Trees:** Hierarchical component trees (for assembly parts and boundary conditions) utilize dense row heights, subtle hover states, and clear expansion arrows.
- **Cards & Panels:** Modular inspection panels featuring pinned headers, integrated action toolbars, and collapsible data groups.
- **Specialized Components:** Includes real-time telemetry sparklines, node coordinate readouts, timeline scrubbers for transient analysis, and multi-axis orientation cubes.