import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(w / 2, h / 4, 'ChemiCraft', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#44ff88',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 4 + 60, 'A Chemistry Learning RPG', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaddcc',
    }).setOrigin(0.5);

    const playBtn = this.add.text(w / 2, h / 2, '[ Play ]', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#334466',
      padding: { x: 30, y: 15 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerover', () => playBtn.setColor('#44ff88'));
    playBtn.on('pointerout', () => playBtn.setColor('#ffffff'));
    playBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    this.add.text(w / 2, h - 60, 'v1.0.0', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#666666',
    }).setOrigin(0.5);
  }
}
