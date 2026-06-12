import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';

export class MainMenuScene extends Phaser.Scene {
  private particles: { x: number; y: number; vx: number; vy: number; r: number; color: number; alpha: number }[] = [];
  private particleGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 3 + 1,
        color: [0x6c5ce7, 0x00cec9, 0xfdcb6e, 0xa29bfe][Math.floor(Math.random() * 4)],
        alpha: Math.random() * 0.4 + 0.1,
      });
    }
    this.particleGraphics = this.add.graphics();

    const titleY = height * 0.25;
    const glow = this.add.graphics();
    glow.fillStyle(0x6c5ce7, 0.08);
    glow.fillCircle(width / 2, titleY, 120);

    this.add.text(width / 2, titleY - 20, '⚗️', { fontSize: '48px' }).setOrigin(0.5);
    this.add.text(width / 2, titleY + 30, 'CHEMICRAFT', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '32px',
      color: '#a29bfe', stroke: '#6c5ce7', strokeThickness: 2,
    }).setOrigin(0.5);
    this.add.text(width / 2, titleY + 65, 'Learn Chemistry Through Adventure', {
      fontFamily: '"Inter", sans-serif', fontSize: '14px', color: '#636e72',
    }).setOrigin(0.5);

    const btnY = height * 0.55;
    this.createMenuButton(width / 2, btnY, 'Start Adventure', () => this.startGame());
    this.createMenuButton(width / 2, btnY + 55, 'Controls', () => this.showControls());

    this.add.text(width - 10, height - 10, 'v1.0.0 MVP', {
      fontFamily: '"Inter", sans-serif', fontSize: '10px', color: '#636e72',
    }).setOrigin(1, 1);

    this.addFloatingMolecule(width * 0.15, height * 0.7, 'H₂O', 0x4fc3f7);
    this.addFloatingMolecule(width * 0.85, height * 0.3, 'N₂', 0x81d4fa);
    this.addFloatingMolecule(width * 0.1, height * 0.3, 'O₂', 0x80cbc4);
  }

  update() {
    this.particleGraphics.clear();
    const { width, height } = this.cameras.main;
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      this.particleGraphics.fillStyle(p.color, p.alpha);
      this.particleGraphics.fillCircle(p.x, p.y, p.r);
    }
  }

  private createMenuButton(x: number, y: number, label: string, cb: () => void) {
    const c = this.add.container(x, y);
    const bg = this.add.image(0, 0, 'btn_primary').setDisplaySize(220, 45);
    const text = this.add.text(0, 0, label, {
      fontFamily: '"Inter", sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5);
    c.add([bg, text]); c.setSize(220, 45);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerover', () => { this.tweens.add({ targets: c, scaleX: 1.05, scaleY: 1.05, duration: 150 }); });
    c.on('pointerout', () => { this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 150 }); });
    c.on('pointerdown', cb);
  }

  private addFloatingMolecule(x: number, y: number, label: string, color: number) {
    const text = this.add.text(x, y, label, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px',
      color: '#' + color.toString(16).padStart(6, '0'),
    }).setOrigin(0.5).setAlpha(0.3);
    this.tweens.add({ targets: text, y: y - 10, alpha: 0.5, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private startGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => { this.scene.start('GameScene'); });
  }

  private showControls() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7).setInteractive();
    const panel = this.add.image(width/2, height/2, 'panel_bg').setDisplaySize(500, 350);
    const title = this.add.text(width/2, height/2-140, 'Controls', { fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#a29bfe' }).setOrigin(0.5);
    const lines = ['WASD / Arrows — Move','E — Interact','I — Inventory','Q — Quest Log','K — Skills','ESC — Close menus'];
    const texts = lines.map((l,i) => this.add.text(width/2, height/2-80+i*30, l, { fontFamily: '"Inter"', fontSize: '13px', color: '#dfe6e9' }).setOrigin(0.5));
    const close = this.add.text(width/2, height/2+130, '[ Close ]', { fontFamily: '"Inter"', fontSize: '14px', color: '#6c5ce7', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => { [overlay,panel,title,close,...texts].forEach(o=>o.destroy()); });
  }
}
