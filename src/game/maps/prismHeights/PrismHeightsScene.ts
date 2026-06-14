import { BaseGameScene } from '../../BaseGameScene';
import { gameStore } from '../../../store/gameStore';

export class PrismHeightsScene extends BaseGameScene {
  private lightMotes: Phaser.Physics.Arcade.Sprite[] = [];
  private questGlows: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super('PrismHeightsScene');
  }

  getMapKey(): string {
    return 'prismHeights';
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
    }
  }

  protected getResourceNodeEmojiOverlay(): Record<string, string> {
    return { crystal_cluster: '💎', light_well: '💡', prism_shard: '🔷' };
  }

  protected createMapDecorations() {
    this.createLightMotes();
    this.createPrismDecoration();
    this.createLampDecoration();
    this.addPathMarkers();
    this.addQuestIndicatorGlow();
  }

  private createLightMotes() {
    if (!this.textures.exists('mote')) {
      const g = this.add.graphics();
      g.fillStyle(0xb3e5fc, 0.6);
      g.fillCircle(4, 4, 4);
      g.fillStyle(0xffffff, 0.3);
      g.fillCircle(4, 4, 2);
      g.generateTexture('mote', 8, 8);
      g.destroy();
    }

    const ts = this.mapData.tileSize;
    const w = this.mapData.width * ts;
    const h = this.mapData.height * ts;

    for (let i = 0; i < 4; i++) {
      const mote = this.physics.add.sprite(
        Phaser.Math.Between(100, w - 100),
        Phaser.Math.Between(100, h - 100),
        'mote'
      );
      mote.setVelocityX(Phaser.Math.Between(15, 35) * (i % 2 === 0 ? 1 : -1));
      mote.setVelocityY(Phaser.Math.Between(10, 25) * (i % 2 === 0 ? 1 : -1));
      mote.setBounce(1);
      mote.setCollideWorldBounds(true);
      mote.setDepth(2);
      mote.setAlpha(0.7);
      mote.setScale(Phaser.Math.FloatBetween(0.8, 1.4));
      mote.setTint([0xb3e5fc, 0xce93d8, 0xf8bbd0, 0xfff9c4][i]);
      (mote.body as Phaser.Physics.Arcade.Body).setDrag(1, 1);
      this.lightMotes.push(mote);

      this.tweens.add({
        targets: mote,
        alpha: 0.3,
        duration: 2000 + Phaser.Math.Between(0, 1000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.physics.add.collider(mote, this.player);
      if (this.buildings) {
        this.physics.add.collider(mote, this.buildings);
      }

      this.time.addEvent({
        delay: 300,
        loop: true,
        callback: () => {
          if (!mote.active) return;
          if (mote.x < -20) mote.x = w + 10;
          else if (mote.x > w + 20) mote.x = -10;
          if (mote.y < -20) mote.y = 10;
          else if (mote.y > h + 20) mote.y = h - 10;
        },
      });
    }
  }

  private createPrismDecoration() {
    const ts = this.mapData.tileSize;
    for (const dec of this.mapData.decorations) {
      if (dec.type === 'prism') {
        const dx = dec.tileX * ts + ts / 2;
        const dy = dec.tileY * ts + ts / 2;

        const prism = this.add.image(dx, dy, 'tile_square').setDepth(4).setAlpha(0.5).setTint(0xce93d8);
        this.tweens.add({
          targets: prism,
          rotation: { from: -0.1, to: 0.1 },
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        if (!this.textures.exists('prism_sparkle')) {
          const sg = this.add.graphics();
          sg.fillStyle(0xffffff, 0.7);
          sg.fillCircle(2, 2, 2);
          sg.generateTexture('prism_sparkle', 4, 4);
          sg.destroy();
        }
        this.add.particles(dx, dy, 'prism_sparkle', {
          speed: { min: 5, max: 15 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.6, end: 0 },
          lifespan: 1000,
          blendMode: 'ADD',
          tint: [0xce93d8, 0xe1bee7, 0xffffff],
          frequency: 300,
        }).setDepth(6);
      }
    }
  }

  private createLampDecoration() {
    const ts = this.mapData.tileSize;
    for (const dec of this.mapData.decorations) {
      if (dec.type === 'lamp') {
        const dx = dec.tileX * ts + ts / 2;
        const dy = dec.tileY * ts + ts / 2;

        const glow = this.add.circle(dx, dy - 8, 18, 0xfff9c4, 0.15).setDepth(1);
        this.tweens.add({
          targets: glow,
          scaleX: 1.3,
          scaleY: 1.3,
          alpha: 0.05,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  private addPathMarkers() {
    const ts = this.mapData.tileSize;
    const markers: { x: number; y: number; color: number }[] = [];

    for (const npc of this.mapData.npcs) {
      markers.push({ x: npc.tileX * ts + ts / 2, y: npc.tileY * ts + ts / 2 + 18, color: 0xf1c40f });
    }
    for (const b of this.mapData.buildings) {
      markers.push({ x: b.tileX * ts + ts / 2, y: b.tileY * ts + ts / 2 + 18, color: 0x4caf50 });
    }
    for (const node of this.mapData.resourceNodes || []) {
      markers.push({ x: node.tileX * ts + ts / 2, y: node.tileY * ts + ts / 2 + 18, color: 0x42a5f5 });
    }

    for (const m of markers) {
      const dot = this.add.circle(m.x, m.y, 2, m.color, 0.4).setDepth(10);
      this.tweens.add({
        targets: dot,
        alpha: 0.15,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private addQuestIndicatorGlow() {
    const ts = this.mapData.tileSize;
    for (const npcSpawn of this.mapData.npcs) {
      const allNpcs = this.cache.json.get('npcs') as Record<string, any>;
      const npcData = allNpcs[npcSpawn.npcId];
      if (!npcData || !npcData.questId) continue;

      if (this.questSystem?.canAcceptQuest(npcData.questId)) {
        const nx = npcSpawn.tileX * ts + ts / 2;
        const ny = npcSpawn.tileY * ts + ts / 2;
        const glow = this.add.circle(nx, ny, 14, 0xf1c40f, 0.25).setDepth(0);
        this.tweens.add({
          targets: glow,
          scaleX: 1.3,
          scaleY: 1.3,
          alpha: 0.1,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.questGlows.push(glow);
      }
    }
  }
}
