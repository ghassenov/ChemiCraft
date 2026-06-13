# New Gameplay Mechanics Design

This document details the 4 new interactive mechanics introduced across maps 2–5, plus improvements to the existing crafting minigame.

---

## Overview

| Map | New Mechanic | Type | Complexity | Development Priority |
|-----|-------------|------|:----------:|:-------------------:|
| 1 | Crafting Minigame (existing, improved) | Skill-based | ★★☆☆☆ | P0 (fix existing) |
| 2 | Material Sorting Minigame | Drag & drop | ★★☆☆☆ | P0 |
| 3 | Climate Calculator | Decision-based | ★★★☆☆ | P1 |
| 4 | Light Puzzle Engine | Grid-based logic | ★★★★☆ | P1 |
| 5 | Trajectory Puzzle Engine | Physics-based | ★★★★★ | P2 |
| 5 | Magnetic Field Navigator | Navigation | ★★★☆☆ | P2 |

---

## 1. Crafting Minigame (Improved)

**Map:** 1 (Atom Meadows) — also used in all maps for molecule/reagent crafting

**Current State:** A temperature regulation minigame where the player mashes SPACE to keep a temperature bar within a target zone. Bonding skill increases cooling rate, Equation Balancing widens the target zone.

### Improvements

#### Visual Overhaul
Add visual feedback layers:

```
┌──────────────────────────────────────────────────┐
│   🔬 Crafting: Water (H₂O)                       │
│                                                  │
│   Temperature: ████████████████░░░░░░░░░  72°C   │
│   Target:      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  65-75°C │
│                ↑↑↑↑↑↑↑↑↑↑↑↑↑                      │
│              [COOL]    ZONE    [HEAT]              │
│                                                  │
│   Progress: ████████████░░░░░░░░░░░  45%          │
│                                                  │
│   ⓘ Press SPACE to heat, release to cool          │
│   Bonding Lv.2 → Cooling rate: +15%               │
│   Eq.Balancing Lv.1 → Target zone: +5°C           │
└──────────────────────────────────────────────────┘
```

#### Difficulty Scaling Per Map
The minigame gets harder on later maps:

| Parameter | Map 1 | Map 2 | Map 3 | Map 4 | Map 5 |
|-----------|:-----:|:-----:|:-----:|:-----:|:-----:|
| Target zone width | ±10°C | ±8°C | ±6°C | ±5°C | ±4°C |
| Heating rate (per press) | +3°C | +4°C | +5°C | +5°C | +6°C |
| Cooling rate (per sec) | -1°C | -1.5°C | -2°C | -2°C | -2.5°C |
| Required progress | 100% | 100% | 120% | 140% | 160% |
| Max temperature | 150°C | 150°C | 200°C | 200°C | 250°C |

#### Failure Consequences
- **Temperature too high (>max):** Reaction fails, lose 1 random reagent, explosion particle effect
- **Temperature too low (<0):** Reaction stalls, lose 1 reagent, freeze particle effect
- **3 consecutive failures:** Locked out of lab for 10 seconds (cooldown)

#### Skill Integration

| Skill | Effect (per level) |
|-------|-------------------|
| **Bonding** | +5% cooling rate |
| **Equation Balancing** | +2°C target zone width |
| **Precipitation Mastery** | +5% progress per successful tick |
| **Acid-Base Sense** | -5% risk of critical failure |

---

## 2. Material Sorting Minigame

**Map:** 2 (Recycling Fields)

**Type:** Drag & drop / timed sorting

**Core Loop:** Items fall onto a conveyor belt. Player drags them into the correct recycling bin before they scroll off-screen.

### Screen Layout

