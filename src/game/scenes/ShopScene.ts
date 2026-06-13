import Phaser from 'phaser';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';
import { MAP_SCENE_KEYS } from '../data/mapSceneKeys';
import { ItemData } from '../data/types';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const { width, height } = this.cameras.main;

    const items = this.cache.json.get('items') as Record<string, ItemData>;

    this.drawBackground(width, height);
    this.drawShelves(width, height);
    this.drawLanterns(width, height);
    this.drawShopkeeper(width, height);

    this.add.text(width / 2, 28, "SAL'S SCIENCE SUPPLY", {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#f39c12',
    }).setOrigin(0.5);

    const coinG = this.add.graphics();
    coinG.fillStyle(0xf39c12, 0.15);
    coinG.fillCircle(width - 60, 30, 14);

    const coinTxt = this.add.text(width - 60, 30, `${gameStore.getState().playerData.coins}`, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#fdcb6e',
    }).setOrigin(0.5);

    const unsub = gameStore.subscribe(() => {
      coinTxt.setText(`${gameStore.getState().playerData.coins}`);
    });
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => unsub());

    const exitBg = this.add.rectangle(50, 30, 80, 26, 0x1a0e00, 0.7)
      .setStrokeStyle(1, 0xf39c12, 0.35).setInteractive({ useHandCursor: true });
    const exitTxt = this.add.text(50, 30, 'EXIT', {
      fontFamily: '"Inter"', fontSize: '11px', color: '#dfe6e9', fontStyle: 'bold',
    }).setOrigin(0.5);
    const exitKey = MAP_SCENE_KEYS[gameStore.getCurrentMap()] || 'AtomMeadowsScene';
    exitBg.on('pointerdown', () => SceneTransition.fadeOutIn(this, exitKey));
    exitTxt.on('pointerdown', () => SceneTransition.fadeOutIn(this, exitKey));

    const shopItems = Object.values(items).filter(i => i.price && i.price > 0);

    let y = 180;
    for (const item of shopItems) {
      const row = this.add.container(0, y);

      const bg = this.add.graphics();
      bg.fillStyle(0x1a0e00, 0.85);
      bg.fillRoundedRect(30, -24, 450, 48, 6);
      bg.lineStyle(1, 0xf39c12, 0.3);
      bg.strokeRoundedRect(30, -24, 450, 48, 6);

      const iconBg = this.add.graphics();
      iconBg.fillStyle(Phaser.Display.Color.HexStringToColor(item.color).color, 0.15);
      iconBg.fillCircle(56, 0, 16);

      const icon = this.add.text(56, 0, item.symbol, {
        fontSize: '20px', fontStyle: 'bold',
      }).setOrigin(0.5);

      const name = this.add.text(88, -8, item.name, {
        fontFamily: '"Inter"', fontSize: '15px', color: item.color, fontStyle: 'bold',
      });

      const shortDesc = item.description.length > 35
        ? item.description.substring(0, 35) + '...'
        : item.description;
      const desc = this.add.text(88, 10, shortDesc, {
        fontFamily: '"Inter"', fontSize: '11px', color: '#7a6a4a',
      });

      const btnG = this.add.graphics();
      btnG.fillStyle(0xf39c12, 0.85);
      btnG.fillRoundedRect(360, -14, 100, 28, 6);
      btnG.lineStyle(1, 0xf5b042, 0.5);
      btnG.strokeRoundedRect(360, -14, 100, 28, 6);

      const btnTxt = this.add.text(410, 0, `${item.price}`, {
        fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5);

      const hitZone = this.add.zone(410, 0, 100, 28).setInteractive({ useHandCursor: true });

      hitZone.on('pointerover', () => {
        btnG.clear();
        btnG.fillStyle(0xf5b042, 0.9);
        btnG.fillRoundedRect(360, -14, 100, 28, 6);
        btnG.lineStyle(1, 0xf7c864, 0.6);
        btnG.strokeRoundedRect(360, -14, 100, 28, 6);
      });
      hitZone.on('pointerout', () => {
        btnG.clear();
        btnG.fillStyle(0xf39c12, 0.85);
        btnG.fillRoundedRect(360, -14, 100, 28, 6);
        btnG.lineStyle(1, 0xf5b042, 0.5);
        btnG.strokeRoundedRect(360, -14, 100, 28, 6);
      });

      hitZone.on('pointerdown', () => {
        if (gameStore.getState().playerData.coins >= item.price!) {
          gameStore.spendCoins(item.price!);
          gameStore.addToInventory(item.id, 1);

          this.sound.play('sfx_coin', { volume: 0.5 });
          this.cameras.main.flash(200, 243, 156, 18);

          btnTxt.setText('SOLD!');
          this.time.delayedCall(800, () => btnTxt.setText(`${item.price}`));
        } else {
          this.cameras.main.shake(200, 0.005);
        }
      });

      row.add([bg, iconBg, icon, name, desc, btnG, btnTxt, hitZone]);
      y += 60;
    }

    this.startLanternGlow(width, height);
    this.addShopAmbience(width, height);
  }

  private addShopAmbience(w: number, h: number) {
    // === Floating dust motes ===
    if (!this.textures.exists('dust_particle')) {
      const dg = this.add.graphics();
      dg.fillStyle(0xffeaa7, 0.3);
      dg.fillCircle(3, 3, 3);
      dg.generateTexture('dust_particle', 6, 6);
      dg.destroy();
    }
    this.add.particles(0, 0, 'dust_particle', {
      x: { min: 0, max: w },
      y: { min: 60, max: h - 80 },
      lifespan: 5000,
      speed: { min: 3, max: 10 },
      angle: { min: 230, max: 310 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.2, end: 0 },
      blendMode: 'ADD',
      frequency: 300,
    });

    // === Coin sparkle behind counter ===
    const sparkle = this.add.particles(w - 60, 30, 'glow_particle', {
      speed: { min: 5, max: 15 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 800,
      blendMode: 'ADD',
      tint: 0xf39c12,
      frequency: 400,
    });
    sparkle.setDepth(1);

    // === Welcome banner with typewriter effect ===
    const bannerG = this.add.graphics().setDepth(5);
    bannerG.fillStyle(0x2a1a0a, 0.8);
    bannerG.fillRoundedRect(w / 2 - 160, 54, 320, 24, 4);
    bannerG.lineStyle(1, 0xf39c12, 0.3);
    bannerG.strokeRoundedRect(w / 2 - 160, 54, 320, 24, 4);

    const welcomeMsg = 'Welcome, chemist! Browse my finest supplies...';
    const welcomeTxt = this.add.text(w / 2, 66, '', {
      fontFamily: '"Inter"', fontSize: '10px', color: '#ffeaa7', fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(6);

    let charIdx = 0;
    this.time.addEvent({
      delay: 40,
      repeat: welcomeMsg.length - 1,
      callback: () => {
        charIdx++;
        welcomeTxt.setText(welcomeMsg.substring(0, charIdx));
      },
    });
  }

  private drawBackground(w: number, h: number) {
    const g = this.add.graphics();

    g.fillStyle(0x1a0e00, 1);
    g.fillRect(0, 0, w, h);

    g.fillStyle(0x2a1a0a, 1);
    g.fillRect(0, 0, w, h - 80);

    g.fillStyle(0x8B6B4a, 0.3);
    for (let i = 0; i < 20; i++) {
      g.fillRect(0, 10 + i * 30, w, 1);
    }

    g.fillStyle(0x5a3a1a, 0.25);
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 14; col++) {
        if ((row + col) % 2 === 0) {
          g.fillRect(col * 60, 80 + row * 40, 60, 40);
        }
      }
    }

    g.fillStyle(0xc0392b, 0.3);
    g.fillTriangle(0, 0, w / 2, 60, w, 0);
    g.fillStyle(0xe67e22, 0.2);
    g.fillTriangle(0, 60, w / 2, 0, w, 60);

    g.fillStyle(0xe67e22, 0.12);
    for (let i = 0; i < 16; i++) {
      g.fillRect(i * 60, 5, 30, 50);
    }

    g.fillStyle(0x2a1a0a, 0.5);
    g.fillRect(0, 55, w, 3);

    g.fillStyle(0x5a3a1a, 0.5);
    g.fillRect(0, 0, w, 5);

    g.fillStyle(0x6a4a2a, 0.3);
    g.fillRect(0, h - 80, w, 80);

    g.fillStyle(0x7a5a3a, 0.15);
    for (let i = 0; i < 18; i++) {
      g.fillRect(i * 48, h - 80, 46, 80);
      g.fillStyle(0x000, 0.05);
    }

    g.fillStyle(0x3a2010, 0.4);
    g.fillRect(0, h - 80, w, 2);
  }

  private drawShelves(w: number, h: number) {
    const g = this.add.graphics();

    g.fillStyle(0x3d2515, 0.7);
    g.fillRect(w - 105, 90, 90, h - 190);
    g.lineStyle(1, 0x5c3a1e, 0.4);
    g.strokeRect(w - 105, 90, 90, h - 190);

    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x4a3020, 0.5);
      g.fillRect(w - 100, 110 + i * 70, 80, 3);
    }

    const bottleColors = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const bx = w - 85 + col * 40;
        const by = 115 + row * 70;
        const bc = bottleColors[(row * 2 + col) % bottleColors.length];

        g.fillStyle(bc, 0.25);
        g.fillRoundedRect(bx - 6, by, 12, 20, 4);

        g.fillStyle(0xffffff, 0.08);
        g.fillRect(bx - 3, by + 2, 3, 14);

        g.fillStyle(bc, 0.15);
        g.fillCircle(bx, by - 4, 4);
      }
    }
  }

  private drawLanterns(w: number, h: number) {
    const g = this.add.graphics();

    for (let i = 0; i < 3; i++) {
      const lx = 150 + i * 250;
      const ly = 65;

      g.lineStyle(1, 0x5a3a1a, 0.6);
      g.lineBetween(lx, ly, lx, ly + 20);

      g.fillStyle(0x2a1a0a, 0.8);
      g.fillRect(lx - 6, ly + 12, 12, 18);

      g.fillStyle(0xf39c12, 0.15);
      g.fillRect(lx - 4, ly + 14, 8, 14);

      g.fillStyle(0xffeaa7, 0.08);
      g.fillCircle(lx, ly + 20, 12);
    }
  }

  private drawShopkeeper(w: number, h: number) {
    const g = this.add.graphics();
    const sx = 30;
    const sy = h / 2 - 40;

    g.fillStyle(0x2a1a0a, 0.7);
    g.fillRoundedRect(sx, sy - 50, 110, 120, 8);
    g.lineStyle(2, 0xf39c12, 0.3);
    g.strokeRoundedRect(sx, sy - 50, 110, 120, 8);

    g.fillStyle(0xffeaa7, 1);
    g.fillCircle(sx + 55, sy - 5, 16);

    g.fillStyle(0xf39c12, 0.9);
    g.fillRoundedRect(sx + 35, sy + 10, 40, 40, 4);

    g.fillStyle(0xe67e22, 0.4);
    g.fillRect(sx + 35, sy + 10, 40, 4);

    g.fillStyle(0xe67e22, 0.9);
    g.fillRect(sx + 39, sy + 3, 4, 12);
    g.fillRect(sx + 67, sy + 3, 4, 12);

    g.fillStyle(0x2d3436, 1);
    g.fillCircle(sx + 49, sy - 6, 1.5);
    g.fillCircle(sx + 61, sy - 6, 1.5);

    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(sx + 48, sy - 7, 0.8);
    g.fillCircle(sx + 60, sy - 7, 0.8);

    g.fillStyle(0xf39c12, 0.6);
    g.fillRect(sx + 42, sy - 18, 26, 4);

    g.fillStyle(0x2d3436, 0.8);
    g.fillRect(sx + 45, sy + 50, 8, 12);
    g.fillRect(sx + 57, sy + 50, 8, 12);

    g.fillStyle(0x636e72, 0.5);
    g.fillRect(sx + 35, sy + 62, 40, 3);

    g.fillStyle(0x2d3436, 0.3);
    g.fillRect(sx + 35, sy + 48, 40, 2);
  }

  private startLanternGlow(w: number, h: number) {
    if (!this.textures.exists('glow_particle')) {
      const g = this.add.graphics();
      g.fillStyle(0xf39c12, 0.2);
      g.fillCircle(4, 4, 4);
      g.generateTexture('glow_particle', 8, 8);
      g.destroy();
    }

    for (let i = 0; i < 3; i++) {
      const lx = 150 + i * 250;
      const ly = 65;

      const glow = this.add.image(lx, ly + 25, 'glow_particle')
        .setAlpha(0.15)
        .setScale(2 + Math.random() * 1.5)
        .setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: glow,
        alpha: 0.05,
        scale: glow.scaleX * 0.7,
        duration: 1500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}
