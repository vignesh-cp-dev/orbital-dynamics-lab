# Orbital Dynamics Lab


## Live Demo

[🚀 Open Orbital Dynamics Lab](https://vignesh-cp-dev-orbital-dynamics-lab.orbital-dynamics-lab.workers.dev)


Build a polished, high-end interactive web application called Lagrange Explorer — a scientific visualization tool for exploring the five Lagrange points (L1–L5) in a two-body orbital system.

This is a space hackathon project where UI/UX and visual impact are the highest priorities. The result should feel like professional scientific/mission-control software, not a generic SaaS dashboard or a typical space-themed website.

DESIGN DIRECTION

Use these design principles as inspiration:

Reown: clean dark information hierarchy and professional dashboard structure

Windy: visualization-first interaction where the visualization is the main application

TwistleLabs: interactive scientific/data visualization with information layered around the visualization

Cycle: contextual/floating information panels

Perplexity: premium, restrained scientific/editorial aesthetic

Do not copy any existing product. Combine these principles into a unique Lagrange Explorer identity.

Visual style

Near-black/deep charcoal background

Off-white primary text

Cool muted gray secondary text

Electric cyan/blue as the main accent

Subtle green for stable states

Amber/red only for warnings or unstable states

Thin subtle borders

Minimal shadows

Subtle glow only where useful

Modern technical sans-serif typography

Precise spacing and strong visual hierarchy

Smooth, sophisticated micro-interactions

Avoid:

generic purple AI gradients

excessive glassmorphism

cartoonish planets

cheesy sci-fi fonts

excessive neon

giant marketing hero sections

excessive rounded cards

generic analytics-dashboard styling

The application should feel like a scientific instrument.

MAIN EXPERIENCE

Do NOT create a traditional landing page.

When the application opens, the user should immediately see the interactive orbital simulation.

The simulation must occupy approximately 65–75% of the main workspace and be the visual centerpiece.

Use a dark visualization environment with subtle coordinate/grid/reference lines and elegant orbital paths.

Show:

Primary body

Secondary body

L1

L2

L3

L4

L5

orbital/reference paths

subtle animated motion

satellite when enabled

The visualization should feel alive and interactive rather than like a static diagram.

Use realistic-looking demo values for now. The real physics engine will be implemented later.

APPLICATION LAYOUT

Compact top bar

Include:

LAGRANGE EXPLORER

Small subtitle:

Orbital Dynamics Laboratory

Also show:

current preset: Earth–Moon

simulation status: READY

compact settings/help icons

Keep the header minimal.

LEFT CONTROL PANEL

Create a compact scientific control panel.

Primary Body

name

mass

mass slider

numerical value

Secondary Body

name

mass

mass slider

numerical value

Separation

distance slider

numerical value

Presets

Provide:

Earth–Moon

Sun–Earth

Custom

Controls should feel like professional scientific instrument controls, not ordinary form inputs.

CENTRAL ORBITAL VISUALIZATION

This is the most important element.

Create a visually impressive orbital visualization using an appropriate browser technology such as SVG, Canvas, or Three.js if useful.

Display all five Lagrange points clearly:

L1 · L2 · L3 · L4 · L5

Each point should have:

visible marker

label

hover state

selected state

subtle animation

The two bodies should have subtle depth and glow while remaining scientifically styled.

Add elegant orbital/reference lines and subtle motion.

Do not turn the visualization into a flashy game.

RIGHT CONTEXT PANEL

Create a contextual information panel.

When nothing is selected, show:

SYSTEM OVERVIEW

Current system

Mass ratio

Separation

Simulation status

When a Lagrange point is selected, show:

L1 — INNER LAGRANGE POINT

Location

Distance

Stability

Short scientific explanation

Common application/use

Keep information concise and visually easy to scan.

Use a small visual stability indicator.

The panel should feel like a floating scientific information panel rather than a large generic card.

L1–L5 NAVIGATION

Add a compact control near the bottom of the workspace:

L1 | L2 | L3 | L4 | L5

Selecting a point should:

highlight the point in the visualization

update the contextual panel

smoothly focus the visualization around the selected point

SATELLITE DEMO

Include a compact Satellite Simulation section.

Allow the user to select:

L1

L2

L3

L4

L5

Add a prominent:

RUN SATELLITE SIMULATION

button.

When activated, show a satellite near the selected point with an animated trajectory.

Also display compact values such as:

simulation time

velocity

distance from selected point

stability status

For this first version, these can use realistic mock/demo values.

SIMULATION CONTROLS

Include:

RUN · PAUSE · RESET

and a small simulation-speed control:

0.5× · 1× · 2× · 5×

Use polished transitions and make the current simulation state obvious.

LIVE DATA

Include a subtle scientific data strip showing values such as:

Mass Ratio

Separation

L1 Distance

L2 Distance

L3 Distance

L4 Angle

L5 Angle

Use realistic demo values.

Structure the UI so these values can later be replaced by real calculations.

INTERACTION PRIORITY

The most important demo flow should work visually:

Open Earth–Moon preset.

See the two bodies and all five Lagrange points.

Click L1/L2/L3/L4/L5.

See the selected point highlighted.

See its information appear in the contextual panel.

Change a mass or separation parameter.

Show the visualization responding smoothly.

Select a point for the satellite.

Run the satellite animation.

These interactions should feel polished.

TECHNICAL STRUCTURE

Build using:

React

Vite

Tailwind CSS

reusable components

clean component structure

Keep simulation/demo data separate from UI components so that we can later replace it with real Lagrange-point calculations.

Do not build authentication, complex databases, payments, admin dashboards, or unnecessary backend functionality.

This first build is primarily a frontend visualization prototype.

Do not spend effort on a traditional backend.

RESPONSIVENESS

Prioritize desktop/laptop presentation because this is a hackathon demo, but make the interface responsive for smaller screens.

On smaller screens, controls and information panels may collapse into drawers while keeping the simulation as the primary focus.

FINAL QUALITY BAR

The finished result should immediately communicate:

"This is an interactive scientific simulation."

It should look polished enough for a hackathon judging demo.

Prioritize:

visualization > interaction > information hierarchy > decoration

The orbital simulation must be the hero of the application.

Do not leave the central visualization as a placeholder.

Use polished mock/demo data initially; real physics calculations will be integrated later in VS Code using GitHub Copilot.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1056ef9f-5ee2-486e-848e-2fda602986fa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