```
┌────────────────────────────────────────────────────┐
│  ♻️ Waste Sorting Challenge — Score: 120/150       │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │     [Plastic Bottle]  ←  Conveyor belt →     │   │
│  │                                              │   │
│  └───────┬──────────┬──────────┬───────────────┘   │
│          │          │          │                    │
│     ┌────▼────┐┌───▼────┐┌───▼────┐               │
│     │ PLASTIC ││ GLASS  ││ METAL  │               │
│     │         ││        ││        │               │
│     │   bin   ││  bin   ││  bin   │               │
│     └─────────┘└────────┘└────────┘               │
│                                                     │
│  ┌──────┐  ┌──────┐  ┌────────┐                    │
│  │ PAPER │  │ORGANIC│  │ELECTRONIC                  │
│  │       │  │       │  │ WASTE  │                    │
│  └───────┘  └──────┘  └────────┘                    │
│                                                     │
│  ⏱ Time remaining: 45s   Streak: 🔥 x3              │
└─────────────────────────────────────────────────────┘
```

### Mechanics

| Parameter | Easy | Medium | Hard |
|-----------|:----:|:-----:|:----:|
| Belt speed | 1 item / 4s | 1 item / 2.5s | 1 item / 1.5s |
| Item types | 3 categories | 5 categories | 6 categories |
| Round duration | 60s | 45s | 30s |
| Target score | 10 correct | 15 correct | 20 correct |

### Item Categories & Visual Cues

| Category | Color | Icon Example | Items |
|----------|-------|-------------|-------|
| **Plastic** | Yellow | Bottle icon | PET bottle, HDPE container, plastic bag, styrofoam |
| **Glass** | Green | Bottle icon | Clear glass, green glass, brown glass, broken glass |
| **Metal** | Silver | Can icon | Aluminum can, steel can, foil, scrap metal |
| **Paper** | Blue | Box icon | Newspaper, cardboard, office paper, magazine |
| **Organic** | Brown | Leaf icon | Food scraps, yard waste, paper towel |
| **Electronic** | Red | Circuit icon | Circuit board, battery, phone, cable |

### Scoring

| Action | Points |
|--------|:------:|
| Correct sort | +10 |
| Wrong bin | -5 |
| Streak (3+ correct) | +5 bonus per correct |
| Perfect round (no errors) | +25 bonus |
| Item falls off belt | -2 |

### Quest Integration

- **"Waste Crisis" quest:** Score 120 points total (sum of attempts)
- **"Know Your Materials" quest:** Identify 10 items correctly with 100% accuracy in one round
- **"Circular Economy" quest:** Sort 5 special "composite" items that require multiple steps

### Implementation Notes

```typescript
class SortingMinigame {
  private items: SortableItem[];
  private bins: Bin[];
  private beltSpeed: number;
  private timeRemaining: number;
  private score: number;
  private streak: number;

  constructor(difficulty: 'easy' | 'medium' | 'hard') {
    // ...
  }

  // Called each frame
  update(delta: number): void {
    // Move items along belt
    // Check if items fell off
    // Update timer
  }

  // Called when player drags item to bin
  onDrop(item: SortableItem, bin: Bin): void {
    if (item.category === bin.category) {
      this.score += 10 + (this.streak >= 3 ? 5 : 0);
      this.streak++;
    } else {
      this.score -= 5;
      this.streak = 0;
    }
  }
}
```

---

## 3. Climate Calculator

**Map:** 3 (EcoVille)

**Type:** Decision-based management simulation

**Core Loop:** Players manage a virtual city's energy mix, waste system, and transportation to meet emission targets while maintaining citizen happiness and budget.

### Screen Layout

