import { BaseGameScene } from '../../BaseGameScene';

export class PrismHeightsScene extends BaseGameScene {
  private lightMotes: Phaser.Physics.Arcade.Sprite[] = [];
  private questGlows: Phaser.GameObjects.Arc[] = [];
  private rainbowAngle = 0;

  constructor() {
    super('PrismHeightsScene');
  }

  getMapKey(): string {
    return 'prismHeights';
  }

  protected applyTileTint(tile: Phaser.GameObjects.Image, tileVal: number, _x: number, _y: number) {
    if (tileVal === 0 || (tileVal >= 2 && tileVal <= 4)) {
      // Soft lavender-silver ground
      tile.setTint(0x9188aa);
    } else if (tileVal === 1) {
      tile.setTint(0x5c4d6e);
    } else if (tileVal === 5) {
      // Path — iridescent pale gold
      tile.setTint(0xc8b8e0);
    }
  }

  protected getResourceNodeEmojiOverlay(): Record<string, string> {
    return { crystal_cluster: '💎', light_well: '💡', prism_shard: '🔷' };
  }

  protected createMapDecorations() {
    this.createSpectralGroundOverlay();
    this.createAuroraRibbons();
    this.createRainbowLightBeams();
    this.createDriftingMotes();
    this.createPrismCrystals();
    this.createCrystalClusterEffect();
    this.createLightWellBeacon();
    this.createPrismShardGlow();
    this.addQuestIndicatorGlow();
  }

  // ─── Iridescent ground colour variation ───────────────────────────────────────
  private createSpectralGroundOverlay() {
    const ts = this.mapData.tileSize;
    const g = this.add.graphics().setDepth(1).setAlpha(0.14);

    const spectra = [0x9b8ec4, 0x8899cc, 0xaa88cc, 0x8ab0cc, 0xc4a0cc, 0x88b8cc, 0xb899cc];
    for (let y = 1; y < this.mapData.height - 1; y++) {
      for (let x = 1; x < this.mapData.width - 1; x++) {
        if (this.mapData.ground[y][x] !== 0) continue;
        const hash = (x * 41 + y * 83) % spectra.length;
        g.fillStyle(spectra[hash], 1);
        g.fillRect(x * ts + 1, y * ts + 1, ts - 2, ts - 2);
      }
    }

    // Soft prismatic shimmer patches
    for (let i = 0; i < 16; i++) {
      const px = Phaser.Math.Between(2, this.mapData.width - 2) * ts;
      const py = Phaser.Math.Between(2, this.mapData.height - 2) * ts;
      const colors = [0xce93d8, 0x90caf9, 0x80deea, 0xf48fb1, 0xfff59d, 0xa5d6a7];
      const col = colors[i % colors.length];
      const patch = this.add.circle(px, py, Phaser.Math.Between(10, 28), col, 0.07).setDepth(1);
      this.tweens.add({
        targets: patch,
        alpha: 0.02,
        scaleX: Phaser.Math.FloatBetween(1.1, 1.5),
        scaleY: Phaser.Math.FloatBetween(1.1, 1.5),
        duration: Phaser.Math.Between(2500, 5500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000),
      });
    }
  }

  // ─── Slow aurora ribbons drifting across the sky ──────────────────────────────
  private createAuroraRibbons() {
    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;

    const auroraColors = [0x9c27b0, 0x3f51b5, 0x00bcd4, 0x4caf50, 0xcddc39];

    for (let i = 0; i < 5; i++) {
      const col = auroraColors[i % auroraColors.length];
      const yPos = Phaser.Math.Between(ts * 2, mapH - ts * 2);
      const ribbon = this.add.rectangle(
        -60, yPos,
        Phaser.Math.Between(80, 160),
        Phaser.Math.Between(2, 5),
        col, 0.18
      ).setDepth(2).setOrigin(0, 0.5);

      this.tweens.add({
        targets: ribbon,
        x: mapW + 80,
        alpha: 0,
        scaleX: Phaser.Math.FloatBetween(0.6, 1.4),
        duration: Phaser.Math.Between(8000, 16000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 10000),
        ease: 'Linear',
        onRepeat: () => {
          ribbon.y = Phaser.Math.Between(ts * 2, mapH - ts * 2);
          ribbon.x = -60;
          ribbon.setAlpha(0.18);
        },
      });
    }
  }

  // ─── Rainbow light-beam fans sweeping from map edges ──────────────────────────
  private createRainbowLightBeams() {
    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;

    const beamColors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0077ff, 0x8800ff];

