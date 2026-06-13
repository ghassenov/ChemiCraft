import Phaser from 'phaser';
import { SceneTransition } from '../systems/SceneTransition';
import { CraftingSystem } from '../systems/CraftingSystem';
import { gameStore } from '../../store/gameStore';
import { RecipeData, ItemData, GameEvents } from '../data/types';

export class LaboratoryScene extends Phaser.Scene {
  private craftingSystem!: CraftingSystem;
  private inputSlots: (Phaser.GameObjects.Sprite | null)[] = [null, null, null, null, null];
  private selectedReagents: string[] = [];

  private chamberGroup!: Phaser.GameObjects.Group;
  private shelfGroup!: Phaser.GameObjects.Group;
  private explanationText!: Phaser.GameObjects.Text;
  private resultIcon!: Phaser.GameObjects.Text;
  private flameGfx!: Phaser.GameObjects.Graphics;
  private liquidGfx!: Phaser.GameObjects.Graphics;
  private bubbleTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'LaboratoryScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const { width, height } = this.cameras.main;

    const recipes = this.cache.json.get('recipes') as RecipeData[];
    const items = this.cache.json.get('items') as Record<string, ItemData>;
    this.craftingSystem = new CraftingSystem(recipes);

    this.drawBackground(width, height);
    this.drawStationaryDecor(width, height);

