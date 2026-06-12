import Phaser from 'phaser';
import { generateTileGrass, generateTileGrassDetail, generateTileWall, generateTileLab, generateTileLibrary, generateTileShop, generateTileSquare, generateTilePortal, generateTileEntrance } from '../textures/TileTextures';
import { generatePlayerSprite, generateNPCSprites } from '../textures/SpriteTextures';
import { generateUITextures } from '../textures/UITextures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const { width, height } = this.cameras.main;
    const barW = 400;
    const barH = 20;
    const barX = (width - barW) / 2;
    const barY = height / 2;

    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x1e1e3f, 1);
    bgBar.fillRoundedRect(barX, barY, barW, barH, 10);

    const progressBar = this.add.graphics();

    this.add.text(width / 2, barY - 60, 'CHEMICRAFT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#a29bfe',
    }).setOrigin(0.5);

    const loadingText = this.add.text(width / 2, barY + 40, 'Loading...', {
      fontFamily: '"Inter", sans-serif',
      fontSize: '14px',
      color: '#636e72',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x6c5ce7, 1);
      progressBar.fillRoundedRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4, 8);
    });

    this.load.on('fileprogress', (file: { key: string }) => {
      loadingText.setText(`Loading: ${file.key}`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      bgBar.destroy();
      loadingText.destroy();
    });

    this.load.json('maps', 'assets/data/maps.json');
    this.load.json('npcs', 'assets/data/npcs.json');
    this.load.json('quests', 'assets/data/quests.json');
    this.load.json('recipes', 'assets/data/recipes.json');
    this.load.json('items', 'assets/data/items.json');
    this.load.json('skills', 'assets/data/skills.json');

    this.load.audio('bgm', 'assets/audio/bgm.wav');
    this.load.audio('sfx_coin', 'assets/audio/sfx_coin.wav');
    this.load.audio('sfx_craft', 'assets/audio/sfx_craft.wav');

    this.load.svg('icon_pickaxe', 'assets/icons/pickaxe.svg', { width: 32, height: 32 });
    this.load.svg('icon_flask', 'assets/icons/flask.svg', { width: 32, height: 32 });
    this.load.svg('icon_particle', 'assets/icons/comet.svg', { width: 16, height: 16 });
  }

  create() {
    this.generateTextures();

    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }

  private generateTextures() {
    generateTileGrass(this);
    generateTileGrassDetail(this);
    generateTileWall(this);
    generateTileLab(this);
    generateTileLibrary(this);
    generateTileShop(this);
    generateTileSquare(this);
    generateTilePortal(this);
    generateTileEntrance(this);

    generatePlayerSprite(this);

    generateNPCSprites(this);

    generateUITextures(this);
  }
}