    // Top-left corner beam fan
    for (let i = 0; i < beamColors.length; i++) {
      const beamG = this.add.graphics().setDepth(1).setAlpha(0.06);
      const angle = (i * 12) * (Math.PI / 180);
      const len = Phaser.Math.Between(140, 220);
      const ex = Math.cos(angle) * len;
      const ey = Math.sin(angle) * len;
      beamG.fillStyle(beamColors[i], 1);
      beamG.fillTriangle(ts, ts, ts + ex - 6, ts + ey, ts + ex + 6, ts + ey);

      this.tweens.add({
        targets: beamG,
        alpha: 0.02,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 200,
      });
    }

    // Bottom-right corner beam fan
    for (let i = 0; i < beamColors.length; i++) {
      const beamG = this.add.graphics().setDepth(1).setAlpha(0.06);
      const angle = Math.PI + (i * 12) * (Math.PI / 180);
      const len = Phaser.Math.Between(120, 200);
      const ex = Math.cos(angle) * len;
      const ey = Math.sin(angle) * len;
      beamG.fillStyle(beamColors[beamColors.length - 1 - i], 1);
      beamG.fillTriangle(
        mapW - ts, mapH - ts,
        mapW - ts + ex - 5, mapH - ts + ey,
        mapW - ts + ex + 5, mapH - ts + ey
      );
      this.tweens.add({
        targets: beamG,
        alpha: 0.015,
        duration: Phaser.Math.Between(2500, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 250 + 1000,
      });
    }
  }

