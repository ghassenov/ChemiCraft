import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DialogueBox } from '../ui/DialogueBox';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';
import { MAP_SCENE_KEYS } from '../data/mapSceneKeys';
import { openLessonSelector } from '../overlays/LessonSelector';
import { addHelpButton } from '../overlays/HelpOverlay';

interface Portrait {
  name: string; label: string; x: number; y: number; read: boolean;
}

export class LibraryInteriorScene extends Phaser.Scene {
  private player!: Player;
  private professor!: NPC;
  private dialogueBox!: DialogueBox;
  private walls!: Phaser.Physics.Arcade.StaticGroup;

  private portraits: Portrait[] = [];
  private portraitBonusClaimed = false;
  private infoText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'LibraryInteriorScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.portraitBonusClaimed = false;

    this.drawRoom();
    this.walls = this.physics.add.staticGroup();
    this.addCollisionWalls();

    this.player = new Player(this, 320, 480);
    this.physics.world.setBounds(20, 20, 600, 600);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);

    const currentMap = gameStore.getCurrentMap();
    const recycling = currentMap === 'recyclingFields';
    const ecoVille = currentMap === 'ecoVille';
    const prismHeights = currentMap === 'prismHeights';
    const npcId = recycling ? 'eco_educator' : ecoVille ? 'eco_activist' : prismHeights ? 'optics_librarian' : 'professor_knowitall';
    const npcName = recycling ? 'Eco Emma' : ecoVille ? 'Zara Green' : prismHeights ? 'Spectra' : 'Prof. Knowitall';

    this.professor = new NPC(this, 480, 200, npcId, npcName, `npc_${npcId}`, null);
    this.physics.add.collider(this.player, this.professor);

    this.dialogueBox = new DialogueBox(this);
    this.player.onInteract(() => this.handleInteraction());

    const libTitle = recycling ? 'MATERIALS RECYCLING CENTER' : ecoVille ? 'ECO CLIMATE LIBRARY' : prismHeights ? 'OPTICS LIBRARY' : 'LIBRARY OF ELEMENTS';
    this.add.text(320, 55, libTitle, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#d4a855',
    }).setOrigin(0.5);

    this.infoText = this.add.text(320, 600, '', {
      fontFamily: '"Inter"', fontSize: '11px', color: '#c8b89a',
      align: 'center', wordWrap: { width: 300 },
    }).setOrigin(0.5).setDepth(15);

    if (recycling) {
      this.portraits = [
        { name: 'Eugene Poubelle', label: 'Invented the waste bin system (1884)', x: 120, y: 560, read: false },
        { name: 'Jean-Jacques', label: 'Pioneer of industrial ecology', x: 320, y: 560, read: false },
        { name: 'Wangari Maathai', label: 'Nobel laureate, environmental activist', x: 520, y: 560, read: false },
      ];
    } else if (ecoVille) {
      this.portraits = [
        { name: 'Eunice Newton Foote', label: 'First to describe the greenhouse effect (1856)', x: 120, y: 560, read: false },
        { name: 'Charles David Keeling', label: 'Created the Keeling Curve of CO\u2082 measurements', x: 320, y: 560, read: false },
        { name: 'James Hansen', label: 'Brought climate change to public attention (1988)', x: 520, y: 560, read: false },
      ];
    } else if (prismHeights) {
      this.portraits = [
        { name: 'Isaac Newton', label: 'Pioneer of optics and color theory (1704)', x: 120, y: 560, read: false },
        { name: 'Ibn al-Haytham', label: 'Father of optics (1021)', x: 320, y: 560, read: false },
        { name: 'James Clerk Maxwell', label: 'Unified light and electromagnetism (1865)', x: 520, y: 560, read: false },
      ];
    } else {
      this.portraits = [
        { name: 'Lavoisier', label: 'Father of modern chemistry', x: 120, y: 560, read: false },
        { name: 'Mendeleev', label: 'Creator of the periodic table', x: 320, y: 560, read: false },
        { name: 'Curie', label: 'Pioneer in radioactivity', x: 520, y: 560, read: false },
      ];
    }

    this.createAnimatedDecor();
    addHelpButton(this, recycling ? [
      'Browse the center to learn about\nrecycling and materials.',
      'Study the three portraits\nfor a coin bonus.',
      'Complete lessons to earn your\nMaterials Expert Certificate.',
      'Exit through the corridor.',
    ] : ecoVille ? [
      'Climate Library helps you understand\nclimate science and carbon capture.',
      'Study the three portraits\nfor a coin bonus.',
      'Complete lessons to prepare for\nthe Green Certificate quest.',
      'Exit through the corridor.',
    ] : prismHeights ? [
      'Browse the optics library to learn\nabout light, color, and lenses.',
      'Study the three portraits\nfor a coin bonus.',
      'Complete lessons to improve your\noptics mastery skill.',
      'Exit through the corridor.',
    ] : [
      'Browse bookshelves to learn\nchemistry lessons.',
      'Study the three portraits\nfor a coin bonus.',
      'Exit through the corridor.',
    ]);
  }

  private createAnimatedDecor() {
    // === Floating dust motes ===
    if (!this.textures.exists('lib_dust')) {
      const dg = this.add.graphics();
      dg.fillStyle(0xd4a855, 0.25);
      dg.fillCircle(2, 2, 2);
      dg.generateTexture('lib_dust', 4, 4);
      dg.destroy();
    }
    this.add.particles(0, 0, 'lib_dust', {
      x: { min: 30, max: 610 },
      y: { min: 30, max: 530 },
      lifespan: 6000,
      speed: { min: 2, max: 8 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.25, end: 0 },
      blendMode: 'ADD',
      frequency: 400,
    }).setDepth(12);

    // === Candle flames on the reading desk ===
    const candlePositions = [
      { x: 250, y: 268 },
      { x: 390, y: 268 },
    ];
    for (const cp of candlePositions) {
      // Candle body
      const cg = this.add.graphics().setDepth(10);
      cg.fillStyle(0xffeaa7, 0.5);
      cg.fillRect(cp.x - 2, cp.y - 8, 4, 10);

      // Flame particle
      this.add.particles(cp.x, cp.y - 12, 'icon_particle', {
        speed: { min: 4, max: 12 },
        angle: { min: 260, max: 280 },
        scale: { start: 0.25, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 400,
        blendMode: 'ADD',
        tint: [0xf39c12, 0xfdcb6e, 0xe74c3c],
        frequency: 50,
      }).setDepth(11);

      // Warm glow
      const glow = this.add.circle(cp.x, cp.y - 6, 15, 0xf39c12, 0.06).setDepth(9);
      this.tweens.add({
        targets: glow, alpha: 0.02, scaleX: 1.3, scaleY: 1.3,
        duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    }

    // === Reading lamp glow on central desk ===
    const lampGlow = this.add.circle(320, 295, 40, 0xffeaa7, 0.05).setDepth(9);
    this.tweens.add({
      targets: lampGlow, alpha: 0.02, scaleX: 1.15, scaleY: 1.15,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // === Bookshelf shimmer — subtle sparkle on bookshelves ===
    const shelfPositions = [
      { x: 60, y: 100 }, { x: 560, y: 100 },
      { x: 60, y: 220 }, { x: 560, y: 220 },
      { x: 60, y: 340 }, { x: 560, y: 340 },
    ];
    for (const sp of shelfPositions) {
      const shimmer = this.add.circle(sp.x + 10, sp.y + 10, 3, 0xffffff, 0.15).setDepth(10);
      this.tweens.add({
        targets: shimmer, alpha: 0, duration: 1200 + Phaser.Math.Between(0, 800),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  update() {
    this.player.update();

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.professor.x, this.professor.y);
    if (dist < 40) this.professor.showPrompt();
    else this.professor.hidePrompt();
    this.professor.updatePromptPosition();

    let nearPortrait: Portrait | null = null;
    for (const p of this.portraits) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      if (d < 36) {
        nearPortrait = p;
        break;
      }
    }

    if (nearPortrait && !nearPortrait.read) {
      if (this.infoText) {
        this.infoText.setText(`Press E to read about ${nearPortrait.name}`);
      }
    } else if (nearPortrait && nearPortrait.read) {
      if (this.infoText) {
        this.infoText.setText(`${nearPortrait.name}: ${nearPortrait.label}`);
      }
    } else {
      if (this.infoText) {
        const readCount = this.portraits.filter(p => p.read).length;
        if (readCount === 3 && !this.portraitBonusClaimed) {
          this.infoText.setText('All portraits read! Walk to the exit door for a reward.');
        } else {
          this.infoText.setText('');
        }
      }
    }

    if (this.player.y > 580) {
      if (this.portraits.every(p => p.read) && !this.portraitBonusClaimed) {
        this.portraitBonusClaimed = true;
        gameStore.addCoins(10);
        this.sound.play('sfx_coin', { volume: 0.5 });
        this.cameras.main.flash(200, 243, 156, 18);
        this.time.delayedCall(600, () => {
          const sceneKey = MAP_SCENE_KEYS[gameStore.getCurrentMap()] || 'AtomMeadowsScene';
          SceneTransition.fadeOutIn(this, sceneKey);
        });
      } else {
        const sceneKey = MAP_SCENE_KEYS[gameStore.getCurrentMap()] || 'AtomMeadowsScene';
        SceneTransition.fadeOutIn(this, sceneKey);
      }
    }
  }

  private drawRoom() {
    const g = this.add.graphics();

    g.fillStyle(0x1e1510, 1);
    g.fillRect(0, 0, 640, 640);

    g.fillStyle(0x2a1e17, 1);
    g.fillRect(20, 20, 600, 520);

    g.fillStyle(0x3a2a1f, 0.3);
    for (let row = 0; row < 30; row++) {
      g.fillRect(20, 20 + row * 20, 600, 1);
    }

    g.fillStyle(0x6a4a2a, 0.3);
    g.fillRect(20, 20, 600, 520);

    g.fillStyle(0x2a1a0e, 0.5);
    g.fillRect(20, 20, 600, 4);
    g.fillRect(20, 20, 4, 520);
    g.fillRect(616, 20, 4, 520);
    g.fillRect(20, 536, 600, 4);

    g.fillStyle(0x8B6914, 0.2);
    g.fillRect(30, 80, 80, 420);
    g.fillRect(530, 80, 80, 420);
    g.fillRect(110, 80, 80, 200);
    g.fillRect(450, 80, 80, 200);

    g.lineStyle(2, 0x8B6914, 0.3);
    g.strokeRect(30, 80, 80, 420);
    g.strokeRect(530, 80, 80, 420);

    const bookColors = [0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xd4a017, 0x2c3e50, 0x7f8c8d, 0x16a085, 0xe67e22, 0x3498db];
    const shelves = [
      { x: 35, y: 90 }, { x: 535, y: 90 },
      { x: 35, y: 210 }, { x: 535, y: 210 },
      { x: 35, y: 330 }, { x: 535, y: 330 },
    ];

    for (const s of shelves) {
      for (let i = 0; i < 8; i++) {
        const bw = 5 + Math.floor(Math.random() * 7);
        const bh = 14 + Math.floor(Math.random() * 6);
        const bc = bookColors[Math.floor(Math.random() * bookColors.length)];
        g.fillStyle(bc, 0.6);
        g.fillRect(s.x + i * 9, s.y + (22 - bh), bw, bh);
        g.fillStyle(0xffffff, 0.06);
        g.fillRect(s.x + i * 9 + 1, s.y + (22 - bh) + 2, 2, bh - 4);
      }
    }

    g.fillStyle(0x3a2a1f, 0.4);
    for (let i = 0; i < 3; i++) {
      g.fillRect(30, 115 + i * 120, 80, 3);
      g.fillRect(530, 115 + i * 120, 80, 3);
    }

    g.fillStyle(0x3d2b1f, 0.8);
    g.fillRect(220, 270, 200, 50);
    g.lineStyle(2, 0x8B6914, 0.4);
    g.strokeRect(220, 270, 200, 50);

    g.fillStyle(0x4a3a2a, 0.3);
    g.fillRect(228, 278, 184, 34);

    g.fillStyle(0xd4a855, 0.12);
    g.fillCircle(250, 295, 6);
    g.fillCircle(390, 295, 6);

    this.drawDecor(g);
    this.drawCorridor(g);
  }

  private drawDecor(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(0x8B6914, 0.15);
    g.fillCircle(320, 295, 30);
    g.fillStyle(0x3a2a1f, 0.2);
    g.fillCircle(320, 295, 18);
    g.fillStyle(0xd4a855, 0.06);
    g.fillCircle(320, 295, 8);

    g.fillStyle(0x8B4513, 0.4);
    g.fillRect(240, 268, 4, 24);
    g.fillRect(396, 268, 4, 24);
    g.fillStyle(0xd4a855, 0.08);
    g.fillCircle(242, 268, 4);
    g.fillCircle(242, 266, 2);
    g.fillCircle(398, 268, 4);
    g.fillCircle(398, 266, 2);

    g.fillStyle(0x8B6914, 0.08);
    g.fillRect(180, 270, 30, 50);
    g.fillRect(430, 270, 30, 50);

    g.fillStyle(0xd4a855, 0.04);
    g.fillCircle(195, 268, 8);
    g.fillCircle(445, 268, 8);

    g.fillStyle(0x4a3a2a, 0.6);
    g.fillRect(314, 80, 12, 60);
    g.fillStyle(0x6a4a2a, 0.4);
    g.fillRect(310, 80, 20, 6);
    g.fillStyle(0xd4a855, 0.06);
    g.fillCircle(318, 76, 10);
    g.fillCircle(318, 76, 6);
    g.fillStyle(0xf1c40f, 0.04);
    g.fillCircle(318, 76, 3);

    g.fillStyle(0x8B4513, 0.3);
    g.fillRect(290, 340, 60, 20);
    g.fillRect(290, 360, 60, 30);
    g.fillStyle(0x6a4a2a, 0.3);
    g.fillCircle(305, 348, 6);
    g.fillCircle(335, 348, 6);
    g.fillStyle(0xd4a855, 0.08);
    g.fillCircle(305, 346, 3);
    g.fillCircle(335, 346, 3);

    g.fillStyle(0x6a8aaa, 0.06);
    g.fillRect(34, 85, 8, 410);
    g.fillRect(598, 85, 8, 410);

    g.fillStyle(0x2d3436, 0.15);
    g.fillRect(220, 375, 200, 80);
    g.lineStyle(1, 0xd4a855, 0.06);
    g.strokeRect(220, 375, 200, 80);

    for (let i = 0; i < 3; i++) {
      g.fillStyle([0x8B6914, 0xc0392b, 0x2980b9][i], 0.3);
      g.fillRect(230 + i * 65, 385, 50, 8);
      g.fillStyle([0x8B6914, 0xc0392b, 0x2980b9][i], 0.15);
      g.fillRect(235 + i * 65, 395, 40, 6);
    }

    g.fillStyle(0x8B6914, 0.1);
    g.fillRect(170, 185, 30, 50);
    g.fillRect(440, 185, 30, 50);
  }

  private drawCorridor(g: Phaser.GameObjects.Graphics) {
    const cy = 540;

    g.fillStyle(0x1e1510, 1);
    g.fillRect(20, cy, 600, 100);

    g.fillStyle(0x2a1e17, 0.6);
    g.fillRect(20, cy, 600, 100);

    g.fillStyle(0x2a1a0e, 0.5);
    g.fillRect(20, cy, 600, 4);
    g.fillRect(20, cy, 4, 100);
    g.fillRect(616, cy, 4, 100);
    g.fillRect(20, cy + 96, 600, 4);

    g.fillStyle(0x8B6914, 0.2);
    g.fillRect(40, cy + 8, 60, 80);
    g.fillStyle(0x6a4a2a, 0.3);
    g.fillRect(44, cy + 12, 52, 72);

    g.fillStyle(0xd4a855, 0.3);
    g.lineStyle(2, 0xd4a855, 0.4);
    g.strokeRect(48, cy + 16, 44, 36);
    g.fillStyle(0x3498db, 0.25);
    g.fillCircle(70, cy + 34, 8);
    g.fillStyle(0x2d3436, 0.15);
    g.fillRect(50, cy + 58, 40, 10);
    g.fillStyle(0xc8b89a, 0.2);
    g.fillRect(52, cy + 60, 36, 6);

    g.fillStyle(0x8B6914, 0.2);
    g.fillRect(540, cy + 8, 60, 80);
    g.fillStyle(0x6a4a2a, 0.3);
    g.fillRect(544, cy + 12, 52, 72);

    g.fillStyle(0xd4a855, 0.3);
    g.lineStyle(2, 0xd4a855, 0.4);
    g.strokeRect(548, cy + 16, 44, 36);
    g.fillStyle(0x9b59b6, 0.25);
    g.fillCircle(570, cy + 34, 8);
    g.fillStyle(0x2d3436, 0.15);
    g.fillRect(550, cy + 58, 40, 10);
    g.fillStyle(0xc8b89a, 0.2);
    g.fillRect(552, cy + 60, 36, 6);

    g.fillStyle(0x8B6914, 0.2);
    g.fillRect(290, cy + 8, 60, 80);
    g.fillStyle(0x6a4a2a, 0.3);
    g.fillRect(294, cy + 12, 52, 72);

    g.fillStyle(0xd4a855, 0.3);
    g.lineStyle(2, 0xd4a855, 0.4);
    g.strokeRect(298, cy + 16, 44, 36);
    g.fillStyle(0x00b894, 0.25);
    g.fillCircle(320, cy + 34, 8);
    g.fillStyle(0x2d3436, 0.15);
    g.fillRect(300, cy + 58, 40, 10);
    g.fillStyle(0xc8b89a, 0.2);
    g.fillRect(302, cy + 60, 36, 6);

    g.fillStyle(0xd4a855, 0.08);
    g.fillCircle(60, cy + 6, 4);
    g.fillCircle(580, cy + 6, 4);
    g.fillCircle(320, cy + 6, 4);

    g.fillStyle(0xf1c40f, 0.03);
    g.fillCircle(60, cy + 6, 6);
    g.fillCircle(580, cy + 6, 6);
    g.fillCircle(320, cy + 6, 6);

    g.fillStyle(0x8B6914, 0.3);
    g.lineStyle(1, 0xd4a855, 0.2);
    g.fillRect(280, cy + 78, 80, 14);
    g.strokeRect(280, cy + 78, 80, 14);
    g.fillStyle(0x3d2b1f, 0.4);
    g.fillRect(284, cy + 82, 72, 6);
  }

  private addCollisionWalls() {
    const g = this.walls;
    g.create(20, 310, 'tile_wall')?.setVisible(false).setSize(10, 620);
    g.create(640, 310, 'tile_wall')?.setVisible(false).setSize(10, 620);
    g.create(320, 20, 'tile_wall')?.setVisible(false).setSize(640, 10);
    g.create(320, 615, 'tile_wall')?.setVisible(false).setSize(640, 10);

    g.create(70, 290, 'tile_wall')?.setVisible(false).setSize(90, 430);
    g.create(570, 290, 'tile_wall')?.setVisible(false).setSize(90, 430);
    g.create(150, 180, 'tile_wall')?.setVisible(false).setSize(90, 220);
    g.create(490, 180, 'tile_wall')?.setVisible(false).setSize(90, 220);
    g.create(320, 295, 'tile_wall')?.setVisible(false).setSize(210, 60);
    g.create(100, 575, 'tile_wall')?.setVisible(false).setSize(70, 20);
    g.create(540, 575, 'tile_wall')?.setVisible(false).setSize(70, 20);
  }

  private handleInteraction() {
    const px = this.player.x;
    const py = this.player.y;
    const currentMap = gameStore.getCurrentMap();
    const recycling = currentMap === 'recyclingFields';
    const ecoVille = currentMap === 'ecoVille';
    const prismHeights = currentMap === 'prismHeights';

    if (this.isNear(px, py, this.professor.x, this.professor.y, 40)) {
      if (!gameStore.hasVisitedInterior('LibraryInteriorScene')) {
        gameStore.markInteriorVisited('LibraryInteriorScene');
        const data = this.cache.json.get('npcs') as Record<string, any>;
        const npcKey = recycling ? 'eco_educator' : ecoVille ? 'eco_activist' : prismHeights ? 'optics_librarian' : 'professor_knowitall';
        this.dialogueBox.show(
          data[npcKey].name,
          data[npcKey].dialogue.default,
          data[npcKey].spriteColor,
          undefined,
          () => openLessonSelector(this, currentMap)
        );
      } else {
        openLessonSelector(this, currentMap);
      }
      return;
    }

    if (this.isInZone(px, py, 30, 80, 80, 420) ||
        this.isInZone(px, py, 530, 80, 80, 420) ||
        this.isInZone(px, py, 110, 80, 80, 200) ||
        this.isInZone(px, py, 450, 80, 80, 200)) {
      openLessonSelector(this, currentMap);
      return;
    }

    for (const p of this.portraits) {
      if (this.isNear(px, py, p.x, p.y, 36)) {
        if (!p.read) {
          p.read = true;
          if (this.infoText) {
            this.infoText.setText(`${p.name}: ${p.label}\n(Portrait studied!)`);
          }
          this.time.delayedCall(1500, () => {
            if (this.infoText && this.portraits.every(q => q.read) && !this.portraitBonusClaimed) {
              this.infoText.setText('You studied all portraits!\nWalk to the exit to claim your reward.');
            }
          });
        }
        return;
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
