import type { PlayerData, InventoryItem } from '../game/data/types';

// ===== Simple State Management (Zustand-like) =====

type Listener = () => void;

export interface GameState {
  playerData: PlayerData;
  isDialogueOpen: boolean;
  isPaused: boolean;
}

const DEFAULT_PLAYER_DATA: PlayerData = {
  userId: 'local_player',
  username: 'Player',
  currentMap: 'atomMeadows',
  coins: 0,
  skills: {
    bonding: 0,
    equation_balancing: 0,
    precipitation: 0,
    acid_base: 0,
    recycling_mastery: 0,
    climate_science: 0,
    optics_mastery: 0,
    magnetism_mastery: 0,
  },
  inventory: [
    { itemId: 'reagent_H', quantity: 10 },
    { itemId: 'reagent_N', quantity: 10 },
    { itemId: 'reagent_O', quantity: 5 },
    { itemId: 'reagent_C', quantity: 5 },
  ],
  completedQuests: [],
  activeQuests: [],
  unlockedChemDex: [],
  activeTool: 'none',
  equippedGear: [],
  interiorVisits: {},
  mapProgress: {
    atomMeadows: { unlocked: true, completed: false, completedQuests: [] },
  },
  unlockedMaps: ['atomMeadows'],
};

class GameStore {
  private state: GameState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = {
      playerData: { ...DEFAULT_PLAYER_DATA },
      isDialogueOpen: false,
      isPaused: false,
    };
  }

  hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  loadSave() {
    const saved = this.loadFromStorage();
    if (saved) {
      this.state.playerData = saved;
      this.notify();
    }
  }

  newGame() {
    this.state.playerData = { ...DEFAULT_PLAYER_DATA };
    localStorage.removeItem(this.SAVE_KEY);
    this.notify();
  }

  getState(): GameState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // ===== Coins =====
  addCoins(amount: number) {
    this.state.playerData.coins += amount;
    this.notify();
    this.autoSave();
  }

  spendCoins(amount: number): boolean {
    if (this.state.playerData.coins < amount) return false;
    this.state.playerData.coins -= amount;
    this.notify();
    this.autoSave();
    return true;
  }

  // ===== Inventory =====
  addToInventory(itemId: string, quantity: number = 1) {
    const inv = this.state.playerData.inventory;
    const existing = inv.find((i) => i.itemId === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      inv.push({ itemId, quantity });
    }
    this.notify();
    this.autoSave();
  }

  removeFromInventory(itemId: string, quantity: number = 1): boolean {
    const inv = this.state.playerData.inventory;
    const existing = inv.find((i) => i.itemId === itemId);
    if (!existing || existing.quantity < quantity) return false;
    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      const idx = inv.indexOf(existing);
      inv.splice(idx, 1);
    }
    this.notify();
    this.autoSave();
    return true;
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    const item = this.state.playerData.inventory.find((i) => i.itemId === itemId);
    return !!item && item.quantity >= quantity;
  }

  getItemCount(itemId: string): number {
    const item = this.state.playerData.inventory.find((i) => i.itemId === itemId);
    return item ? item.quantity : 0;
  }

  getInventory(): InventoryItem[] {
    return [...this.state.playerData.inventory];
  }

  // ===== Quests =====
  acceptQuest(questId: string) {
    if (!this.state.playerData.activeQuests.includes(questId)) {
      this.state.playerData.activeQuests.push(questId);
      this.notify();
      this.autoSave();
    }
  }

  completeQuest(questId: string) {
    this.state.playerData.activeQuests = this.state.playerData.activeQuests.filter(
      (q) => q !== questId
    );
    if (!this.state.playerData.completedQuests.includes(questId)) {
      this.state.playerData.completedQuests.push(questId);
      
      // Update map-specific quest progress
      const currentMap = this.state.playerData.currentMap;
      if (this.state.playerData.mapProgress[currentMap]) {
          if (!this.state.playerData.mapProgress[currentMap].completedQuests.includes(questId)) {
              this.state.playerData.mapProgress[currentMap].completedQuests.push(questId);
          }
      }
    }
    this.notify();
    this.autoSave();
  }

  isQuestActive(questId: string): boolean {
    return this.state.playerData.activeQuests.includes(questId);
  }

  isQuestCompleted(questId: string): boolean {
    return this.state.playerData.completedQuests.includes(questId);
  }

  // ===== ChemDex =====
  unlockChemDex(moleculeSymbol: string) {
    if (!this.state.playerData.unlockedChemDex.includes(moleculeSymbol)) {
      this.state.playerData.unlockedChemDex.push(moleculeSymbol);
      this.notify();
      this.autoSave();
      
      // We could trigger a notification event here
      const event = new CustomEvent('chemicraft:notification', {
        detail: { message: `New molecule unlocked in ChemDex: ${moleculeSymbol}!`, color: '#00cec9' }
      });
      window.dispatchEvent(event);
    }
  }

  hasChemDex(moleculeSymbol: string): boolean {
    return this.state.playerData.unlockedChemDex.includes(moleculeSymbol);
  }

  // ===== Skills =====
  addSkillPoints(skillId: string, points: number) {
    const current = this.state.playerData.skills[skillId] || 0;
    this.state.playerData.skills[skillId] = Math.min(current + points, 5);
    this.notify();
    this.autoSave();
  }

  getSkillLevel(skillId: string): number {
    return this.state.playerData.skills[skillId] || 0;
  }

  // ===== Equipment & Tools =====
  setActiveTool(tool: string) {
    this.state.playerData.activeTool = tool;
    this.notify();
    this.autoSave();
  }

  equipGear(itemId: string) {
    // Unequip similar items if needed, or just set it
    if (!this.state.playerData.equippedGear.includes(itemId)) {
      this.state.playerData.equippedGear.push(itemId);
      this.notify();
      this.autoSave();
    }
  }

  isEquipped(itemId: string): boolean {
    return this.state.playerData.equippedGear.includes(itemId);
  }

  consumeItem(itemId: string): boolean {
    if (this.removeFromInventory(itemId, 1)) {
      // Trigger effect via events
      const event = new CustomEvent('chemicraft:consumed', { detail: { itemId } });
      window.dispatchEvent(event);
      return true;
    }
    return false;
  }

  // ===== UI State =====
  setDialogueOpen(open: boolean) {
    this.state.isDialogueOpen = open;
    this.notify();
  }

  setPaused(paused: boolean) {
    this.state.isPaused = paused;
    this.notify();
  }

  // ===== Map Progression =====
  travelToMap(mapKey: string) {
    if (!this.state.playerData.unlockedMaps.includes(mapKey)) {
        console.warn(`Cannot travel to ${mapKey} - map is not unlocked.`);
        return false;
    }
    
    this.state.playerData.currentMap = mapKey;
    
    // Ensure progress entry exists
    if (!this.state.playerData.mapProgress[mapKey]) {
        this.state.playerData.mapProgress[mapKey] = {
            unlocked: true,
            completed: false,
            completedQuests: []
        };
    }
    
    this.notify();
    this.autoSave();
    return true;
  }

  unlockMap(mapKey: string) {
    if (!this.state.playerData.unlockedMaps.includes(mapKey)) {
        this.state.playerData.unlockedMaps.push(mapKey);
        
        if (!this.state.playerData.mapProgress[mapKey]) {
            this.state.playerData.mapProgress[mapKey] = {
                unlocked: true,
                completed: false,
                completedQuests: []
            };
        } else {
             this.state.playerData.mapProgress[mapKey].unlocked = true;
        }

        this.notify();
        this.autoSave();
        
        const event = new CustomEvent('chemicraft:notification', {
            detail: { message: `New Area Unlocked!`, color: '#f1c40f' }
        });
        window.dispatchEvent(event);
        
        const unlockEvent = new CustomEvent('chemicraft:mapUnlocked', { detail: { mapKey } });
        window.dispatchEvent(unlockEvent);
    }
  }

  markMapCompleted(mapKey: string) {
      if (this.state.playerData.mapProgress[mapKey] && !this.state.playerData.mapProgress[mapKey].completed) {
          this.state.playerData.mapProgress[mapKey].completed = true;
          this.notify();
          this.autoSave();
      }
  }
  
  isMapUnlocked(mapKey: string): boolean {
      return this.state.playerData.unlockedMaps.includes(mapKey);
  }

  getCurrentMap(): string {
      return this.state.playerData.currentMap;
  }

  // ===== Interior Visits =====
  markInteriorVisited(sceneKey: string) {
    this.state.playerData.interiorVisits[sceneKey] = true;
    this.notify();
    this.autoSave();
  }

  hasVisitedInterior(sceneKey: string): boolean {
    return !!this.state.playerData.interiorVisits[sceneKey];
  }

  // ===== Persistence (localStorage) =====
  private readonly SAVE_KEY = 'chemicraft_save';

  saveToStorage() {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state.playerData));
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  }

  loadFromStorage(): PlayerData | null {
    try {
      const data = localStorage.getItem(this.SAVE_KEY);
      if (data) return JSON.parse(data) as PlayerData;
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return null;
  }

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveToStorage(), 2000);
  }
}

// Singleton instance
export const gameStore = new GameStore();
