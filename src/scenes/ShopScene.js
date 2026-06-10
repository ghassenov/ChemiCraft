import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  init() {
    this.questManager = this.registry.get('questManager') || null;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#1a2a1e');

    this.add.text(w / 2, 40, '🏪 Shop', {
      fontFamily: 'monospace', fontSize: '28px', color: '#44ff88', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(w / 2, 90, '"Coming soon! Check back later."', {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaaacc',
    }).setOrigin(0.5);

    if (this.questManager) {
      const state = this.questManager.getState();
      this.add.text(w / 2, 130, `Your coins: 🪙 ${state.coins}`, {
        fontFamily: 'monospace', fontSize: '16px', color: '#ffdd44',
      }).setOrigin(0.5);
    }

    const backBtn = this.add.text(w / 2, h - 50, '[ Back to Map ]', {
      fontFamily: 'monospace', fontSize: '16px', color: '#aaaacc',
      backgroundColor: '#333355', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#aaaacc'));
    backBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
