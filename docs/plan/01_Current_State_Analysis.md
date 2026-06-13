# Current State Analysis & Improvement Roadmap

## Overview

ChemiCraft is a 2D educational chemistry RPG built with **Phaser 3 + TypeScript + Vite**. It currently functions as a single-map prototype where players gather atoms, craft molecules, and complete quests in a pixel-art overworld called *Atom Meadows*.

---

## 1. What Exists Today

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript 5.8 |
| **Game Engine** | Phaser 3.87 (Arcade Physics) |
| **State Management** | Custom Zustand-like singleton (`gameStore.ts`) |
| **Build** | Vite 6.3 + Tailwind CSS 4.1 |
| **Persistence** | `localStorage` per user, debounced auto-save |
| **Graphics** | 100% programmatic — all textures generated via `Phaser.Graphics` API |
| **Audio** | WAV files: BGM + SFX (craft, coin) |

### Core Gameplay Loop

```
Explore Map → Talk to NPCs → Accept Quests
→ Gather Resources (atoms) → Enter Lab → Craft Molecules
→ Return to NPC → Complete Quest → Earn Rewards (coins, skill points)
→ Unlock Portal → Next Map
```

### Implemented Features

#### Scenes
| Scene | Purpose |
|-------|---------|
| `AuthScreen` (HTML overlay) | Login / Signup / Guest access |
| `BootScene` | Asset preload, programmatic texture generation |
| `MainMenuScene` | Title screen with animated particles, Start / Controls buttons |
| `GameScene` | Overworld map (Atom Meadows) — main gameplay hub |
| `HUDScene` | Persistent overlay: coins, quest tracker, inventory, skills, ChemDex, minimap |
| `LabInteriorScene` | Laboratory interior — pick reagents, place on bench, craft, temperature minigame |
| `LibraryInteriorScene` | Library interior — scientist portraits, lesson selector, quizzes |
| `ShopInteriorScene` | Shop interior — shopkeeper, buy items |
| `LaboratoryScene` | Alternate lab (drag-shelf UI, accessed via NPC dialogue) |
| `LibraryScene` | Alternate library (book-based lessons, accessed via NPC dialogue) |
| `ShopScene` | Alternate shop (scrollable item list, accessed via NPC dialogue) |

#### Data Files (`public/assets/data/`)
| File | Contents |
|------|----------|
| `items.json` | 13 items: 5 reagents (H, O, N, C, Na), 5 molecules (H₂, O₂, N₂, H₂O, CO₂), 2 equipment, 1 consumable, 1 quest item |
| `recipes.json` | 7 recipes: H₂, O₂, N₂, H₂O, CO₂, CH₄, NH₃ (difficulty 1–3) |
| `quests.json` | 2 main quests: "Ventilation Crisis" (craft N₂), "Water of Life" (craft H₂O) |
| `maps.json` | 1 map: Atom Meadows (20×20 grid, 3 buildings, 5 NPCs, 1 locked portal) |
| `npcs.json` | 5 NPCs: Panting Pete, Prof. Knowitall, Shopkeeper Sal, Mayor Molecule, Lab Assistant |
| `skills.json` | 4 skills (max level 5 each): Bonding, Equation Balancing, Precipitation Mastery, Acid-Base Sense |

#### Systems
- **8-direction player movement** with animated sprite
- **NPC wander AI** with interaction prompt + typewriter dialogue
- **Resource gathering** from nodes (coal, water, crystal, air) with tools (pickaxe, flask)
- **Crafting system** — order-independent recipe matching, multi-step (craft H₂ first, then H₂O)
- **Crafting minigame** — temperature regulation (SPACE mashing), affected by skill levels
- **Quest system** — prerequisites, acceptance, progress tracking, completion rewards
- **Skill system** — 4 skills, points earned via quests + quizzes
- **Equipment system** — Lab Coat (speed), Safety Goggles
- **Consumables** — Speed Potion
- **ChemDex** — molecule discovery tracking (unlocked on first craft)
- **Portal mechanic** — locked until all main quests complete
- **Minimap** — renders Atom Meadows with player position
- **Auto-save** — debounced localStorage persistence for registered users
- **Tutorial overlay** — first-visit controls explanation
- **Notification system** — sliding in-game messages

