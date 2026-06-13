# Architecture Refactor Plan

## Core Problem

`GameScene` currently hardcodes Atom Meadows — the tile grid, building positions, NPC spawns, decorations, and portal behavior are all written directly in the scene class. Adding a second map would require either:
- **Duplicating** the entire ~700-line scene (bad — maintenance nightmare)
- **Refactoring** to be data-driven (correct — scalable)

We choose the **data-driven** approach.

---

## 1. Data Model Changes

### New / Expanded Types in `types.ts`

```typescript
// === Map Data ===
interface MapTheme {
  groundColor: number;       // Primary ground tile color
  wallColor: number;         // Wall / collision tile color
  accentColor: number;       // Decoration accent color
  bgColor: number;           // Scene background color
  particles: 'pollen' | 'leaves' | 'wind' | 'sparkles' | 'embers' | 'none';
  music?: string;            // BGM key for this map
}

interface MapBuilding {
  type: 'lab' | 'library' | 'shop';
  name: string;
  tileX: number;
  tileY: number;
  sceneKey: string;
  style?: Record<string, number>; // Per-building color overrides
}

interface MapPortal {
  tileX: number;
  tileY: number;
  targetMap: string;         // Map key to transition to
  spawnTileX: number;        // Where player appears on the target map
  spawnTileY: number;
  unlockCondition: 'all_quests' | 'none';
}

interface MapNPC {
  npcId: string;
  tileX: number;
  tileY: number;
}

interface MapDecoration {
  type: 'flower' | 'grass' | 'tree' | 'rock' | 'lamp' | 'sign' | 'bin' | 'solar_panel' | 'prism' | 'magnet';
  tileX: number;
  tileY: number;
}

interface MapData {
  key: string;               // Unique identifier (e.g., "atomMeadows")
  name: string;              // Display name (e.g., "Atom Meadows")
  difficulty: number;        // 1–5
  theme: MapTheme;
  width: number;             // In tiles
  height: number;            // In tiles
  tileSize: number;          // Pixels per tile (currently 32)
  ground: number[][];        // 2D tile type grid
  buildings: MapBuilding[];
  portals: MapPortal[];
  npcs: MapNPC[];
  decorations: MapDecoration[];
  resourceNodes: ResourceNodeData[];
  playerSpawn: { tileX: number; tileY: number };
  requiredMap?: string;      // Map key that must be completed to access this one
}

// === Map Progression ===
interface MapProgress {
  [mapKey: string]: {
    unlocked: boolean;
    completed: boolean;
    completedQuests: string[];
  };
}

// === Expanded PlayerData ===
interface PlayerData {
  // ... existing fields ...
  currentMap: string;                // Which map the player is on
  mapProgress: MapProgress;          // Per-map completion state
  unlockedMaps: string[];            // Maps the player can access
}

// === Expanded Item types ===
interface ItemData {
  id: string;
  name: string;
  type: 'reagent' | 'molecule' | 'equipment' | 'consumable' | 'quest' | 'material';
  description: string;
  icon: string;                      // Icon key for programmatic rendering
  buyPrice?: number;
  sellPrice?: number;
  category?: string;                 // For sorting systems: 'plastic' | 'glass' | 'metal' | 'paper' | 'organic'
  mapOrigin?: string;                // Which map this item belongs to
}

// === Expanded Recipe types ===
interface RecipeData {
  id: string;
  inputs: { itemId: string; quantity: number }[];
  output: string;
  outputQuantity: number;
  difficulty: number;
  mapOrigin?: string;                // Which map this recipe is available on
  minSkillLevel?: Record<string, number>; // Minimum skill levels required
  category?: string;                 // 'molecule' | 'composite' | 'biofuel' | 'alloy'
}
```

### Maps.json Structure (per map)

