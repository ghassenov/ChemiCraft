import Phaser from 'phaser';
import { QuestManager } from '../systems/QuestManager.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import {
  groundGrid, decorationGrid, pois, npcs,
  MAP_WIDTH, MAP_HEIGHT, TILE_SIZE
} from '../data/atom_meadows.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    if (this.registry.has('questManager')) {
      this.questManager = this.registry.get('questManager');
    } else {
      this.questManager = new QuestManager();
      this.questManager.addReagent('H', 5);
      this.questManager.addReagent('O', 3);
      this.questManager.addReagent('N', 3);
      this.questManager.addReagent('C', 2);
      this.registry.set('questManager', this.questManager);
    }

    this.playerSpeed = 160;
    this.dialogueBox = null;

    this._buildMap();
    this._createPlayer();
    this._createAnimations();
    this._setupCamera();
    this._setupInput();
    this._createNPCs();
    this._createHUD();
    this._createInteractionPrompt();
  }

  _buildMap() {
    const map = this.make.tilemap({
      data: [groundGrid, decorationGrid],
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    const tileset = map.addTilesetImage('tileset');

    this.groundLayer = map.createLayer(0, tileset, 0, 0);
    this.decoLayer = map.createLayer(1, tileset, 0, 0);

    this.groundLayer.setCollisionBetween(10, 14);
    this.groundLayer.setCollision([60, 61, 62, 63, 65, 66]);

    this.physics.world.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
  }

  _createPlayer() {
    const spawnX = 9 * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = 13 * TILE_SIZE + TILE_SIZE / 2;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player', 0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 32);
    this.player.body.setOffset(8, 28);
    this.player.setDepth(10);

    this.physics.add.collider(this.player, this.groundLayer);
  }

  _createAnimations() {
    const anims = [
      { key: 'idle_down',   frames: [{ key: 'player', frame: 0 }], frameRate: 1 },
      { key: 'walk_down',   frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }), frameRate: 8 },
      { key: 'idle_up',     frames: [{ key: 'player', frame: 3 }], frameRate: 1 },
      { key: 'walk_up',     frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }), frameRate: 8 },
      { key: 'idle_right',  frames: [{ key: 'player', frame: 6 }], frameRate: 1 },
      { key: 'walk_right',  frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }), frameRate: 8 },
      { key: 'idle_left',   frames: [{ key: 'player', frame: 6 }], frameRate: 1 },
      { key: 'walk_left',   frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }), frameRate: 8 },
    ];
    for (const a of anims) {
      if (!this.anims.exists(a.key)) {
        this.anims.create({ ...a, repeat: -1 });
      }
    }
  }

  _setupCamera() {
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update() {
    if (this.dialogueBox && this.dialogueBox.isVisible()) {
      this.player.setVelocity(0, 0);
      this.player.anims.play('idle_down', true);
      return;
    }

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.setFlipX(true);
      this.player.anims.play('walk_left', true);
    } else if (right) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.setFlipX(false);
      this.player.anims.play('walk_right', true);
    } else {
      this.player.setVelocityX(0);
    }

    if (up) {
      this.player.setVelocityY(-this.playerSpeed);
      if (!left && !right) this.player.anims.play('walk_up', true);
    } else if (down) {
      this.player.setVelocityY(this.playerSpeed);
      if (!left && !right) this.player.anims.play('walk_down', true);
    } else {
      this.player.setVelocityY(0);
    }

    if (!left && !right && !up && !down) {
      const anim = this.player.anims.currentAnim;
      if (anim) {
        const key = anim.key.replace('walk_', 'idle_');
        this.player.anims.play(key, true);
      } else {
        this.player.anims.play('idle_down', true);
      }
    }

    this._checkInteraction();
  }

  _createNPCs() {
    for (const npcDef of npcs) {
      const x = npcDef.tileX * TILE_SIZE + TILE_SIZE / 2;
      const y = npcDef.tileY * TILE_SIZE + TILE_SIZE / 2;

      const npc = this.add.sprite(x, y, 'npc_square');
      npc.setTint(npcDef.color);
      npc.setDepth(5);

      this.add.text(x, y - 40, npcDef.name, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(6);
    }
  }

  _createInteractionPrompt() {
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffdd44',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0);
    this.promptText.setVisible(false);
  }

  _checkInteraction() {
    let closest = null;
    let minDist = Infinity;
    const px = this.player.x;
    const py = this.player.y;

    for (const npcDef of npcs) {
      const nx = npcDef.tileX * TILE_SIZE + TILE_SIZE / 2;
      const ny = npcDef.tileY * TILE_SIZE + TILE_SIZE / 2;
      const dist = Phaser.Math.Distance.Between(px, py, nx, ny);
      if (dist < TILE_SIZE * 2 && dist < minDist) {
        minDist = dist;
        closest = { type: 'npc', data: npcDef };
      }
    }

    for (const poi of Object.values(pois)) {
      const nx = poi.tileX * TILE_SIZE + TILE_SIZE;
      const ny = poi.tileY * TILE_SIZE + TILE_SIZE * 1.5;
      const dist = Phaser.Math.Distance.Between(px, py, nx, ny);
      if (dist < TILE_SIZE * 2.5 && dist < minDist) {
        minDist = dist;
        closest = { type: 'poi', data: poi };
      }
    }

    if (closest) {
      const label = closest.type === 'npc'
        ? `[E] Talk to ${closest.data.name}`
        : `[E] Enter ${closest.data.label}`;
      this.promptText.setText(label);
      this.promptText.setVisible(true);
      this.promptText.setPosition(this.cameras.main.width / 2, this.cameras.main.height - 200);

      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        if (closest.type === 'npc') {
          this._talkToNPC(closest.data);
        } else {
          this._enterPOI(closest.data);
        }
      }
    } else {
      this.promptText.setVisible(false);
    }
  }

  _talkToNPC(npcDef) {
    const quest = this.questManager.quests.find(q => q.npc === npcDef.id);
    if (!quest) return;
    if (this.questManager.completedQuests.includes(quest.id)) return;

    const d = quest.dialogue;
    const lines = [d.greeting, d.problem, d.hint];

    this.dialogueBox = new DialogueBox(this, {
      npcName: npcDef.name,
      lines,
      onAccept: () => {
        this.questManager.acceptQuest(quest.id);
        const qt = this.add.text(
          this.cameras.main.width / 2, 60,
          `Quest: ${quest.title}`,
          { fontFamily: 'monospace', fontSize: '14px', color: '#ffdd44', backgroundColor: '#000000aa', padding: { x: 8, y: 4 } }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(20);
        this.time.delayedCall(4000, () => qt.destroy());
        this.dialogueBox = null;
      },
    });
    this.dialogueBox.show();
  }

  _enterPOI(poi) {
    this.scene.start(poi.scene);
  }

  _createHUD() {
    const w = this.cameras.main.width;

    this.coinText = this.add.text(w - 20, 10, '🪙 0', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffdd44',
      backgroundColor: '#00000088', padding: { x: 8, y: 4 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(20);

    this.questManager.onChange((state) => {
      this.coinText.setText(`🪙 ${state.coins}`);
    });
  }
}
