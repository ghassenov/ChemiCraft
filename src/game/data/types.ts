// ===== ChemiCraft Type Definitions =====

/** Player save data persisted to localStorage */
export interface PlayerData {
  userId: string;
  username: string;
  currentMap: string;
  coins: number;
  skills: Record<string, number>;
  inventory: InventoryItem[];
  completedQuests: string[];
  activeQuests: string[];
  isGuest: boolean;
}

/** An item in the player's inventory */
export interface InventoryItem {
  itemId: string;
  quantity: number;
}

/** Quest definition from quests.json */
export interface QuestData {
  id: string;
  title: string;
  description: string;
  npcId: string;
  objectiveType: 'craft' | 'collect' | 'talk' | 'explore';
  target: string;
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
  dialogue: {
    default: string[];
    questActive?: string[];
    questComplete?: string[];
  };
}

/** Recipe definition from recipes.json */
export interface RecipeData {
  inputs: string[];
  output: string;
  outputName: string;
  explanation: string;
  difficulty: number;
}

/** Item definition from items.json */
export interface ItemData {
  id: string;
  name: string;
  symbol: string;
  type: 'reagent' | 'molecule' | 'equipment' | 'consumable' | 'quest_item';
  description: string;
  color: string;
  price: number;
  stackable: boolean;
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

/** Map definition from maps.json */
export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  playerSpawn: { x: number; y: number };
  ground: number[][];
  tileTypes: Record<string, { name: string; collision: boolean }>;
  buildings: BuildingData[];
  npcSpawns: NPCSpawn[];
  portal: {
    position: { x: number; y: number };
    locked: boolean;
    unlockCondition: string;
  };
}

export interface BuildingData {
  id: string;
  name: string;
  entrance: { x: number; y: number };
  scene: string;
  tiles: number[][];
}

export interface NPCSpawn {
  npcId: string;
  x: number;
  y: number;
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
}
