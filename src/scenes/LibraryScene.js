import Phaser from 'phaser';

export class LibraryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LibraryScene' });
  }

  init() {
    this.questManager = this.registry.get('questManager') || null;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#2a1a2e');

    this.add.text(w / 2, 40, '📚 Library', {
      fontFamily: 'monospace', fontSize: '28px', color: '#ffaa44', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(w / 2, 90, '"Professor Knowitall" is away... books are here though!', {
      fontFamily: 'monospace', fontSize: '12px', color: '#aaaacc',
    }).setOrigin(0.5);

    this.add.text(w / 2, 150, '📖 Atoms & Molecules', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
      backgroundColor: '#444466', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerover', function () { this.setColor('#ffdd44'); })
      .on('pointerout', function () { this.setColor('#ffffff'); })
      .on('pointerdown', () => {
        this.add.text(w / 2, 200, 'Atoms are the building blocks of matter. Molecules form when atoms bond.', {
          fontFamily: 'monospace', fontSize: '12px', color: '#88ddff',
          wordWrap: { width: 400 }, align: 'center',
        }).setOrigin(0.5);
      });

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
