import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(w / 2 - 160, h / 2 - 25, 320, 50);

    this.add.text(w / 2, h / 2 - 60, 'ChemiCraft', {
      fontFamily: 'monospace', fontSize: '28px', color: '#44ff88',
    }).setOrigin(0.5);

    const percentText = this.add.text(w / 2, h / 2, '0%', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x44aa44, 1);
      progressBar.fillRect(w / 2 - 155, h / 2 - 20, 310 * value, 40);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
    });

    this.loadAssets();
  }

  loadAssets() {
    this.load.spritesheet('tileset',
      'assets/images/tilesets/rpg-base/Spritesheet/RPGpack_sheet.png',
      { frameWidth: 64, frameHeight: 64 }
    );

    this.load.spritesheet('player',
      'assets/images/characters/player.png',
      { frameWidth: 40, frameHeight: 64 }
    );

    this.load.image('npc_square', 'assets/images/characters/rpg_character_sprites_-_spritesheet_adventurer.png');

    this.load.image('backpack', 'assets/images/ui/backpack.png');
    this.load.image('flask', 'assets/images/ui/bubbling-flask.png');
    this.load.image('coin_icon', 'assets/images/ui/crown-coin.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
