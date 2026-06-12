import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DialogueBox } from '../ui/DialogueBox';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';
import { openShop } from '../overlays/ShopOverlay';
import { addHelpButton } from '../overlays/HelpOverlay';
import { ItemData } from '../data/types';

export class ShopInteriorScene extends Phaser.Scene {
  private player!: Player;
  private sal!: NPC;
  private dialogueBox!: DialogueBox;
  private walls!: Phaser.Physics.Arcade.StaticGroup;

  private crateSearched = false;
  private exiting = false;
  private infoText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'ShopInteriorScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.crateSearched = false;
    this.exiting = false;

    this.drawRoom();
    this.walls = this.physics.add.staticGroup();
    this.addCollisionWalls();

    this.player = new Player(this, 320, 480);
    this.physics.world.setBounds(20, 20, 600, 600);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);

    this.sal = new NPC(this, 320, 190, 'shopkeeper_sal', 'Sal', 'npc_shopkeeper_sal', null);
    this.physics.add.collider(this.player, this.sal);

    this.dialogueBox = new DialogueBox(this);
    this.player.onInteract(() => this.handleInteraction());

    this.add.text(320, 55, "SAL'S SCIENCE SUPPLY", {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#f39c12',
    }).setOrigin(0.5);

    const coinG = this.add.graphics().setDepth(5);
    coinG.fillStyle(0xf39c12, 0.1);
    coinG.fillCircle(580, 55, 12);

    const coinTxt = this.add.text(580, 55, `${gameStore.getState().playerData.coins}`, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#fdcb6e',
    }).setOrigin(0.5).setDepth(5);

    const unsub = gameStore.subscribe(() => {
      coinTxt.setText(`${gameStore.getState().playerData.coins}`);
    });
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => unsub());

    this.infoText = this.add.text(320, 600, '', {
      fontFamily: '"Inter"', fontSize: '11px', color: '#fdcb6e',
      align: 'center', wordWrap: { width: 300 },
    }).setOrigin(0.5).setDepth(15);

    addHelpButton(this, [
      'Browse Sal\'s inventory\nto buy reagents.',
      'Search the crate near the exit\nfor hidden items.',
      'Exit through the corridor.',
    ]);
  }

  update() {
    this.player.update();

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.sal.x, this.sal.y);
    if (dist < 40) this.sal.showPrompt();
    else this.sal.hidePrompt();
    this.sal.updatePromptPosition();

    if (this.isInZone(this.player.x, this.player.y, 180, 545, 80, 50)) {
      if (!this.crateSearched && this.infoText) {
        this.infoText.setText('Press E to search the crate');
      }
    } else {
      if (this.infoText && this.infoText.text !== '') {
        this.infoText.setText('');
      }
    }

    if (this.player.y > 580 && !this.exiting) {
      this.exiting = true;
      if (!this.crateSearched) {
        this.searchCrate();
      }
      this.time.delayedCall(500, () => {
        SceneTransition.fadeOutIn(this, 'GameScene');
      });
    }
  }

  private drawRoom() {
    const g = this.add.graphics();

    g.fillStyle(0x1a0e00, 1);
    g.fillRect(0, 0, 640, 640);

    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(20, 20, 600, 520);

    g.fillStyle(0x5a3a1a, 0.2);
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 15; col++) {
        if ((row + col) % 2 === 0) {
          g.fillRect(22 + col * 40, 22 + row * 40, 38, 38);
        }
      }
    }

    g.fillStyle(0x2a1a0a, 0.5);
    g.fillRect(20, 20, 600, 4);
    g.fillRect(20, 20, 4, 520);
    g.fillRect(616, 20, 4, 520);
    g.fillRect(20, 536, 600, 4);

    const bc = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c];
    g.fillStyle(0x3d2515, 0.7);
    g.fillRect(30, 80, 100, 200);
    g.fillRect(510, 80, 100, 200);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const bx = 35 + col * 18;
        const by = 90 + row * 55;
        const colorIdx = (row * 5 + col) % bc.length;
        g.fillStyle(bc[colorIdx], 0.25);
        g.fillRoundedRect(bx, by, 14, 22, 3);
        g.fillStyle(0xffffff, 0.06);
        g.fillRect(bx + 3, by + 3, 3, 14);
        g.fillStyle(bc[colorIdx], 0.15);
        g.fillCircle(bx + 7, by - 2, 3);
      }
    }

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const bx = 515 + col * 18;
        const by = 90 + row * 55;
        const colorIdx = (row * 5 + col + 2) % bc.length;
        g.fillStyle(bc[colorIdx], 0.25);
        g.fillRoundedRect(bx, by, 14, 22, 3);
        g.fillStyle(0xffffff, 0.06);
        g.fillRect(bx + 3, by + 3, 3, 14);
        g.fillStyle(bc[colorIdx], 0.15);
        g.fillCircle(bx + 7, by - 2, 3);
      }
    }

    g.fillStyle(0x3d2515, 0.6);
    g.fillRect(30, 285, 100, 4);
    g.fillRect(510, 285, 100, 4);

    g.fillStyle(0x5c3a1e, 0.8);
    g.fillRect(220, 290, 200, 30);
    g.lineStyle(2, 0x8B6914, 0.4);
    g.strokeRect(220, 290, 200, 30);

    g.fillStyle(0x6c4a2e, 0.3);
    g.fillRect(224, 294, 192, 22);

    g.fillStyle(0xf39c12, 0.08);
    g.fillCircle(320, 305, 8);

    g.lineStyle(1, 0x8B6914, 0.2);
    g.lineBetween(30, 380, 610, 380);

    g.fillStyle(0x3a2a1a, 0.4);
    g.fillRect(120, 320, 400, 50);
    g.lineStyle(1, 0x8B6914, 0.2);
    g.strokeRect(120, 320, 400, 50);

    for (let i = 0; i < 3; i++) {
      const lx = 100 + i * 220;
      g.lineStyle(1, 0x5a3a1a, 0.5);
      g.lineBetween(lx, 62, lx, 82);
      g.fillStyle(0x2a1a0a, 0.6);
      g.fillRect(lx - 5, 70, 10, 14);
      g.fillStyle(0xf39c12, 0.1);
      g.fillRect(lx - 3, 72, 6, 10);
      g.fillStyle(0xffeaa7, 0.04);
      g.fillCircle(lx, 76, 8);
    }

    this.drawDecor(g);
    this.drawCorridor(g);
  }

  private drawDecor(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x5c3a1e, 0.6);
    g.fillRect(200, 290, 30, 30);
    g.fillStyle(0x8B6914, 0.3);
    g.fillRect(204, 294, 22, 4);
    g.fillRect(204, 302, 22, 4);
    g.fillRect(204, 310, 22, 4);

    g.fillStyle(0x7f8c8d, 0.2);
    g.fillCircle(215, 280, 2);
    g.fillCircle(215, 280, 4);
    g.fillRect(212, 272, 6, 8);

    g.fillStyle(0x8B6914, 0.4);
    g.fillRect(350, 290, 40, 30);
    g.fillStyle(0x5c3a1e, 0.3);
    g.fillRect(354, 294, 32, 4);
    g.fillRect(354, 302, 32, 4);
    g.fillRect(354, 310, 32, 4);

    g.fillStyle(0xf39c12, 0.08);
    g.fillCircle(370, 280, 3);

    g.fillStyle(0x3a2a1a, 0.5);
    g.fillRect(400, 300, 30, 30);
    g.fillStyle(0x5a3a1a, 0.4);
    g.fillRect(404, 304, 22, 4);
    g.fillRect(404, 312, 22, 4);
    g.fillRect(404, 320, 22, 4);

    g.fillStyle(0x6a4a2a, 0.3);
    g.fillRect(100, 340, 24, 30);
    g.fillRect(516, 340, 24, 30);
    g.fillRect(120, 340, 30, 24);
    g.fillRect(490, 340, 30, 24);

    g.fillStyle(0x8B6914, 0.15);
    g.fillRect(100, 340, 4, 30);
    g.fillRect(120, 340, 30, 4);
    g.fillRect(516, 340, 4, 30);
    g.fillRect(490, 340, 30, 4);

    g.fillStyle(0xf39c12, 0.04);
    g.fillCircle(100, 62, 6);
    g.fillCircle(100, 62, 10);
    g.fillCircle(180, 62, 6);
    g.fillCircle(180, 62, 10);
    g.fillCircle(460, 62, 6);
    g.fillCircle(460, 62, 10);
    g.fillCircle(540, 62, 6);
    g.fillCircle(540, 62, 10);

    const wareColors = [0x3498db, 0xe74c3c, 0x2ecc71, 0x9b59b6];
    for (let i = 0; i < 6; i++) {
      const wx = 80 + i * 90;
      const wy = 60 + (i % 2) * 10;
      g.fillStyle(wareColors[i % wareColors.length], 0.12);
      g.fillRect(wx, wy, 8, 14);
      g.lineStyle(1, 0x5a3a1a, 0.3);
      g.lineBetween(wx + 4, wy, wx + 4, wy - 4);
    }
  }

  private drawCorridor(g: Phaser.GameObjects.Graphics) {
    const cy = 540;

    g.fillStyle(0x1a0e00, 1);
    g.fillRect(20, cy, 600, 100);

    g.fillStyle(0x2a1a0a, 0.6);
    g.fillRect(20, cy, 600, 100);

    g.fillStyle(0x2a1a0a, 0.5);
    g.fillRect(20, cy, 600, 4);
    g.fillRect(20, cy, 4, 100);
    g.fillRect(616, cy, 4, 100);
    g.fillRect(20, cy + 96, 600, 4);

    g.fillStyle(0x5c3a1e, 0.5);
    g.fillRect(30, cy + 8, 60, 80);
    g.fillRect(550, cy + 8, 60, 80);
    g.fillRect(90, cy + 16, 50, 72);
    g.fillRect(500, cy + 16, 50, 72);

    g.lineStyle(1, 0x8B6914, 0.2);
    g.strokeRect(30, cy + 8, 60, 80);
    g.strokeRect(550, cy + 8, 60, 80);
    g.strokeRect(90, cy + 16, 50, 72);
    g.strokeRect(500, cy + 16, 50, 72);

    g.fillStyle(0x8B6914, 0.15);
    for (let i = 0; i < 3; i++) {
      g.fillRect(36, cy + 14 + i * 24, 48, 4);
    }
    for (let i = 0; i < 3; i++) {
      g.fillRect(556, cy + 14 + i * 24, 48, 4);
    }

    g.fillStyle(0x5c3a1e, 0.6);
    g.fillRect(180, cy + 12, 80, 76);
    g.lineStyle(1, 0x8B6914, 0.3);
    g.strokeRect(180, cy + 12, 80, 76);

    g.fillStyle(0x8B6914, 0.2);
    g.lineBetween(185, cy + 24, 255, cy + 24);
    g.lineBetween(185, cy + 48, 255, cy + 48);
    g.lineBetween(185, cy + 72, 255, cy + 72);

    g.fillStyle(0xf39c12, 0.06);
    g.fillCircle(220, cy + 6, 6);
    g.fillCircle(220, cy + 6, 10);

    g.fillStyle(0x2a1a0a, 0.6);
    g.fillRect(280, cy + 12, 80, 76);
    g.lineStyle(1, 0x8B6914, 0.3);
    g.strokeRect(280, cy + 12, 80, 76);

    g.fillStyle(0x8B6914, 0.2);
    g.fillRect(284, cy + 16, 72, 64);

    g.fillStyle(0x5a3a1a, 0.3);
    g.fillRect(288, cy + 20, 64, 4);
    g.fillRect(288, cy + 36, 64, 4);
    g.fillRect(288, cy + 52, 64, 4);
    g.fillRect(288, cy + 68, 64, 4);

    g.fillStyle(0xf1c40f, 0.04);
    g.fillCircle(288, cy + 20, 2);
    g.fillCircle(352, cy + 36, 2);
    g.fillCircle(288, cy + 52, 2);
    g.fillCircle(352, cy + 68, 2);

    g.fillStyle(0x3d2b1f, 0.4);
    g.fillRect(280, cy + 80, 80, 14);
    g.fillStyle(0x8B6914, 0.2);
    g.fillRect(284, cy + 84, 72, 6);

    g.fillStyle(0x5a3a1a, 0.4);
    g.fillRect(380, cy + 12, 80, 76);
    g.lineStyle(1, 0x8B6914, 0.3);
    g.strokeRect(380, cy + 12, 80, 76);

    g.fillStyle(0x8B6914, 0.2);
    g.lineBetween(385, cy + 24, 455, cy + 24);
    g.lineBetween(385, cy + 48, 455, cy + 48);
    g.lineBetween(385, cy + 72, 455, cy + 72);
  }

  private addCollisionWalls() {
    const g = this.walls;
    g.create(20, 310, 'tile_wall')?.setVisible(false).setSize(10, 620);
    g.create(640, 310, 'tile_wall')?.setVisible(false).setSize(10, 620);
    g.create(320, 20, 'tile_wall')?.setVisible(false).setSize(640, 10);
    g.create(320, 615, 'tile_wall')?.setVisible(false).setSize(640, 10);

    g.create(80, 180, 'tile_wall')?.setVisible(false).setSize(110, 210);
    g.create(560, 180, 'tile_wall')?.setVisible(false).setSize(110, 210);
    g.create(320, 305, 'tile_wall')?.setVisible(false).setSize(210, 40);
    g.create(320, 355, 'tile_wall')?.setVisible(false).setSize(410, 60);
  }

  private handleInteraction() {
    const px = this.player.x;
    const py = this.player.y;

    if (this.isNear(px, py, this.sal.x, this.sal.y, 40)) {
      openShop(this);
      return;
    }

    if (this.isInZone(px, py, 180, 540, 80, 60)) {
      if (!this.crateSearched) {
        this.searchCrate();
      } else if (this.infoText) {
        this.infoText.setText('This crate is empty.');
      }
      return;
    }
  }

  private searchCrate() {
    this.crateSearched = true;
    const roll = Math.random();

    const items = this.cache.json.get('items') as Record<string, ItemData>;

    if (roll < 0.3) {
      const coins = 1 + Math.floor(Math.random() * 3);
      gameStore.addCoins(coins);
      this.sound.play('sfx_coin', { volume: 0.5 });
      this.cameras.main.flash(200, 243, 156, 18);
      if (this.infoText) {
        this.infoText.setText(`Found ${coins} coins in the crate!`);
      }
    } else if (roll < 0.5) {
      const reagents = Object.values(items).filter(i => i.type === 'reagent' && i.price && i.price > 0);
      if (reagents.length > 0) {
        const reagent = reagents[Math.floor(Math.random() * reagents.length)];
        gameStore.addToInventory(reagent.id, 1);
        this.cameras.main.flash(200, 100, 255, 200);
        if (this.infoText) {
          this.infoText.setText(`Found a ${reagent.name} in the crate!`);
        }
      } else if (this.infoText) {
        this.infoText.setText('The crate is empty.');
      }
    } else {
      if (this.infoText) {
        this.infoText.setText('The crate is empty.');
      }
    }
  }

  private isNear(x1: number, y1: number, x2: number, y2: number, dist: number): boolean {
    return Phaser.Math.Distance.Between(x1, y1, x2, y2) < dist;
  }

  private isInZone(px: number, py: number, zx: number, zy: number, zw: number, zh: number): boolean {
    return px >= zx && px <= zx + zw && py >= zy && py <= zy + zh;
  }
}
