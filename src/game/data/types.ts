// ===== ChemiCraft Type Definitions =====

/** Player save data persisted to localStorage */
export interface PlayerData {
  userId: string;
  username: string;
  currentMap: string;
  mapProgress: MapProgress;
  unlockedMaps: string[];
  coins: number;
  skills: Record<string, number>;
  inventory: InventoryItem[];
  completedQuests: string[];
  activeQuests: string[];
  unlockedChemDex: string[];
  activeTool: string;
  equippedGear: string[];
  isGuest: boolean;
  interiorVisits: Record<string, boolean>;
  sortingScore: number;
}

/** Map Progression State */
export interface MapProgress {
  [mapKey: string]: {
    unlocked: boolean;
    completed: boolean;
    completedQuests: string[];
  };
}

/** An item in the player's inventory */
export interface InventoryItem {
  itemId: string;
  quantity: number;
}

/** Quest definition from quests.json */
export interface QuestData {
  id: string;
  mapOrigin: string;
  title: string;
  description: string;
  npcId: string;
  objectiveType: 'craft' | 'collect' | 'talk' | 'explore' | 'sort' | 'climate_calc' | 'light_puzzle' | 'trajectory' | 'field_nav';
  target: string;
  targetItemId: string;
  targetAmount: number;
  rewardCoins: number;
  rewardSkill: Record<string, number>;
  rewardItems: string[];
  prerequisiteQuests: string[];
  isMainQuest: boolean;
  hints: string[];
}

/** NPC definition from npcs.json */
export interface NPCData {
  id: string;
  name: string;
  spriteColor: string;
  questId: string | null;
  mapOrigin: string;
  dialogue: {
    default: string[];
    questActive?: string[];
    questComplete?: string[];
  };
}

/** Recipe definition from recipes.json */
export interface RecipeData {
  id: string;
  inputs: string[];
  output: string;
  outputName: string;
  outputItemId: string;
  outputQuantity: number;
  difficulty: number;
  mapOrigin: string;
  explanation: string;
  minSkillLevel?: Record<string, number>;
  category?: string;
}

/** Item definition from items.json */
export interface ItemData {
  id: string;
  name: string;
  symbol: string;
  type: 'reagent' | 'molecule' | 'equipment' | 'consumable' | 'quest_item' | 'material';
  description: string;
  color: string;
  price: number;
  stackable: boolean;
  category?: string;
  mapOrigin?: string;
}

/** Skill definition from skills.json */
export interface SkillData {
  id: string;
  name: string;
  icon: string;
  maxLevel: number;
  description: string;
  levelDescriptions: string[];
}

/** Map Theme Configuration */
export interface MapTheme {
  groundColor: number;
  wallColor: number;
  accentColor: number;
  bgColor: number;
  particles: 'pollen' | 'leaves' | 'wind' | 'sparkles' | 'embers' | 'none';
  music?: string;
}

export interface MapBuilding {
  type: 'lab' | 'library' | 'shop';
  name: string;
  tileX: number;
  tileY: number;
  sceneKey: string;
  tiles: number[][];
  style?: {
    wallColor: number;
    roofColor: number;
    doorColor?: number;
    windowColor?: number;
    accentColor?: number;
  };
}

export interface MapPortal {
  tileX: number;
  tileY: number;
  targetMap: string;
  spawnTileX: number;
  spawnTileY: number;
  unlockCondition: 'all_quests' | 'none';
}

export interface MapNPC {
  npcId: string;
  tileX: number;
  tileY: number;
}

export interface MapDecoration {
  type: 'flower' | 'grass' | 'tree' | 'rock' | 'lamp' | 'sign' | 'bin' | 'solar_panel' | 'prism' | 'magnet' | 'barrel' | 'pile' | 'conveyor';
  tileX: number;
  tileY: number;
  color?: string;
}

export interface ResourceNodeData {
  type: string;
  tileX: number;
  tileY: number;
  maxGathers: number;
}

/** Map definition from maps.json */
export interface MapData {
  key: string;
  name: string;
  difficulty: number;
  requiredMap?: string;
  theme: MapTheme;
  width: number;
  height: number;
  tileSize: number;
  playerSpawn: { tileX: number; tileY: number };
  ground: number[][];
  buildings: MapBuilding[];
  portals: MapPortal[];
  npcs: MapNPC[];
  decorations: MapDecoration[];
  resourceNodes: ResourceNodeData[];
}

/** Direction enum for player movement */
export enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
  UpLeft = 'up-left',
  UpRight = 'up-right',
  DownLeft = 'down-left',
  DownRight = 'down-right',
  None = 'none',
}

/** Game events emitted via Phaser's event system */
export enum GameEvents {
  QuestAccepted = 'quest:accepted',
  QuestCompleted = 'quest:completed',
  ItemCrafted = 'item:crafted',
  ItemObtained = 'item:obtained',
  CoinsChanged = 'coins:changed',
  SkillLevelUp = 'skill:levelup',
  DialogueStart = 'dialogue:start',
  DialogueEnd = 'dialogue:end',
  SceneTransition = 'scene:transition',
  SaveGame = 'game:save',
  Notification = 'ui:notification',
  MapUnlocked = 'map:unlocked',
}
