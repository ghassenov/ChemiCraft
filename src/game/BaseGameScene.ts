import Phaser from 'phaser';
import { Player } from './entities/Player';
import { NPC } from './entities/NPC';
import { ResourceNode, ResourceType } from './entities/ResourceNode';
import { DialogueBox } from './ui/DialogueBox';
import { QuestSystem } from './systems/QuestSystem';
import { SceneTransition } from './systems/SceneTransition';
import { gameStore } from '../store/gameStore';
import { MapData, NPCData, QuestData, GameEvents, Direction } from './data/types';
import { MAP_SCENE_KEYS } from './data/mapSceneKeys';

(window as any).__skipQuestCheck = true;

export abstract class BaseGameScene extends Phaser.Scene {
  protected player!: Player;
  protected npcs: Phaser.GameObjects.Group;
  protected dialogueBox!: DialogueBox;
  protected questSystem!: QuestSystem;
  protected mapData!: MapData;
  protected buildings!: Phaser.Physics.Arcade.StaticGroup;
  protected groundLayer!: Phaser.GameObjects.Group;
  protected portalPrompt!: Phaser.GameObjects.Text;
  protected buildingPrompt!: Phaser.GameObjects.Text;

  protected resourceNodes!: Phaser.Physics.Arcade.StaticGroup;
  protected binZones: { x: number; y: number; wasteType: string; color: string; prompt: Phaser.GameObjects.Container; graphics: Phaser.GameObjects.Graphics[] }[] = [];
  private _portalNotified = false;

  constructor(key: string) {
    super({ key });
    this.npcs = null as any;
    this.buildings = null as any;
  }

  abstract getMapKey(): string;

  create() {
    if (!this.scene.isActive('HUDScene')) {
      this.scene.launch('HUDScene');
    }

    this.cameras.main.fadeIn(500, 0, 0, 0);

    const currentMapKey = this.getMapKey();
    const allMaps = this.cache.json.get('maps') as Record<string, MapData>;
    this.mapData = allMaps[currentMapKey];
    if (!this.mapData) {
      console.error(`Map "${currentMapKey}" not found, falling back to atomMeadows`);
      this.mapData = allMaps.atomMeadows;
    }

    const allNpcs = this.cache.json.get('npcs') as Record<string, NPCData>;
    const quests = this.cache.json.get('quests') as Record<string, QuestData>;

    this.questSystem = new QuestSystem(this, quests);
    this.dialogueBox = new DialogueBox(this);

    this.applyTheme();
    this.buildMap();
    this.drawBuildingFacades();

    const spawnData = this.mapData.playerSpawn;
    const ts = this.mapData.tileSize;

    this.player = new Player(this, spawnData.tileX * ts + ts / 2, spawnData.tileY * ts + ts / 2);

    this.physics.world.setBounds(0, 0, this.mapData.width * ts, this.mapData.height * ts);
    this.cameras.main.setBounds(0, 0, this.mapData.width * ts, this.mapData.height * ts);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    this.npcs = this.add.group();
    for (const npcSpawn of this.mapData.npcs) {
      const data = allNpcs[npcSpawn.npcId];
      if (data) {
        const npc = new NPC(
          this,
          npcSpawn.tileX * ts + ts / 2,
          npcSpawn.tileY * ts + ts / 2,
          data.id, data.name,
          `npc_${data.id}`,
          data.questId
        );
        this.npcs.add(npc);
      }
    }

    this.resourceNodes = this.physics.add.staticGroup();
    const emojiOverlay = this.getResourceNodeEmojiOverlay();
    if (this.mapData.resourceNodes && this.mapData.resourceNodes.length > 0) {
      for (const nodeData of this.mapData.resourceNodes) {
        const rx = nodeData.tileX * ts + ts / 2;
        const ry = nodeData.tileY * ts + ts / 2;
        const node = new ResourceNode(this, rx, ry, nodeData.type as ResourceType, nodeData.maxGathers);
        this.resourceNodes.add(node);
        if (emojiOverlay[nodeData.type]) {
          const emoji = this.add.text(rx, ry - 20, emojiOverlay[nodeData.type], {
            fontSize: '18px',
          }).setOrigin(0.5).setDepth(3);
          node.emojiLabel = emoji;
        }
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const rx = Phaser.Math.Between(2, this.mapData.width - 3) * ts + ts / 2;
        const ry = Phaser.Math.Between(2, this.mapData.height - 3) * ts + ts / 2;
        const type: ResourceType = ['coal', 'water', 'crystal', 'air'][Phaser.Math.Between(0, 3)] as ResourceType;
        const node = new ResourceNode(this, rx, ry, type, Phaser.Math.Between(1, 3));
        this.resourceNodes.add(node);
      }
    }

    this.physics.add.collider(this.player, this.buildings);
    this.physics.add.collider(this.player, this.npcs);
    this.physics.add.collider(this.player, this.resourceNodes);
    for (const child of this.npcs.getChildren()) {
      this.physics.add.collider(child as NPC, this.buildings);
    }

    this.portalPrompt = this.add.text(0, 0, '', {
      fontFamily: '"Inter", sans-serif', fontSize: '12px', color: '#a29bfe',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(30).setAlpha(0);

    this.buildingPrompt = this.add.text(0, 0, '', {
      fontFamily: '"Inter", sans-serif', fontSize: '12px', color: '#fdcb6e',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(30).setAlpha(0);

    this.player.onInteract(() => this.handleInteraction(allNpcs));

    if (!this.sound.get('bgm')) {
      this.sound.play('bgm', { loop: true, volume: 0.4 });
    }

    this.createDecorations();
    this.createMapDecorations();

    const unsub = gameStore.subscribe(() => {
      const state = gameStore.getState();
      this.player.canMove = !state.isDialogueOpen && !state.isPaused;
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => unsub());

    const questCompleteHandler = (id: string) => {
      this.onQuestCompleteHook(id);
    };
    this.events.on(GameEvents.QuestCompleted, questCompleteHandler);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(GameEvents.QuestCompleted, questCompleteHandler);
    });

    if (!sessionStorage.getItem('chemicraft_tutorial_shown')) {
      sessionStorage.setItem('chemicraft_tutorial_shown', '1');
      this.showTutorialOverlay();
    }
  }

  update(_time: number, _delta: number) {
    this.player.update();

    const ts = this.mapData.tileSize;

    for (const child of this.npcs.getChildren()) {
      const npc = child as NPC;
      npc.update();
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < 40) {
        npc.showPrompt();
      } else {
        npc.hidePrompt();
      }
      npc.updatePromptPosition();
    }
    for (const child of this.resourceNodes.getChildren()) {
      const node = child as ResourceNode;
      if (!node.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
      if (dist < 40) {
        node.showPrompt();
      } else {
        node.hidePrompt();
      }
    }
    for (const zone of this.binZones) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y);
      if (dist < 40) {
        if (zone.prompt.alpha === 0) {
          zone.prompt.setAlpha(1).setScale(1);
        }
      } else {
        if (zone.prompt.alpha === 1) {
          zone.prompt.setAlpha(0).setScale(0.8);
        }
      }
    }

    const px = Math.floor(this.player.x / ts);
    const py = Math.floor(this.player.y / ts);

    let nearBuilding = false;
    for (const b of this.mapData.buildings) {
      if (Math.abs(b.tileX - px) <= 1 && Math.abs(b.tileY - py) <= 1) {
        nearBuilding = true;
      }
    }
    if (nearBuilding) {
      const bx = this.player.x;
      const by = this.player.y - 40;
      this.buildingPrompt.setPosition(bx, by).setText(this.player.facing === Direction.Up ? '[ ↑ ] Enter' : '[ ↑ ] Face up').setAlpha(1);
    } else {
      this.buildingPrompt.setAlpha(0);
    }

    for (const b of this.mapData.buildings) {
      if (b.tileX === px && b.tileY === py) {
        if (this.player.facing === Direction.Up) {
          this.player.y += 10;
          SceneTransition.fadeOutIn(this, b.sceneKey);
        }
      }
    }

    const portals = this.mapData.portals;
    if (portals && portals.length > 0) {
      let nearPortal = false;
      for (const portal of portals) {
        const distToPortal = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          portal.tileX * ts + ts / 2, portal.tileY * ts + ts / 2
        );
        if (distToPortal < 30) {
          nearPortal = true;
          if (!this._portalNotified) {
            this._portalNotified = true;
            this.unlockAndTravel(this.mapData.key, portal.targetMap, portal);
          }
          break;
        }
      }
      if (!nearPortal) this._portalNotified = false;
    }
  }