  // ─── Dense drifting light motes of many colours ───────────────────────────────
  private createDriftingMotes() {
    if (!this.textures.exists('prism_mote')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(4, 4, 4);
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(4, 4, 2);
      g.generateTexture('prism_mote', 8, 8);
      g.destroy();
    }

    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;
    const moteColors = [0xce93d8, 0x90caf9, 0x80deea, 0xf48fb1, 0xfff59d, 0xa5d6a7, 0xff8a65, 0xb39ddb];

    for (let i = 0; i < 20; i++) {
      const mote = this.physics.add.sprite(
        Phaser.Math.Between(ts, mapW - ts),
        Phaser.Math.Between(ts, mapH - ts),
        'prism_mote'
      );
      const speed = Phaser.Math.Between(10, 40);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      mote.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      mote.setBounce(1);
      mote.setCollideWorldBounds(true);
      mote.setDepth(3 + (i % 4));
      mote.setAlpha(Phaser.Math.FloatBetween(0.4, 0.85));
      mote.setScale(Phaser.Math.FloatBetween(0.5, 1.6));
      mote.setTint(moteColors[i % moteColors.length]);
      (mote.body as Phaser.Physics.Arcade.Body).setDrag(0.5, 0.5);
      this.lightMotes.push(mote);

      // Pulse alpha
      this.tweens.add({
        targets: mote,
        alpha: Phaser.Math.FloatBetween(0.1, 0.3),
        duration: Phaser.Math.Between(1200, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });

      // Wrap edges
      this.time.addEvent({
        delay: 400,
        loop: true,
        callback: () => {
          if (!mote.active) return;
          if (mote.x < -20) mote.x = mapW + 5;
          else if (mote.x > mapW + 20) mote.x = -5;
          if (mote.y < -20) mote.y = mapH - 5;
          else if (mote.y > mapH + 20) mote.y = 5;
        },
      });
    }
  }

  // ─── Prism crystals with rainbow refraction fans ──────────────────────────────
  private createPrismCrystals() {
    const ts = this.mapData.tileSize;
    const prismDecs = this.mapData.decorations.filter(d => d.type === 'prism');

    const rainbowColors = [0xff4444, 0xff9900, 0xffee00, 0x44ff44, 0x44aaff, 0x8844ff];

    for (const dec of prismDecs) {
      const dx = dec.tileX * ts + ts / 2;
      const dy = dec.tileY * ts + ts / 2;

      // Crystal body — tall faceted triangle
      const crystalG = this.add.graphics().setDepth(4);
      crystalG.fillStyle(0xce93d8, 0.85);
      crystalG.fillTriangle(dx, dy - 16, dx - 10, dy + 8, dx + 10, dy + 8);
      crystalG.fillStyle(0xe1bee7, 0.5);
      crystalG.fillTriangle(dx - 2, dy - 16, dx - 12, dy + 8, dx + 4, dy + 8);
      crystalG.lineStyle(1.5, 0xf3e5f5, 0.8);
      crystalG.strokeTriangle(dx, dy - 16, dx - 10, dy + 8, dx + 10, dy + 8);
      // Inner facet lines
      crystalG.lineStyle(0.5, 0xffffff, 0.4);
      crystalG.lineBetween(dx, dy - 16, dx, dy + 8);
      crystalG.lineBetween(dx - 10, dy + 8, dx + 5, dy - 4);

      // Gentle levitation
      this.tweens.add({
        targets: crystalG,
        y: -3,
        rotation: Phaser.Math.FloatBetween(-0.06, 0.06),
        duration: Phaser.Math.Between(2000, 3500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1500),
      });

      // Rainbow refraction fan — 6 coloured rays emanating from tip
      const fanG = this.add.graphics().setDepth(3).setAlpha(0.12);
      for (let r = 0; r < rainbowColors.length; r++) {
        const rayAngle = (r * 22 - 60) * (Math.PI / 180);
        const rayLen = Phaser.Math.Between(28, 55);
        fanG.fillStyle(rainbowColors[r], 1);
        fanG.fillTriangle(
          dx, dy + 6,
          dx + Math.cos(rayAngle) * rayLen - 3,
          dy + 8 + Math.sin(rayAngle) * rayLen,
          dx + Math.cos(rayAngle) * rayLen + 3,
          dy + 8 + Math.sin(rayAngle) * rayLen
        );
      }
      this.tweens.add({
        targets: fanG,
        alpha: 0.04,
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });

      // Sparkle particle burst at crystal tip
      this.add.particles(dx, dy - 14, 'icon_particle', {
        speed: { min: 8, max: 22 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.22, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: { min: 500, max: 1200 },
        blendMode: 'ADD',
        tint: [0xce93d8, 0xf48fb1, 0x90caf9, 0xfff59d, 0xffffff],
        frequency: 220,
      }).setDepth(6);

      // Purple glow beneath crystal
      const glow = this.add.circle(dx, dy + 6, 16, 0xce93d8, 0.14).setDepth(2);
      this.tweens.add({
        targets: glow,
        alpha: 0.04,
        scaleX: 1.6,
        scaleY: 1.6,
        duration: Phaser.Math.Between(1500, 2800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1000),
      });
    }
  }

  // ─── Crystal cluster — faceted gem with spectral shimmer ──────────────────────
  private createCrystalClusterEffect() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'crystal_cluster');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const cx = nodeData.tileX * ts + ts / 2;
    const cy = nodeData.tileY * ts + ts / 2;

    // Cluster of 5 small crystals at varying heights
    const offsets = [[-8, 0, 12], [0, -4, 16], [8, 0, 12], [-4, 6, 9], [5, 5, 9]];
    for (const [ox, oy, h] of offsets) {
      const cg = this.add.graphics().setDepth(3);
      cg.fillStyle(0x80deea, 0.85);
      cg.fillTriangle(cx + ox, cy + oy - h, cx + ox - 5, cy + oy + 5, cx + ox + 5, cy + oy + 5);
      cg.lineStyle(1, 0xb2ebf2, 0.8);
      cg.strokeTriangle(cx + ox, cy + oy - h, cx + ox - 5, cy + oy + 5, cx + ox + 5, cy + oy + 5);
      this.tweens.add({
        targets: cg,
        y: -2,
        duration: Phaser.Math.Between(1800, 3200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1500),
      });
    }

    // Concentric shimmer rings
    for (let i = 0; i < 4; i++) {
      const ring = this.add.circle(cx, cy, 8, 0x80deea, 0.2).setDepth(2);
      this.tweens.add({
        targets: ring,
        scaleX: 3.5, scaleY: 3.5, alpha: 0,
        duration: 2400, repeat: -1, delay: i * 600,
        ease: 'Quad.easeOut',
      });
    }

    // Sparkle particles
    this.add.particles(cx, cy, 'icon_particle', {
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.25, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 600, max: 1400 },
      blendMode: 'ADD',
      tint: [0x80deea, 0xb2ebf2, 0xe0f7fa, 0xffffff],
      frequency: 160,
    }).setDepth(6);
  }

  // ─── Light well — radiant beacon column ───────────────────────────────────────
  private createLightWellBeacon() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'light_well');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const lx = nodeData.tileX * ts + ts / 2;
    const ly = nodeData.tileY * ts + ts / 2;

    // Well base ring
    const base = this.add.graphics().setDepth(3);
    base.fillStyle(0x4a3a6a, 0.95);
    base.fillEllipse(lx, ly + 4, 28, 12);
    base.fillStyle(0xffd54f, 0.4);
    base.fillEllipse(lx, ly + 2, 18, 7);

    // Rising golden light column — tall thin rect that fades upward
    const beam = this.add.graphics().setDepth(4).setAlpha(0.22);
    beam.fillGradientStyle(0xffd54f, 0xffd54f, 0xffd54f, 0xffd54f, 0.7, 0.7, 0, 0);
    beam.fillRect(lx - 5, ly - 48, 10, 50);
    this.tweens.add({
      targets: beam,
      alpha: 0.08,
      scaleY: 1.3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Pulsing concentric gold rings
    for (let i = 0; i < 4; i++) {
      const ring = this.add.circle(lx, ly, 8, 0xffd54f, 0.25).setDepth(3);
      this.tweens.add({
        targets: ring,
        scaleX: 4, scaleY: 2.5, alpha: 0,
        duration: 2200, repeat: -1, delay: i * 550,
        ease: 'Quad.easeOut',
      });
    }

    // Bright sparkle burst rising upward
    this.add.particles(lx, ly - 8, 'icon_particle', {
      speed: { min: 20, max: 50 },
      angle: { min: 255, max: 285 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: { min: 600, max: 1400 },
      blendMode: 'ADD',
      tint: [0xffd54f, 0xfff9c4, 0xffffff, 0xffee58],
      frequency: 100,
    }).setDepth(7);

    // Ground golden glow
    const glow = this.add.circle(lx, ly + 2, 22, 0xffd54f, 0.15).setDepth(2);
    this.tweens.add({
      targets: glow, alpha: 0.04, scaleX: 1.6, scaleY: 1.6,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // ─── Prism shard — small floating fragment ────────────────────────────────────
  private createPrismShardGlow() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'prism_shard');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const sx = nodeData.tileX * ts + ts / 2;
    const sy = nodeData.tileY * ts + ts / 2;

    // Shard body — small angled gem
    const shardG = this.add.graphics().setDepth(4);
    shardG.fillStyle(0x42a5f5, 0.9);
    shardG.fillTriangle(sx, sy - 12, sx - 7, sy + 4, sx + 7, sy + 4);
    shardG.fillStyle(0x90caf9, 0.5);
    shardG.fillTriangle(sx - 2, sy - 12, sx - 9, sy + 4, sx + 3, sy + 4);
    shardG.lineStyle(1.5, 0xe3f2fd, 0.9);
    shardG.strokeTriangle(sx, sy - 12, sx - 7, sy + 4, sx + 7, sy + 4);

    // Hovering spin
    this.tweens.add({
      targets: shardG,
      y: -4,
      rotation: 0.08,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Blue refraction rays below shard
    const rayG = this.add.graphics().setDepth(3).setAlpha(0.1);
    const blueRays = [0x1565c0, 0x1976d2, 0x42a5f5, 0x90caf9, 0xe3f2fd];
    for (let r = 0; r < blueRays.length; r++) {
      const rayAngle = ((r * 18) - 36) * (Math.PI / 180);
      const rLen = Phaser.Math.Between(22, 44);
      rayG.fillStyle(blueRays[r], 1);
      rayG.fillTriangle(
        sx, sy + 2,
        sx + Math.cos(Math.PI / 2 + rayAngle) * rLen - 3,
        sy + 4 + Math.sin(Math.PI / 2 + rayAngle) * rLen,
        sx + Math.cos(Math.PI / 2 + rayAngle) * rLen + 3,
        sy + 4 + Math.sin(Math.PI / 2 + rayAngle) * rLen
      );
    }
    this.tweens.add({
      targets: rayG, alpha: 0.04,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Glow + particles
    const glow = this.add.circle(sx, sy, 14, 0x42a5f5, 0.16).setDepth(2);
    this.tweens.add({
      targets: glow, alpha: 0.05, scaleX: 1.8, scaleY: 1.8,
      duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    this.add.particles(sx, sy, 'icon_particle', {
      speed: { min: 8, max: 20 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.18, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: { min: 500, max: 1200 },
      blendMode: 'ADD',
      tint: [0x42a5f5, 0x90caf9, 0xe3f2fd, 0xffffff],
      frequency: 200,
    }).setDepth(6);
  }

  // ─── Quest indicator glows ────────────────────────────────────────────────────
  private addQuestIndicatorGlow() {
    const ts = this.mapData.tileSize;
    for (const npcSpawn of this.mapData.npcs) {
      const allNpcs = this.cache.json.get('npcs') as Record<string, any>;
      const npcData = allNpcs[npcSpawn.npcId];
      if (!npcData || !npcData.questId) continue;

      if (this.questSystem?.canAcceptQuest(npcData.questId)) {
        const nx = npcSpawn.tileX * ts + ts / 2;
        const ny = npcSpawn.tileY * ts + ts / 2;

        const outerGlow = this.add.circle(nx, ny, 18, 0xce93d8, 0.15).setDepth(0);
        this.tweens.add({
          targets: outerGlow,
          scaleX: 1.5, scaleY: 1.5, alpha: 0.04,
          duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        const innerGlow = this.add.circle(nx, ny, 10, 0xffd54f, 0.35).setDepth(0);
        this.tweens.add({
          targets: innerGlow,
          scaleX: 1.2, scaleY: 1.2, alpha: 0.1,
          duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 300,
        });
        this.questGlows.push(outerGlow);
        this.questGlows.push(innerGlow);
      }
    }
  }
}
