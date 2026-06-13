import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';
import { GameEvents, ItemData, SkillData, QuestData, MapData } from '../data/types';

export class HUDScene extends Phaser.Scene {
  private coinText!: Phaser.GameObjects.Text;
  private questTracker!: Phaser.GameObjects.Text;
  private activeToolText!: Phaser.GameObjects.Text;
  private activeToolIcon!: Phaser.GameObjects.Image;
  private uiContainer!: Phaser.GameObjects.Container;
  private overlayBg!: Phaser.GameObjects.Rectangle;
  private isOverlayOpen = false;
  private nameInputEl!: HTMLInputElement;
  private nameWrapperEl!: HTMLDivElement;
  private keyboardGuard = false;

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
    this.add.text(30, 20, 'Current Quest', { fontFamily: '"Inter"', fontSize: '12px', color: '#f39c12', fontStyle: 'bold' });
    this.questTracker = this.add.text(30, 40, 'Explore the village.', {
        fontFamily: '"Inter"', fontSize: '12px', color: '#dfe6e9', wordWrap: { width: 200 }
    });

    // Buttons
    this.createMiniBtn(width - 40, height - 40, 'M', 'Map', () => this.showOverlay('map'));
    this.createMiniBtn(width - 90, height - 40, 'K', 'Skills', () => this.showOverlay('skills'));
    this.createMiniBtn(width - 140, height - 40, 'I', 'Inventory', () => this.showOverlay('inventory'));
    this.createMiniBtn(width - 190, height - 40, 'Q', 'Quests', () => this.showOverlay('quests'));
    this.createMiniBtn(width - 240, height - 40, 'C', 'ChemDex', () => this.showOverlay('chemdex'));
    this.createMiniBtn(width - 290, height - 40, '⛶', 'Fullscreen', () => this.toggleFullscreen());

    // Active Tool
    this.add.image(width / 2, height - 30, 'hud_panel').setDisplaySize(120, 40);
    this.activeToolIcon = this.add.image(width / 2 - 30, height - 30, 'icon_particle').setDisplaySize(20, 20); // Fallback icon
    this.activeToolText = this.add.text(width / 2 + 10, height - 30, 'None\n[T]', {
      fontFamily: '"Inter"', fontSize: '10px', color: '#fff', align: 'center'
    }).setOrigin(0.5);

    // Keyboard shortcuts (guarded so they don't fire while typing)
    const guard = (fn: () => void) => () => { if (!this.keyboardGuard) fn(); };

    if (this.input.keyboard) {
        this.input.keyboard.on('keydown-I', guard(() => this.toggleOverlay('inventory')));
        this.input.keyboard.on('keydown-Q', guard(() => this.toggleOverlay('quests')));
        this.input.keyboard.on('keydown-K', guard(() => this.toggleOverlay('skills')));
        this.input.keyboard.on('keydown-C', guard(() => this.toggleOverlay('chemdex')));
        this.input.keyboard.on('keydown-M', guard(() => this.toggleOverlay('map')));
        this.input.keyboard.on('keydown-T', guard(() => this.cycleTool()));
        this.input.keyboard.on('keydown-ESC', guard(() => this.closeOverlay()));
        this.input.keyboard.on('keydown-F', guard(() => this.toggleFullscreen()));
    }

