import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DialogueBox } from '../ui/DialogueBox';
import { CraftingSystem } from '../systems/CraftingSystem';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';
import { RecipeData, ItemData, Direction } from '../data/types';
import { openReagentSelector, ReagentSelectorCallbacks } from '../overlays/ReagentSelector';
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
  private benchReagents: string[] = [];
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
    this.benchReagents = [];
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

    this.assistant = new NPC(this, 480, 240, 'lab_assistant', 'Lab Assistant', 'npc_lab_assistant', null);
    this.physics.add.collider(this.player, this.assistant);

    this.dialogueBox = new DialogueBox(this);
    this.player.onInteract(() => this.handleInteraction());

    this.benchGroup = this.add.group();

    this.statusText = this.add.text(480, 80, '', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#bcc6db', align: 'center',
      wordWrap: { width: 180 }, lineSpacing: 3,
    }).setOrigin(0.5);

    this.drawDecor();
    this.createAnimatedDecor();
    addHelpButton(this, [
      'Pick up reagents from the shelf\non the left wall.',
      'Bring them to the workbench\nin the center to craft molecules.',
      'Exit through the corridor —\ndecontamination runs automatically.',
    ]);
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
        SceneTransition.fadeOutIn(this, 'GameScene');
      }
    }
  }

  private drawRoom() {
    const g = this.add.graphics();

    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(0, 0, 640, 640);

    g.fillStyle(0x2a2a44, 1);
    g.fillRect(20, 20, 600, 520);

    g.fillStyle(0x3a3a54, 0.3);
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 15; col++) {
        if ((row + col) % 2 === 0) {
          g.fillRect(24 + col * 40, 24 + row * 40, 40, 40);
        }
      }
    }

    g.fillStyle(0x2a1a0e, 0.5);
    g.fillRect(20, 20, 600, 4);
    g.fillRect(20, 20, 4, 520);
    g.fillRect(616, 20, 4, 520);
    g.fillRect(20, 536, 600, 4);

    g.fillStyle(0x3d2b1f, 0.6);
    for (let i = 0; i < 3; i++) {
      g.fillRect(24, 100 + i * 140, 100, 6);
    }

    g.fillStyle(0x8B4513, 0.8);
    g.fillRect(40, 110, 70, 140);

    g.fillStyle(0x3d2b1f, 0.4);
    g.fillRect(40, 110, 70, 4);
    g.fillRect(40, 140, 70, 4);
    g.fillRect(40, 170, 70, 4);
    g.fillRect(40, 200, 70, 4);
    g.fillRect(40, 230, 70, 4);

    g.fillStyle(0x4a3a2a, 0.8);
    g.fillRect(520, 110, 80, 140);

    g.fillStyle(0x5a4a3a, 0.4);
    g.fillRect(524, 114, 72, 132);

    g.fillStyle(0x3a2a1a, 0.5);
    g.fillRect(520, 110, 80, 3);

    g.fillStyle(0x4a3a2a, 0.5);
    g.fillRect(180, 340, 280, 50);

    g.lineStyle(2, 0x3a3a4a, 0.5);
    g.strokeRect(180, 340, 280, 50);

    g.fillStyle(0x5a5a6a, 0.2);
    g.fillRect(200, 350, 240, 30);

    g.fillStyle(0xff6b35, 0.08);
    g.fillCircle(320, 380, 14);

    this.drawCorridor(g);
  }

  private drawCorridor(g: Phaser.GameObjects.Graphics) {
    const cy = 540;

    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(20, cy, 600, 100);

    g.fillStyle(0x2a2a44, 0.5);
    g.fillRect(20, cy, 600, 100);

    g.fillStyle(0x2a1a0e, 0.5);
    g.fillRect(20, cy, 600, 4);
    g.fillRect(20, cy, 4, 100);
    g.fillRect(616, cy, 4, 100);
    g.fillRect(20, cy + 96, 600, 4);

    g.fillStyle(0xffd700, 0.15);
    for (let x = 30; x < 620; x += 40) {
      g.fillTriangle(x, cy, x + 20, cy, x + 10, cy + 12);
      g.fillStyle(0x2d3436, 0.15);
      g.fillTriangle(x + 20, cy, x + 40, cy, x + 30, cy + 12);
      g.fillStyle(0xffd700, 0.15);
    }

    g.fillStyle(0x4a4a5a, 0.6);
    g.fillRect(40, cy + 16, 60, 68);
    g.fillRect(540, cy + 16, 60, 68);
    g.fillStyle(0x3a3a4a, 0.4);
    for (let i = 0; i < 4; i++) {
      g.fillRect(44, cy + 20 + i * 16, 10, 10);
      g.fillRect(586, cy + 20 + i * 16, 10, 10);
    }

    g.fillStyle(0x2d3436, 0.8);
    g.fillRect(300, cy + 20, 40, 56);

    g.fillStyle(0x636e72, 0.6);
    g.fillCircle(320, cy + 28, 6);
    g.fillStyle(this.exitLocked ? 0xe74c3c : 0x00b894, 0.8);
    g.fillCircle(320, cy + 28, 4);

    g.fillStyle(0x4a4a5a, 0.8);
    g.fillRect(300, cy + 72, 40, 12);
    g.fillStyle(0x636e72, 0.4);
    g.fillCircle(310, cy + 78, 2);
    g.fillCircle(320, cy + 78, 2);
    g.fillCircle(330, cy + 78, 2);
  }

  private addCollisionWalls() {
    const g = this.walls;
    g.create(20, 310, 'tile_wall')?.setVisible(false).setSize(10, 620);
    g.create(640, 310, 'tile_wall')?.setVisible(false).setSize(10, 620);
    g.create(320, 20, 'tile_wall')?.setVisible(false).setSize(640, 10);
    g.create(320, 615, 'tile_wall')?.setVisible(false).setSize(640, 10);

    g.create(75, 180, 'tile_wall')?.setVisible(false).setSize(80, 150);
    g.create(560, 180, 'tile_wall')?.setVisible(false).setSize(90, 150);
    g.create(320, 365, 'tile_wall')?.setVisible(false).setSize(290, 60);
  }

  private drawDecor() {
    const g = this.add.graphics();

    g.fillStyle(0x6a8aaa, 0.15);
    g.fillCircle(75, 170, 14);
    g.fillCircle(75, 200, 14);
    g.fillCircle(75, 230, 14);

    const bottleColors = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6];
    for (let i = 0; i < 5; i++) {
      const bx = 42 + i * 14;
      const by = 118 + (i % 2) * 28;
      const bc = bottleColors[i];
      g.fillStyle(bc, 0.3);
      g.fillRoundedRect(bx, by, 10, 18, 3);
      g.fillStyle(0xffffff, 0.08);
      g.fillRect(bx + 2, by + 2, 3, 12);
      g.fillStyle(bc, 0.2);
      g.fillCircle(bx + 5, by - 2, 3);
    }

    g.fillStyle(0x4a6a8a, 0.15);
    g.fillRect(530, 125, 8, 36);
    g.fillRect(560, 120, 8, 42);
    g.fillRect(575, 130, 8, 30);

    g.lineStyle(1, 0x6c5ce7, 0.2);
    g.lineBetween(40, 340, 250, 340);
    g.lineBetween(390, 340, 600, 340);

    g.fillStyle(0x2d3436, 0.3);
    g.fillRect(160, 55, 200, 120);
    g.lineStyle(1, 0x636e72, 0.2);
    g.strokeRect(160, 55, 200, 120);

    g.fillStyle(0x3498db, 0.12);
    const elements = [
      [170, 65], [195, 65], [220, 65], [245, 65], [270, 65],
      [170, 85], [195, 85], [220, 85], [245, 85], [270, 85],
      [170, 105], [195, 105], [220, 105], [245, 105], [270, 105],
      [170, 125], [195, 125], [220, 125], [245, 125], [270, 125],
      [170, 145], [195, 145], [220, 145], [245, 145], [270, 145],
    ];
    const elColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22, 0x2c3e50];
    for (const [ex, ey] of elements) {
      g.fillStyle(elColors[Math.floor(Math.random() * elColors.length)], 0.2);
      g.fillRect(ex, ey, 18, 14);
    }

    g.fillStyle(0xf1c40f, 0.1);
    g.fillCircle(320, 52, 8);
    g.fillCircle(320, 52, 12);

    g.fillStyle(0x3d2b1f, 0.6);
    g.fillRect(155, 52, 4, 124);
    g.fillRect(355, 52, 4, 124);

    g.fillStyle(0x8B4513, 0.5);
    g.fillRect(140, 320, 30, 14);
    g.fillCircle(155, 314, 8);
    g.fillStyle(0x3d2b1f, 0.3);
    g.fillRect(140, 334, 30, 20);

    g.fillStyle(0xe74c3c, 0.3);
    g.fillRect(580, 440, 16, 50);
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(584, 445, 8, 4);
    g.fillRect(584, 455, 8, 4);
    g.fillRect(584, 465, 8, 4);
    g.fillRect(584, 475, 8, 4);

    g.fillStyle(0x4a6a8a, 0.08);
    for (let i = 0; i < 5; i++) {
      g.fillRect(100 + i * 100, 48, 60, 4);
    }

    g.fillStyle(0x00b894, 0.1);
    g.fillRect(260, 240, 120, 80);

    g.lineStyle(1, 0x00b894, 0.15);
    for (let i = 0; i < 6; i++) {
      g.lineBetween(260 + i * 20, 240, 260 + i * 20, 320);
    }
    for (let i = 0; i < 4; i++) {
      g.lineBetween(260, 240 + i * 20, 380, 240 + i * 20);
    }

    g.fillStyle(0x636e72, 0.3);
    g.fillCircle(320, 230, 4);
    g.fillStyle(0x2d3436, 0.4);
    g.fillRect(318, 230, 4, 8);
    g.fillStyle(0xf1c40f, 0.15);
    g.fillCircle(320, 230, 6);
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

  private handleInteraction() {
    const px = this.player.x;
    const py = this.player.y;

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

    if (this.isInZone(px, py, 40, 110, 70, 140) || this.isInZone(px, py, 24, 100, 100, 6)) {
      if (this.state === 'idle') {
        openReagentSelector(this, {
          onSelectReagent: (symbol) => {
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

    if (this.isInZone(px, py, 180, 340, 280, 50)) {
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
    this.carriedReagent = null;
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
    const overlay = this.add.rectangle(0, 0, width, height, 0x000, 0.6).setOrigin(0).setDepth(50);

    const panel = this.add.graphics().setDepth(51);
    panel.fillStyle(0x1a1a3e, 0.95);
    panel.fillRoundedRect(width / 2 - 150, height / 2 - 80, 300, 160, 12);
    panel.lineStyle(2, 0x6c5ce7, 0.5);
    panel.strokeRoundedRect(width / 2 - 150, height / 2 - 80, 300, 160, 12);

    const closeIcn = this.add.text(width / 2 + 130, height / 2 - 70, '✕', {
      fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675',
    }).setOrigin(0.5).setDepth(55).setInteractive({ useHandCursor: true });

    const t = this.add.text(width / 2, height / 2 - 55, 'Craft these reagents?', {
      fontFamily: '"Inter"', fontSize: '15px', color: '#f1c40f', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);

    const reagentsTxt = this.add.text(width / 2, height / 2 - 20, this.benchReagents.join(' + '), {
      fontFamily: '"Inter"', fontSize: '18px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);

    const craftG = this.add.graphics().setDepth(52);
    craftG.fillStyle(0x6c5ce7, 0.9);
    craftG.fillRoundedRect(width / 2 - 90, height / 2 + 20, 80, 30, 6);
    const craftT = this.add.text(width / 2 - 50, height / 2 + 35, 'CRAFT', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(53);

    const craftZ = this.add.zone(width / 2 - 50, height / 2 + 35, 80, 30)
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
    clearG.fillRoundedRect(width / 2 + 10, height / 2 + 20, 80, 30, 6);
    const clearT = this.add.text(width / 2 + 50, height / 2 + 35, 'CLEAR', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#ff7675', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(53);
    const clearZ = this.add.zone(width / 2 + 50, height / 2 + 35, 80, 30)
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
      this.clearBenchIcons();
      this.benchReagents = [];
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
    
    const inst = this.add.text(width / 2, height / 2 - 105, 'Mash [SPACE] to heat.\nKeep in green zone.', {
      fontFamily: '"Inter"', fontSize: '10px', color: '#fff', align: 'center'
    }).setOrigin(0.5).setDepth(102);

    const state = gameStore.getState();
    const bonding = state.playerData.skills['bonding'] || 0;
    const equationBalancing = state.playerData.skills['equation_balancing'] || 0;
    const hasLabCoat = state.playerData.equippedGear.includes('lab_coat');

    const coolingRate = 0.03 - (bonding * 0.003); 
    const targetWidth = 60 + (equationBalancing * 10); 
    const targetMin = 50 - (targetWidth / 2) * (100 / 180); // map from pixels to 0-100 scale? No, temp is 0-100.
    // Wait, temp is 0 to 100. The target zone was 60 pixels out of 180 (which is 33% to 66% temp).
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
    const progBg = this.add.rectangle(width / 2 - 80, height / 2 + 20, 10, 180, 0x2d3436).setDepth(102);
    const progFill = this.add.rectangle(width / 2 - 80, height / 2 + 110, 10, 0, 0x0984e3).setOrigin(0.5, 1).setDepth(103);

    let isPlaying = true;
    
    const minigameUpdate = (time: number, delta: number) => {
      if (!isPlaying) return;
      
      // Cooling
      temp -= delta * coolingRate;
      if (temp < 0) temp = 0;
      
      // Heating
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey('SPACE'))) {
        temp += 12;
        if (temp > 100) temp = 100;
        
        // Small flame effect
        const f = this.add.particles(width / 2, height / 2 + 120, 'icon_particle', {
          speed: 20, angle: {min: 250, max: 290}, scale: {start:0.3, end:0}, lifespan: 300, blendMode: 'ADD', tint: 0xe74c3c
        }).setDepth(105);
        this.time.delayedCall(300, () => f.destroy());
      }
      
      // Update indicator Y
      // 0 is height/2 + 90, 100 is height/2 - 90
      indicator.y = (height / 2 + 90) - (temp / 100) * 180;
      
      // Check if in target zone
      if (temp > minTemp && temp < maxTemp) {
        progress += delta * progressSpeed;
        targetZone.setFillStyle(0x55efc4, 0.8);
      } else {
        progress -= delta * 0.02;
        targetZone.setFillStyle(0x00b894, 0.5);
      }
      if (progress < 0) progress = 0;
      
      progFill.height = (progress / 100) * 180;
      
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
    const outSymbol = result.result.output;
    let craftedItemId = '';
    for (const [id, data] of Object.entries(this.craftingItems)) {
      if (data.type === 'molecule' && data.symbol === outSymbol) {
        craftedItemId = id;
        break;
      }
    }

    if (craftedItemId) {
      const symbolToId: Record<string, string> = {};
      for (const [id, data] of Object.entries(this.craftingItems)) {
        symbolToId[data.symbol] = id;
      }
      for (const sym of this.benchReagents) {
        const id = symbolToId[sym];
        if (id) gameStore.removeFromInventory(id, 1);
      }
      gameStore.addToInventory(craftedItemId, 1);
      gameStore.unlockChemDex(outSymbol);

      this.sound.play('sfx_craft', { volume: 0.6 });
      this.cameras.main.flash(200, 100, 255, 200);
      this.showResultPopout(`Success!\n${result.result.outputName}`, '#00b894');
      this.statusText.setText(`Crafted: ${result.result.outputName}!`);
    }

    this.clearBenchIcons();
    this.benchReagents = [];
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
    this.clearBenchIcons();
    this.benchReagents = [];
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
