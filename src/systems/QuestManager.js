import questsData from '../data/quests.json';

export class QuestManager {
  constructor() {
    this.quests = questsData;
    this.activeQuest = null;
    this.completedQuests = [];
    this.coins = 0;
    this.skills = { bonding: 0, balancing: 0, precipitation: 0, acid_base: 0 };
    this.inventory = {};
    this.listeners = [];
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  _notify() {
    this.listeners.forEach(fn => fn(this.getState()));
  }

  getState() {
    return {
      activeQuest: this.activeQuest,
      completedQuests: this.completedQuests,
      coins: this.coins,
      skills: { ...this.skills },
      inventory: { ...this.inventory },
    };
  }

  acceptQuest(questId) {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return false;
    if (this.completedQuests.includes(questId)) return false;
    this.activeQuest = quest;
    this._notify();
    return true;
  }

  checkCompletion(craftedMolecule) {
    if (!this.activeQuest) return false;
    const objective = this.activeQuest.objective;
    if (objective.type === 'molecule' && craftedMolecule === objective.target) {
      this.completeQuest();
      return true;
    }
    return false;
  }

  completeQuest() {
    const quest = this.activeQuest;
    if (!quest) return;

    const rewards = quest.rewards;
    this.coins += rewards.coins;

    if (rewards.skill) {
      this.skills[rewards.skill] = (this.skills[rewards.skill] || 0) + rewards.skill_points;
    }

    if (rewards.unlock_reagent) {
      this.inventory[rewards.unlock_reagent] = (this.inventory[rewards.unlock_reagent] || 0) + 5;
    }

    this.completedQuests.push(quest.id);
    this.activeQuest = null;
    this._notify();
  }

  addReagent(reagentId, quantity = 1) {
    this.inventory[reagentId] = (this.inventory[reagentId] || 0) + quantity;
    this._notify();
  }

  hasReagents(reagentIds) {
    for (const id of reagentIds) {
      if (!this.inventory[id] || this.inventory[id] <= 0) return false;
    }
    return true;
  }

  consumeReagents(reagentIds) {
    for (const id of reagentIds) {
      if (this.inventory[id]) this.inventory[id]--;
    }
    this._notify();
  }
}