#### Controls
| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| E | Interact / Gather |
| I | Inventory |
| Q | Quest Log |
| K | Skills |
| C | ChemDex |
| M | Minimap |
| T | Cycle Tool |
| ESC | Close overlays |

---

## 2. What's Broken / Missing

### Critical Bugs
- **CH₄ (Methane) and NH₃ (Ammonia) recipes exist in `recipes.json` but have NO corresponding entries in `items.json`** — they appear in the lab as craftable but cannot actually be added to inventory, causing a softlock or crash
- **Portal returns to `MainMenuScene`** instead of loading a new map — there is no second map to transition to

### Missing Features
- **No second map/region** — only Atom Meadows exists
- **No thematic axes 2–5** (Environment, Materials, Magnetism, Optics) — only Molecular Cuisine is partially implemented
- **No difficulty scaling** — all recipes are available from the start, no progressive unlocking
- **No failure states** — failed crafting just shakes the UI, no consequence
- **No player character stats** (HP, energy, level) — only coins and skills
- **No achievements or milestones** beyond quest completion
- **No enemy or challenge system** — pure exploration/crafting with no risk

### Technical Debt
- **`counter.ts` and `style.css`** are Vite boilerplate remnants — unused
- **Dual UI systems** — `LabInteriorScene` + `LaboratoryScene`, `LibraryInteriorScene` + `LibraryScene`, `ShopInteriorScene` + `ShopScene` — the interior scenes are the primary buildings, while the `*Scene.ts` variants are triggered via NPC dialogue. This creates confusion and code duplication (~600 lines total across the 3 legacy scenes)
- **`GameScene` hardcodes Atom Meadows** — map geometry, building positions, NPC spawns, and decorations are all hardcoded, making it impossible to add new maps without duplicating the entire scene
- **All textures regenerated every boot** — no caching to image assets

---

## 3. Improvement Roadmap

### Phase 1 — Foundation & Data Layer
| # | Task | Impact |
|---|------|--------|
| 1 | Add missing CH₄ / NH₃ items to `items.json` | Fixes broken recipes |
| 2 | Expand `types.ts` with `MapData`, `MapProgress`, themed items | Enables multi-map architecture |
| 3 | Refactor `gameStore.ts` to track multiple maps, progression | State layer for maps |
| 4 | Expand `maps.json` with all 5 maps and visual theming data | Single source of truth for maps |

### Phase 2 — Data-Driven Map Rendering
| # | Task | Impact |
|---|------|--------|
| 5 | Refactor `GameScene` to load any map from `maps.json` | Eliminates hardcoding, enables infinite maps |
| 6 | Refactor `TileTextures` + `SpriteTextures` for per-map color themes | Each map looks distinct |
| 7 | Refactor HUD minimap to render from dynamic map data | Minimap works on any map |
| 8 | Build map-to-map portal transition system | Smooth inter-map travel |

### Phase 3 — Map Content & New Mechanics
| # | Map | Theme | New Mechanics |
|---|-----|-------|---------------|
| 9 | Atom Meadows (fix + expand) | Molecular Cuisine | Fix portal, add 2 quests |
| 10 | Recycling Fields | Materials & Recycling | Sorting minigame |
| 11 | EcoVille | Environment & Climate | Carbon calculator |
| 12 | Prism Heights | Optics & Colors | Light beam puzzles |
| 13 | Magnet Core | Magnetism & Motion | Trajectory / field puzzles |

### Phase 4 — Polish & Balance
| # | Task | Impact |
|---|------|--------|
| 14 | Cross-map quest prerequisites validation | Smooth progression |
| 15 | Difficulty tuning (reagent costs, rewards scaling) | Balanced economy |
| 16 | Per-map audio and visual polish | Immersive feel |
| 17 | Clean up legacy scenes (LabScene, LibraryScene, ShopScene) | Reduced tech debt |

---

## 4. Metrics — Current vs Target

| Metric | Current | Target |
|--------|---------|--------|
| Maps | 1 | 5 |
| Quests | 2 | 12–15 |
| Recipes | 7 | 20+ |
| Items | 13 | 30+ |
| NPCs | 5 | 18+ |
| Skills | 4 | 6–7 |
| Thematic Axes | 1 of 5 | 5 of 5 |
| Playtime (est.) | ~15 min | ~2–3 hours |