```
┌────────────────────────────────────────────────────┐
│  🌍 Climate Action Plan — Year 2030                │
│                                                     │
│  ┌───── City Dashboard ──────────────────────────┐  │
│  │    CO₂: ████████████░░░░  12.4 Mt  (-8% YoY)  │  │
│  │    Budget: 💰 $2.4M / $5.0M                    │  │
│  │    Approval: 😊 68%                            │  │
│  │    Energy: ⚡ 340 MW (82% renewable)            │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  ┌───── Action Cards ─────────────────────────────┐  │
│  │                                                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │ Solar    │  │ Wind     │  │ Carbon   │      │  │
│  │  │ Farm     │  │ Turbine  │  │ Tax      │      │  │
│  │  │ $500k    │  │ $300k    │  │ $0       │      │  │
│  │  │ -2 Mt CO₂│  │ -1 Mt CO₂│  │ -3 Mt CO₂│      │  │
│  │  │ +5% enrg │  │ +3% enrg │  │ -10% app │      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  │                                                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │ Reforest │  │ Electric │  │ Public   │      │  │
│  │  │          │  │ Buses    │  │ Campaign │      │  │
│  │  │ $200k    │  │ $400k    │  │ $100k    │      │  │
│  │  │ -1 Mt CO₂│  │ -1.5 Mt  │  │ +15% app │      │  │
│  │  │ +5% app  │  │ +0% app  │  │ -0 Mt    │      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  📊 Target: -50% CO₂ by 2035 (need 8 more Mt)       │
│  🎯 Current Year: 2026   ⏱ Actions left: 8          │
└─────────────────────────────────────────────────────┘
```

### Mechanics

| Parameter | Value |
|-----------|-------|
| Starting CO₂ | 25 Mt/year |
| Target | 12.5 Mt/year (50% reduction) |
| Action slots | 10 total (choose wisely) |
| Budget | $5M total |
| Starting approval | 50% |
| Failure conditions | Budget < $0 OR Approval < 20% |

### Action Cards

| Action | Cost | CO₂ Reduction | Approval Change | Energy Impact |
|--------|:----:|:-------------:|:---------------:|:------------:|
| Solar Farm | $500k | -2 Mt | +5% | +5% renewable |
| Wind Turbine | $300k | -1 Mt | +3% | +3% renewable |
| Carbon Tax | $0 | -3 Mt | -10% | 0% |
| Reforestation | $200k | -1 Mt | +5% | 0% |
| Electric Buses | $400k | -1.5 Mt | 0% | +2% renewable |
| Public Campaign | $100k | 0 Mt | +15% | 0% |
| Nuclear Plant | $1M | -4 Mt | -5% | +10% renewable |
| Green Roofs | $150k | -0.5 Mt | +3% | 0% |
| Recycling Program | $250k | -0.8 Mt | +2% | 0% |
| Research Grant | $200k | -1 Mt (after 2 turns) | +1% | +1% renewable |

### Quest Integration

- **"Carbon Neutral":** Achieve target in 10 actions or fewer (gives Double XP)
- **"Green Mayor":** Achieve target while keeping approval > 60%
- **"Fiscal Conservative":** Achieve target while spending < $3M total

### Multiple Rounds

The calculator is played across 3 rounds (2030, 2035, 2040), each with:
- Higher baseline CO₂ (growth pressure)
- More action cards unlocked
- Tighter budget
- Cumulative effects from previous rounds

---

## 4. Light Puzzle Engine

**Map:** 4 (Prism Heights)

**Type:** Grid-based beam manipulation puzzle

**Core Loop:** Place optical components on a grid to guide a light beam from source to target receptor(s).

### Grid Layout

```
      Source (White Light)
         │
         ▼
    ┌───┬───┬───┬───┬───┬───┐
    │   │   │   │   │   │   │
    ├───┼───┼───┼───┼───┼───┤
    │   │ ▶ │   │   │   │   │  ▶ = Prism (bends light right)
    ├───┼───┼───┼───┼───┼───┤
    │   │   │   │ ■ │   │   │  ■ = Red Filter
    ├───┼───┼───┼───┼───┼───┤
    │   │   │   │   │ 🔴 │   │  🔴 = Red Target
    ├───┼───┼───┼───┼───┼───┤
    │   │   │   │   │   │   │
    └───┴───┴───┴───┴───┴───┘
```

### Component Types

