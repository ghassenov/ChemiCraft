import type { PlayerData, InventoryItem } from '../game/data/types';

// ===== Simple State Management (Zustand-like) =====

type Listener = () => void;

export interface GameState {
  // Auth state
  isAuthenticated: boolean;
  isGuest: boolean;
  username: string;

  // Player data
  playerData: PlayerData;

  // UI state
  isDialogueOpen: boolean;
  isPaused: boolean;
}

const DEFAULT_PLAYER_DATA: PlayerData = {
  userId: '',
  username: 'Guest',
  currentMap: 'atomMeadows',
  coins: 0,
  skills: {
    bonding: 0,
    equation_balancing: 0,
    precipitation: 0,
    acid_base: 0,
  },
  inventory: [
    { itemId: 'reagent_H', quantity: 10 },
    { itemId: 'reagent_N', quantity: 10 },
    { itemId: 'reagent_O', quantity: 5 },
    { itemId: 'reagent_C', quantity: 5 },
  ],
  completedQuests: [],
  activeQuests: [],
  isGuest: true,
};

class GameStore {
  private state: GameState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = {
      isAuthenticated: false,
      isGuest: true,
      username: 'Guest',
      playerData: { ...DEFAULT_PLAYER_DATA },
      isDialogueOpen: false,
      isPaused: false,
    };
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

  // ===== Auth Actions =====
  login(username: string) {
    const userId = `local_${username.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const saved = this.loadFromStorage(userId);

    this.state = {
      ...this.state,
      isAuthenticated: true,
      isGuest: false,
      username,
      playerData: saved || {
        ...DEFAULT_PLAYER_DATA,
        userId,
        username,
        isGuest: false,
      },
    };
    this.notify();
  }

  playAsGuest() {
    this.state = {
      ...this.state,
      isAuthenticated: true,
      isGuest: true,
      username: 'Guest',
      playerData: { ...DEFAULT_PLAYER_DATA },
    };
    this.notify();
  }

  logout() {
    this.saveToStorage();
    this.state = {
      ...this.state,
      isAuthenticated: false,
      isGuest: true,
      username: 'Guest',
      playerData: { ...DEFAULT_PLAYER_DATA },
    };
    this.notify();
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

  // ===== UI State =====
  setDialogueOpen(open: boolean) {
    this.state.isDialogueOpen = open;
    this.notify();
  }

  setPaused(paused: boolean) {
    this.state.isPaused = paused;
    this.notify();
  }

  // ===== Persistence (localStorage) =====
  saveToStorage() {
    if (this.state.isGuest) return;
    const key = `chemicraft_save_${this.state.playerData.userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(this.state.playerData));
      localStorage.setItem('chemicraft_last_user', this.state.playerData.userId);
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  }

  loadFromStorage(userId: string): PlayerData | null {
    const key = `chemicraft_save_${userId}`;
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data) as PlayerData;
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return null;
  }

  getLastUserId(): string | null {
    return localStorage.getItem('chemicraft_last_user');
  }

  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoSave() {
    if (this.state.isGuest) return;
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveToStorage(), 2000);
  }
}

// Singleton instance
export const gameStore = new GameStore();
