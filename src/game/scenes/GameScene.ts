import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { ResourceNode, ResourceType } from '../entities/ResourceNode';
import { DialogueBox } from '../ui/DialogueBox';
import { QuestSystem } from '../systems/QuestSystem';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';
import { MapData, NPCData, QuestData, GameEvents, Direction } from '../data/types';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private npcs: Phaser.GameObjects.Group;
  private dialogueBox!: DialogueBox;
  private questSystem!: QuestSystem;
  private mapData!: MapData;
  private buildings!: Phaser.Physics.Arcade.StaticGroup;
  private groundLayer!: Phaser.GameObjects.Group;
  private portalPrompt!: Phaser.GameObjects.Text;

  private resourceNodes!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({ key: 'GameScene' });
    this.npcs = null as any;
    this.buildings = null as any;
  }

  create() {
    if (!this.scene.isActive('HUDScene')) {
      this.scene.launch('HUDScene');
    }

    this.cameras.main.fadeIn(500, 0, 0, 0);
    const { width, height } = this.cameras.main;

    const currentMapKey = gameStore.getCurrentMap();
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
    if (this.mapData.resourceNodes && this.mapData.resourceNodes.length > 0) {
      for (const nodeData of this.mapData.resourceNodes) {
        const rx = nodeData.tileX * ts + ts / 2;
        const ry = nodeData.tileY * ts + ts / 2;
        const node = new ResourceNode(this, rx, ry, nodeData.type as ResourceType, nodeData.maxGathers);
        this.resourceNodes.add(node);
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

    this.player.onInteract(() => this.handleInteraction(allNpcs));

    if (!this.sound.get('bgm')) {
      this.sound.play('bgm', { loop: true, volume: 0.4 });
    }

    this.createOverworldDecorations();

    const unsub = gameStore.subscribe(() => {
      const state = gameStore.getState();
      this.player.canMove = !state.isDialogueOpen && !state.isPaused;
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => unsub());

    if (!sessionStorage.getItem('chemicraft_tutorial_shown')) {
      sessionStorage.setItem('chemicraft_tutorial_shown', '1');
      this.showTutorialOverlay();
    }
  }

  update(time: number, delta: number) {
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

    const px = Math.floor(this.player.x / ts);
    const py = Math.floor(this.player.y / ts);

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
        if (distToPortal < 40) {
          nearPortal = true;
          const currentMapKey = this.mapData.key;
          const nextMapKey = portal.targetMap;
          const isUnlockPortal = portal.unlockCondition === 'all_quests';

          if (isUnlockPortal) {
            const allMainComplete = this.checkAllMainQuestsComplete();
            if (allMainComplete) {
              this.portalPrompt.setText('[E] Travel to next region');
              this.portalPrompt.setColor('#00cec9');
              if (Phaser.Input.Keyboard.JustDown(this.player.interactKey)) {
                this.portalPrompt.setAlpha(0);
                this.unlockAndTravel(currentMapKey, nextMapKey, portal);
              }
            } else {
              this.portalPrompt.setText('Complete all quests to unlock the portal');
              this.portalPrompt.setColor('#ff7675');
            }
          } else {
            this.portalPrompt.setText('[E] Travel to ' + portal.targetMap);
            this.portalPrompt.setColor('#00cec9');
            if (Phaser.Input.Keyboard.JustDown(this.player.interactKey)) {
              this.portalPrompt.setAlpha(0);
              this.unlockAndTravel(currentMapKey, nextMapKey, portal);
            }
          }
          this.portalPrompt.setPosition(this.cameras.main.width / 2, 80);
          this.portalPrompt.setAlpha(1);
          break;
        }
      }
      if (!nearPortal) {
        this.portalPrompt.setAlpha(0);
      }
    }
  }

  private unlockAndTravel(currentMapKey: string, nextMapKey: string, portal: any) {
    const allMaps = this.cache.json.get('maps') as Record<string, MapData>;
    if (allMaps[nextMapKey]) {
      gameStore.unlockMap(nextMapKey);
      gameStore.travelToMap(nextMapKey);
      gameStore.markMapCompleted(currentMapKey);
      this.sound.stopByKey('bgm');
      SceneTransition.fadeOutIn(this, 'GameScene');
    } else {
      const event = new CustomEvent('chemicraft:notification', {
        detail: { message: 'Victory! All maps completed!', color: '#f1c40f' }
      });
      window.dispatchEvent(event);
      SceneTransition.fadeOutIn(this, 'MainMenuScene');
    }
  }

  private checkAllMainQuestsComplete(): boolean {
    const allQuests = this.cache.json.get('quests') as Record<string, any>;
    const currentMap = this.mapData.key;
    const mapQuests = Object.values(allQuests).filter((q: any) => q.mapOrigin === currentMap && q.isMainQuest);
    return mapQuests.every((q: any) => gameStore.isQuestCompleted(q.id));
  }

  private applyTheme() {
    const theme = this.mapData.theme;
    if (theme) {
      this.cameras.main.setBackgroundColor(theme.bgColor);
    }
  }

  private createOverworldDecorations() {
    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;

    const theme = this.mapData.theme;
    const particleTint: number[] = theme?.accentColor
      ? [theme.accentColor, theme.groundColor, theme.wallColor]
      : [0xa8e6cf, 0xdcedc1, 0xffd3b6];

    this.add.particles(0, 0, 'icon_particle', {
      x: { min: 0, max: mapW },
      y: { min: 0, max: mapH },
      lifespan: 6000,
      speed: { min: 5, max: 18 },
      angle: { min: 200, max: 250 },
      scale: { start: 0.25, end: 0 },
      alpha: { start: 0.35, end: 0 },
      blendMode: 'ADD',
      tint: particleTint,
      frequency: 350,
    }).setDepth(15);

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

    const flowerEmojis = ['🌿', '🌸', '🌼', '🍀', '🌱'];
    const flowerPositions: { x: number, y: number }[] = [];
    for (let i = 0; i < 25; i++) {
      const fx = Phaser.Math.Between(2, this.mapData.width - 3) * ts + Phaser.Math.Between(-10, 10);
      const fy = Phaser.Math.Between(2, this.mapData.height - 3) * ts + Phaser.Math.Between(-10, 10);
      let blocked = false;
      for (const b of this.mapData.buildings) {
        for (const [bx, by] of b.tiles) {
          if (Math.abs(fx - bx * ts) < ts && Math.abs(fy - by * ts) < ts) { blocked = true; break; }
        }
        if (blocked) break;
      }
      if (!blocked) flowerPositions.push({ x: fx, y: fy });
    }
    for (const fp of flowerPositions) {
      const emoji = flowerEmojis[Phaser.Math.Between(0, flowerEmojis.length - 1)];
      const flower = this.add.text(fp.x, fp.y, emoji, { fontSize: '14px' }).setOrigin(0.5).setDepth(2).setAlpha(0.7);
      this.tweens.add({
        targets: flower,
        y: flower.y - 2,
        angle: Phaser.Math.Between(-5, 5),
        duration: 2000 + Phaser.Math.Between(0, 1000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
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

  private handleInteraction(allNpcs: Record<string, NPCData>) {
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
        if (result === 'wrong_tool') {
          const required = (node.resourceType === 'water' || node.resourceType === 'air') ? 'Flask' : 'Pickaxe';
          const t = this.add.text(node.x, node.y - 20, `Equip ${required}! [T]`, {
            fontFamily: '"Inter"', fontSize: '11px', color: '#ff7675', fontStyle: 'bold'
          }).setOrigin(0.5).setDepth(40);
          this.tweens.add({
            targets: t, y: t.y - 30, alpha: 0, duration: 2000, onComplete: () => t.destroy()
          });
          this.cameras.main.shake(120, 0.003);
        } else if (result) {
          gameStore.addToInventory(result, 1);
          const t = this.add.text(node.x, node.y - 20, `+1 ${node.resourceType}`, {
            fontFamily: '"Inter"', fontSize: '12px', color: '#00cec9', fontStyle: 'bold'
          }).setOrigin(0.5).setDepth(40);
          this.tweens.add({
            targets: t, y: t.y - 30, alpha: 0, duration: 1500, onComplete: () => t.destroy()
          });
          this.sound.play('sfx_coin', { volume: 0.3 });
        }
        interactedNode = true;
        break;
      }
    }

    if (interactedNode) return;

    if (closestNpc && closestNpc.npcId) {
      const data = allNpcs[closestNpc.npcId];
      if (!data) return;

      if (data.id === 'shopkeeper_sal' || data.id === 'green_dealer') {
        this.dialogueBox.show(data.name, data.dialogue.default, data.spriteColor, undefined, () => {
          SceneTransition.fadeOutIn(this, 'ShopInteriorScene');
        });
      } else if (data.id === 'professor_knowitall' || data.id === 'eco_educator') {
        this.dialogueBox.show(data.name, data.dialogue.default, data.spriteColor, undefined, () => {
          SceneTransition.fadeOutIn(this, 'LibraryInteriorScene');
        });
      } else if (data.id === 'lab_assistant') {
        this.dialogueBox.show(data.name, data.dialogue.default, data.spriteColor, undefined, () => {
          SceneTransition.fadeOutIn(this, 'LabInteriorScene');
        });
      } else {
        if (data.questId && gameStore.isQuestActive(data.questId)) {
          const quest = this.questSystem.getQuest(data.questId);
          if (quest && (quest.objectiveType === 'craft' || quest.objectiveType === 'collect')) {
            const targetItemId = quest.targetItemId;
            if (targetItemId && gameStore.hasItem(targetItemId, quest.targetAmount || 1)) {
              gameStore.removeFromInventory(targetItemId, quest.targetAmount || 1);
              this.questSystem.completeQuest(data.questId);
            }
          }
        }

        const lines = this.questSystem.getNpcDialogue(data);
        let questToOffer: string | undefined;
        if (data.questId && this.questSystem.canAcceptQuest(data.questId)) {
          questToOffer = data.questId;
        }
        this.dialogueBox.show(data.name, lines, data.spriteColor, questToOffer);
      }
    }
  }

  private buildMap() {
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

  private drawBuildingFacades() {
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
    const entrancePx = b.tileX * ts + ts / 2;

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
                '[ T ]       - Cycle Active Tool\n\n' +
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