| Component | Function | Unlock |
|-----------|----------|--------|
| **Prism** (▶) | Bends light 90° clockwise | Default |
| **Inverse Prism** (◀) | Bends light 90° counter-clockwise | Puzzle 2 |
| **Red Filter** (■R) | Passes only red light | Puzzle 2 |
| **Green Filter** (■G) | Passes only green light | Puzzle 2 |
| **Blue Filter** (■B) | Passes only blue light | Puzzle 2 |
| **Beam Splitter** (⊞) | Splits beam into 3 directions | Puzzle 3 |
| **Convex Lens** (⏤) | Focuses beam (required for distant targets) | Puzzle 4 |
| **Mirror** (╱) | Reflects beam at 45° angle | Puzzle 4 |

### Puzzle Progression

| Puzzle | Grid | Components | Target | New Mechanic |
|--------|:----:|:----------:|:------:|:------------:|
| 1 | 4×4 | 1 prism | 1 (white) | Basic bending |
| 2 | 5×5 | 2 prisms, 1 filter | 1 (colored) | Color matching |
| 3 | 6×6 | 2 prisms, 1 splitter, 2 filters | 2 (different colors) | Beam splitting |
| 4 | 7×7 | 3 prisms, 2 lenses, 2 mirrors, 3 filters | 3 (various) | Focusing + reflection |
| 5 | 8×8 | All components | 4 (all colors) | Master challenge |

### Implementation Approach

```typescript
interface LightGridCell {
  x: number;
  y: number;
  component: OpticalComponent | null;
  beamDirection: Direction | null;  // Which way beam passes through
  beamColor: Color;
}

interface OpticalComponent {
  type: 'prism' | 'prism_inv' | 'filter_red' | 'filter_green' | 'filter_blue' | 'splitter' | 'lens' | 'mirror';
  rotation: 0 | 90 | 180 | 270;
}

class LightPuzzle {
  private grid: LightGridCell[][];
  private source: { x: number; y: number; direction: Direction };
  private targets: { x: number; y: number; color: Color }[];

  // Ray-tracing simulation
  simulate(): boolean {
    // Cast beam from source
    // Follow through each cell
    // Apply component effects (bend, filter, split, reflect)
    // Check if all targets are hit with correct color
  }

  // Called when player places/rotates a component
  onComponentPlaced(x: number, y: number, component: OpticalComponent): void {
    this.grid[y][x].component = component;
    return this.simulate(); // Real-time feedback
  }
}
```

### Visual Feedback
- **Beam path** rendered as animated glowing line
- **Correct color hit** → target pulses green
- **Wrong color hit** → target flashes red
- **No beam** → target dim
- **Solution complete** → all targets glow + particles + sound

### Quest Integration

- **"Split the Light":** Complete puzzles 1–2
- **"Color Mixing":** Create secondary colors by filtering + overlapping beams
- **"Lens Creation" quest** unlocks convex lens component
- **"Rainbow Bridge":** Complete all 5 puzzles

---

## 5. Trajectory Puzzle Engine

**Map:** 5 (Magnet Core)

**Type:** Physics-based projectile aiming puzzle

**Core Loop:** Calculate launch angle and velocity to guide a metallic projectile through magnetic fields to reach a target.

### Puzzle View Layout

```
    Launch Pad
       ╔══╗
       ║  ║  →  θ = 45°, v = 5
       ╚══╝
         ↘
          ● ──→  ←── ●
         /      N       \
        /    ┌──────┐    \
       /     │  S   │     \
      /      │      │      \
     /       └──────┘       \
    ● ←──────────────────── ●
     \                      /
      \                    /
       \        🎯        /
        \                /
         ●──────────────●
```

### Mechanics

