import Phaser from 'phaser';
import { BaseGameScene } from '../../BaseGameScene';
import { gameStore } from '../../../store/gameStore';

export class EcoVilleScene extends BaseGameScene {
  private leaves: Phaser.Physics.Arcade.Sprite[] = [];
  private questGlows: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super('EcoVilleScene');
  }

  getMapKey(): string {
    return 'ecoVille';
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
    return { pollution_vent: '☁️', clean_water_spring: '💧', biomass_pile: '🌿' };
  }

  protected createMapDecorations() {
    this.createLeafPhysics();
    this.createPollutionParticles();
    this.createWaterRipples();
    this.animateDecorations();
    this.addPathMarkers();
    this.addQuestIndicatorGlow();
  }

  private createLeafPhysics() {
    if (!this.textures.exists('leaf')) {
      const g = this.add.graphics();
      g.fillStyle(0x4caf50, 0.7);
      g.fillEllipse(4, 3, 8, 5);
      g.fillStyle(0x81c784, 0.3);
      g.fillEllipse(4, 3, 6, 3);
      g.generateTexture('leaf', 8, 6);
      g.destroy();
    }

    const ts = this.mapData.tileSize;
    const w = this.mapData.width * ts;
    const h = this.mapData.height * ts;

    for (let i = 0; i < 4; i++) {
      const leaf = this.physics.add.sprite(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        'leaf'
      );
      leaf.setVelocityX(Phaser.Math.Between(30, 70) * (i % 2 === 0 ? 1 : -1));
      leaf.setVelocityY(Phaser.Math.Between(-5, 5));
      leaf.setBounce(1);
      leaf.setCollideWorldBounds(true);
      leaf.setDepth(1);
      leaf.setAlpha(0.8);
      leaf.setScale(Phaser.Math.FloatBetween(0.8, 1.3));
      (leaf.body as Phaser.Physics.Arcade.Body).setDrag(2, 2);
      this.leaves.push(leaf);

      this.tweens.add({
        targets: leaf,
        angle: { from: 0, to: 360 },
        duration: Phaser.Math.Between(3000, 5000),
        repeat: -1,
        ease: 'Linear',
      });

      this.physics.add.collider(leaf, this.player);
      if (this.buildings) {
        this.physics.add.collider(leaf, this.buildings);
      }

      this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          if (!leaf.active) return;
          if (leaf.x < -20) leaf.x = w + 10;
          else if (leaf.x > w + 20) leaf.x = -10;
          if (leaf.y < -20) leaf.y = 10;
          else if (leaf.y > h + 20) leaf.y = h - 10;
        },
      });
    }
  }

  private createPollutionParticles() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'pollution_vent');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const px = nodeData.tileX * ts + ts / 2;
    const py = nodeData.tileY * ts + ts / 2;

    if (!this.textures.exists('pollution_particle')) {
      const g = this.add.graphics();
      g.fillStyle(0x636e72, 0.7);
      g.fillCircle(3, 3, 3);
      g.generateTexture('pollution_particle', 6, 6);
      g.destroy();
    }

    this.add.particles(px, py, 'pollution_particle', {
      speed: { min: 8, max: 20 },
      angle: { min: 250, max: 290 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: { min: 1500, max: 3000 },
      frequency: 600,
      blendMode: 'ADD',
      quantity: 1,
    }).setDepth(5);
  }

  private createWaterRipples() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'clean_water_spring');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const sx = nodeData.tileX * ts + ts / 2;
    const sy = nodeData.tileY * ts + ts / 2;

    for (let i = 0; i < 3; i++) {
      const ripple = this.add.circle(sx, sy, 4, 0x4fc3f7, 0.25).setDepth(2);
      this.tweens.add({
        targets: ripple,
        scaleX: 3,
        scaleY: 3,
        alpha: 0,
        duration: 2500,
        repeat: -1,
        delay: i * 800,
        onRepeat: () => { ripple.setScale(1).setAlpha(0.25); },
      });
    }
  }

  private animateDecorations() {
    const ts = this.mapData.tileSize;
    for (const dec of this.mapData.decorations) {
      const dx = dec.tileX * ts + ts / 2;
      const dy = dec.tileY * ts + ts / 2;

      if (dec.type === 'solar_panel') {
        const panel = this.add.image(dx, dy + 4, 'tile_square').setDepth(4).setAlpha(0.6).setTint(0x4caf50);
        this.tweens.add({
          targets: panel,
          rotation: { from: -0.05, to: 0.05 },
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        const sparkle = this.add.circle(dx + 6, dy - 4, 2, 0xfff9c4, 0.6).setDepth(6);
        this.tweens.add({
          targets: sparkle,
          alpha: 0,
          scale: 2,
          duration: 1500,
          repeat: -1,
          delay: Phaser.Math.Between(0, 2000),
        });
      } else if (dec.type === 'tree') {
        const tree = this.add.image(dx, dy + 4, 'tile_square').setDepth(4).setAlpha(0.4).setTint(0x2d5a27);
        this.tweens.add({
          targets: tree,
          rotation: { from: -0.02, to: 0.02 },
          duration: 4000,
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
