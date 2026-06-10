# ChemiCraft

A chemistry learning RPG built with Phaser.js 3.

## Gameplay
- Explore a 2D tile-based village (Atom Meadows)
- Talk to NPCs, accept chemistry quests
- Enter the Laboratory to combine reagents
- Craft molecules to solve quests
- Earn coins and skill points

## First Quest — "Ventilation Crisis"
1. Approach Panting Pete (village center) → press E
2. Accept the quest → N₂ is needed!
3. Enter the Laboratory → combine N + N → click Craft
4. Quest auto-completes

## Controls
- WASD or Arrow Keys — Move avatar
- E — Interact with NPCs and enter buildings

## Tech Stack
- **Engine:** Phaser.js 3
- **Build:** Vite
- **Backend:** Firebase (planned)

## Project Structure
```
src/
├── data/          — Map grids, reagents, reactions, quests
├── scenes/        — Phaser scenes (Game, Lab, Library, Shop)
├── systems/       — QuestManager (persistent state)
├── ui/            — DialogueBox
└── utils/         — Chemistry reaction solver
public/assets/
├── images/        — Tilesets, character sprites, UI icons
└── audio/         — SFX and background music
```

## Development
```bash
npm install
npm run dev        # Start dev server on localhost:3000
npm run build      # Production build to dist/
```

## Credits
- Tilesets by Kenney.nl (CC0)
- Character sprites by Fry (CC0) and Vircon32 (CC-BY 4.0)
- UI icons from Game-icons.net (CC BY 3.0)
- Music from Audionautix.com (CC BY 4.0)