| Parameter | Range | Description |
|-----------|:-----:|-------------|
| Launch angle (θ) | 0° – 90° | Angle relative to horizontal |
| Launch velocity (v) | 1 – 10 | Initial speed (affects distance) |
| Magnet strength | 1 – 5 | Attraction/repulsion force |
| Magnet polarity | N / S | Attract (opposite) or repel (same) |
| Gravity | 1 (fixed) | Constant downward pull |
| Wind | 0 – 2 | Optional horizontal drift (later puzzles) |

### Magnet Types

| Magnet | Visual | Effect |
|--------|--------|--------|
| **North** (N) | Blue glow | Attracts opposite pole (S), repels same (N) |
| **South** (S) | Red glow | Attracts opposite pole (N), repels same (S) |
| **Iron block** | Grey | Attracted by both poles |
| **Shield** | Green outline | Blocks magnetic effects |

### Puzzle Progression

| # | Grid | Magnets | Obstacles | Goal | New Mechanic |
|:-:|:----:|:-------:|:---------:|:----:|:------------:|
| 1 | 6×4 | 0 | None | Direct hit | Angle + velocity |
| 2 | 8×6 | 1 (N) | 1 wall | Navigate around wall | Single magnet attraction |
| 3 | 10×8 | 2 (N+S) | 2 walls | Pass through narrow gap | Opposing magnets |
| 4 | 12×10 | 3 (N, S, iron) | 3 barriers + wind | Reach moving target | Wind + complex fields |
| 5 | 14×12 | 4 (mixed) | Moving barriers | 3 targets in 1 shot | Master challenge |

### Implementation Approach

```typescript
interface Magnet {
  x: number;
  y: number;
  polarity: 'N' | 'S';
  strength: number;  // 1–5
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isIron: boolean;
  trail: { x: number; y: number }[];
}

class TrajectoryPuzzle {
  private magnets: Magnet[];
  private projectile: Projectile;
  private target: { x: number; y: number };
  private launchAngle: number;
  private launchVelocity: number;

  fire(): void {
    this.projectile = {
      x: this.launchPad.x,
      y: this.launchPad.y,
      vx: Math.cos(this.launchAngle) * this.launchVelocity,
      vy: -Math.sin(this.launchAngle) * this.launchVelocity,
      isIron: true,
      trail: []
    };
  }

  update(delta: number): void {
    // Apply gravity
    this.projectile.vy += GRAVITY * delta;

    // Apply magnetic forces
    for (const magnet of this.magnets) {
      const dx = magnet.x - this.projectile.x;
      const dy = magnet.y - this.projectile.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const force = magnet.strength / (dist * dist);
      // Attract if opposite polarity, repel if same
      // Apply force vector
    }

    // Apply wind
    this.projectile.vx += WIND * delta;

    // Update position
    this.projectile.x += this.projectile.vx * delta;
    this.projectile.y += this.projectile.vy * delta;

    // Store trail point
    this.projectile.trail.push({ x: this.projectile.x, y: this.projectile.y });
  }

  checkHit(): boolean {
    const dx = this.projectile.x - this.target.x;
    const dy = this.projectile.y - this.target.y;
    return Math.sqrt(dx*dx + dy*dy) < TARGET_RADIUS;
  }
}
```

### Visual Feedback
- **Launch preview:** Dotted trajectory line shown before firing (updates as angle/velocity change)
- **Magnetic field lines:** Visible as animated curves around magnets (toggle via compass item)
- **Projectile trail:** Fading dots showing actual path
- **Hit:** Target explodes with particles + success sound
- **Miss:** Projectile bounces off walls / disappears off screen

### Quest Integration

- **"Polar Attraction":** Complete puzzles 1–2
- **"Magnetic Fields":** Complete puzzle 3
- **"Perfect Trajectory":** Complete puzzle 4 with no misses
- **"Core Stabilization":** Complete all puzzles

---

## 6. Magnetic Field Navigator

**Map:** 5 (Magnet Core)

**Type:** Navigation puzzle with invisible forces

This is a secondary mechanic for Map 5, simpler than the trajectory engine but providing variety.

