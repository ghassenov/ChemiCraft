import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DialogueBox } from '../ui/DialogueBox';
import { CraftingSystem } from '../systems/CraftingSystem';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';
import { RecipeData, ItemData, Direction } from '../data/types';
import { MAP_SCENE_KEYS } from '../data/mapSceneKeys';
import { openReagentSelector, ReagentSelectorCallbacks } from '../overlays/ReagentSelector';
import { openLightPuzzle } from '../overlays/LightPuzzle';
import { addHelpButton } from '../overlays/HelpOverlay';

type LabState = 'idle' | 'carrying' | 'craft_prompt';

export class LabInteriorScene extends Phaser.Scene {
  private player!: Player;
  private assistant!: NPC;
  private dialogueBox!: DialogueBox;
  private craftingSystem!: CraftingSystem;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private state: LabState = 'idle';
  private carriedReagent: string | null = null;
  private carriedItemId: string | null = null;
  private benchReagents: string[] = [];
  private benchItemIds: string[] = [];
  private carriedIcon: Phaser.GameObjects.Text | null = null;
  private benchIcons: Phaser.GameObjects.Container[] = [];
  private benchGroup!: Phaser.GameObjects.Group;
  private statusText!: Phaser.GameObjects.Text;
  private craftingItems!: Record<string, ItemData>;

  private deconActive = false;
  private deconComplete = false;
  private deconTimer = 0;
  private exitLocked = true;
  private corridorOverlay: Phaser.GameObjects.Graphics | null = null;
  private corridorText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'LabInteriorScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.state = 'idle';
    this.carriedReagent = null;
    this.carriedItemId = null;
    this.benchReagents = [];
    this.benchItemIds = [];
    this.benchIcons = [];
    this.deconActive = false;
    this.deconComplete = false;
    this.deconTimer = 0;
    this.exitLocked = true;
    this.craftingSystem = new CraftingSystem(
      this.cache.json.get('recipes') as RecipeData[]
    );
    this.craftingItems = this.cache.json.get('items') as Record<string, ItemData>;

    this.drawRoom();
    this.walls = this.physics.add.staticGroup();
    this.addCollisionWalls();