  protected unlockAndTravel(currentMapKey: string, nextMapKey: string, portal: any) {
    if (!(window as any).__skipQuestCheck && portal.unlockCondition === 'all_quests' && !this.checkAllMainQuestsComplete()) {
      const event = new CustomEvent('chemicraft:notification', {
        detail: { message: 'Complete all main quests first!', color: '#e74c3c' }
      });
      window.dispatchEvent(event);
      return;
    }
    const allMaps = this.cache.json.get('maps') as Record<string, MapData>;
    if (allMaps[nextMapKey]) {
      gameStore.unlockMap(nextMapKey);
      gameStore.travelToMap(nextMapKey);
      gameStore.markMapCompleted(currentMapKey);
      this.sound.stopByKey('bgm');
      const nextSceneKey = MAP_SCENE_KEYS[nextMapKey] || 'AtomMeadowsScene';
      SceneTransition.fadeOutIn(this, nextSceneKey);
    } else {
      const event = new CustomEvent('chemicraft:notification', {
        detail: { message: 'Victory! All maps completed!', color: '#f1c40f' }
      });
      window.dispatchEvent(event);
      SceneTransition.fadeOutIn(this, 'MainMenuScene');
    }
  }

  protected checkAllMainQuestsComplete(): boolean {
    const allQuests = this.cache.json.get('quests') as Record<string, any>;
    const currentMap = this.mapData.key;
    const mapQuests = Object.values(allQuests).filter((q: any) => q.mapOrigin === currentMap && q.isMainQuest);
    return mapQuests.every((q: any) => gameStore.isQuestCompleted(q.id));
  }

  protected applyTheme() {
    const theme = this.mapData.theme;
    if (theme) {
      this.cameras.main.setBackgroundColor(theme.bgColor);
    }
  }