### Core Concept
The player walks through rooms where invisible magnetic fields push/pull them:
- **Field lines** are partially visible (faint glowing curves)
- **Compass item** reveals full field lines when equipped
- Walking **with** field lines → speed bonus
- Walking **against** field lines → slowed + slight pushback
- **Steel obstacles** block movement, must navigate around

### Puzzle Design

| Room | Size | Challenge | Goal |
|:----:|:----:|:---------|:-----|
| 1 | 10×10 | Follow field lines to exit | Exit in < 15s |
| 2 | 12×12 | Cross multiple field zones | Collect 3 tokens + exit |
| 3 | 15×15 | Timed: alternating field polarity | Exit in < 25s |
| 4 | 18×18 | Complex field maze + steel barriers | All tokens + exit |

### Implementation

```typescript
class MagneticFieldNavigator {
  private fieldGrid: FieldCell[][];
  private compassEquipped: boolean;

  getForceAt(x: number, y: number): { fx: number; fy: number } {
    // Interpolate from field grid
    // Returns push/pull vector
  }

  onPlayerMove(player: Player): void {
    const force = this.getForceAt(player.x, player.y);
    // Apply force as velocity modifier
    if (Math.abs(force.fx) > 0 || Math.abs(force.fy) > 0) {
      if (this.compassEquipped) {
        // Show direction arrows
      }
    }
  }
}
```

---

## 7. Cross-Mechanic Integration

### Items That Bridge Mechanics

| Item | Source Map | Used In | Effect |
|------|:----------:|:-------:|--------|
| Recycled Plastic (2) | Recycling Fields | EcoVille Lab | Used in Solar Panel recipe |
| Biofuel (3) | EcoVille Lab | Magnet Core | Used in Propulsion Device recipe |
| Compass (5) | Magnet Core | Magnet Core | Reveals magnetic field lines in Navigator |
| Convex Lens (4) | Prism Heights | Light Puzzle | Unlocks Puzzle 4 |
| Speed Booster (1) | Atom Meadows | Trajectory Puzzle | +2 velocity for 1 attempt |

### Skills That Span Mechanics

| Skill | Map 1 | Map 2 | Map 3 | Map 4 | Map 5 |
|-------|:-----:|:-----:|:-----:|:-----:|:-----:|
| **Bonding** | Crafting speed | Crafting speed | Crafting speed | Crafting speed | Crafting speed |
| **Equation Balancing** | Target zone width | — | — | — | Trajectory angle precision |
| **Precipitation Mastery** | Crafting progress | Sorting bonus time | — | — | — |
| **Acid-Base Sense** | Failure reduction | — | Carbon calculator insight | — | — |
| **Recycling Mastery** (NEW) | — | Sorting score bonus | — | — | — |
| **Climate Science** (NEW) | — | — | Action efficiency | — | — |
| **Optics Mastery** (NEW) | — | — | — | Puzzle hint frequency | — |
| **Magnetism Mastery** (NEW) | — | — | — | — | Magnet strength bonus |

---

## 8. Difficulty Tuning Summary

| Parameter | Map 1 | Map 2 | Map 3 | Map 4 | Map 5 |
|-----------|:-----:|:-----:|:-----:|:-----:|:-----:|
| Crafting target zone | ±10°C | ±8°C | ±6°C | ±5°C | ±4°C |
| Sorting belt speed | — | 4s/item | — | — | — |
| Climate budget | — | — | $5M | — | — |
| Light puzzle grid | — | — | — | 4×4 → 8×8 | — |
| Trajectory magnets | — | — | — | — | 0 → 4 |
| Quest count | 5 | 4 | 5 | 5 | 6 |
| Recipe difficulty range | 1–3 | 1–2 | 2–3 | 1–3 | 3–5 |
| Average coin reward | 80 | 90 | 135 | 160 | 250 |
| New items added | 2 (fixes) | 10 | 8 | 11 | 10 |