    this.player = new Player(this, 320, 500);
    this.physics.world.setBounds(20, 20, 600, 600);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);

    this.assistant = new NPC(this, 480, 240, 'lab_assistant', 'Lab Assistant', 'npc_lab_assistant', null, true);
    this.physics.add.collider(this.player, this.assistant);

    this.dialogueBox = new DialogueBox(this);
    this.player.onInteract(() => this.handleInteraction());

    this.benchGroup = this.add.group();

    this.statusText = this.add.text(480, 80, '', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#bcc6db', align: 'center',
      wordWrap: { width: 180 }, lineSpacing: 3,
    }).setOrigin(0.5);

    this.createAnimatedDecor();
    this.createShelfPrompt();
    this.createShelfFloorMarker();
    this.createBenchFloorMarker();
    this.createBenchPrompt();
    addHelpButton(this, [
      'Pick up reagents from the shelf\non the left wall.',
      'Bring them to the workbench\nin the center to craft molecules.',
      'Exit through the corridor —\ndecontamination runs automatically.',
    ]);

    if (gameStore.getCurrentMap() === 'prismHeights') {
      this.createLightTableZone();
    }
  }

  private createLightTableZone() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0xce93d8, 0.12);
    g.fillRoundedRect(440, 350, 120, 60, 8);
    g.lineStyle(2, 0xce93d8, 0.4);
    g.strokeRoundedRect(440, 350, 120, 60, 8);

    g.fillStyle(0xb39ddb, 0.08);
    g.fillCircle(500, 380, 16);

    const icon = this.add.text(500, 365, '💡', {
      fontSize: '22px',
    }).setOrigin(0.5).setDepth(5);
    icon.setAlpha(0.7);

    this.tweens.add({
      targets: icon, alpha: 0.3, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    const markerG = this.add.graphics().setDepth(4);
    markerG.fillStyle(0xce93d8, 0.06);
    markerG.fillRoundedRect(440, 410, 120, 20, 4);

    const markerT = this.add.text(500, 420, 'Light Table', {
      fontFamily: '"Inter"', fontSize: '8px', color: '#ce93d8',
    }).setOrigin(0.5).setDepth(5).setAlpha(0.4);
    this.tweens.add({
      targets: markerT, alpha: 0.15, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  private isAtLightTable(px: number, py: number): boolean {
    return px >= 440 && px <= 560 && py >= 350 && py <= 410;
  }

  update(_time: number, delta: number) {
    this.player.update();

    if (this.carriedIcon && this.carriedReagent) {
      this.carriedIcon.setPosition(this.player.x, this.player.y - 26);
    }

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.assistant.x, this.assistant.y);
    if (dist < 40) this.assistant.showPrompt();
    else this.assistant.hidePrompt();
    this.assistant.updatePromptPosition();

    if (this.deconActive) {
      this.deconTimer += delta;
      const progress = Math.min(this.deconTimer / 2000, 1);
      if (this.corridorOverlay) {
        this.corridorOverlay.clear();
        this.corridorOverlay.fillStyle(0x00b894, 0.15);
        this.corridorOverlay.fillRect(170, 560, 300, 20);
        this.corridorOverlay.fillStyle(0x00b894, 0.6);
        this.corridorOverlay.fillRect(170, 560, 300 * progress, 20);
      }
      if (this.corridorText) {
        const pct = Math.floor(progress * 100);
        this.corridorText.setText(`DECONTAMINATING... ${pct}%`);
      }
      if (progress >= 1) {
        this.deconActive = false;
        this.deconComplete = true;
        this.exitLocked = false;
        if (this.corridorText) {
          this.corridorText.setText('Decontamination complete.\nExiting...');
          this.corridorText.setColor('#00b894');
        }
        if (this.corridorOverlay) {
          this.corridorOverlay.clear();
          this.corridorOverlay.fillStyle(0x00b894, 0.3);
          this.corridorOverlay.fillRect(170, 560, 300, 20);
        }
      }
    }

    if (this.player.y > 580) {
      if (!this.deconActive && !this.deconComplete) {
        this.startDecontamination();
      } else if (this.deconComplete) {
        this.corridorText?.destroy();
        this.corridorOverlay?.destroy();
        SceneTransition.fadeOutIn(this, MAP_SCENE_KEYS[gameStore.getCurrentMap()] || 'AtomMeadowsScene');
      }
    }
  }

  private drawRoom() {
    const g = this.add.graphics();

    // Base pristine floor
    g.fillStyle(0x1a252c, 1);
    g.fillRect(0, 0, 640, 640);

    // Floor texture - Clean tiles
    g.fillStyle(0x23313a, 1);
    g.fillRect(20, 20, 600, 520);

    // Sci-fi grid floor
    g.lineStyle(1, 0x00cec9, 0.15); // Cyan glow lines
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 15; col++) {
        g.strokeRect(20 + col * 40, 20 + row * 40, 40, 40);
        // Little corner nodes
        if (row > 0 && col > 0) {
          g.fillStyle(0x00cec9, 0.3);
          g.fillRect(19 + col * 40, 19 + row * 40, 2, 2);
        }
      }
    }

    // High-tech glowing room borders
    g.fillStyle(0x0a151c, 0.9);
    g.fillRect(20, 20, 600, 6);
    g.fillRect(20, 20, 6, 520);
    g.fillRect(614, 20, 6, 520);
    g.fillRect(20, 534, 600, 6);
    
    // Neon accent strips
    g.fillStyle(0x00cec9, 0.6);
    g.fillRect(22, 22, 596, 2);
    g.fillRect(22, 536, 596, 2);

    // Chemical Storage Racks (Metal, clean)
    g.fillStyle(0x34495e, 1); // Steel frame
    g.fillRect(30, 80, 70, 170);
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(540, 80, 70, 170);
    
    // Metallic trim and shelves
    g.lineStyle(2, 0xbdc3c7, 0.8);
    g.strokeRect(30, 80, 70, 170);
    g.strokeRect(540, 80, 70, 170);

    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x7f8c8d, 1);
      g.fillRect(30, 110 + i * 40, 70, 4);
      g.fillRect(540, 110 + i * 40, 70, 4);
      // Under-shelf LED strip
      g.fillStyle(0x00cec9, 0.3);
      g.fillRect(30, 114 + i * 40, 70, 2);
      g.fillRect(540, 114 + i * 40, 70, 2);
    }

    // Main Lab Workbench (Stainless steel and glass)
    g.fillStyle(0x95a5a6, 1); // Steel base
    g.fillRoundedRect(180, 320, 280, 70, 6);
    g.fillStyle(0x7f8c8d, 1); // Bevel
    g.fillRoundedRect(180, 320, 280, 70, { tl: 0, tr: 0, bl: 6, br: 6 } as any);
    
    // Glass top
    g.fillStyle(0xecf0f1, 0.85);
    g.fillRoundedRect(185, 325, 270, 60, 4);
    // Glass reflection
    g.fillStyle(0xffffff, 0.4);
    g.fillRect(185, 330, 270, 10);
    g.lineStyle(2, 0x00cec9, 0.5);
    g.strokeRoundedRect(185, 325, 270, 60, 4);

    this.drawCorridor(g);
    this.drawDecor(g);
  }

  private drawCorridor(g: Phaser.GameObjects.Graphics) {
    const cy = 540;

    g.fillStyle(0x0a151c, 1);
    g.fillRect(20, cy, 600, 100);

    g.fillStyle(0x1a252c, 0.8);
    g.fillRect(20, cy, 600, 100);

    // Decon Chamber Floor Grates
    g.lineStyle(1, 0x34495e, 0.8);
    for (let x = 30; x < 610; x += 10) {
      g.lineBetween(x, cy, x, cy + 96);
    }

    g.fillStyle(0x0a151c, 0.9);
    g.fillRect(20, cy, 600, 6);
    g.fillRect(20, cy, 6, 100);
    g.fillRect(614, cy, 6, 100);
    g.fillRect(20, cy + 94, 600, 6);

    // Hazard Stripes
    g.fillStyle(0xf1c40f, 0.6);
    for (let x = 30; x < 620; x += 40) {
      g.fillTriangle(x, cy + 6, x + 20, cy + 6, x + 10, cy + 18);
      g.fillStyle(0x2d3436, 0.6);
      g.fillTriangle(x + 20, cy + 6, x + 40, cy + 6, x + 30, cy + 18);
      g.fillStyle(0xf1c40f, 0.6);
    }

    // Airlock Doors
    g.fillStyle(0x2c3e50, 0.9);
    g.fillRect(40, cy + 16, 60, 68);
    g.fillRect(540, cy + 16, 60, 68);
    g.lineStyle(2, 0x00cec9, 0.4);
    g.strokeRect(40, cy + 16, 60, 68);
    g.strokeRect(540, cy + 16, 60, 68);

    // Center Door Lock Mechanism
    g.fillStyle(0x34495e, 0.9);
    g.fillRect(300, cy + 20, 40, 56);
    g.lineStyle(1, 0xbdc3c7, 0.5);
    g.strokeRect(300, cy + 20, 40, 56);

    // Indicator Light
    g.fillStyle(0x636e72, 0.8);
    g.fillCircle(320, cy + 30, 8);
    g.fillStyle(this.exitLocked ? 0xe74c3c : 0x00b894, 0.9);
    g.fillCircle(320, cy + 30, 5);
  }

  private addCollisionWalls() {
    const g = this.walls;
    g.create(20, 310, 'tile_wall')?.setVisible(false).setSize(10, 620);
    g.create(640, 310, 'tile_wall')?.setVisible(false).setSize(10, 620);
    g.create(320, 20, 'tile_wall')?.setVisible(false).setSize(640, 10);
    g.create(320, 615, 'tile_wall')?.setVisible(false).setSize(640, 10);

    g.create(55, 180, 'tile_wall')?.setVisible(false).setSize(20, 140);
    g.create(560, 180, 'tile_wall')?.setVisible(false).setSize(90, 150);
    g.create(320, 350, 'tile_wall')?.setVisible(false).setSize(290, 24);
  }

  private drawDecor(g: Phaser.GameObjects.Graphics) {
    // Holographic Displays / Monitors on the back wall
    g.fillStyle(0x2c3e50, 0.8); // Monitor frames
    g.fillRoundedRect(150, 40, 160, 100, 4);
    g.fillRoundedRect(330, 40, 160, 100, 4);

    // Monitor screens (glowing)
    g.fillStyle(0x0984e3, 0.15);
    g.fillRect(155, 45, 150, 90);
    g.fillStyle(0x00cec9, 0.15);
    g.fillRect(335, 45, 150, 90);
    
    // Screen contents (data lines)
    g.lineStyle(2, 0x74b9ff, 0.8);
    for (let i = 0; i < 5; i++) {
      g.lineBetween(160, 60 + i * 15, 160 + Phaser.Math.Between(20, 130), 60 + i * 15);
    }
    // Sine wave on the second monitor
    g.lineStyle(2, 0x55efc4, 0.8);
    g.beginPath();
    for (let x = 0; x < 140; x += 5) {
      if (x === 0) g.moveTo(340 + x, 90 + Math.sin(x * 0.1) * 20);
      else g.lineTo(340 + x, 90 + Math.sin(x * 0.1) * 20);
    }
    g.strokePath();

    // Beautiful Beakers & Vials on the left shelf
    const vialColors = [0x0984e3, 0xd63031, 0x00b894, 0xfdc128, 0x9b59b6];
    for (let i = 0; i < 12; i++) {
      const rx = 35 + (i % 3) * 18;
      const ry = 90 + Math.floor(i / 3) * 40;
      const col = vialColors[i % vialColors.length];
      
      // Glass body
      g.fillStyle(0xffffff, 0.2);
      g.fillRoundedRect(rx, ry, 12, 16, 3);
      // Liquid
      g.fillStyle(col, 0.8);
      g.fillRoundedRect(rx + 1, ry + 6, 10, 9, 2);
      // Highlight
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(rx + 2, ry + 2, 2, 12);
      // Cap/Cork
      g.fillStyle(0x2d3436, 1);
      g.fillRect(rx + 3, ry - 3, 6, 4);
    }

    // Equipment on the right shelf (Microscopes / Centrifuges)
    g.fillStyle(0xbdc3c7, 1);
    g.fillRect(550, 90, 20, 16); // Centrifuge base
    g.fillStyle(0xecf0f1, 1);
    g.fillEllipse(560, 90, 20, 8); // Centrifuge top
    
    g.fillStyle(0x34495e, 1);
    g.fillRect(555, 130, 20, 16); // Storage box
    g.lineStyle(1, 0x00cec9, 0.5);
    g.strokeRect(555, 130, 20, 16);

    // High-tech Workbench Decor
    g.fillStyle(0x2d3436, 0.9);
    g.fillRoundedRect(280, 335, 80, 30, 4); // Heating plate
    g.lineStyle(1, 0x00cec9, 0.5);
    g.strokeRoundedRect(280, 335, 80, 30, 4);
    
    // Circular burner/reactor core
    g.fillStyle(0x0a151c, 1);
    g.fillCircle(320, 350, 12);
    g.lineStyle(2, 0x0984e3, 0.8);
    g.strokeCircle(320, 350, 12);
  }

  private createAnimatedDecor() {
    // Bubbles coming out of the decorative flasks
    for (let i = 0; i < 5; i++) {
      const bx = 47 + i * 14;
      const by = 118 + (i % 2) * 28;
      
      const bubbles = this.add.particles(bx, by, 'icon_particle', {
        speed: { min: 5, max: 15 },
        angle: { min: 260, max: 280 },
        scale: { start: 0.2, end: 0 },
        lifespan: 1500,
        blendMode: 'ADD',
        tint: [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6][i],
        frequency: Phaser.Math.Between(300, 800),
      });
      bubbles.setDepth(10);
    }

    // Flame for the burner
    const flame = this.add.particles(320, 226, 'icon_particle', {
      speed: { min: 10, max: 20 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 600,
      blendMode: 'ADD',
      tint: 0x3498db, // Blue hot flame
      frequency: 50,
    });
    flame.setDepth(10);

    // === Periodic Table Pulsing Glow ===
    const ptGlow = this.add.circle(260, 120, 60, 0x3498db, 0.04).setDepth(8);
    this.tweens.add({
      targets: ptGlow, alpha: 0.01, scaleX: 1.2, scaleY: 1.2,
      duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
    // Highlight random element cells
    for (let i = 0; i < 4; i++) {
      const ex = 170 + Phaser.Math.Between(0, 4) * 25;
      const ey = 65 + Phaser.Math.Between(0, 4) * 20;
      const dot = this.add.circle(ex + 9, ey + 7, 2, 0x00cec9, 0.3).setDepth(9);
      this.tweens.add({
        targets: dot, alpha: 0, duration: 800 + Phaser.Math.Between(0, 600),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 3000)
      });
    }

    // === Electric Sparks on Equipment Racks ===
    const sparkPositions = [
      { x: 540, y: 130 }, { x: 565, y: 125 }, { x: 580, y: 135 },
    ];
    for (const sp of sparkPositions) {
      // Intermittent spark burst
      const emitter = this.add.particles(sp.x, sp.y, 'icon_particle', {
        speed: { min: 15, max: 40 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 200,
        blendMode: 'ADD',
        tint: [0xf1c40f, 0xffffff, 0x00cec9],
        frequency: -1, // manual emit
        quantity: 3,
      }).setDepth(11);

      // Emit sparks periodically
      this.time.addEvent({
        delay: 2000 + Phaser.Math.Between(0, 3000),
        loop: true,
        callback: () => {
          emitter.emitParticle(Phaser.Math.Between(2, 5));
        }
      });
    }

    // === Steam rising from the workbench ===
    if (!this.textures.exists('steam_particle')) {
      const sg = this.add.graphics();
      sg.fillStyle(0xffffff, 0.15);
      sg.fillCircle(4, 4, 4);
      sg.generateTexture('steam_particle', 8, 8);
      sg.destroy();
    }
    this.add.particles(320, 340, 'steam_particle', {
      x: { min: -60, max: 60 },
      speed: { min: 3, max: 10 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.5, end: 1.2 },
      alpha: { start: 0.12, end: 0 },
      lifespan: 3000,
      blendMode: 'ADD',
      frequency: 500,
    }).setDepth(10);

    // === Subtle ambient hum glow around the workbench ===
    const benchGlow = this.add.circle(320, 365, 80, 0x6c5ce7, 0.03).setDepth(7);
    this.tweens.add({
      targets: benchGlow, alpha: 0.01, scaleX: 1.1, scaleY: 1.1,
      duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }

  private createShelfFloorMarker() {
    const g = this.add.graphics().setDepth(4);
    const zx = 70, zy = 170, zw = 80, zh = 60;

    g.fillStyle(0x00cec9, 0.06);
    g.fillRoundedRect(zx, zy, zw, zh, 6);
    g.lineStyle(1, 0x00cec9, 0.15);
    g.strokeRoundedRect(zx, zy, zw, zh, 6);

    this.tweens.add({
      targets: g,
      alpha: 0.2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const standHere = this.add.text(110, 200, 'Stand here & press [E]', {
      fontFamily: '"Inter"', fontSize: '8px', color: '#00cec9',
    }).setOrigin(0.5).setDepth(5).setAlpha(0.4);

    this.tweens.add({
      targets: standHere,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
  }

  private createBenchFloorMarker() {
    const g = this.add.graphics().setDepth(4);
    const zx = 170, zy = 365, zw = 300, zh = 40;

    g.fillStyle(0xf1c40f, 0.06);
    g.fillRoundedRect(zx, zy, zw, zh, 6);
    g.lineStyle(1, 0xf1c40f, 0.15);
    g.strokeRoundedRect(zx, zy, zw, zh, 6);

    this.tweens.add({
      targets: g,
      alpha: 0.2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const standHere = this.add.text(320, 390, 'Stand here & press [E]', {
      fontFamily: '"Inter"', fontSize: '8px', color: '#f1c40f',
    }).setOrigin(0.5).setDepth(5).setAlpha(0.4);

    this.tweens.add({
      targets: standHere,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
  }

  private createShelfPrompt() {
    const cx = 75;
    const cy = 160;

    const bg = this.add.graphics().setDepth(20);
    bg.fillStyle(0x000000, 0.55);
    bg.fillRoundedRect(cx - 66, cy - 18, 132, 36, 8);
    bg.lineStyle(2, 0x00cec9, 0.6);
    bg.strokeRoundedRect(cx - 66, cy - 18, 132, 36, 8);

    const icon = this.add.text(cx - 42, cy, '📋', { fontSize: '20px' }).setOrigin(0.5).setDepth(21);

    const label = this.add.text(cx + 8, cy, 'Take Reagent', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#dfe6e9', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(21);

    const keyHint = this.add.text(cx + 8, cy - 20, '[ E ]', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#00cec9',
    }).setOrigin(0.5).setDepth(21);

    const arrow = this.add.text(cx, cy + 28, '▼', {
      fontFamily: '"Inter"', fontSize: '18px', color: '#00cec9',
    }).setOrigin(0.5).setDepth(21);

    this.tweens.add({
      targets: [bg, icon, label, keyHint, arrow],
      y: '+=6',
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const glow = this.add.circle(cx, cy, 80, 0x00cec9, 0.04).setDepth(19);
    this.tweens.add({
      targets: glow,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0.01,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.particles(cx, cy, 'icon_particle', {
      speed: { min: 6, max: 16 },
      angle: { min: 220, max: 320 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 1400,
      blendMode: 'ADD',
      tint: [0x00cec9, 0x6c5ce7, 0x00b894],
      frequency: 400,
    }).setDepth(20);
  }

  private createBenchPrompt() {
    const cx = 320;
    const cy = 330;

    const arrow = this.add.text(cx, cy - 10, '▼', {
      fontFamily: '"Inter"', fontSize: '16px', color: '#f1c40f',
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.tweens.add({
      targets: arrow,
      y: cy - 22,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 3000,
    });

    const pulse = this.add.circle(cx, cy + 20, 18, 0x6c5ce7, 0.08).setDepth(19);
    this.tweens.add({
      targets: pulse,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 2000,
      repeat: -1,
      delay: 3000,
    });
  }

  private handleInteraction() {
    const px = this.player.x;
    const py = this.player.y;

    if (gameStore.getCurrentMap() === 'prismHeights' && this.isAtLightTable(px, py)) {
      openLightPuzzle(this);
      return;
    }

    if (this.isNear(px, py, this.assistant.x, this.assistant.y, 40)) {
      if (!gameStore.hasVisitedInterior('LabInteriorScene')) {
        gameStore.markInteriorVisited('LabInteriorScene');
        const data = this.cache.json.get('npcs') as Record<string, any>;
        this.dialogueBox.show('Lab Assistant', data.lab_assistant.dialogue.default, '#00b894');
      } else {
        this.openReagentSelectorFromAssistant();
      }
      return;
    }

    if (this.isInZone(px, py, 70, 115, 80, 140)) {
      if (this.state === 'idle') {
        openReagentSelector(this, {
          onSelectReagent: (symbol) => {
            for (const [id, data] of Object.entries(this.craftingItems)) {
              if (data.symbol === symbol && (data.type === 'reagent' || data.type === 'molecule' || data.type === 'material')) {
                gameStore.removeFromInventory(id, 1);
                this.carriedItemId = id;
                break;
              }
            }
            this.carriedReagent = symbol;
            this.state = 'carrying';
            if (this.statusText) this.statusText.setText(`Carrying: ${symbol}\nBring it to the workbench.`);
          },
          getStatusText: () => this.statusText,
          getCraftingItems: () => this.craftingItems,
        });
      } else if (this.state === 'carrying') {
        this.statusText.setText('Already carrying a reagent!\nBring it to the bench.');
      }
      return;
    }

    if (this.isInZone(px, py, 170, 355, 300, 55)) {
      if (this.state === 'carrying' && this.carriedReagent) {
        this.addToBench();
      } else if (this.state === 'idle' && this.benchReagents.length > 0) {
        this.state = 'craft_prompt';
        this.showCraftPrompt();
      } else if (this.state === 'idle') {
        this.statusText.setText('Pick up reagents from the shelf first.');
      }
      return;
    }

  }

  private openReagentSelectorFromAssistant() {
    if (this.state !== 'idle') {
      this.statusText.setText(this.state === 'carrying' ? 'Already carrying a reagent!' : 'Finish crafting first.');
      return;
    }
    openReagentSelector(this, {
      onSelectReagent: (symbol) => {
        for (const [id, data] of Object.entries(this.craftingItems)) {
          if (data.symbol === symbol && (data.type === 'reagent' || data.type === 'molecule' || data.type === 'material')) {
            gameStore.removeFromInventory(id, 1);
            this.carriedItemId = id;
            break;
          }
        }
        this.carriedReagent = symbol;
        this.state = 'carrying';
        if (this.statusText) this.statusText.setText(`Carrying: ${symbol}\nBring it to the workbench.`);
      },
      getStatusText: () => this.statusText,
      getCraftingItems: () => this.craftingItems,
    });
  }

  private startDecontamination() {
    this.deconActive = true;
    this.deconTimer = 0;

    this.corridorOverlay = this.add.graphics().setDepth(15);
    this.corridorText = this.add.text(320, 595, 'DECONTAMINATING... 0%', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#00b894',
      align: 'center',
    }).setOrigin(0.5).setDepth(16);

    this.statusText.setText('Airlock decontaminating...');
  }

  private addToBench() {
    if (!this.carriedReagent) return;
    this.benchReagents.push(this.carriedReagent);
    this.benchItemIds.push(this.carriedItemId || '');
    this.carriedReagent = null;
    this.carriedItemId = null;
    this.state = 'idle';

    if (this.carriedIcon) {
      this.carriedIcon.destroy();
      this.carriedIcon = null;
    }

    const slotIdx = this.benchReagents.length - 1;
    const angle = (slotIdx * Math.PI * 2) / 5 - Math.PI / 2;
    const cx = 320;
    const cy = 365;
    const r = 60;

    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;

    const g = this.add.graphics();
    g.fillStyle(0x1a1a3e, 0.9);
    g.fillCircle(0, 0, 14);
    g.lineStyle(2, 0x6c5ce7, 0.6);
    g.strokeCircle(0, 0, 14);

    const txt = this.add.text(0, 0, this.benchReagents[slotIdx], {
      fontFamily: '"Inter"', fontSize: '16px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const container = this.add.container(px, py, [g, txt]);
    container.setScale(0);
    this.tweens.add({ targets: container, scale: 1, duration: 200, ease: 'Back.easeOut' });

    this.benchIcons.push(container);

    this.statusText.setText(`Bench: ${this.benchReagents.join(' + ')}\nPress E at bench to craft.`);
  }

  private showCraftPrompt() {
    const { width, height } = this.cameras.main;
    const cx = width * 0.5 - 120;
    const overlay = this.add.rectangle(0, 0, width, height, 0x000, 0.6).setOrigin(0).setDepth(50);

    const panel = this.add.graphics().setDepth(51);
    panel.fillStyle(0x1a1a3e, 0.95);
    panel.fillRoundedRect(cx - 150, height / 2 - 80, 300, 160, 12);
    panel.lineStyle(2, 0x6c5ce7, 0.5);
    panel.strokeRoundedRect(cx - 150, height / 2 - 80, 300, 160, 12);

    const closeIcn = this.add.text(cx + 130, height / 2 - 70, '✕', {
      fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675',
    }).setOrigin(0.5).setDepth(55).setInteractive({ useHandCursor: true });

    const t = this.add.text(cx, height / 2 - 55, 'Craft these reagents?', {
      fontFamily: '"Inter"', fontSize: '15px', color: '#f1c40f', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);

    const reagentsTxt = this.add.text(cx, height / 2 - 20, this.benchReagents.join(' + '), {
      fontFamily: '"Inter"', fontSize: '18px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);

    const craftG = this.add.graphics().setDepth(52);
    craftG.fillStyle(0x6c5ce7, 0.9);
    craftG.fillRoundedRect(cx - 90, height / 2 + 20, 80, 30, 6);
    const craftT = this.add.text(cx - 50, height / 2 + 35, 'CRAFT', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(53);

    const craftZ = this.add.zone(cx - 50, height / 2 + 35, 80, 30)
      .setInteractive({ useHandCursor: true }).setDepth(54);
    craftZ.on('pointerdown', () => {
      closeIcn.destroy();
      overlay.destroy();
      panel.destroy();
      t.destroy();
      reagentsTxt.destroy();
      craftG.destroy();
      craftT.destroy();
      craftZ.destroy();
      clearG.destroy();
      clearT.destroy();
      clearZ.destroy();
      this.executeCraft();
    });

    const clearG = this.add.graphics().setDepth(52);
    clearG.fillStyle(0x2d3436, 0.9);
    clearG.fillRoundedRect(cx + 10, height / 2 + 20, 80, 30, 6);
    const clearT = this.add.text(cx + 50, height / 2 + 35, 'CLEAR', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#ff7675', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(53);
    const clearZ = this.add.zone(cx + 50, height / 2 + 35, 80, 30)
      .setInteractive({ useHandCursor: true }).setDepth(54);
    clearZ.on('pointerdown', () => {
      closeIcn.destroy();
      overlay.destroy();
      panel.destroy();
      t.destroy();
      reagentsTxt.destroy();
      craftG.destroy();
      craftT.destroy();
      craftZ.destroy();
      clearG.destroy();
      clearT.destroy();
      clearZ.destroy();
      this.clearBench();
    });

    closeIcn.on('pointerdown', () => {
      closeIcn.destroy();
      overlay.destroy();
      panel.destroy();
      t.destroy();
      reagentsTxt.destroy();
      craftG.destroy();
      craftT.destroy();
      craftZ.destroy();
      clearG.destroy();
      clearT.destroy();
      clearZ.destroy();
    });
  }

  private executeCraft() {
    const result = this.craftingSystem.craft(this.benchReagents);
    if (result.success && result.result) {
      this.startMinigame(result);
    } else {
      this.cameras.main.shake(200, 0.01);
      this.showResultPopout(result.error || 'Reaction failed.', '#ff7675');
      for (const id of this.benchItemIds) {
        if (id) gameStore.addToInventory(id, 1);
      }
      this.clearBenchIcons();
      this.benchReagents = [];
      this.benchItemIds = [];
      this.state = 'idle';
    }
  }

  private startMinigame(craftResult: any) {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0).setDepth(100);
    
    const panel = this.add.graphics().setDepth(101);
    panel.fillStyle(0x1a1a3e, 0.95);
    panel.fillRoundedRect(width / 2 - 100, height / 2 - 150, 200, 300, 12);
    panel.lineStyle(2, 0x6c5ce7, 0.5);
    panel.strokeRoundedRect(width / 2 - 100, height / 2 - 150, 200, 300, 12);

    const title = this.add.text(width / 2, height / 2 - 130, 'Regulate Temp!', {
      fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#f1c40f'
    }).setOrigin(0.5).setDepth(102);
    
    const inst = this.add.text(width / 2, height / 2 - 105, 'Hold [SPACE] to heat.\nKeep in green zone.', {
      fontFamily: '"Inter"', fontSize: '10px', color: '#fff', align: 'center'
    }).setOrigin(0.5).setDepth(102);

    const state = gameStore.getState();
    const bonding = state.playerData.skills['bonding'] || 0;
    const equationBalancing = state.playerData.skills['equation_balancing'] || 0;
    const hasLabCoat = state.playerData.equippedGear.includes('lab_coat');

    const coolingRate = 0.03 - (bonding * 0.003); 
    const targetWidth = 60 + (equationBalancing * 10); 
    const targetTempWidth = targetWidth / 1.8; 
    const minTemp = 50 - (targetTempWidth / 2);
    const maxTemp = 50 + (targetTempWidth / 2);
    const progressSpeed = hasLabCoat ? 0.0575 : 0.05;

    // Temperature bar
    const barBg = this.add.rectangle(width / 2, height / 2 + 20, 30, 180, 0x2d3436).setDepth(102);
    const targetZone = this.add.rectangle(width / 2, height / 2 + 20, 30, targetWidth, 0x00b894, 0.5).setDepth(103);
    const indicator = this.add.rectangle(width / 2, height / 2 + 80, 40, 10, 0xff7675).setDepth(104);

    let temp = 0; // 0 to 100
    let progress = 0;

    const BAR_BOTTOM = height / 2 + 110;
    const BAR_HEIGHT = 180;

    const progBg = this.add.rectangle(width / 2 - 80, height / 2 + 20, 10, BAR_HEIGHT, 0x2d3436).setDepth(102);
    const progFill = this.add.rectangle(width / 2 - 80, BAR_BOTTOM, 10, 0, 0x0984e3)
      .setDepth(103);

    let isPlaying = true;
    const spaceKey = this.input.keyboard!.addKey('SPACE');
    let lastFlameTime = 0;
    
    const minigameUpdate = (_time: number, delta: number) => {
      if (!isPlaying) return;
      
      // Cooling
      temp -= delta * coolingRate;
      if (temp < 0) temp = 0;
      
      // Heating (hold SPACE for continuous)
      if (spaceKey.isDown) {
        temp += delta * 0.04;
        if (temp > 100) temp = 100;
        
        // Flame particle every ~200ms while held
        if (time - lastFlameTime > 200) {
          lastFlameTime = time;
          const f = this.add.particles(width / 2, height / 2 + 120, 'icon_particle', {
            speed: 20, angle: {min: 250, max: 290}, scale: {start:0.3, end:0}, lifespan: 300, blendMode: 'ADD', tint: 0xe74c3c
          }).setDepth(105);
          this.time.delayedCall(300, () => f.destroy());
        }
      }
      
      // Update indicator Y
      // temp 0 => bottom (height/2 + 110), temp 100 => top (height/2 - 70)
      indicator.y = (height / 2 + 110) - (temp / 100) * 180;
      
      // Check if in target zone
      if (temp > minTemp && temp < maxTemp) {
        progress += delta * progressSpeed;
        targetZone.setFillStyle(0x55efc4, 0.8);
      } else {
        progress -= delta * 0.02;
        targetZone.setFillStyle(0x00b894, 0.5);
      }
      if (progress < 0) progress = 0;
      
      const fillHeight = (progress / 100) * BAR_HEIGHT;
      progFill.height = fillHeight;
      progFill.y = BAR_BOTTOM - fillHeight;
      
      if (progress >= 100) {
        isPlaying = false;
        this.events.off('update', minigameUpdate);
        
        // Success
        title.setText('SUCCESS!');
        title.setColor('#00b894');
        
        this.time.delayedCall(1000, () => {
          overlay.destroy(); panel.destroy(); title.destroy(); inst.destroy();
          barBg.destroy(); targetZone.destroy(); indicator.destroy();
          progBg.destroy(); progFill.destroy();
          this.finishCraft(craftResult);
        });
      }
    };

    this.events.on('update', minigameUpdate);
  }

  private finishCraft(result: any) {
    const craftedItemId = result.result.outputItemId;

    if (craftedItemId) {
      gameStore.addToInventory(craftedItemId, 1);
      gameStore.unlockChemDex(result.result.output);

      this.sound.play('sfx_craft', { volume: 0.6 });
      this.cameras.main.flash(200, 100, 255, 200);
      this.showResultPopout(`Success!\n${result.result.outputName}`, '#00b894');
      this.statusText.setText(`Crafted: ${result.result.outputName}!`);
    }

    this.clearBenchIcons();
    this.benchReagents = [];
    this.benchItemIds = [];
    this.state = 'idle';
  }

  private showResultPopout(msg: string, color: string) {
    const { width, height } = this.cameras.main;
    const t = this.add.text(width / 2, height / 2 - 40, msg, {
      fontFamily: '"Inter"', fontSize: '18px', color, fontStyle: 'bold',
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: t, alpha: 0, y: t.y - 30, duration: 2000, delay: 1200,
      onComplete: () => t.destroy(),
    });
  }

  private clearBench() {
    for (const id of this.benchItemIds) {
      if (id) gameStore.addToInventory(id, 1);
    }
    if (this.carriedItemId) {
      gameStore.addToInventory(this.carriedItemId, 1);
      this.carriedItemId = null;
      this.carriedReagent = null;
      if (this.carriedIcon) {
        this.carriedIcon.destroy();
        this.carriedIcon = null;
      }
    }
    this.clearBenchIcons();
    this.benchReagents = [];
    this.benchItemIds = [];
    this.state = 'idle';
    this.statusText.setText('Bench cleared.');
  }

  private clearBenchIcons() {
    for (const c of this.benchIcons) c.destroy();
    this.benchIcons = [];
  }

  private isNear(x1: number, y1: number, x2: number, y2: number, dist: number): boolean {
    return Phaser.Math.Distance.Between(x1, y1, x2, y2) < dist;
  }

  private isInZone(px: number, py: number, zx: number, zy: number, zw: number, zh: number): boolean {
    return px >= zx && px <= zx + zw && py >= zy && py <= zy + zh;
  }
}