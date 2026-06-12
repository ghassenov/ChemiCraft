import { gameStore } from '../../store/gameStore';
import type { QuestData } from '../data/types';
import { GameEvents } from '../data/types';

/**
 * QuestSystem — manages quest acceptance, progress tracking, and completion.
 */
export class QuestSystem {
  private quests: Record<string, QuestData> = {};
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, questData: Record<string, QuestData>) {
    this.scene = scene;
    this.quests = questData;

    // Listen for quest events
    scene.events.on(GameEvents.QuestAccepted, (id: string) => this.onQuestAccepted(id));
    // Note: We no longer auto-complete on ItemCrafted event
  }

  getQuest(id: string): QuestData | null {
    return this.quests[id] || null;
  }

  getAllQuests(): QuestData[] {
    return Object.values(this.quests);
  }

  getActiveQuests(): QuestData[] {
    return gameStore.getState().playerData.activeQuests
      .map(id => this.quests[id])
      .filter(Boolean);
  }

  getCompletedQuests(): QuestData[] {
    return gameStore.getState().playerData.completedQuests
      .map(id => this.quests[id])
      .filter(Boolean);
  }

  canAcceptQuest(id: string): boolean {
    const quest = this.quests[id];
    if (!quest) return false;
    if (gameStore.isQuestActive(id) || gameStore.isQuestCompleted(id)) return false;
    return quest.prerequisiteQuests.every(pq => gameStore.isQuestCompleted(pq));
  }

  private onQuestAccepted(id: string) {
    const quest = this.quests[id];
    if (!quest) return;
    console.log(`Quest accepted: ${quest.title}`);
    this.scene.events.emit(GameEvents.Notification, {
      title: 'Quest Accepted!',
      message: quest.title,
      icon: '📜',
    });
  }

  // Note: Craft quests are now completed manually by talking to the NPC with the item in inventory

  completeQuest(id: string) {
    const quest = this.quests[id];
    if (!quest) return;

    // Grant rewards
    gameStore.addCoins(quest.rewardCoins);
    for (const [skill, points] of Object.entries(quest.rewardSkill)) {
      gameStore.addSkillPoints(skill, points);
    }
    for (const itemId of quest.rewardItems) {
      gameStore.addToInventory(itemId, 5); // give 5 of reward reagents
    }

    gameStore.completeQuest(id);

    this.scene.events.emit(GameEvents.QuestCompleted, id);
    this.scene.events.emit(GameEvents.Notification, {
      title: 'Quest Complete!',
      message: `${quest.title} — +${quest.rewardCoins} coins`,
      icon: '✅',
    });

    console.log(`Quest completed: ${quest.title}`);
  }

  /** Get NPC dialogue based on quest state */
  getNpcDialogue(npcData: { questId: string | null; dialogue: { default: string[]; questActive?: string[]; questComplete?: string[] } }): string[] {
    if (!npcData.questId) return npcData.dialogue.default;
    
    if (gameStore.isQuestCompleted(npcData.questId)) {
      return npcData.dialogue.questComplete || npcData.dialogue.default;
    }
    if (gameStore.isQuestActive(npcData.questId)) {
      return npcData.dialogue.questActive || npcData.dialogue.default;
    }
    return npcData.dialogue.default;
  }
}
