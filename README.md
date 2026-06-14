# ChemiCraft

**Learn real chemistry, materials science, climate science, optics, and magnetism through a 2D RPG adventure.** Built with Phaser 3 + TypeScript.

Explore five themed maps, talk to NPCs, gather resources, craft molecules and materials in the lab, study library lessons, and solve puzzles — all while learning how science solves real-world problems.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser and click **Play as Guest**.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | TypeScript check + production build into `dist/` |
| `npm run preview` | Preview the production build |

---

## What You'll Learn

| Map | Science Domain | Difficulty | Quest Count |
|-----|---------------|------------|-------------|
| **Atom Meadows** | Foundational chemistry — atoms, covalent bonds, molecules (H₂, O₂, N₂, H₂O, CO₂, CH₄, NH₃) | 1 | 6 |
| **Recycling Fields** | Materials science — plastic types, glass/metal recycling, circular economy, sorting | 2 | 4 |
| **EcoVille** | Climate science — greenhouse effect, carbon cycle, carbon capture, renewable energy | 3 | 5 |
| **Prism Heights** | Optics — refraction, Snell's Law, lenses, additive color theory, EM spectrum | 4 | 5 |
| **Magnet Core** | Magnetism — poles, fields, electromagnets, projectile motion, magnetic shielding | 5 | 5 |

Each map must be completed in order — portals unlock only after finishing all quests in the current map. Knowledge and items carry forward between maps.

---

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| E | Interact with NPCs / objects / buildings |
| I | Inventory |
| Q | Quest Log |
| K | Skills |
| C | ChemDex |
| M | Map |
| T | Cycle active tool |
| ESC | Close overlays |

---

## Gameplay Loop

1. **Explore** the overworld map — talk to NPCs with E
2. **Accept quests** — villagers need scientific solutions to real problems
3. **Research** in the Library — read interactive lessons and take 5-question quizzes
4. **Gather** resources from nodes on the map
5. **Craft** in the Laboratory — pick up reagents from the shelf, combine on the workbench, complete the temperature-control minigame
6. **Deliver** the result to the quest giver for coins and skill points
7. **Level up** skills to unlock bonuses in crafting, sorting, puzzles, and navigation
8. **Unlock** the portal by completing all main quests to reach the next map

---

## Project Structure

```
src/
├── components/       # HTML overlay components (AuthScreen)
├── game/
│   ├── scenes/       # Phaser scenes (Boot, MainMenu, Game, HUD, interiors)
│   ├── maps/         # Per-map scenes (AtomMeadows, RecyclingFields, EcoVille, PrismHeights, MagnetCore)
│   ├── entities/     # Player, NPC, ResourceNode
│   ├── overlays/     # In-game panels (Shop, ReagentSelector, LessonSelector, LightPuzzle, Help)
│   ├── textures/     # Procedural texture generators (no external image assets)
│   ├── systems/      # CraftingSystem, QuestSystem, SceneTransition
│   ├── ui/           # DialogueBox
│   └── data/         # TypeScript types, map scene keys
├── store/            # Game state (Zustand-like) with localStorage persistence
└── styles/           # CSS

public/assets/
├── data/             # JSON: maps, items, recipes, quests, npcs, skills
├── audio/            # Sound effects and music
└── icons/            # SVG icons for tools
```

---

## Technical Stack

- **Game engine:** Phaser 3.87
- **Language:** TypeScript
- **Build:** Vite
- **State management:** Custom store with localStorage persistence (no external state library)
- **Graphics:** All textures generated programmatically via Phaser Graphics API — zero external image assets
- **Audio:** Web Audio API via Phaser's sound manager

---

## Documentation

- `docs/atom_meadows.md` — Map 1: quest chain, reagents, library lessons, cross-map connections
- `docs/recycling_fields.md` — Map 2: sorting minigame, materials, circular economy
- `docs/eco_ville.md` — Map 3: climate science, renewable energy, carbon capture
- `docs/prism_heights.md` — Map 4: optics, light puzzle levels guide
- `docs/magnet_core.md` — Map 5: magnetism, trajectory puzzles, core stabilization
- `docs/pedagogical_architecture.md` — How learning is structured: scaffolding, spiral curriculum, active learning, quest dependency graph, skill progression