    this.add.text(width / 2, 30, 'LABORATORY', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: '#c8b8e8',
    }).setOrigin(0.5);

    this.add.text(110, 85, 'REAGENTS', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#bcc6db', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, 85, 'REACTION CHAMBER', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#bcc6db', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.shelfGroup = this.add.group();
    this.renderShelf(items);

    this.resultIcon = this.add.text(width / 2, height / 2 - 18, '', {
      fontFamily: '"Inter"', fontSize: '36px', color: '#00b894', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.chamberGroup = this.add.group();

    this.flameGfx = this.add.graphics();
    this.liquidGfx = this.add.graphics();

    const cx = width / 2;
    const cy = height / 2 - 10;

    const clearBg = this.add.rectangle(cx - 80, cy + 155, 110, 34, 0x2d3436, 0.85)
      .setStrokeStyle(1, 0xff7675, 0.4).setInteractive({ useHandCursor: true });
    const clearTxt = this.add.text(cx - 80, cy + 155, 'CLEAR', {
      fontFamily: '"Inter"', fontSize: '13px', color: '#ff7675', fontStyle: 'bold',
    }).setOrigin(0.5);
    clearBg.on('pointerdown', () => this.clearChamber());
    clearTxt.on('pointerdown', () => this.clearChamber());

    const craftBg = this.add.rectangle(cx + 80, cy + 155, 110, 34, 0x6c5ce7, 0.9)
      .setStrokeStyle(2, 0x8b7bf7).setInteractive({ useHandCursor: true });
    const craftTxt = this.add.text(cx + 80, cy + 155, 'CRAFT', {
      fontFamily: '"Inter"', fontSize: '14px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    craftBg.on('pointerdown', () => this.attemptCraft(items));
    craftTxt.on('pointerdown', () => this.attemptCraft(items));

    this.add.text(700, 85, 'OBSERVATION', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#bcc6db', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.explanationText = this.add.text(700, 130, 'Add reagents to the reaction chamber and press Craft.', {
      fontFamily: '"Inter"', fontSize: '13px', color: '#c8d6e5',
      wordWrap: { width: 175 }, lineSpacing: 5,
    }).setOrigin(0.5, 0).setAlpha(0.9);

    const exitBg = this.add.rectangle(50, 30, 80, 26, 0x1e1e3f, 0.7)
      .setStrokeStyle(1, 0x6c5ce7, 0.35).setInteractive({ useHandCursor: true });
    const exitTxt = this.add.text(50, 30, 'EXIT', {
      fontFamily: '"Inter"', fontSize: '11px', color: '#dfe6e9', fontStyle: 'bold',
    }).setOrigin(0.5);
    exitBg.on('pointerdown', () => SceneTransition.fadeOutIn(this, 'GameScene'));
    exitTxt.on('pointerdown', () => SceneTransition.fadeOutIn(this, 'GameScene'));

    this.bubbleTimer = this.time.addEvent({
      delay: 2800, loop: true,
      callback: () => this.emitSteam(cx, cy - 55),
    });
  }

  private drawBackground(w: number, h: number) {
    const g = this.add.graphics();

    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(0, 0, w, h);

    g.fillStyle(0x222244, 1);
    g.fillRect(0, 0, w, h - 100);

    g.fillStyle(0x2a2a3e, 0.4);
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 12; col++) {
        if ((row + col) % 2 === 0) {
          g.fillRect(col * 72, row * 64, 72, 64);
        }
      }
    }

    g.fillStyle(0x3d3d56, 0.3);
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, h - 100 - 4, w, 4);

    g.fillStyle(0x8B7355, 0.5);
    g.fillRect(0, h - 100, w, 100);

    g.fillStyle(0x9B8365, 0.3);
    for (let col = 0; col < 14; col++) {
      for (let row = 0; row < 4; row++) {
        if ((col + row) % 2 === 0) {
          g.fillRect(col * 60, h - 100 + row * 28, 60, 28);
        }
      }
    }

    g.fillStyle(0x5c3a1e, 0.6);
    g.fillRect(0, h - 100, w, 3);

    g.fillStyle(0x2a1a0e, 0.5);
    g.fillRect(0, h - 100 + 6, w, 2);
  }

  private drawStationaryDecor(w: number, h: number) {
    const d = this.add.graphics();
    const cy = h / 2 - 10;

    d.fillStyle(0x3d2b1f, 0.8);
    d.fillRoundedRect(5, 95, 200, h - 210, 8);
    d.lineStyle(2, 0x5c3a1e, 0.6);
    d.strokeRoundedRect(5, 95, 200, h - 210, 8);

    d.fillStyle(0x4a3525, 0.5);
    for (let sh = 0; sh < 4; sh++) {
      d.fillRect(15, 130 + sh * 100, 180, 4);
    }

    d.fillStyle(0x1a1a2e, 0.85);
    d.fillRoundedRect(220, 95, 360, h - 210, 12);
    d.lineStyle(2, 0x4a5a6a, 0.4);
    d.strokeRoundedRect(220, 95, 360, h - 210, 12);

    d.fillStyle(0x2d2d3f, 0.6);
    d.fillRect(230, 105, 340, 8);

    d.fillStyle(0x4a5a6a, 0.15);
    d.fillCircle(w / 2, cy, 80);
    d.fillStyle(0x5a6a7a, 0.1);
    d.fillCircle(w / 2, cy, 65);
    d.lineStyle(2, 0x6c7c8c, 0.2);
    d.strokeCircle(w / 2, cy, 70);

    d.fillStyle(0x3d2b1f, 0.8);
    d.fillRoundedRect(595, 95, 200, h - 210, 8);
    d.lineStyle(2, 0x5c3a1e, 0.6);
    d.strokeRoundedRect(595, 95, 200, h - 210, 8);

    d.fillStyle(0x4a6a3a, 0.2);
    d.fillRect(605, 110, 180, h - 260);

    d.fillStyle(0x5c3a1e, 0.3);
    d.fillRect(595, h - 115, 200, 4);

    d.fillStyle(0x4a5a6a, 0.2);
    d.fillRoundedRect(w / 2 - 18, cy + 60, 36, 24, 4);
    d.fillStyle(0xff6b35, 0.15);
    d.fillRoundedRect(w / 2 - 12, cy + 64, 24, 16, 3);

    d.fillStyle(0x6c5ce7, 0.08);
    for (let i = 0; i < 3; i++) {
      d.fillCircle(120 + i * 35, 540, 6);
    }

    this.drawPipes(d, w, h);
  }

  private drawPipes(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    g.lineStyle(4, 0x5a6a7a, 0.3);
    g.lineBetween(220, 95, 220, h - 115);
    g.lineBetween(580, 95, 580, h - 115);

    g.lineStyle(4, 0x6a7a8a, 0.2);
    g.lineBetween(220, 95, w / 2 - 80, 120);
    g.lineBetween(580, 95, w / 2 + 80, 120);

    g.lineStyle(3, 0x6a7a8a, 0.2);
    g.lineBetween(w / 2 - 80, 120, w / 2 - 80, 180);
    g.lineBetween(w / 2 + 80, 120, w / 2 + 80, 180);

    g.lineStyle(4, 0x7a8a9a, 0.15);
    g.lineBetween(220, h - 115, w / 2, h - 115);
    g.lineBetween(580, h - 115, w / 2, h - 115);

    g.fillStyle(0x6a7a8a, 0.2);
    g.fillCircle(w / 2 - 80, 180, 4);
    g.fillCircle(w / 2 + 80, 180, 4);
    g.fillCircle(220, 95, 4);
    g.fillCircle(580, 95, 4);
  }

  private renderShelf(items: Record<string, ItemData>) {
    this.shelfGroup.clear(true, true);

    const inv = gameStore.getInventory();
    const recipes = this.cache.json.get('recipes') as RecipeData[];
    const recipeInputSymbols = new Set<string>();
    for (const r of recipes) {
      for (const input of r.inputs) recipeInputSymbols.add(input);
    }
    const symbolToId: Record<string, string> = {};
    for (const [id, data] of Object.entries(items)) symbolToId[data.symbol] = id;
    const usableMoleculeIds = new Set<string>();
    for (const sym of recipeInputSymbols) {
      const id = symbolToId[sym];
      if (id && items[id]?.type === 'molecule') usableMoleculeIds.add(id);
    }

    let idx = 0;
    for (const invItem of inv) {
      const itemData = items[invItem.itemId];
      if (itemData && (itemData.type === 'reagent' || usableMoleculeIds.has(itemData.id))) {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const bx = 30 + col * 85;
        const by = 145 + row * 95;

        const card = this.add.container(bx + 40, by);

        const color = Phaser.Display.Color.HexStringToColor(itemData.color).color;

        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a3f, 0.9);
        bg.fillRoundedRect(-35, -30, 70, 75, 6);
        bg.lineStyle(1, color, 0.5);
        bg.strokeRoundedRect(-35, -30, 70, 75, 6);

        bg.fillStyle(color, 0.15);
        bg.fillCircle(0, -8, 18);

        bg.fillStyle(color, 0.25);
        bg.fillRoundedRect(-10, -22, 20, 28, 4);

        bg.fillStyle(0xffffff, 0.1);
        bg.fillRect(-6, -20, 4, 20);

        const txt = this.add.text(0, -8, itemData.symbol, {
          fontFamily: '"Inter"', fontSize: '18px', color: itemData.color, fontStyle: 'bold',
        }).setOrigin(0.5);

        const countInChamber = this.selectedReagents.filter(s => s === itemData.symbol).length;
        const qtyText = `${invItem.quantity - countInChamber}`;
        const qty = this.add.text(0, 22, qtyText, {
          fontFamily: '"Inter"', fontSize: '14px', color: '#bcc6db',
        }).setOrigin(0.5);

        card.add([bg, txt, qty]);
        card.setSize(70, 75);
        card.setInteractive({ useHandCursor: true });

        card.on('pointerover', () => {
          this.tweens.add({ targets: card, scaleX: 1.08, scaleY: 1.08, duration: 80 });
        });
        card.on('pointerout', () => {
          this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 80 });
        });

        card.on('pointerdown', () => {
          const countInChamber = this.selectedReagents.filter(s => s === itemData.symbol).length;
          if (this.selectedReagents.length < 5 && gameStore.hasItem(itemData.id, countInChamber + 1)) {
            this.addToChamber(itemData);
            this.renderShelf(items);
          } else if (!gameStore.hasItem(itemData.id, countInChamber + 1)) {
            this.explanationText.setText('Not enough reagents!');
          } else {
            this.explanationText.setText('Chamber is full! (Max 5 reagents)');
          }
        });

        this.shelfGroup.add(card);
        idx++;
      }
    }
  }

  private refreshChamber(animateLast = false) {
    this.chamberGroup.clear(true, true);
    
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2 - 10;
    const r = 55;
    
    const items = this.cache.json.get('items') as Record<string, ItemData>;
    const symbolToItem: Record<string, ItemData> = {};
    for (const data of Object.values(items)) {
        symbolToItem[data.symbol] = data;
    }

    for (let i = 0; i < this.selectedReagents.length; i++) {
        const sym = this.selectedReagents[i];
        const itemData = symbolToItem[sym];
        
        const angle = (i * (Math.PI * 2) / 5) - Math.PI / 2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;

        const g = this.add.graphics();
        g.fillStyle(0x1a1a3e, 0.9);
        g.fillCircle(0, 0, 18);
        g.lineStyle(2, Phaser.Display.Color.HexStringToColor(itemData.color).color, 0.6);
        g.strokeCircle(0, 0, 18);

        const txt = this.add.text(0, 0, itemData.symbol, {
          fontFamily: '"Inter"', fontSize: '20px', color: itemData.color, fontStyle: 'bold',
        }).setOrigin(0.5);

        const container = this.add.container(px, py, [g, txt]);
        
        // Make interactive
        container.setInteractive(new Phaser.Geom.Circle(0, 0, 18), Phaser.Geom.Circle.Contains);
        // Workaround for useHandCursor on custom hit area
        container.input!.cursor = 'pointer';
        
        container.on('pointerdown', () => {
            this.selectedReagents.splice(i, 1);
            this.refreshChamber(false);
            this.renderShelf(items);
        });
        
        this.chamberGroup.add(container);

        if (animateLast && i === this.selectedReagents.length - 1) {
            container.setScale(0);
            this.tweens.add({
              targets: container, scale: 1, duration: 250, ease: 'Back.easeOut',
            });
        }
    }
    
    this.showFlame(this.selectedReagents.length > 0);
    if (this.selectedReagents.length === 0) {
        this.resultIcon.setText('');
        this.explanationText.setText('Chamber cleared.');
        this.liquidGfx.clear();
    } else {
        this.resultIcon.setText('');
        this.explanationText.setText('Ready to react...');
    }
  }

  private addToChamber(itemData: ItemData) {
    this.selectedReagents.push(itemData.symbol);
    this.refreshChamber(true);
  }

  private showFlame(visible: boolean) {
    this.flameGfx.clear();
    if (!visible) return;

    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2 - 10;

    const time = this.time.now;
    const flicker = Math.sin(time * 0.02) * 2 + Math.sin(time * 0.05) * 1;

    this.flameGfx.fillStyle(0xff6b35, 0.4);
    this.flameGfx.fillCircle(cx, cy + 60 + flicker, 10 + flicker * 0.3);

    this.flameGfx.fillStyle(0xffa502, 0.3);
    this.flameGfx.fillCircle(cx, cy + 60, 7 + flicker * 0.2);

    this.flameGfx.fillStyle(0xffee58, 0.2);
    this.flameGfx.fillCircle(cx, cy + 60 - 1, 4);

    if (visible && this.selectedReagents.length > 0) {
      this.liquidGfx.clear();
      this.liquidGfx.fillStyle(0x00b894, 0.08);
      this.liquidGfx.fillCircle(cx, cy, 40);
    }

    this.time.delayedCall(80, () => {
      if (this.selectedReagents.length > 0) this.showFlame(true);
      else this.flameGfx.clear();
    });
  }

  private emitSteam(cx: number, cy: number) {
    if (this.selectedReagents.length === 0) return;
    if (!this.textures.exists('steam_particle')) {
      const sg = this.add.graphics();
      sg.fillStyle(0xffffff, 0.35);
      sg.fillCircle(4, 4, 4);
      sg.generateTexture('steam_particle', 8, 8);
      sg.destroy();
    }

    const p = this.add.image(
      cx + Phaser.Math.Between(-20, 20),
      cy + Phaser.Math.Between(-10, 10),
      'steam_particle'
    ).setAlpha(0.4).setScale(0.5 + Math.random() * 0.5);

    this.tweens.add({
      targets: p,
      y: p.y - Phaser.Math.Between(30, 60),
      alpha: 0,
      scale: p.scaleX * 2,
      duration: 1200 + Math.random() * 800,
      ease: 'Power2',
      onComplete: () => p.destroy(),
    });
  }

  private clearChamber() {
    this.selectedReagents = [];
    this.chamberGroup.clear(true, true);
    this.resultIcon.setText('');
    this.flameGfx.clear();
    this.liquidGfx.clear();
    this.explanationText.setText('Chamber cleared.');
    
    // Re-render shelf to update quantities
    const items = this.cache.json.get('items') as Record<string, ItemData>;
    this.renderShelf(items);
  }

  private attemptCraft(items: Record<string, ItemData>) {
    if (this.selectedReagents.length === 0) return;

    const result = this.craftingSystem.craft(this.selectedReagents);

    if (result.success && result.result) {
      const outSymbol = result.result.output;
      let craftedItemId = '';
      for (const [id, data] of Object.entries(items)) {
        if (data.type === 'molecule' && data.symbol === outSymbol) {
          craftedItemId = id;
          break;
        }
      }

      if (craftedItemId) {
        const symbolToId: Record<string, string> = {};
        for (const [id, data] of Object.entries(items)) symbolToId[data.symbol] = id;

        for (const sym of this.selectedReagents) {
          const id = symbolToId[sym];
          if (id) gameStore.removeFromInventory(id, 1);
        }

        gameStore.addToInventory(craftedItemId, 1);

        this.sound.play('sfx_craft', { volume: 0.6 });
        this.cameras.main.flash(200, 100, 255, 200);
        this.resultIcon.setText(result.result.output).setColor('#00b894');
        this.explanationText.setText(`Success! Crafted ${result.result.outputName}.\n\n${result.result.explanation}`);
        this.chamberGroup.clear(true, true);
        this.selectedReagents = [];
        this.flameGfx.clear();
        this.liquidGfx.clear();

        this.renderShelf(items);

        this.events.emit(GameEvents.ItemCrafted, result.result.output);
      }
    } else {
      this.cameras.main.shake(200, 0.01);
      this.explanationText.setText(result.error || 'Reaction failed.');
      this.resultIcon.setText('X').setColor('#ff7675');
    }
  }
}
