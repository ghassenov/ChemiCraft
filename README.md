# ⚗️ ChemiCraft

**Learn Chemistry Through Adventure** — an educational 2D RPG built with Phaser 3.

Explore a village, talk to NPCs, solve chemistry quests in the lab, and unlock new reagents and recipes.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Click **Play as Guest** to jump straight in.

Or try live demo at `http://lo3ba.louaydardouri.me/`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | TypeScript check + production build into `dist/` |
| `npm run preview` | Preview the production build |

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| E | Interact with NPCs / objects |
| I | Inventory |
| Q | Quest Log |
| K | Skills |
| C | ChemDex |
| M | Map |
| T | Cycle active tool (hands / pickaxe / flask) |
| ESC | Close overlays |

## Gameplay Loop

1. **Explore** the overworld map — talk to NPCs with `E`
2. **Accept quests** — villagers need your help synthesizing molecules
3. **Research** in the Library — read interactive lessons and take quizzes
4. **Craft** in the Laboratory — pick up reagents from the bench and combine them
5. **Deliver** the crafted molecule back to the quest giver for coins and skill points
6. **Level up** your skills to unlock bonuses in the crafting mini-game
7. **Unlock** the portal by completing all main quests to reach the next map

## Tech Stack

- **Game engine:** Phaser 3.87
- **Framework:** TypeScript + Vite
- **State:** Custom store with localStorage persistence
- **Graphics:** All textures generated programmatically via Phaser Graphics API (no external image assets)

## Project Structure

```
src/
├── components/       # HTML overlay components (AuthScreen)
├── game/
│   ├── scenes/       # Phaser scenes (Boot, MainMenu, Game, HUD, interiors)
│   ├── entities/     # Player, NPC, ResourceNode
│   ├── overlays/     # In-game overlay panels (Shop, ReagentSelector, LessonSelector, Help)
│   ├── textures/     # Procedural texture generators (Tile, Sprite, UI)
│   ├── systems/      # CraftingSystem, QuestSystem, SceneTransition
│   ├── ui/           # DialogueBox
│   └── data/         # TypeScript types
├── store/            # Game state management
└── styles/           # CSS (auth overlay)
public/assets/
├── data/             # JSON: maps, items, recipes, quests, npcs, skills
├── audio/            # Sound effects and music
└── icons/            # SVG icons for tools
```
