# ChemiCraft — Art & Audio Assets

## Art Sources (Free / Royalty-Free)

| Type               | Source              | URL                                   | License        | Notes                              |
|--------------------|---------------------|---------------------------------------|----------------|------------------------------------|
| 2D Tilesets        | Kenney.nl           | https://kenney.nl/assets              | Public Domain  | Use "RPG Tiles" or "Top-Down" sets |
| Character Sprites  | OpenGameArt.org     | https://opengameart.org               | CC0 / CC-BY    | Search "RPG character sprites"     |
| UI Icons           | Game-icons.net      | https://game-icons.net                | CC BY 3.0      | Flask, beaker, backpack, coin icons|
| Lab Equipment      | Freepik             | https://freepik.com                   | Free (attrib)  | Beakers, test tubes, burners       |
| Particles / FX     | Kenney.nl           | https://kenney.nl/assets/particle-pack| Public Domain  | Smoke, bubbles, sparkles           |
| Font               | Google Fonts        | https://fonts.google.com              | SIL Open Font  | "Press Start 2P" (retro) or similar|

---

## Audio Sources

| Type               | Source              | URL                                   | License        | Notes                              |
|--------------------|---------------------|---------------------------------------|----------------|------------------------------------|
| Background Music   | Audionautix.com     | https://audionautix.com               | CC BY 4.0      | "Adventure" or "Exploring" tracks  |
| SFX: Crafting      | SoundBible.com      | https://soundbible.com                | Public Domain  | "Bubbling", "Potion mix" sounds    |
| SFX: UI Click      | Freesound.org       | https://freesound.org                 | CC0            | Button clicks, pop sounds          |
| SFX: NPC Talk      | SoundBible.com      | https://soundbible.com                | Public Domain  | Short blips for dialogue           |
| SFX: Coin          | Freesound.org       | https://freesound.org                 | CC0            | "Coin collect" or "Cash register"  |

---

## Asset Pipeline

### Recommended Workflow

1. **Download tilesets** from Kenney.nl — extract to `public/assets/images/tilesets/`
2. **Create sprite sheets** for avatar (idle, walk 4/8 directions)
3. **Create NPC sprites** (each NPC needs an idle + talking frame)
4. **Design UI icons** using Game-icons.net SVGs (convert to PNG at 32×32)
5. **Create tilemaps** using **Tiled** editor (export as JSON for Phaser)
6. **Convert audio** to OGG + MP3 (Phaser supports both for cross-browser)

### Tilemap Pipeline
```
Tiled Editor
  → Export as .json (base64 encoded layer data)
  → Load into Phaser via Tilemap system
  → Apply tileset image as texture
```

---

## Asset Naming Convention

```
kebab-case with prefixes:

  tileset_<name>.png          → tilesets
  char_<name>_<anim>.png      → character sprites
  npc_<name>_<anim>.png       → NPC sprites
  bgm_<name>.ogg              → background music
  sfx_<name>.ogg              → sound effects
  icon_<name>.png             → UI icons
  ui_<name>.png               → UI elements (panels, buttons)
  tilemap_<map_id>.json       → Tiled exports
```

### Example Files
```
public/assets/
├── images/
│   ├── tilesets/
│   │   ├── tileset_outdoor.png
│   │   └── tileset_indoor.png
│   ├── characters/
│   │   ├── char_alex_walk.png
│   │   ├── char_alex_idle.png
│   │   └── npc_panting_pete.png
│   ├── items/
│   │   ├── reagent_H.png
│   │   ├── reagent_O.png
│   │   └── icon_backpack.png
│   └── ui/
│       ├── ui_panel_brown.png
│       └── ui_button_blue.png
└── audio/
    ├── sfx/
    │   ├── sfx_craft_bubble.ogg
    │   ├── sfx_coin_collect.ogg
    │   └── sfx_npc_blip.ogg
    └── music/
        └── bgm_adventure.ogg
```

---

## Sprite Specifications

| Asset              | Size (px) | Frames | Notes                       |
|--------------------|-----------|--------|-----------------------------|
| Avatar walk        | 32×32     | 4×4    | 4 directions, 4 frames each |
| Avatar idle        | 32×32     | 2      | 2-frame breathing loop     |
| NPC portrait       | 64×64     | 1      | Static portrait for dialogue|
| NPC sprite         | 32×32     | 2      | Idle + talk                 |
| Tile (terrain)     | 32×32     | 1      | Aligned to 32px grid       |
| Item icon          | 32×32     | 1      | Square icon                 |
| UI button          | 128×32    | 3      | Normal / hover / pressed   |
