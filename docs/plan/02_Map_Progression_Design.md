# Map Progression Design

## Design Philosophy

The 5 maps form a **learning curve** that introduces scientific concepts in a pedagogically sound order. Each map builds on knowledge from the previous one, and the difficulty ramps up smoothly — not just in recipe complexity, but in the sophistication of mechanics the player must master.

```
Simple atoms  →  Simple molecules  →  Materials / Recycling
 →  Environmental systems  →  Light & optics  →  Forces & magnetism
```

---

## Progression Flow

```
                     ┌──────────────────────┐
                     │    Main Menu Scene    │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │   MAP 1: ATOM MEADOWS │  ★☆☆☆☆
                     │  Molecular Cuisine    │  Foundation
                     └──────────┬───────────┘
                                │  (portal unlocks)
                     ┌──────────▼───────────┐
                     │  MAP 2: RECYCLING FIELDS│  ★★☆☆☆
                     │  Materials & Recycling │  Easy
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │  MAP 3: ECOVILLE     │  ★★★☆☆
                     │  Environment & Climate│  Medium
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │ MAP 4: PRISM HEIGHTS  │  ★★★★☆
                     │  Optics & Colors      │  Medium-Hard
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │  MAP 5: MAGNET CORE   │  ★★★★★
                     │  Magnetism & Motion   │  Hard
                     └──────────────────────┘
```

### Key Rules
- **Linear progression** — maps unlock one at a time (Map 1 → 2 → 3 → 4 → 5)
- **Revisitable** — once unlocked, a map can be revisited freely via portals
- **Cross-map inventory** — items, coins, and skills carry across all maps
- **Map completion** = complete all main quests on that map (2–3 quests per map)
- **Portal condition** — each map's exit portal unlocks only when all its main quests are done

---

## Difficulty Curve Per Map

| Map | Theme | Difficulty | Recipe Complexity | Puzzle Complexity | Reading Load |
|-----|-------|:----------:|:-----------------:|:-----------------:|:------------:|
| 1. Atom Meadows | Molecules | ★☆☆☆☆ | 2-atom → 5-atom | None (gather + craft) | Low |
| 2. Recycling Fields | Materials | ★★☆☆☆ | 3-atom → composites | Sort items into bins | Low |
| 3. EcoVille | Climate | ★★★☆☆ | 4-atom + catalysts | Manage numbers (carbon calc) | Medium |
| 4. Prism Heights | Optics | ★★★★☆ | Standard + filters | Spatial (angle/path puzzles) | Medium |
| 5. Magnet Core | Forces | ★★★★★ | Standard + alloys | Spatial + timing (trajectory) | High |

### Difficulty Ramp Explained

**Map 1 → Map 2: Gradual**
- Map 2 uses the same gather → craft → quest loop
- New mechanic (sorting) is intuitive — drag items into bins
- Recipe complexity stays similar (2–4 inputs)

**Map 2 → Map 3: Moderate**
- Map 3 introduces numbers-based puzzles (carbon footprint calculator)
- Still uses crafting, but some recipes require multi-step processing
- Environmental concepts are real-world, making them relatable

**Map 3 → Map 4: Steeper**
- Map 4 shifts from chemistry toward physics (optics)
- Light puzzles require spatial reasoning (angle matching)
- New reagent types (color filters, prisms) need to be understood

**Map 4 → Map 5: Peak**
- Map 5 combines spatial reasoning + timing
- Trajectory puzzles require calculating angle and velocity
- Magnetic field navigation is abstract
- All previous mechanics may appear in combination

---

## Smooth Progression — Thematic Bridges

Each map transition has a **conceptual bridge** that makes the jump feel natural:

| Transition | Bridge |
|-----------|--------|
| **Map 1 → 2** | *"You've learned how atoms form molecules. Now see how those molecules form the materials around you — plastic, glass, metal — and how we can recycle them."* |
| **Map 2 → 3** | *"Materials don't just disappear when we throw them away. Where do they go? What happens to the air, the water, the soil? Let's explore our impact on the environment."* |
| **Map 3 → 4** | *"The sun's light drives our climate. But what is light, really? How does it bend, split, and combine to create the colors we see?"* |
| **Map 4 → 5** | *"Light is an electromagnetic wave. What about the other side of electromagnetism — magnetic fields, forces, and motion?"* |

---

## Map Visual Identity

Each map gets a distinct color palette and atmosphere:

| Map | Primary Color | Secondary | Ambient | Particles | Vibe |
|-----|:------------:|:---------:|:-------:|:---------:|------|
| Atom Meadows | `#8ab04a` (grass green) | `#5a8a3a` | Warm sunlight | Pollen floating | Peaceful meadow |
| Recycling Fields | `#7c9a5e` (sage) | `#4a7a3e` | Overcast | Falling leaves | Industrial-nature blend |
| EcoVille | `#4a9ac4` (sky blue) | `#2a7a5e` | Bright clean | Wind lines | Clean future city |
| Prism Heights | `#c4b0e8` (lavender) | `#8a7ac4` | Twilight | Sparkles | Mystical high-tech |
| Magnet Core | `#c04a4a` (rust red) | `#3a3a6a` | Dim / electric | Embers / sparks | Industrial core |

---

## Portal & Travel UX

Between maps, the portal transition follows this flow:

```
1. Player walks into portal on current map
2. Fade to black (500ms)
3. "Traveling to [Next Map Name]..." text overlay (1s)
4. Game auto-saves
5. Load next map scene
6. Fade in at the new map's entrance point (500ms)
```

### Portal Visual Design Per Map

| Map | Portal Visual |
|-----|--------------|
| Atom Meadows | Green swirling portal (existing, recolor) |
| Recycling Fields | Brown/amber vortex with gear motifs |
| EcoVille | Blue/white shimmer with leaf particles |
| Prism Heights | Rainbow prismatic portal with light rays |
| Magnet Core | Red/blue electric arc portal |

---

## Replayability & Backtracking

- All unlocked maps remain accessible from their connecting portals (bidirectional)
- Map 1 has a portal hub that lists all unlocked maps for quick travel
- NPCs on earlier maps get new dialogue once later maps are completed (reward for revisiting)
- Some late-game quests may require gathering materials from earlier maps
