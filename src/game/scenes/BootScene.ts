import Phaser from 'phaser';

/**
 * BootScene — loads all assets and data, shows a loading bar.
 * Transitions to MainMenuScene when complete.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const { width, height } = this.cameras.main;
    const barW = 400;
    const barH = 20;
    const barX = (width - barW) / 2;
    const barY = height / 2;

    // Background bar
    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x1e1e3f, 1);
    bgBar.fillRoundedRect(barX, barY, barW, barH, 10);

    // Progress bar
    const progressBar = this.add.graphics();

    // Title text
    this.add.text(width / 2, barY - 60, '⚗️ CHEMICRAFT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#a29bfe',
    }).setOrigin(0.5);

    // Loading text
    const loadingText = this.add.text(width / 2, barY + 40, 'Loading...', {
      fontFamily: '"Inter", sans-serif',
      fontSize: '14px',
      color: '#636e72',
    }).setOrigin(0.5);

    // Progress events
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

    // ===== Load JSON data files =====
    this.load.json('maps', 'assets/data/maps.json');
    this.load.json('npcs', 'assets/data/npcs.json');
    this.load.json('quests', 'assets/data/quests.json');
    this.load.json('recipes', 'assets/data/recipes.json');
    this.load.json('items', 'assets/data/items.json');
    this.load.json('skills', 'assets/data/skills.json');
  }

  create() {
    // Generate programmatic textures
    this.generateTextures();

    // Transition to main menu
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }

  /** Generate all placeholder sprite textures at runtime */
  private generateTextures() {
    const ts = 32; // tile size

    // ===== Tileset textures =====
    // Grass tile
    this.generateTile('tile_grass', ts, 0x4a7c59);
    
    // Add grass blades
    const g = this.add.graphics();
    g.setVisible(false);
    g.fillStyle(0x5a8c69, 1);
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * ts;
      const y = Math.random() * ts;
      g.fillRect(x, y, 2, 3);
    }
    g.generateTexture('tile_grass_detail', ts, ts);
    g.destroy();

    // Wall tile
    this.generateTile('tile_wall', ts, 0x5d5d7a);

    // Laboratory tile (blue building)
    this.generateTile('tile_lab', ts, 0x2d6a9f);

    // Library tile (brown building)
    this.generateTile('tile_library', ts, 0x8b6914);

    // Shop tile (orange building)
    this.generateTile('tile_shop', ts, 0xc47f17);

    // Village square (lighter stone)
    this.generateTile('tile_square', ts, 0x7f8c8d);

    // Portal tile (purple glow)
    this.generateTile('tile_portal', ts, 0x9b59b6);

    // ===== Building entrance indicators =====
    this.generateTile('entrance_marker', ts, 0x2ecc71);

    // ===== Player spritesheet (4 directions, 2 frames each) =====
    this.generatePlayerSprite();

    // ===== NPC sprites =====
    this.generateNPCSprites();

    // ===== UI textures =====
    this.generateUITextures();
  }

  private generateTile(key: string, size: number, color: number) {
    const g = this.add.graphics();
    g.setVisible(false);
    g.fillStyle(color, 1);
    g.fillRect(0, 0, size, size);
    // Add slight border for tile distinction
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).brighten(15).color, 0.3);
    g.strokeRect(0, 0, size, size);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private generatePlayerSprite() {
    const frameW = 32;
    const frameH = 32;
    const totalFrames = 8; // 4 directions × 2 frames
    const sheetW = frameW * totalFrames;

    const g = this.add.graphics();
    g.setVisible(false);

    for (let i = 0; i < totalFrames; i++) {
      const ox = i * frameW;
      const frame = i % 2;

      // Body
      g.fillStyle(0x6c5ce7, 1);
      g.fillRoundedRect(ox + 8, 8 + (frame === 1 ? -1 : 0), 16, 16, 3);

      // Head
      g.fillStyle(0xffeaa7, 1);
      g.fillCircle(ox + 16, 8, 6);

      // Eyes based on direction
      g.fillStyle(0x2d3436, 1);
      const dir = Math.floor(i / 2);
      if (dir === 0) { // Down
        g.fillCircle(ox + 14, 7, 1.5);
        g.fillCircle(ox + 18, 7, 1.5);
      } else if (dir === 1) { // Up
        // No eyes visible from behind
        g.fillStyle(0xd4a757, 1);
        g.fillCircle(ox + 16, 7, 3); // hair
      } else if (dir === 2) { // Left
        g.fillCircle(ox + 13, 7, 1.5);
      } else { // Right
        g.fillCircle(ox + 19, 7, 1.5);
      }

      // Legs
      g.fillStyle(0x2d3436, 1);
      const legOffset = frame === 1 ? 2 : 0;
      g.fillRect(ox + 10, 24, 4, 6 + legOffset);
      g.fillRect(ox + 18, 24, 4, 6 - legOffset);
    }

    g.generateTexture('player_sheet', sheetW, frameH);
    g.destroy();

    // Create spritesheet frames
    if (this.textures.exists('player_sheet')) {
      const texture = this.textures.get('player_sheet');
      // Remove auto-generated frame to manually define
      texture.add('__BASE', 0, 0, 0, sheetW, frameH);
      for (let i = 0; i < totalFrames; i++) {
        texture.add(i, 0, i * frameW, 0, frameW, frameH);
      }
    }
  }

  private generateNPCSprites() {
    const npcs = [
      { key: 'npc_panting_pete', color: 0xe74c3c, accent: 0xc0392b },
      { key: 'npc_professor_knowitall', color: 0x3498db, accent: 0x2980b9 },
      { key: 'npc_shopkeeper_sal', color: 0xf39c12, accent: 0xe67e22 },
      { key: 'npc_mayor_molecule', color: 0x9b59b6, accent: 0x8e44ad },
    ];

    for (const npc of npcs) {
      const g = this.add.graphics();
      g.setVisible(false);
      // Body
      g.fillStyle(npc.color, 1);
      g.fillRoundedRect(8, 10, 16, 14, 3);
      // Head
      g.fillStyle(0xffeaa7, 1);
      g.fillCircle(16, 8, 6);
      // Eyes
      g.fillStyle(0x2d3436, 1);
      g.fillCircle(14, 7, 1.5);
      g.fillCircle(18, 7, 1.5);
      // Hat/accent
      g.fillStyle(npc.accent, 1);
      g.fillRoundedRect(10, 1, 12, 4, 2);
      // Legs
      g.fillStyle(0x2d3436, 1);
      g.fillRect(10, 24, 4, 6);
      g.fillRect(18, 24, 4, 6);
      g.generateTexture(npc.key, 32, 32);
      g.destroy();
    }
  }

  private generateUITextures() {
    // Interaction prompt background
    const g1 = this.add.graphics();
    g1.setVisible(false);
    g1.fillStyle(0x0a0a1a, 0.85);
    g1.fillRoundedRect(0, 0, 120, 30, 8);
    g1.lineStyle(1, 0x6c5ce7, 0.6);
    g1.strokeRoundedRect(0, 0, 120, 30, 8);
    g1.generateTexture('prompt_bg', 120, 30);
    g1.destroy();

    // Dialogue box background
    const g2 = this.add.graphics();
    g2.setVisible(false);
    g2.fillStyle(0x131330, 0.95);
    g2.fillRoundedRect(0, 0, 800, 160, 12);
    g2.lineStyle(2, 0x6c5ce7, 0.5);
    g2.strokeRoundedRect(0, 0, 800, 160, 12);
    g2.generateTexture('dialogue_bg', 800, 160);
    g2.destroy();

    // Button textures
    const g3 = this.add.graphics();
    g3.setVisible(false);
    g3.fillStyle(0x6c5ce7, 1);
    g3.fillRoundedRect(0, 0, 160, 40, 8);
    g3.generateTexture('btn_primary', 160, 40);
    g3.destroy();

    const g4 = this.add.graphics();
    g4.setVisible(false);
    g4.fillStyle(0x1e1e3f, 1);
    g4.fillRoundedRect(0, 0, 160, 40, 8);
    g4.lineStyle(1, 0x6c5ce7, 0.5);
    g4.strokeRoundedRect(0, 0, 160, 40, 8);
    g4.generateTexture('btn_secondary', 160, 40);
    g4.destroy();

    // HUD panel background
    const g5 = this.add.graphics();
    g5.setVisible(false);
    g5.fillStyle(0x0a0a1a, 0.8);
    g5.fillRoundedRect(0, 0, 200, 40, 8);
    g5.lineStyle(1, 0x6c5ce7, 0.3);
    g5.strokeRoundedRect(0, 0, 200, 40, 8);
    g5.generateTexture('hud_panel', 200, 40);
    g5.destroy();

    // Inventory slot
    const g6 = this.add.graphics();
    g6.setVisible(false);
    g6.fillStyle(0x1e1e3f, 0.9);
    g6.fillRoundedRect(0, 0, 48, 48, 6);
    g6.lineStyle(1, 0x6c5ce7, 0.3);
    g6.strokeRoundedRect(0, 0, 48, 48, 6);
    g6.generateTexture('inv_slot', 48, 48);
    g6.destroy();

    // Panel background for menus
    const g7 = this.add.graphics();
    g7.setVisible(false);
    g7.fillStyle(0x131330, 0.95);
    g7.fillRoundedRect(0, 0, 600, 400, 16);
    g7.lineStyle(2, 0x6c5ce7, 0.4);
    g7.strokeRoundedRect(0, 0, 600, 400, 16);
    g7.generateTexture('panel_bg', 600, 400);
    g7.destroy();
  }
}