```json
{
  "key": "recyclingFields",
  "name": "Recycling Fields",
  "difficulty": 2,
  "requiredMap": "atomMeadows",
  "theme": {
    "groundColor": 12738494,
    "wallColor": 9325118,
    "accentColor": 4882495,
    "bgColor": 3821102,
    "particles": "leaves",
    "music": "bgm_recycling"
  },
  "width": 20,
  "height": 20,
  "tileSize": 32,
  "ground": [[/* 20x20 tile grid */]],
  "buildings": [
    { "type": "lab", "name": "Materials Lab", "tileX": 4, "tileY": 3, "sceneKey": "LabInteriorScene",
      "style": { "wallColor": 0x6a8a4e, "roofColor": 0x4a6a2e } }
  ],
  "portals": [
    { "tileX": 18, "tileY": 10, "targetMap": "atomMeadows", "spawnTileX": 10, "spawnTileY": 3, "unlockCondition": "none" },
    { "tileX": 10, "tileY": 1, "targetMap": "ecoVille", "spawnTileX": 10, "spawnTileY": 18, "unlockCondition": "all_quests" }
  ],
  "npcs": [
    { "npcId": "waste_manager", "tileX": 8, "tileY": 12 }
  ],
  "decorations": [
    { "type": "bin", "tileX": 5, "tileY": 14 },
    { "type": "tree", "tileX": 12, "tileY": 16 }
  ],
  "resourceNodes": [
    { "type": "plastic", "tileX": 6, "tileY": 8, "maxGathers": 3 },
    { "type": "glass", "tileX": 14, "tileY": 6, "maxGathers": 3 }
  ],
  "playerSpawn": { "tileX": 10, "tileY": 18 }
}
```

---

## 2. State Management Changes (`gameStore.ts`)

### New State Fields

```typescript
interface GameState {
  // ... existing fields ...

  // Map progression
  currentMap: string;
  mapProgress: MapProgress;
  unlockedMaps: string[];

  // Computed / helper getters
  isCurrentMapComplete: () => boolean;
  getAvailableRecipes: () => RecipeData[];
  getAvailableQuests: () => QuestData[];

  // Actions
  travelToMap: (mapKey: string) => void;
  completeMapQuest: (mapKey: string, questId: string) => void;
  unlockMap: (mapKey: string) => void;
}
```

### Save/Load Changes

`localStorage` key structure:
```
chemiCraft_save_{userId}
  └── playerData {
        ...existing,
        currentMap: "recyclingFields",
        unlockedMaps: ["atomMeadows", "recyclingFields"],
        mapProgress: {
          atomMeadows: { unlocked: true, completed: true, completedQuests: ["ventilation_crisis", "water_of_life"] },
          recyclingFields: { unlocked: true, completed: false, completedQuests: [] }
        }
      }
```

The auto-save triggers on:
- Map transitions
- Quest completion
- Item acquisition
- Periodic debounce (existing behavior)

---

## 3. GameScene Refactor

### Before (hardcoded)
```
GameScene.create()
  ├── this.drawGround()           → hardcoded 20x20 loop
  ├── this.drawBuildings()       → hardcoded positions
  ├── this.spawnNPCs()           → hardcoded NPC list
  ├── this.addDecorations()      → hardcoded decoration positions
  ├── this.createPortals()       → hardcoded portal at (10, 2)
  └── this.setupPlayer()         → hardcoded spawn at (10, 14)
```

### After (data-driven)
```
GameScene.create()
  ├── this.mapData = MAP_DATA[store.currentMap]   → Load from JSON
  ├── applyTheme(this.mapData.theme)               → Set colors, bg, particles
  ├── drawGround(this.mapData.ground)              → Loop driven by map data
  ├── drawBuildings(this.mapData.buildings)        → Loop driven by map data
  ├── spawnNPCs(this.mapData.npcs)                 → Loop driven by map data
  ├── addDecorations(this.mapData.decorations)     → Loop driven by map data
  ├── spawnResourceNodes(this.mapData.resourceNodes)
  ├── createPortals(this.mapData.portals)          → Loop driven by map data
  └── setupPlayer(this.mapData.playerSpawn)        → Driven by map data
```