  protected createDecorations() {
    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;
    const theme = this.mapData.theme;

    const isFirstMap = this.mapData.key === 'atomMeadows';
    if (isFirstMap) {
      const particleTint: number[] = theme?.accentColor
        ? [theme.accentColor, theme.groundColor, theme.wallColor]
        : [0xa8e6cf, 0xdcedc1, 0xffd3b6];
      this.add.particles(0, 0, 'icon_particle', {
        x: { min: 0, max: mapW }, y: { min: 0, max: mapH },
        lifespan: 6000, speed: { min: 5, max: 18 },
        angle: { min: 200, max: 250 },
        scale: { start: 0.25, end: 0 },
        alpha: { start: 0.35, end: 0 },
        blendMode: 'ADD',
        tint: particleTint,
        frequency: 350,
      }).setDepth(15);
    } else {
      const particleType = theme?.particles ?? 'pollen';
      let particleConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
      switch (particleType) {
        case 'leaves':
          particleConfig = {
            x: { min: 0, max: mapW }, y: -10,
            lifespan: 8000, speed: { min: 10, max: 30 },
            angle: { min: 200, max: 250 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.4, end: 0 },
            tint: [0x8bc34a, 0x4caf50, 0xcddc39],
            frequency: 400, blendMode: 'ADD',
          };
          break;
        case 'wind':
          particleConfig = {
            x: -10, y: { min: 0, max: mapH },
            lifespan: 3000, speed: { min: 40, max: 80 },
            angle: { min: 0, max: 10 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.25, end: 0 },
            tint: [0xb3e5fc, 0x81d4fa, 0xffffff],
            frequency: 200, blendMode: 'ADD',
          };
          break;
        case 'sparkles':
          particleConfig = {
            x: { min: 0, max: mapW }, y: { min: 0, max: mapH },
            lifespan: 2000, speed: { min: 2, max: 8 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.15, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: [0xffeb3b, 0xfff176, 0xffffff],
            frequency: 150, blendMode: 'ADD',
          };
          break;
        case 'embers':
          particleConfig = {
            x: { min: 0, max: mapW }, y: { min: mapH * 0.5, max: mapH },
            lifespan: 5000, speed: { min: 8, max: 25 },
            angle: { min: 250, max: 290 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.7, end: 0 },
            tint: [0xff5722, 0xff6f00, 0xff9800, 0xffeb3b],
            frequency: 300, blendMode: 'ADD',
          };
          break;
        default:
          particleConfig = {
            x: { min: 0, max: mapW }, y: { min: 0, max: mapH },
            lifespan: 6000, speed: { min: 5, max: 18 },
            angle: { min: 200, max: 250 },
            scale: { start: 0.25, end: 0 },
            alpha: { start: 0.35, end: 0 },
            tint: [theme?.accentColor ?? 0xa8e6cf, theme?.groundColor ?? 0xdcedc1, theme?.wallColor ?? 0xffd3b6],
            frequency: 350, blendMode: 'ADD',
          };
          break;
      }
      this.add.particles(0, 0, 'icon_particle', particleConfig).setDepth(15);
    }

    for (const b of this.mapData.buildings) {
      const ex = b.tileX * ts + ts / 2;
      const ey = b.tileY * ts - 8;

      const torchG = this.add.graphics().setDepth(8);
      torchG.fillStyle(0x5a3a1a, 0.9);
      torchG.fillRect(ex - 15, ey - 8, 4, 12);
      torchG.fillRect(ex + 11, ey - 8, 4, 12);

      this.add.particles(ex - 13, ey - 12, 'icon_particle', {
        speed: { min: 8, max: 18 },
        angle: { min: 255, max: 285 },
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 500,
        blendMode: 'ADD',
        tint: [0xf39c12, 0xe74c3c, 0xfdcb6e],
        frequency: 60,
      }).setDepth(9);

      this.add.particles(ex + 13, ey - 12, 'icon_particle', {
        speed: { min: 8, max: 18 },
        angle: { min: 255, max: 285 },
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 500,
        blendMode: 'ADD',
        tint: [0xf39c12, 0xe74c3c, 0xfdcb6e],
        frequency: 60,
      }).setDepth(9);

      const glow = this.add.circle(ex, ey, 20, 0xf39c12, 0.08).setDepth(7);
      this.tweens.add({
        targets: glow, alpha: 0.03, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });

      let signLabel = '';
      let signColor = '#dfe6e9';
      if (b.type === 'lab') { signLabel = 'Lab'; signColor = '#74b9ff'; }
      else if (b.type === 'library') { signLabel = 'Library'; signColor = '#ffeaa7'; }
      else if (b.type === 'shop') { signLabel = 'Shop'; signColor = '#fab1a0'; }

      if (signLabel) {
        const signG = this.add.graphics().setDepth(7);
        signG.fillStyle(0x3d2b1f, 0.85);
        signG.fillRoundedRect(ex - 30, ey - 32, 60, 18, 4);
        signG.lineStyle(1, 0x8B6914, 0.5);
        signG.strokeRoundedRect(ex - 30, ey - 32, 60, 18, 4);
        signG.fillStyle(0x5a3a1a, 0.8);
        signG.fillRect(ex - 2, ey - 14, 4, 14);

        this.add.text(ex, ey - 23, signLabel, {
          fontFamily: '"Inter"', fontSize: '9px', color: signColor, fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(8);
      }
    }

    if (this.mapData.decorations) {
      for (const decor of this.mapData.decorations) {
        const dx = decor.tileX * ts + ts / 2;
        const dy = decor.tileY * ts + ts / 2;
        switch (decor.type) {
          case 'flower': {
            const colors = [0xe91e63, 0xff9800, 0xffeb3b, 0x8bc34a, 0x03a9f4];
            const g = this.add.graphics().setDepth(2);
            const c = colors[Phaser.Math.Between(0, colors.length - 1)];
            g.fillStyle(0x4caf50, 0.7);
            g.fillRect(dx - 1, dy, 2, 6);
            g.fillStyle(c, 0.8);
            g.fillCircle(dx, dy - 2, 4);
            break;
          }
          case 'grass': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0x4caf50, 0.5);
            for (let i = -1; i <= 1; i++) {
              g.fillRect(dx + i * 3, dy - 4 + Math.abs(i) * 2, 2, 6);
            }
            break;
          }
          case 'bin': {
            if (gameStore.isQuestCompleted('waste_crisis')) break;
            const binColors: Record<string, number> = {
              yellow: 0xf1c40f, green: 0x00b894, grey: 0xb2bec3, blue: 0x0984e3, brown: 0x6d4c41,
            };
            const wasteByColor: Record<string, string> = {
              yellow: 'plastic_waste', green: 'glass_waste', grey: 'metal_waste',
              blue: 'paper_waste', brown: 'organic_waste',
            };
            const color = decor.color || 'green';
            const bodyColor = binColors[color] || 0x4a7c59;
            const binGraphics: Phaser.GameObjects.Graphics[] = [];
            const g = this.add.graphics().setDepth(2);
            binGraphics.push(g);
            
            // Drop shadow
            g.fillStyle(0x000000, 0.2);
            g.fillEllipse(dx, dy + 8, 24, 8);
            
            // Main body
            g.fillStyle(bodyColor, 1);
            g.fillRoundedRect(dx - 10, dy - 8, 20, 16, 4);
            
            // Darker shading on the right for 3D effect
            g.fillStyle(0x000000, 0.15);
            g.fillRoundedRect(dx + 2, dy - 8, 8, 16, { tl: 0, tr: 4, bl: 0, br: 4 } as any);
            
            // Bin lid
            g.fillStyle(0xffffff, 0.9);
            g.fillRoundedRect(dx - 12, dy - 12, 24, 6, 2);
            
            // Lid shading
            g.fillStyle(0x000000, 0.2);
            g.fillRoundedRect(dx + 2, dy - 12, 10, 6, { tl: 0, tr: 2, bl: 0, br: 2 } as any);
            
            // Glowing rim on the lid
            g.lineStyle(1, bodyColor, 0.8);
            g.strokeRoundedRect(dx - 11, dy - 11, 22, 4, 1);

            // Center recycling logo (simple circle + triangle)
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(dx, dy, 5);
            g.fillStyle(bodyColor, 1);
            g.fillCircle(dx, dy, 3);
            
            const binPrompt = this.add.text(0, 0, '[E] Sort', {
              fontFamily: '"Inter"', fontSize: '10px', fontStyle: 'bold', color: '#00cec9',
              stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5);
            const promptContainer = this.add.container(dx, dy - 32, [binPrompt]);
            promptContainer.setDepth(20).setAlpha(0).setScale(0.8);
            
            this.tweens.add({
              targets: promptContainer, y: dy - 36,
              duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });

            this.binZones.push({ x: dx, y: dy, wasteType: wasteByColor[color] || 'plastic_waste', color, prompt: promptContainer, graphics: binGraphics });
            break;
          }
          case 'tree': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0x5d4037, 0.9);
            g.fillRect(dx - 3, dy - 4, 6, 14);
            const canopy = this.add.circle(dx, dy - 10, 14, 0x388e3c, 0.65).setDepth(2);
            this.tweens.add({
              targets: canopy, scaleX: 1.05, scaleY: 1.05,
              duration: 3000 + Math.random() * 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
            break;
          }
          case 'lamp': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0x616161, 0.9);
            g.fillRect(dx - 2, dy - 14, 4, 18);
            g.fillStyle(0xffd54f, 0.7);
            g.fillCircle(dx, dy - 16, 5);
            const glow = this.add.circle(dx, dy - 16, 14, 0xffd54f, 0.1).setDepth(1);
            this.tweens.add({
              targets: glow, alpha: 0.04, scaleX: 1.3, scaleY: 1.3,
              duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            });
            break;
          }
          case 'sign': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0x795548, 0.9);
            g.fillRect(dx - 1, dy - 12, 3, 16);
            g.fillStyle(0x5d4037, 0.85);
            g.fillRoundedRect(dx - 12, dy - 22, 24, 12, 3);
            g.lineStyle(1, 0x8d6e63, 0.6);
            g.strokeRoundedRect(dx - 12, dy - 22, 24, 12, 3);
            break;
          }
          case 'barrel': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0x78909c, 0.85);
            g.fillRoundedRect(dx - 8, dy - 8, 16, 16, 3);
            g.fillStyle(0x90a4ae, 0.6);
            g.fillRect(dx - 9, dy - 3, 18, 3);
            g.fillRect(dx - 9, dy + 2, 18, 3);
            break;
          }
          case 'pile': {
            const g = this.add.graphics().setDepth(2);
            const pColors = [0x795548, 0x6d4c41, 0x5d4037, 0x8d6e63];
            for (let i = 0; i < 6; i++) {
              g.fillStyle(pColors[Phaser.Math.Between(0, pColors.length - 1)], 0.7);
              g.fillCircle(dx + Phaser.Math.Between(-10, 10), dy + Phaser.Math.Between(-6, 6), Phaser.Math.Between(2, 5));
            }
            break;
          }
          case 'conveyor': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0x455a64, 0.85);
            g.fillRect(dx - 14, dy - 6, 28, 12);
            for (let i = 0; i < 6; i++) {
              g.fillStyle(i % 2 === 0 ? 0x78909c : 0x546e7a, 0.9);
              g.fillRect(dx - 12 + i * 5, dy - 4, 3, 8);
            }
            this.tweens.add({
              targets: g, x: 2, duration: 400, repeat: -1,
              onRepeat: () => { g.x = 0; },
            });
            break;
          }
          case 'solar_panel': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0x1565c0, 0.85);
            g.fillRect(dx - 10, dy - 6, 20, 12);
            g.lineStyle(1, 0x42a5f5, 0.5);
            g.strokeRect(dx - 10, dy - 6, 20, 12);
            g.fillStyle(0x0d47a1, 0.4);
            g.fillRect(dx - 8, dy - 2, 5, 4);
            g.fillRect(dx + 3, dy - 2, 5, 4);
            break;
          }
          case 'prism': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0xce93d8, 0.7);
            g.fillTriangle(dx, dy - 10, dx - 8, dy + 6, dx + 8, dy + 6);
            g.lineStyle(1, 0xe1bee7, 0.6);
            g.strokeTriangle(dx, dy - 10, dx - 8, dy + 6, dx + 8, dy + 6);
            break;
          }
          case 'magnet': {
            const g = this.add.graphics().setDepth(2);
            g.fillStyle(0xd32f2f, 0.85);
            g.fillRect(dx - 10, dy - 6, 6, 14);
            g.fillRect(dx + 4, dy - 6, 6, 14);
            g.fillStyle(0xb71c1c, 0.85);
            g.fillRect(dx - 4, dy - 6, 8, 6);
            break;
          }
          default: {
            const dot = this.add.text(dx, dy, '•', { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5).setDepth(2).setAlpha(0.5);
            this.tweens.add({ targets: dot, alpha: 0.2, duration: 1000, yoyo: true, repeat: -1 });
            break;
          }
        }
      }
    }

    const portals = this.mapData.portals;
    if (portals && portals.length > 0) {
      for (const portal of portals) {
        const px = portal.tileX * ts + ts / 2;
        const py = portal.tileY * ts + ts / 2;

        const ring = this.add.circle(px, py, 18, 0x6c5ce7, 0.15).setDepth(5);
        this.tweens.add({
          targets: ring, scaleX: 1.6, scaleY: 1.6, alpha: 0, duration: 2000, repeat: -1
        });

        const innerGlow = this.add.circle(px, py, 10, 0xa29bfe, 0.2).setDepth(5);
        this.tweens.add({
          targets: innerGlow, scaleX: 1.2, scaleY: 1.2, alpha: 0.05, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.add.particles(px, py, 'icon_particle', {
          speed: { min: 10, max: 25 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.3, end: 0 },
          alpha: { start: 0.6, end: 0 },
          lifespan: 1200,
          blendMode: 'ADD',
          tint: [0x6c5ce7, 0xa29bfe, 0x00cec9],
          frequency: 150,
        }).setDepth(6);
      }
    }

    const pathG = this.add.graphics().setDepth(1);
    for (let y = 0; y < this.mapData.height; y++) {
      for (let x = 0; x < this.mapData.width; x++) {
        const val = this.mapData.ground[y][x];
        if (val === 5) {
          pathG.fillStyle(0xd4a855, 0.06);
          pathG.fillCircle(x * ts + ts / 2, y * ts + ts / 2, ts / 3);
        }
      }
    }
  }

  protected createMapDecorations() {
  }

  protected getResourceNodeEmojiOverlay(): Record<string, string> {
    return {};
  }

  protected onQuestCompleteHook(_questId: string) {
  }

  protected buildMap() {
    const ts = this.mapData.tileSize;
    this.groundLayer = this.add.group();
    this.buildings = this.physics.add.staticGroup();

    for (let y = 0; y < this.mapData.height; y++) {
      for (let x = 0; x < this.mapData.width; x++) {
        const tileVal = this.mapData.ground[y][x];

        let texture = 'tile_grass';
        if (tileVal === 0) texture = Math.random() > 0.8 ? 'tile_grass_detail' : 'tile_grass';
        if (tileVal === 1) texture = 'tile_wall';
        if (tileVal === 5) texture = 'tile_square';
        if (tileVal === 6) texture = 'tile_portal';

        if (tileVal >= 2 && tileVal <= 4) {
          texture = 'tile_grass';
        }

        const tile = this.add.image(x * ts + ts / 2, y * ts + ts / 2, texture);

        this.applyTileTint(tile, tileVal, x, y);

        if (tileVal === 1) {
          const body = this.buildings.create(x * ts + ts / 2, y * ts + ts / 2, texture);
          body.setVisible(false);
          body.setAlpha(0);
        }
      }
    }

    for (const b of this.mapData.buildings) {
      for (const [bx, by] of b.tiles) {
        if (bx === b.tileX && by === b.tileY) continue;
        const body = this.buildings.create(bx * ts + ts / 2, by * ts + ts / 2, 'tile_wall');
        body.setVisible(false);
        body.setAlpha(0);
      }

      this.add.image(b.tileX * ts + ts / 2, b.tileY * ts + ts / 2, 'entrance_marker').setAlpha(0.5);
    }
  }

  protected applyTileTint(tile: Phaser.GameObjects.Image, tileVal: number, _x: number, _y: number) {
    const theme = this.mapData.theme;
    if (tileVal === 0 || (tileVal >= 2 && tileVal <= 4)) {
      tile.setTint(theme.groundColor);
    } else if (tileVal === 1) {
      tile.setTint(theme.wallColor);
    } else if (tileVal === 5) {
      const c = Phaser.Display.Color.ValueToColor(theme.accentColor);
      tile.setTint(Phaser.Display.Color.GetColor(c.red * 0.6, c.green * 0.6, c.blue * 0.6));
    } else if (tileVal === 6) {
      tile.setTint(theme.accentColor);
    }
  }

  protected drawBuildingFacades() {
    for (const b of this.mapData.buildings) {
      this.drawFacade(b);
    }
  }

  private drawFacade(b: any) {
    const g = this.add.graphics();
    const ts = this.mapData.tileSize;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [bx, by] of b.tiles) {
      if (bx < minX) minX = bx;
      if (by < minY) minY = by;
      if (bx > maxX) maxX = bx;
      if (by > maxY) maxY = by;
    }

    const left = minX * ts;
    const top = minY * ts;
    const w = (maxX - minX + 1) * ts;
    const h = (maxY - minY + 1) * ts;
    const cx = left + w / 2;

    const style = b.style || {};
    const labWall = style.wallColor || 0x2a4a6a;
    const labRoof = style.roofColor || 0x3a5aaa;
    const libWall = style.wallColor || 0x5c3a1e;
    const libRoof = style.roofColor || 0x4a2a0e;
    const shopWall = style.wallColor || 0x8a4a1a;
    const shopRoof = style.roofColor || 0xc0392b;

    if (b.type === 'lab') {
      g.fillStyle(labWall, 1);
      g.fillRect(left - 2, top - 6, w + 4, h + 8);
      g.fillStyle(0x3a5a7a, 0.4);
      g.fillRect(left, top, w, h);
      g.fillStyle(labWall, 1);
      g.fillRect(left - 6, top - 10, w + 12, 8);
      g.fillStyle(0x4a6a8a, 0.3);
      g.fillRect(left - 6, top - 10, w + 12, 2);
      g.fillStyle(0x5a8aaa, 0.6);
      g.fillCircle(cx - w * 0.25, top + h * 0.25, 10);
      g.fillCircle(cx + w * 0.25, top + h * 0.25, 10);
      g.lineStyle(2, 0x6a8aaa, 0.8);
      g.strokeCircle(cx - w * 0.25, top + h * 0.25, 10);
      g.strokeCircle(cx + w * 0.25, top + h * 0.25, 10);
      g.lineStyle(2, 0x6a8aaa, 0.8);
      g.strokeCircle(cx - w * 0.25, top + h * 0.25, 6);
      g.strokeCircle(cx + w * 0.25, top + h * 0.25, 6);
      g.fillStyle(0x4a6a3a, 0.5);
      g.fillRect(cx - 8, top + h - 4, 16, 6);
      g.fillStyle(0x8abada, 0.3);
      g.fillRect(left, top + h - 2, w, 2);
      g.fillStyle(0xffffff, 0.15);
      g.fillRect(cx - 4, top - 14, 8, 6);
      g.fillStyle(0x00b894, 0.4);
      g.fillCircle(cx, top - 11, 3);
    } else if (b.type === 'library') {
      g.fillStyle(libWall, 1);
      g.fillRect(left - 2, top - 6, w + 4, h + 8);
      g.fillStyle(0x6c4a2e, 0.5);
      g.fillRect(left, top, w, h);
      g.fillStyle(libRoof, 1);
      g.fillTriangle(left - 6, top - 2, cx, top - 16, left + w + 6, top - 2);
      g.fillStyle(0x7a5a3e, 0.3);
      g.fillRect(left + 4, top + 4, w - 8, h - 8);
      g.fillStyle(0xd4a855, 0.4);
      g.fillRect(cx - 8, top + h * 0.2, 16, h * 0.6);
      g.fillStyle(0xd4a855, 0.3);
      g.fillRect(cx - 14, top + h * 0.2, 28, 4);
      g.fillRect(cx - 14, top + h * 0.8, 28, 4);
      g.fillStyle(0xffffff, 0.1);
      g.fillRect(cx - 4, top + h * 0.2, 8, h * 0.6);
      g.fillStyle(0x4a2a0e, 0.5);
      g.fillRect(left - 2, top + h - 4, w + 4, 6);
    } else if (b.type === 'shop') {
      g.fillStyle(shopWall, 1);
      g.fillRect(left - 2, top - 6, w + 4, h + 8);
      g.fillStyle(0x9a5a2a, 0.5);
      g.fillRect(left, top, w, h);
      g.fillStyle(shopRoof, 0.3);
      for (let i = 0; i < 6; i++) {
        const triLeft = left + (i / 6) * w;
        g.fillTriangle(triLeft, top - 2, triLeft + w / 12, top - 14, triLeft + w / 6, top - 2);
      }
      g.fillStyle(0xf39c12, 0.2);
      g.fillRect(left + 4, top + 4, w - 8, h - 8);
      g.fillStyle(0x6a3a1a, 0.5);
      g.fillRect(cx - 10, top + h - 4, 20, 6);
      g.fillStyle(0xf39c12, 0.3);
      g.fillRect(cx - 8, top + h - 2, 16, 3);
      g.fillStyle(0xf39c12, 0.2);
      g.fillCircle(cx, top + 10, 6);
      g.fillStyle(0xf1c40f, 0.1);
      g.fillCircle(cx, top + 10, 3);
      g.fillStyle(0x9a5a2a, 0.3);
      g.fillRect(left + 2, top + 6, w * 0.35, h * 0.4);
      g.fillRect(left + w - w * 0.35 - 2, top + 6, w * 0.35, h * 0.4);
    }
  }

  protected handleInteraction(allNpcs: Record<string, NPCData>) {
    let closestNpc: NPC | null = null;
    let minDist = 1000;

    const npcList = this.npcs.getChildren() as NPC[];
    for (const npc of npcList) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < 50) {
        const dx = npc.x - this.player.x;
        const dy = npc.y - this.player.y;
        let valid = false;
        if (this.player.facing === Direction.Up && dy < 0 && Math.abs(dx) < 20) valid = true;
        else if (this.player.facing === Direction.Down && dy > 0 && Math.abs(dx) < 20) valid = true;
        else if (this.player.facing === Direction.Left && dx < 0 && Math.abs(dy) < 20) valid = true;
        else if (this.player.facing === Direction.Right && dx > 0 && Math.abs(dy) < 20) valid = true;
        if (valid && dist < minDist) {
          minDist = dist;
          closestNpc = npc;
        }
      }
    }
    let interactedNode = false;
    const activeTool = gameStore.getState().playerData.activeTool;
    for (const child of this.resourceNodes.getChildren()) {
      const node = child as ResourceNode;
      if (!node.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
      if (dist < 50) {
        const result = node.gather(activeTool);
        if (result === 'pickaxe' || result === 'flask' || result === 'none') {
          const labels: Record<string, string> = { pickaxe: 'Pickaxe', flask: 'Flask', none: 'your hands' };
          const msg = result === 'none' ? 'Use your hands!' : `Equip ${labels[result]}! [T]`;
          const t = this.add.text(node.x, node.y - 20, msg, {
            fontFamily: '"Inter"', fontSize: '11px', color: '#ff7675', fontStyle: 'bold'
          }).setOrigin(0.5).setDepth(40);
          this.tweens.add({
            targets: t, y: t.y - 30, alpha: 0, duration: 2000, onComplete: () => t.destroy()
          });
          this.cameras.main.shake(120, 0.003);
        } else if (result) {
          gameStore.addToInventory(result, 1);
          if (this.mapData.key === 'recyclingFields') {
            const names: Record<string, string> = {
              plastic_pile: 'Plastic waste', glass_pile: 'Glass waste',
              metal_pile: 'Metal waste', paper_pile: 'Paper waste', compost_heap: 'Organic waste',
            };
            const type = node.resourceType;
            const name = names[type] || type;
            const t = this.add.text(node.x, node.y - 25, `Found ${name}!`, {
              fontFamily: '"Inter"', fontSize: '11px', color: '#00cec9', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(40);
            this.tweens.add({
              targets: t, y: t.y - 35, alpha: 0, duration: 1500, onComplete: () => t.destroy()
            });
          } else {
            const t = this.add.text(node.x, node.y - 20, `+1 ${node.resourceType}`, {
              fontFamily: '"Inter"', fontSize: '12px', color: '#00cec9', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(40);
            this.tweens.add({
              targets: t, y: t.y - 30, alpha: 0, duration: 1500, onComplete: () => t.destroy()
            });
          }
          this.sound.play('sfx_coin', { volume: 0.3 });
        }
        interactedNode = true;
        break;
      }
    }

    if (interactedNode) return;

    for (const zone of this.binZones) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y);
      if (dist < 50) {
        const names: Record<string, string> = {
          plastic_waste: 'Plastic waste', glass_waste: 'Glass waste',
          metal_waste: 'Metal waste', paper_waste: 'Paper waste', organic_waste: 'Organic waste',
        };
        const itemName = names[zone.wasteType] || zone.wasteType;
        if (gameStore.hasItem(zone.wasteType, 1)) {
          gameStore.removeFromInventory(zone.wasteType, 1);
          gameStore.addSortingScore(1);
          const t = this.add.text(zone.x, zone.y - 25, `${itemName} sorted!`, {
            fontFamily: '"Inter"', fontSize: '11px', color: '#00cec9', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(40);
          this.tweens.add({ targets: t, y: t.y - 35, alpha: 0, duration: 1500, onComplete: () => t.destroy() });
          this.sound.play('sfx_coin', { volume: 0.3 });
        } else {
          const t = this.add.text(zone.x, zone.y - 25, `No ${itemName} to sort!`, {
            fontFamily: '"Inter"', fontSize: '10px', color: '#ff7675', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(40);
          this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 1500, onComplete: () => t.destroy() });
        }
        return;
      }
    }

    if (closestNpc && closestNpc.npcId) {
      const data = allNpcs[closestNpc.npcId];
      if (!data) return;

      if (data.id === 'shopkeeper_sal' || data.id === 'green_dealer') {
        this.dialogueBox.show(data.name, data.dialogue.default, data.spriteColor, undefined, () => {
          SceneTransition.fadeOutIn(this, 'ShopInteriorScene');
        });
        return;
      }

      const buildingSceneKey = data.id === 'lab_assistant' ? 'LabInteriorScene'
        : (data.id === 'professor_knowitall' || data.id === 'eco_educator' || data.id === 'eco_activist') ? 'LibraryInteriorScene'
        : null;

      if (data.questId && gameStore.isQuestActive(data.questId) && !gameStore.isQuestCompleted(data.questId)) {
        const quest = this.questSystem.getQuest(data.questId);
        if (quest && (quest.objectiveType === 'craft' || quest.objectiveType === 'collect')) {
          const targetItemId = quest.targetItemId;
          if (targetItemId && gameStore.hasItem(targetItemId, quest.targetAmount || 1)) {
            gameStore.removeFromInventory(targetItemId, quest.targetAmount || 1);
            this.questSystem.completeQuest(data.questId);
          }
        } else if (quest && quest.objectiveType === 'sort') {
          if (gameStore.getSortingScore() >= (quest.targetAmount || 1)) {
            gameStore.resetSortingScore();
            this.questSystem.completeQuest(data.questId);
          }
        }
      }

      const lines = this.questSystem.getNpcDialogue(data);
      let questToOffer: string | undefined;
      if (data.questId && this.questSystem.canAcceptQuest(data.questId)) {
        questToOffer = data.questId;
      }

      if (data.questId && !questToOffer && !gameStore.isQuestActive(data.questId) && !gameStore.isQuestCompleted(data.questId)) {
        const missing = this.questSystem.getMissingPrerequisite(data.questId);
        if (missing) {
          const prereqLines = [`I can't help you with that yet.`, `First, you need to complete: "${missing}".`, `Come back after that's done!`];
          this.dialogueBox.show(data.name, prereqLines, data.spriteColor, undefined, buildingSceneKey ? (() => {
            SceneTransition.fadeOutIn(this, buildingSceneKey);
          }) : undefined);
          return;
        }
      }

      if (buildingSceneKey) {
        this.dialogueBox.show(data.name, lines, data.spriteColor, questToOffer, () => {
          SceneTransition.fadeOutIn(this, buildingSceneKey);
        });
      } else {
        this.dialogueBox.show(data.name, lines, data.spriteColor, questToOffer);
      }
    }
  }

  protected clearRecyclingNodes() {
    if (this.mapData.key !== 'recyclingFields') return;
    for (const zone of this.binZones) {
      zone.prompt.destroy();
      for (const g of zone.graphics) {
        g.destroy();
      }
    }
    this.binZones = [];
  }

  private showTutorialOverlay() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0).setDepth(100);

    const panel = this.add.graphics().setDepth(101);
    panel.fillStyle(0x1a1a3e, 0.95);
    panel.fillRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 12);
    panel.lineStyle(2, 0x00cec9, 0.5);
    panel.strokeRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 12);

    const title = this.add.text(width / 2, height / 2 - 120, 'WELCOME TO CHEMICRAFT', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#00cec9'
    }).setOrigin(0.5).setDepth(102);

    const txt = 'CONTROLS:\n\n' +
                '[ W A S D ] - Move your character\n' +
                '[ E ]       - Interact / Gather\n' +
                '[ I ]       - Open Backpack\n' +
                '[ Q ]       - Open Quest Log\n' +
                '[ K ]       - View Skill Tree\n' +
                '[ C ]       - Open ChemDex\n' +
                '[ T ]       - Cycle Active Tool\n' +
                '[ F ]       - Toggle Fullscreen\n\n' +
                'Start by talking to Mayor Molecule in the center of the village!';

    const desc = this.add.text(width / 2, height / 2, txt, {
      fontFamily: '"Inter"', fontSize: '12px', color: '#dfe6e9', align: 'center', lineSpacing: 5
    }).setOrigin(0.5).setDepth(102);

    const btnG = this.add.graphics().setDepth(102);
    btnG.fillStyle(0x00b894, 0.85);
    btnG.fillRoundedRect(width / 2 - 60, height / 2 + 100, 120, 30, 6);

    const btnT = this.add.text(width / 2, height / 2 + 115, 'START GAME', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(103);

    const zone = this.add.zone(width / 2, height / 2 + 115, 120, 30).setInteractive({ useHandCursor: true }).setDepth(104);

    gameStore.setPaused(true);
    zone.on('pointerdown', () => {
      gameStore.setPaused(false);
      overlay.destroy(); panel.destroy(); title.destroy(); desc.destroy(); btnG.destroy(); btnT.destroy(); zone.destroy();
    });
  }
}
