# Pedagogical Architecture

> How ChemiCraft makes learning chemistry, materials science, climate science, optics, and magnetism engaging and effective.

---

## Core Principles

### Active Learning

Players don't read about chemical bonds — they combine atoms on a workbench and see the result. Every game mechanic maps to a real scientific action:

| Game Mechanic | What the Player Does | What They Learn |
|--------------|---------------------|-----------------|
| Resource gathering | Walk to nodes, press E to collect | Materials come from specific sources; some are finite |
| Crafting | Select reagents, complete temperature minigame | Atoms combine in specific ratios; reactions need controlled conditions |
| Sorting minigame | Drag items to correct bins | Material identification; contamination ruins recycling |
| Library lessons | Read text, answer 5 quiz questions | Theoretical knowledge behind the crafting |
| Light puzzle | Place components on a grid to guide beams | Refraction, filtering, and recombination |
| Quest completion | Craft/collect/sort to meet objectives | Science solves real problems |

### Scaffolded Difficulty

Maps are numbered 1–5 with increasing difficulty. Each requires completing all quests in the previous map to unlock:

```
Atom Meadows (1) ──► Recycling Fields (2) ──► EcoVille (3) ──► Prism Heights (4) ──► Magnet Core (5)
```

Within each map, quests are ordered from simplest to most complex:
- **Atom Meadows:** Diatomic molecules → triatomic → polyatomic (CH₄ has 5 atoms)
- **Recycling Fields:** Sorting (identification) → library study → single-step crafts → multi-step composite
- **EcoVille:** Single fuel → gas study + capture → filtration → solar → system synthesis
- **Prism Heights:** Split light (dispersion) → filter (color theory) → lens (focusing) → spectrum (EM extension) → bridge (application)
- **Magnet Core:** Basic poles → field navigation → visualization → propulsion → stabilization

### Spiral Curriculum

Concepts recur across maps with increasing depth:

| Concept | Map 1 | Map 2 | Map 3 | Map 4 | Map 5 |
|---------|-------|-------|-------|-------|-------|
| **CO₂** | Craft as simple molecule | — | Study as greenhouse gas, capture it | — | — |
| **Recycled materials** | — | Create from waste | Use in Solar Panels | Use in Convex Lenses | — |
| **Water (H₂O)** | Craft as molecule | — | Use as reagent (biofuel, capture) | — | — |
| **Crafting skill** | Learn minigame | Apply with new recipes | Multi-step chains | Puzzle + craft hybrid | Cross-map synthesis |

This mirrors real education: you learn a concept in simple form, then revisit it later in a more complex context.

### Cross-Map Knowledge Transfer

Items crafted in one map are physically required in another. This teaches that science doesn't happen in silos:

```
Atom Meadows                    Recycling Fields                  EcoVille
  Craft H₂ ─────────────► Biofuel needs H₂O ──────────► Propulsion Device needs Biofuel
  Craft C, H, O, N       Sort waste ─────────────► Recycled materials
  Library: periodic       Library: resin codes        Library: carbon cycle
  table, covalent bonds                               
         │                         │                         │
         ▼                         ▼                         ▼
                              Prism Heights               Magnet Core
                           Lenses need recycled glass   Steel alloy needs C + metal
                           Light puzzles need optics    Biofuel needed for propulsion
                           Library: Snell's Law, lenses Library: magnetism
```

### Multiple Learning Modalities

Players engage with each topic through several channels:

1. **Reading** — Library lessons introduce the theory (5 lessons per map, ~150 words each)
2. **Doing** — Crafting minigames apply the theory hands-on
3. **Testing** — 5-question quizzes after each lesson reinforce retention
4. **Exploring** — Resource nodes on the map teach where materials come from
5. **Puzzling** — Light puzzles (Prism Heights) and trajectory puzzles (Magnet Core) teach through experimentation
6. **Problem-solving** — Quests frame science as the solution to community problems

### Intrinsic Motivation

Quests are never "learn this because it's on the test." They are:

- **Ventilation Crisis** — "The air is stale, help us!"
- **Waste Crisis** — "The fields are overflowing with trash!"
- **Carbon Neutral** — "Help us become the first carbon-neutral city!"
- **Split the Light** — "The Prism Tower has gone dark, all color is fading!"

This framing shows players _why_ science matters in the real world.

---

## Quest Dependency Graph

```
Atom Meadows:
  ventilation_crisis ─► water_of_life ─► methane_harvest ─► ammonia_synthesis
                          │
                          └──► carbon_capture_1

Recycling Fields:
  waste_crisis ─► know_your_materials ─► circular_economy ─► composite_creation

EcoVille:
  carbon_neutral ─► greenhouse_gases ─► clean_water_quest ─► renewable_shift ─► sustainable_city

Prism Heights:
  split_the_light ─► color_mixing ─► lens_creation ─► invisible_spectrum ─► rainbow_bridge

Magnet Core:
  polar_attraction ─► magnetic_fields ─► field_art ─► perfect_trajectory ─► core_stabilization
```

Each map's final quest unlocks the portal to the next. Maps cannot be skipped.

---

## Skill Progression

Skills earned early continue to provide benefits in later maps:

| Skill | Earned In | Affects | Stacks Across Maps? |
|-------|-----------|---------|---------------------|
| Bonding | Atom Meadows | Crafting cooling rate | Yes — all maps |
| Equation Balancing | Atom Meadows, EcoVille | Target zone width, trajectory accuracy | Yes — all maps |
| Precipitation | Atom Meadows, EcoVille | Crafting progress speed | Yes — all maps |
| Acid-Base Sense | (Future) | Reduces crafting failure | Yes — all maps |
| Recycling Mastery | Recycling Fields | Sorting score, belt speed, streaks | Recycling Fields only |
| Climate Science | EcoVille | Climate Calculator slots | EcoVille only |
| Optics Mastery | Prism Heights | Light puzzle hints | Prism Heights only |
| Magnetism Mastery | Magnet Core | Trajectory preview, navigation | Magnet Core only |

Bonding and Equation Balancing are the most valuable skills — they improve the core crafting mechanic through all 5 maps, rewarding early mastery.

---

## The Learning Journey (Summary)

1. **Atom Meadows** teaches the **language of chemistry** — atoms, bonds, molecules. Players leave reading chemical formulas and understanding conservation of atoms.

2. **Recycling Fields** applies chemistry knowledge to **materials science and sustainability**. Players learn that physical processes transform waste into resources.

3. **EcoVille** extends to **climate science and systems thinking**. Players see how molecules connect to global challenges and how multiple technologies combine for carbon neutrality.

4. **Prism Heights** moves to **physics of light and optics**, introducing wave behavior, refraction, and color through both crafting and a puzzle minigame.

5. **Magnet Core** completes the journey with **magnetism and electromagnetism**, requiring cross-map knowledge from every prior domain. It is the ultimate synthesis — chemistry, materials, climate tech, and optics all come together to stabilize the Core.

The progression mirrors real science education: **fundamentals → applications → systems → specialized physics → interdisciplinary synthesis.**