### Scene Lifecycle

```
GameScene.init()
  └── Read store.currentMap → load mapData from cache or JSON

GameScene.create()
  ├── Clear all existing objects (if returning from building interior)
  ├── Apply map theme (background color, ambient particles)
  ├── Build tile grid from mapData.ground
  ├── Place building entrances
  ├── Place decorations (flowers, grass tufts, torches, etc.)
  ├── Spawn NPCs at configured positions
  ├── Place resource nodes
  ├── Create portals
  └── Place player at spawn point

GameScene.update()
  ├── Standard update loop (player movement, collisions)
  └── Check portal overlaps → if condition met → transition
```

### Scene Transition Flow (map-to-map)

```
player overlaps portal tile
  → if (portal.unlockCondition === 'all_quests' && !store.isCurrentMapComplete())
      → show locked message ("Complete all quests first!")
      → return
  → store.travelToMap(portal.targetMap)
  → sceneTransition.fadeOut(500ms)
  → "Traveling to {targetMapName}..." overlay
  → gameStore.save()
  → scene.stop('GameScene')
  → scene.start('GameScene')      // Reloads same scene with new currentMap
  → sceneTransition.fadeIn(500ms)
  → player.position = portal.spawnTile
```

---

## 4. Tile & Sprite Texture Refactor

### TileTextures.ts — Per-Map Color Support

```typescript
// Current: hardcoded colors
const grassColor = 0x7ec850;
const wallColor = 0x5a4a3a;

// New: accepts theme colors
function generateTileTextures(
  scene: Phaser.Scene,
  colors: { grass: number; wall: number; path: number; water: number }
): void {
  // Generate tiles using provided color palette
}
```

Each texture gets a **suffix** based on map key to avoid key collisions:
- `grass_atomMeadows`, `grass_recyclingFields`, etc.
- Or use a shared palette approach where map colors are applied as tint at render time

**Preferred approach:** Generate textures once per map load with unique keys based on `mapKey + tileType`. When switching maps, destroy old textures and generate new ones.

### Building Facades — Per-Map Styles

```typescript
interface BuildingStyle {
  wallColor: number;
  roofColor: number;
  doorColor: number;
  windowColor: number;
  accentColor?: number;
}

const DEFAULT_BUILDING_STYLES: Record<string, BuildingStyle> = {
  lab:   { wallColor: 0x4a7acc, roofColor: 0x3a5aaa, doorColor: 0x2a3a6a, windowColor: 0x88bbff },
  library: { wallColor: 0x8a6a4a, roofColor: 0x6a4a2a, doorColor: 0x4a2a1a, windowColor: 0xffcc88 },
  shop:    { wallColor: 0xcc6a4a, roofColor: 0xaa4a2a, doorColor: 0x8a2a1a, windowColor: 0xffaa66 },
};
```

Each map can override these defaults via `mapData.buildings[].style`.

---

## 5. HUDScene Refactor

### Minimap — Dynamic Rendering

```typescript
// Before: hardcoded Atom Meadows render
// After: render from mapData
function renderMinimap(scene: Phaser.Scene, mapData: MapData): void {
  const scale = 4; // 32px tile → 4px minimap tile
  for (let y = 0; y < mapData.height; y++) {
    for (let x = 0; x < mapData.width; x++) {
      const tileType = mapData.ground[y][x];
      const color = TILE_MINIMAP_COLORS[tileType] ?? 0x333333;
      // draw 4x4 rect
    }
  }
  // Draw player dot
  // Draw portal markers
  // Draw building markers
}
```

### Map Name Display
- Show current map name in HUD (top center)
- Show map difficulty stars

---

## 6. Crafting System Changes

### Map-Specific Recipe Filtering

