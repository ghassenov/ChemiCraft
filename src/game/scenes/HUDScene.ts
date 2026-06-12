import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';
import { GameEvents, ItemData, SkillData, QuestData } from '../data/types';

export class HUDScene extends Phaser.Scene {
  private coinText!: Phaser.GameObjects.Text;
  private questTracker!: Phaser.GameObjects.Text;
  private uiContainer!: Phaser.GameObjects.Container;
  private overlayBg!: Phaser.GameObjects.Rectangle;
  private isOverlayOpen = false;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Coins
    this.add.image(width - 110, 30, 'hud_panel').setDisplaySize(180, 40);
    this.coinText = this.add.text(width - 180, 30, `🪙 ${gameStore.getState().playerData.coins}`, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#fdcb6e'
    }).setOrigin(0, 0.5);

    // Quest Tracker
    this.add.image(130, 40, 'hud_panel').setDisplaySize(220, 60);
    this.add.text(30, 20, 'Current Quest', { fontFamily: '"Inter"', fontSize: '12px', color: '#a29bfe', fontStyle: 'bold' });
    this.questTracker = this.add.text(30, 40, 'Explore the village.', {
        fontFamily: '"Inter"', fontSize: '12px', color: '#dfe6e9', wordWrap: { width: 200 }
    });

    // Buttons
    this.createMiniBtn(width - 40, height - 40, 'M', 'Map', () => this.showOverlay('map'));
    this.createMiniBtn(width - 90, height - 40, 'K', 'Skills', () => this.showOverlay('skills'));
    this.createMiniBtn(width - 140, height - 40, 'I', 'Inventory', () => this.showOverlay('inventory'));
    this.createMiniBtn(width - 190, height - 40, 'Q', 'Quests', () => this.showOverlay('quests'));

    // Input
    if (this.input.keyboard) {
        this.input.keyboard.on('keydown-I', () => this.toggleOverlay('inventory'));
        this.input.keyboard.on('keydown-Q', () => this.toggleOverlay('quests'));
        this.input.keyboard.on('keydown-K', () => this.toggleOverlay('skills'));
        this.input.keyboard.on('keydown-ESC', () => this.closeOverlay());
    }

    // Subscribe to store
    const unsub = gameStore.subscribe(() => this.updateHUD());
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => unsub());

    // Overlay container
    this.overlayBg = this.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0).setAlpha(0);
    this.overlayBg.setInteractive(); // block clicks
    this.overlayBg.on('pointerdown', () => this.closeOverlay());
    
    this.uiContainer = this.add.container(width/2, height/2).setAlpha(0);

    this.updateHUD();

    // Notifications
    this.scene.get('GameScene').events.on(GameEvents.Notification, (data: { title: string, message: string, icon: string }) => {
        this.showNotification(data);
    });
  }

  private updateHUD() {
      const state = gameStore.getState();
      this.coinText.setText(`🪙 ${state.playerData.coins}`);

      // Update quest tracker
      const active = state.playerData.activeQuests;
      if (active.length > 0) {
          const quests = this.cache.json.get('quests') as Record<string, QuestData>;
          const firstQuest = quests[active[0]];
          if (firstQuest) {
              this.questTracker.setText(firstQuest.title + '\n' + firstQuest.objectiveType + ' ' + firstQuest.target);
          }
      } else {
          this.questTracker.setText('Explore the village.');
      }
  }

  private createMiniBtn(x: number, y: number, key: string, label: string, cb: () => void) {
      const btn = this.add.circle(x, y, 20, 0x1e1e3f).setStrokeStyle(2, 0x6c5ce7).setInteractive({ useHandCursor: true });
      this.add.text(x, y, key, { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#a29bfe' }).setOrigin(0.5);
      
      const tooltip = this.add.text(x, y - 30, label, { fontFamily: '"Inter"', fontSize: '10px', color: '#fff', backgroundColor: '#000', padding: { x: 4, y: 2 } }).setOrigin(0.5).setAlpha(0);

      btn.on('pointerdown', cb);
      btn.on('pointerover', () => { tooltip.setAlpha(1); btn.setFillStyle(0x6c5ce7); });
      btn.on('pointerout', () => { tooltip.setAlpha(0); btn.setFillStyle(0x1e1e3f); });
  }

  private toggleOverlay(type: string) {
      if (this.isOverlayOpen) this.closeOverlay();
      else this.showOverlay(type);
  }

  private showOverlay(type: string) {
      this.uiContainer.removeAll(true);
      gameStore.setPaused(true);
      this.isOverlayOpen = true;

      const panel = this.add.image(0, 0, 'panel_bg');
      this.uiContainer.add(panel);

      const titleMap: any = { inventory: 'Backpack', quests: 'Quest Log', skills: 'Skill Tree', map: 'Map' };
      this.uiContainer.add(this.add.text(0, -170, titleMap[type], { fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#a29bfe' }).setOrigin(0.5));

      if (type === 'inventory') this.renderInventory();
      else if (type === 'quests') this.renderQuests();
      else if (type === 'skills') this.renderSkills();

      this.tweens.add({ targets: [this.overlayBg, this.uiContainer], alpha: 1, duration: 200 });
  }

  private closeOverlay() {
      if (!this.isOverlayOpen) return;
      this.isOverlayOpen = false;
      gameStore.setPaused(false);
      this.tweens.add({ targets: [this.overlayBg, this.uiContainer], alpha: 0, duration: 200 });
  }

  private renderInventory() {
      const items = this.cache.json.get('items') as Record<string, ItemData>;
      const inv = gameStore.getInventory();
      
      let x = -230, y = -100;
      for (const item of inv) {
          const data = items[item.itemId];
          if (!data) continue;

          const slot = this.add.image(x, y, 'inv_slot');
          const icon = this.add.text(x, y-5, data.symbol, { fontSize: '20px' }).setOrigin(0.5);
          const qty = this.add.text(x+15, y+15, `${item.quantity}`, { fontFamily: '"Inter"', fontSize: '10px', color: '#fff' }).setOrigin(1);
          
          slot.setInteractive();
          // Tooltip logic could go here
          this.uiContainer.add([slot, icon, qty]);

          x += 60;
          if (x > 230) { x = -230; y += 60; }
      }
  }

  private renderQuests() {
      const quests = this.cache.json.get('quests') as Record<string, QuestData>;
      const active = gameStore.getState().playerData.activeQuests;
      
      let y = -120;
      if (active.length === 0) {
          this.uiContainer.add(this.add.text(0, 0, 'No active quests.', { fontFamily: '"Inter"', color: '#636e72' }).setOrigin(0.5));
      }

      for (const qid of active) {
          const q = quests[qid];
          if (!q) continue;
          this.uiContainer.add(this.add.text(-250, y, `! ${q.title}`, { fontFamily: '"Inter"', fontSize: '16px', color: '#f1c40f', fontStyle: 'bold' }));
          this.uiContainer.add(this.add.text(-230, y + 25, q.description, { fontFamily: '"Inter"', fontSize: '12px', color: '#dfe6e9', wordWrap: { width: 480 } }));
          y += 80;
      }
  }

  private renderSkills() {
      const skills = this.cache.json.get('skills') as Record<string, SkillData>;
      const pSkills = gameStore.getState().playerData.skills;

      let x = -150, y = -50;
      for (const [id, data] of Object.entries(skills)) {
          const level = pSkills[id] || 0;
          this.uiContainer.add(this.add.text(x, y - 40, data.icon, { fontSize: '32px' }).setOrigin(0.5));
          this.uiContainer.add(this.add.text(x, y - 10, data.name, { fontFamily: '"Inter"', fontSize: '12px', color: '#a29bfe', fontStyle: 'bold' }).setOrigin(0.5));
          
          // Progress bar
          this.uiContainer.add(this.add.rectangle(x, y + 10, 100, 10, 0x1e1e3f).setOrigin(0.5));
          if (level > 0) {
             this.uiContainer.add(this.add.rectangle(x - 50, y + 10, 20 * level, 10, 0x00cec9).setOrigin(0, 0.5));
          }
          this.uiContainer.add(this.add.text(x, y + 30, `Lvl ${level}/${data.maxLevel}`, { fontFamily: '"Inter"', fontSize: '10px', color: '#fff' }).setOrigin(0.5));

          x += 300;
          if (x > 150) { x = -150; y += 120; }
      }
  }

  private showNotification(data: { title: string, message: string, icon: string }) {
      const { width } = this.cameras.main;
      const c = this.add.container(width / 2, -50);
      
      const bg = this.add.rectangle(0, 0, 300, 60, 0x1e1e3f, 0.9).setStrokeStyle(2, 0x6c5ce7).setOrigin(0.5);
      const icon = this.add.text(-120, 0, data.icon, { fontSize: '24px' }).setOrigin(0.5);
      const title = this.add.text(-80, -15, data.title, { fontFamily: '"Inter"', fontSize: '12px', color: '#a29bfe', fontStyle: 'bold' });
      const msg = this.add.text(-80, 5, data.message, { fontFamily: '"Inter"', fontSize: '12px', color: '#dfe6e9' });

      c.add([bg, icon, title, msg]);

      this.tweens.add({ targets: c, y: 50, duration: 400, ease: 'Back.easeOut' });
      this.time.delayedCall(3000, () => {
          this.tweens.add({ targets: c, y: -50, duration: 300, ease: 'Power2', onComplete: () => c.destroy() });
      });
  }
}