    // Subscribe to store
    const unsub = gameStore.subscribe(() => this.updateHUD());
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => unsub());

    // Overlay container
    this.overlayBg = this.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0).setAlpha(0);
    this.overlayBg.setInteractive(); // block clicks
    this.overlayBg.on('pointerdown', () => this.closeOverlay());
    
    this.uiContainer = this.add.container(width/2, height/2).setAlpha(0);

    // Username input (DOM overlay on the right side)
    this.createUsernameInput();

    this.updateHUD();

    // Notifications
    this.scene.get('GameScene').events.on(GameEvents.Notification, (data: { title: string, message: string, icon: string }) => {
        this.showNotification(data);
    });

    // Custom events
    window.addEventListener('chemicraft:notification', (e: any) => {
        this.showNotification({ title: 'System', message: e.detail.message, icon: '💡' });
    });
  }

  private createUsernameInput() {
    this.nameWrapperEl = document.createElement('div');
    this.nameWrapperEl.style.cssText = `
      position: fixed; top: 75px; right: 20px; z-index: 500;
      display: flex; flex-direction: column; align-items: stretch; gap: 3px;
    `;

    const label = document.createElement('span');
    label.textContent = 'PLAYER';
    label.style.cssText = `
      font-family: "Press Start 2P", monospace; font-size: 8px;
      color: #7a6a4a; letter-spacing: 1px; text-align: right;
    `;

    this.nameInputEl = document.createElement('input');
    this.nameInputEl.type = 'text';
    this.nameInputEl.value = gameStore.getState().playerData.username;
    this.nameInputEl.style.cssText = `
      width: 160px; padding: 6px 10px; font-size: 13px;
      background: #0a0a0a; border: 2px solid #2a1a0a; border-radius: 2px;
      color: #c8b89a; font-family: "Inter", sans-serif; outline: none;
      transition: border-color 0.2s ease;
    `;

    this.nameInputEl.addEventListener('focus', () => {
      this.nameInputEl.style.borderColor = '#f39c12';
      this.keyboardGuard = true;
      gameStore.setPaused(true);
      this.nameInputEl.dataset.originalValue = this.nameInputEl.value;
    });

    this.nameInputEl.addEventListener('blur', () => {
      this.nameInputEl.style.borderColor = '#2a1a0a';
      this.keyboardGuard = false;
      gameStore.setPaused(false);
      const val = this.nameInputEl.value.trim();
      if (val) gameStore.setUsername(val);
    });

    this.nameInputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        this.nameInputEl.blur();
      }
      if (e.key === 'Escape') {
        this.nameInputEl.value = this.nameInputEl.dataset.originalValue || this.nameInputEl.value;
        this.nameInputEl.blur();
      }
    });

    this.nameWrapperEl.appendChild(label);
    this.nameWrapperEl.appendChild(this.nameInputEl);
    document.body.appendChild(this.nameWrapperEl);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.nameWrapperEl.parentNode) this.nameWrapperEl.parentNode.removeChild(this.nameWrapperEl);
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

      // Update Tool
      const tool = state.playerData.activeTool;
      if (tool === 'none') {
        this.activeToolText.setText('Hands\n[T]');
        this.activeToolIcon.setTexture('icon_particle').setAlpha(0.2);
      } else if (tool === 'pickaxe') {
        this.activeToolText.setText('Pickaxe\n[T]');
        this.activeToolIcon.setTexture('icon_pickaxe').setAlpha(1);
      } else if (tool === 'flask') {
        this.activeToolText.setText('Flask\n[T]');
        this.activeToolIcon.setTexture('icon_flask').setAlpha(1);
      }
  }

  private cycleTool() {
    const tools = ['none', 'pickaxe', 'flask'];
    const current = gameStore.getState().playerData.activeTool;
    const idx = tools.indexOf(current);
    const nextIdx = (idx + 1) % tools.length;
    gameStore.setActiveTool(tools[nextIdx]);
  }

  private toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }

  private createMiniBtn(x: number, y: number, key: string, label: string, cb: () => void) {
      const btn = this.add.circle(x, y, 20, 0x1a0e00).setStrokeStyle(2, 0xf39c12).setInteractive({ useHandCursor: true });
      this.add.text(x, y, key, { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#f39c12' }).setOrigin(0.5);
      
      const tooltip = this.add.text(x, y - 30, label, { fontFamily: '"Inter"', fontSize: '10px', color: '#fff', backgroundColor: '#000', padding: { x: 4, y: 2 } }).setOrigin(0.5).setAlpha(0);

      btn.on('pointerdown', cb);
      btn.on('pointerover', () => { tooltip.setAlpha(1); btn.setFillStyle(0xf39c12); });
      btn.on('pointerout', () => { tooltip.setAlpha(0); btn.setFillStyle(0x1a0e00); });
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

      const titleMap: any = { inventory: 'Backpack', quests: 'Quest Log', skills: 'Skill Tree', map: 'Map', chemdex: 'ChemDex' };
      this.uiContainer.add(this.add.text(0, -170, titleMap[type], { fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#f39c12' }).setOrigin(0.5));

      if (type === 'inventory') this.renderInventory();
      else if (type === 'quests') this.renderQuests();
      else if (type === 'skills') this.renderSkills();
      else if (type === 'chemdex') this.renderChemDex();
      else if (type === 'map') this.renderMap();

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

          const isEquipped = gameStore.isEquipped(item.itemId);
          
          const slot = this.add.image(x, y, 'inv_slot');
          if (isEquipped) {
              slot.setTint(0x00b894); // Highlight equipped
          }
          
          const icon = this.add.text(x, y-5, data.symbol, { fontSize: '20px' }).setOrigin(0.5);
          const qty = this.add.text(x+15, y+15, `${item.quantity}`, { fontFamily: '"Inter"', fontSize: '10px', color: '#fff' }).setOrigin(1);
          
          slot.setInteractive({ useHandCursor: true });
          
          // Tooltip
          let actionLabel = data.name;
          if (data.type === 'equipment') actionLabel += '\n(Click to Equip)';
          if (data.type === 'consumable') actionLabel += '\n(Click to Consume)';
          
          const tooltip = this.add.text(x, y - 40, actionLabel, { 
              fontFamily: '"Inter"', fontSize: '10px', color: '#fff', backgroundColor: '#000', padding: { x: 4, y: 2 }, align: 'center'
          }).setOrigin(0.5).setAlpha(0).setDepth(200);

          slot.on('pointerover', () => tooltip.setAlpha(1));
          slot.on('pointerout', () => tooltip.setAlpha(0));
          
          slot.on('pointerdown', () => {
              if (data.type === 'equipment') {
                  // Only 1 gear can be equipped in this simple system for now, or we can just push it
                  // To simplify: clear all gear and equip this one
                  gameStore.getState().playerData.equippedGear = []; 
                  gameStore.equipGear(item.itemId);
                  this.showOverlay('inventory'); // refresh
              } else if (data.type === 'consumable') {
                  if (gameStore.consumeItem(item.itemId)) {
                      this.showOverlay('inventory'); // refresh
                  }
              }
          });

          this.uiContainer.add([slot, icon, qty, tooltip]);

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
          this.uiContainer.add(this.add.text(x, y - 10, data.name, { fontFamily: '"Inter"', fontSize: '12px', color: '#f39c12', fontStyle: 'bold' }).setOrigin(0.5));
          
          // Progress bar
          this.uiContainer.add(this.add.rectangle(x, y + 10, 100, 10, 0x2a1a0a).setOrigin(0.5));
          if (level > 0) {
             this.uiContainer.add(this.add.rectangle(x - 50, y + 10, 20 * level, 10, 0x00cec9).setOrigin(0, 0.5));
          }
          this.uiContainer.add(this.add.text(x, y + 30, `Lvl ${level}/${data.maxLevel}`, { fontFamily: '"Inter"', fontSize: '10px', color: '#fff' }).setOrigin(0.5));

          x += 300;
          if (x > 150) { x = -150; y += 120; }
      }
  }

  private renderChemDex() {
      const items = this.cache.json.get('items') as Record<string, ItemData>;
      const unlocked = gameStore.getState().playerData.unlockedChemDex;

      let x = -200, y = -100;
      
      if (unlocked.length === 0) {
          this.uiContainer.add(this.add.text(0, 0, 'No molecules discovered yet.\nGo synthesize some in the Lab!', { fontFamily: '"Inter"', color: '#636e72', align: 'center' }).setOrigin(0.5));
          return;
      }

      for (const symbol of unlocked) {
          // Find item data
          let itemData: ItemData | null = null;
          for (const key in items) {
              if (items[key].symbol === symbol && items[key].type === 'molecule') {
                  itemData = items[key];
                  break;
              }
          }
          if (!itemData) continue;

          const card = this.add.rectangle(x, y, 160, 100, 0x1a0e00, 0.85).setStrokeStyle(1, 0xf39c12);
          const icon = this.add.text(x - 50, y - 10, itemData.symbol, { fontFamily: '"Inter"', fontSize: '24px', fontStyle: 'bold', color: itemData.color }).setOrigin(0.5);
          const name = this.add.text(x + 20, y - 20, itemData.name, { fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold', wordWrap: { width: 100 } }).setOrigin(0.5);
          
          const descStr = itemData.description || 'A fascinating molecule.';
          const desc = this.add.text(x + 20, y + 10, descStr, { fontFamily: '"Inter"', fontSize: '9px', color: '#dfe6e9', wordWrap: { width: 90 } }).setOrigin(0.5);

          this.uiContainer.add([card, icon, name, desc]);

          x += 180;
          if (x > 200) { x = -200; y += 120; }
      }
  }

  private renderMap() {
      const gameScene = this.scene.get('GameScene') as any;
      if (!gameScene.player || !gameScene.mapData) return;

      const mapData = gameScene.mapData as MapData;

      const mapW = mapData.width;
      const mapH = mapData.height;
      const tilePx = 14;
      const totalPxW = mapW * tilePx;
      const totalPxH = mapH * tilePx;

      const container = this.uiContainer;
      const panelBg = container.getAt(0) as Phaser.GameObjects.Image;
      const cx = -panelBg.displayWidth / 2 + 20;
      const cy = -panelBg.displayHeight / 2 + 20;
      const ox = cx + (panelBg.displayWidth - 40 - totalPxW) / 2;
      const oy = cy + 50;

      const g = this.add.graphics().setAlpha(0.9);
      container.add(g);

      const ts = mapData.tileSize;

      for (let y = 0; y < mapH; y++) {
        for (let x = 0; x < mapW; x++) {
          const val = mapData.ground[y][x];
          const rx = ox + x * tilePx;
          const ry = oy + y * tilePx;

          if (val === 0 || val === 5 || val === 6) {
            g.fillStyle(0x4a9e3a, 0.6);
            g.fillRect(rx, ry, tilePx - 1, tilePx - 1);
          } else if (val === 1) {
            g.fillStyle(0x3d2b1f, 0.9);
            g.fillRect(rx, ry, tilePx - 1, tilePx - 1);
          }
        }
      }

      const buildingColors: Record<string, number> = {
        lab: 0x8B4513,
        library: 0x4a6741,
        shop: 0x6B4226,
      };
      for (const b of mapData.buildings) {
        const col = buildingColors[b.type] || 0x555555;
        for (const [bx, by] of b.tiles) {
          g.fillStyle(col, 0.85);
          g.fillRect(ox + bx * tilePx, oy + by * tilePx, tilePx - 1, tilePx - 1);
        }
        g.fillStyle(0xffffff, 0.95);
        const label = this.add.text(ox + b.tileX * tilePx + tilePx / 2, oy + b.tileY * tilePx - 4, b.name, {
          fontFamily: '"Inter"', fontSize: '8px', color: '#ffffff', backgroundColor: '#000000aa',
          padding: { x: 2, y: 1 },
        }).setOrigin(0.5, 1);
        container.add(label);
      }

      if (mapData.portals && mapData.portals.length > 0) {
        for (const portal of mapData.portals) {
          g.fillStyle(0xf39c12, 1);
          g.fillRect(ox + portal.tileX * tilePx - 1, oy + portal.tileY * tilePx - 1, tilePx + 1, tilePx + 1);
        }
      }

      const px = Math.floor(gameScene.player.x / ts);
      const py = Math.floor(gameScene.player.y / ts);
      g.fillStyle(0x00b894, 1);
      g.fillCircle(ox + px * tilePx + tilePx / 2, oy + py * tilePx + tilePx / 2, 4);

      const legendY = oy + mapH * tilePx + 14;
      container.add(this.add.text(ox, legendY, '■ Wall  ■ Building  ★ Portal  ● You', {
        fontFamily: '"Inter"', fontSize: '9px', color: '#7a6a4a',
      }));
  }

  private showNotification(data: { title: string, message: string, icon: string }) {
      const { width } = this.cameras.main;
      const c = this.add.container(width / 2, -50);
      
      const bg = this.add.rectangle(0, 0, 300, 60, 0x1a0e00, 0.9).setStrokeStyle(2, 0xf39c12).setOrigin(0.5);
      const icon = this.add.text(-120, 0, data.icon, { fontSize: '24px' }).setOrigin(0.5);
      const title = this.add.text(-80, -15, data.title, { fontFamily: '"Inter"', fontSize: '12px', color: '#f39c12', fontStyle: 'bold' });
      const msg = this.add.text(-80, 5, data.message, { fontFamily: '"Inter"', fontSize: '12px', color: '#dfe6e9' });

      c.add([bg, icon, title, msg]);

      this.tweens.add({ targets: c, y: 50, duration: 400, ease: 'Back.easeOut' });
      this.time.delayedCall(3000, () => {
          this.tweens.add({ targets: c, y: -50, duration: 300, ease: 'Power2', onComplete: () => c.destroy() });
      });
  }
}