```typescript
function getAvailableRecipes(): RecipeData[] {
  const allRecipes = loadRecipes();
  const playerMap = store.currentMap;
  const playerSkills = store.playerData.skills;

  return allRecipes.filter(recipe => {
    // Must be available on current map (or no map restriction)
    if (recipe.mapOrigin && recipe.mapOrigin !== playerMap) return false;
    // Must meet minimum skill levels
    if (recipe.minSkillLevel) {
      for (const [skill, level] of Object.entries(recipe.minSkillLevel)) {
        if ((playerSkills[skill] ?? 0) < level) return false;
      }
    }
    return true;
  });
}
```

### Multi-Stage Crafting
Some recipes span multiple maps:
- Map 1: Craft H₂ and O₂ separately
- Map 2: Combine with materials to make composites
- Map 3: Use molecules as catalysts for biofuel

The crafting system already supports multi-step (H₂ + O → H₂O requires H₂ first). This pattern extends naturally.

---

## 7. Quest System Changes

### Cross-Map Quests

```typescript
interface QuestData {
  id: string;
  mapOrigin: string;             // Which map this quest belongs to
  prerequisites: string[];       // Quest IDs that must be completed first
  // ... existing fields ...
}
```

### Quest Giver Filtering
- NPCs on a map only offer quests where `quest.mapOrigin === currentMap`
- Quests with prerequisites check `mapProgress[mapKey].completedQuests`

### Map Completion Detection
```typescript
function isMapComplete(mapKey: string): boolean {
  const mapQuests = allQuests.filter(q => q.mapOrigin === mapKey && q.type === 'main');
  const completed = store.mapProgress[mapKey]?.completedQuests ?? [];
  return mapQuests.every(q => completed.includes(q.id));
}
```

---

## 8. Loading Strategy

### JSON Data Loading

All JSON files (`maps.json`, `items.json`, `recipes.json`, etc.) are loaded once in `BootScene` and cached:

```typescript
// BootScene.preload()
this.load.json('maps', 'assets/data/maps.json');
this.load.json('items', 'assets/data/items.json');
// ... etc.

// Accessed globally via:
const maps = this.cache.json.get('maps') as Record<string, MapData>;
```

This avoids reloading on every map transition.

### Texture Regeneration on Map Change

When `GameScene` loads a new map:
1. Destroy old tile textures from cache
2. Generate new tiles using new map's theme colors
3. Generate new building facades with per-map styles
4. Keep shared textures (player sprite, NPC sprites, UI elements) — these are universal

---

## 9. File Structure Changes

```
src/
└── game/
    ├── config.ts                  # Scene list updated (no new scenes needed)
    ├── data/
    │   └── types.ts               # Expanded (MapData, etc.)
    ├── scenes/
    │   ├── GameScene.ts           # Refactored to be data-driven
    │   └── ... (other scenes unchanged)
    ├── systems/
    │   ├── CraftingSystem.ts      # Updated with map filtering
    │   ├── QuestSystem.ts         # Updated with map filtering
    │   ├── MapManager.ts          # NEW: Map loading, transitions, progress
    │   └── SceneTransition.ts     # Updated with map-to-map transitions
    ├── textures/
    │   ├── TileTextures.ts        # Updated for per-map colors
    │   └── SpriteTextures.ts      # Mostly unchanged
    ├── entities/
    │   ├── Player.ts              # Mostly unchanged
    │   ├── NPC.ts                 # Mostly unchanged
    │   └── ResourceNode.ts        # Updated for new resource types
    └── overlays/
        └── HelpOverlay.ts         # Updated for per-map help text

public/assets/data/
    ├── maps.json                  # 5 maps instead of 1
    ├── items.json                 # Expanded (~30 items)
    ├── recipes.json               # Expanded (~20 recipes)
    ├── quests.json                # Expanded (~12 quests)
    └── npcs.json                  # Expanded (~18 NPCs)
```

**Key insight:** With the data-driven approach, we add **one new file** (`MapManager.ts`) and modify existing ones, rather than creating 4 new scene classes. This is the most maintainable path.
