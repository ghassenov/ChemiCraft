import { BaseGameScene } from '../../BaseGameScene';

export class EcoVilleScene extends BaseGameScene {
  private leaves: Phaser.Physics.Arcade.Sprite[] = [];
  private questGlows: Phaser.GameObjects.Arc[] = [];
  private windTurbines: { shaft: Phaser.GameObjects.Graphics; blades: Phaser.GameObjects.Graphics; angle: number }[] = [];
  private solarSparkles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super('EcoVilleScene');
  }

  getMapKey(): string {
    return 'ecoVille';
  }

  protected applyTileTint(tile: Phaser.GameObjects.Image, tileVal: number, _x: number, _y: number) {
    const theme = this.mapData.theme;
    if (tileVal === 0 || (tileVal >= 2 && tileVal <= 4)) {
      // Richer grass tint — slightly more saturated green than default
      tile.setTint(0x4a7a44);
    } else if (tileVal === 1) {
      tile.setTint(theme.wallColor);
    } else if (tileVal === 5) {
      // Path tiles — warm stone colour
      tile.setTint(0xa8956e);
    }
  }

  protected getResourceNodeEmojiOverlay(): Record<string, string> {
    return {
      pollution_vent: '☁️',
      clean_water_spring: '💧',
      biomass_pile: '🌿',
    };
  }

  protected createMapDecorations() {
    this.createGroundDetailOverlay();
    this.createAtmosphericFog();
    this.createLeafSwarm();
    this.createSolarPanelEffects();
    this.createWindTurbines();
    this.createPollutionVentSmoke();
    this.createWaterSpring();
    this.createBiomassBioluminescence();
    this.addQuestIndicatorGlow();
    this.update_windTurbines();
  }

  // ─── Subtle ground tint variation ────────────────────────────────────────────
  private createGroundDetailOverlay() {
    const ts = this.mapData.tileSize;
    const g = this.add.graphics().setDepth(1).setAlpha(0.18);

    for (let y = 1; y < this.mapData.height - 1; y++) {
      for (let x = 1; x < this.mapData.width - 1; x++) {
        if (this.mapData.ground[y][x] !== 0) continue;
        // Pseudo-random per-tile colour variation using hash
        const hash = ((x * 37 + y * 97) % 5);
        const colors = [0x5cbb54, 0x4a9e45, 0x63c45a, 0x3d8a38, 0x57b350];
        g.fillStyle(colors[hash], 1);
        g.fillRect(x * ts + 2, y * ts + 2, ts - 4, ts - 4);
      }
    }
  }

  // ─── Soft atmospheric haze at the top of the map ─────────────────────────────
  private createAtmosphericFog() {
    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;

    // Sky-light tint that follows the camera — radial gradient from top
    const fogG = this.add.graphics().setScrollFactor(0).setDepth(0).setAlpha(0.07);
    fogG.fillGradientStyle(0xa8d8a8, 0xa8d8a8, 0x2d5a27, 0x2d5a27, 0.6, 0.6, 0, 0);
    fogG.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Ambient leaf-green light patches scattered on the ground
    for (let i = 0; i < 18; i++) {
      const lx = Phaser.Math.Between(2, this.mapData.width - 2) * ts;
      const ly = Phaser.Math.Between(2, this.mapData.height - 2) * ts;
      const patch = this.add.circle(lx, ly, Phaser.Math.Between(14, 30), 0x55bb44, 0.06).setDepth(1);
      this.tweens.add({
        targets: patch,
        alpha: 0.02,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 3000),
      });
    }

    // Wind-line horizontal streaks
    for (let i = 0; i < 6; i++) {
      const wy = Phaser.Math.Between(ts * 2, mapH - ts * 2);
      const streak = this.add.rectangle(
        -40, wy,
        Phaser.Math.Between(30, 80), 1,
        0xc8e6c9, 0.22
      ).setDepth(2).setOrigin(0, 0.5);
      this.tweens.add({
        targets: streak,
        x: mapW + 60,
        duration: Phaser.Math.Between(4000, 9000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 6000),
        ease: 'Linear',
        onRepeat: () => { streak.y = Phaser.Math.Between(ts * 2, mapH - ts * 2); },
      });
    }
  }

  // ─── Dense leaf swarm with natural wind drift ─────────────────────────────────
  private createLeafSwarm() {
    if (!this.textures.exists('leaf_eco')) {
      const g = this.add.graphics();
      // Leaf shape — elongated ellipse with vein
      g.fillStyle(0x4caf50, 0.85);
      g.fillEllipse(5, 4, 10, 6);
      g.fillStyle(0x81c784, 0.5);
      g.fillEllipse(5, 4, 7, 3);
      g.lineStyle(0.5, 0xffffff, 0.3);
      g.lineBetween(2, 4, 8, 4);
      g.generateTexture('leaf_eco', 10, 8);
      g.destroy();
    }

    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;
    const leafColors = [0x4caf50, 0x8bc34a, 0xcddc39, 0x66bb6a, 0xa5d6a7];

    for (let i = 0; i < 14; i++) {
      const leaf = this.physics.add.sprite(
        Phaser.Math.Between(0, mapW),
        Phaser.Math.Between(0, mapH),
        'leaf_eco'
      );
      const speed = Phaser.Math.Between(20, 55);
      leaf.setVelocityX(speed * (i % 3 === 0 ? -1 : 1));
      leaf.setVelocityY(Phaser.Math.Between(-8, 8));
      leaf.setBounce(0.4);
      leaf.setCollideWorldBounds(true);
      leaf.setDepth(3 + (i % 3));
      leaf.setAlpha(Phaser.Math.FloatBetween(0.5, 0.85));
      leaf.setScale(Phaser.Math.FloatBetween(0.7, 1.4));
      leaf.setTint(leafColors[i % leafColors.length]);
      (leaf.body as Phaser.Physics.Arcade.Body).setDrag(3, 3);
      this.leaves.push(leaf);

      // Spin + gentle sway
      this.tweens.add({
        targets: leaf,
        angle: { from: 0, to: 360 },
        duration: Phaser.Math.Between(2500, 5500),
        repeat: -1,
        ease: 'Linear',
      });
      // Gentle Y undulation
      this.tweens.add({
        targets: leaf,
        velocityY: Phaser.Math.Between(-15, 15),
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Wrap around edges
      this.time.addEvent({
        delay: 400,
        loop: true,
        callback: () => {
          if (!leaf.active) return;
          if (leaf.x < -30) leaf.x = mapW + 10;
          else if (leaf.x > mapW + 30) leaf.x = -10;
          if (leaf.y < -30) leaf.y = mapH - 10;
          else if (leaf.y > mapH + 30) leaf.y = 10;
        },
      });
    }
  }

  // ─── Animated solar panel array with shimmer ─────────────────────────────────
  private createSolarPanelEffects() {
    const ts = this.mapData.tileSize;
    const solarPositions = this.mapData.decorations
      .filter(d => d.type === 'solar_panel')
      .map(d => ({ x: d.tileX * ts + ts / 2, y: d.tileY * ts + ts / 2 }));

    for (const sp of solarPositions) {
      // Animated blue glare sweep across panel
      const glare = this.add.rectangle(sp.x - 9, sp.y - 5, 4, 11, 0x90caf9, 0.5)
        .setDepth(5).setOrigin(0, 0);
      this.tweens.add({
        targets: glare,
        x: sp.x + 10,
        alpha: 0,
        duration: Phaser.Math.Between(1800, 3200),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Quad.easeIn',
        onRepeat: () => {
          glare.x = sp.x - 9;
          glare.setAlpha(0.5);
        },
      });

      // Yellow energy sparkle above each panel
      const sparkle = this.add.arc(sp.x + Phaser.Math.Between(-6, 6), sp.y - 8, 2, 0, 360, false, 0xfff176, 0.8)
        .setDepth(6);
      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        scaleX: 2.5,
        scaleY: 2.5,
        duration: Phaser.Math.Between(900, 1800),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2500),
        onRepeat: () => { sparkle.setScale(1).setAlpha(0.8); },
      });
      this.solarSparkles.push(sparkle);

      // Soft green ground glow beneath panel
      const glow = this.add.circle(sp.x, sp.y + 4, 12, 0x00e676, 0.07).setDepth(2);
      this.tweens.add({
        targets: glow,
        alpha: 0.03,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1500),
      });
    }
  }

  // ─── Wind turbines at sign positions ─────────────────────────────────────────
  private createWindTurbines() {
    const ts = this.mapData.tileSize;
    const signPositions = this.mapData.decorations
      .filter(d => d.type === 'sign')
      .map(d => ({ x: d.tileX * ts + ts / 2, y: d.tileY * ts + ts / 2 }));

    for (const sp of signPositions) {
      // Tall shaft
      const shaft = this.add.graphics().setDepth(4);
      shaft.fillStyle(0x78909c, 0.95);
      shaft.fillRect(sp.x - 2, sp.y - 24, 4, 28);
      // Base
      shaft.fillStyle(0x546e7a, 0.9);
      shaft.fillRect(sp.x - 5, sp.y + 4, 10, 4);

      // Rotating blades
      const blades = this.add.graphics().setDepth(5);
      const turbine = { shaft, blades, angle: 0 };
      this.windTurbines.push(turbine);
      this._drawTurbineBlades(blades, sp.x, sp.y - 22, 0);

      // Hub
      const hub = this.add.circle(sp.x, sp.y - 22, 3, 0xb0bec5, 1).setDepth(6);

      // Wind-motion indicator – small particle burst from blade tips
      this.add.particles(sp.x, sp.y - 22, 'icon_particle', {
        speed: { min: 12, max: 30 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.18, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 600,
        blendMode: 'ADD',
        tint: [0xb3e5fc, 0x81d4fa, 0xffffff],
        frequency: 180,
      }).setDepth(5);
    }
  }

  private _drawTurbineBlades(g: Phaser.GameObjects.Graphics, cx: number, cy: number, angle: number) {
    g.clear();
    g.fillStyle(0xb0bec5, 0.9);
    const len = 11;
    for (let b = 0; b < 3; b++) {
      const rad = angle + (b * Math.PI * 2) / 3;
      const tipX = cx + Math.cos(rad) * len;
      const tipY = cy + Math.sin(rad) * len;
      const lx = cx + Math.cos(rad + 0.25) * 3;
      const ly = cy + Math.sin(rad + 0.25) * 3;
      const rx = cx + Math.cos(rad - 0.25) * 3;
      const ry = cy + Math.sin(rad - 0.25) * 3;
      g.fillTriangle(lx, ly, rx, ry, tipX, tipY);
    }
  }

  private update_windTurbines() {
    // Spin turbine blades each frame
    const ts = this.mapData.tileSize;
    const signPositions = this.mapData.decorations
      .filter(d => d.type === 'sign')
      .map(d => ({ x: d.tileX * ts + ts / 2, y: d.tileY * ts + ts / 2 }));

    this.time.addEvent({
      delay: 33, // ~30fps
      loop: true,
      callback: () => {
        for (let i = 0; i < this.windTurbines.length; i++) {
          const t = this.windTurbines[i];
          const sp = signPositions[i];
          if (!sp) continue;
          t.angle += 0.06;
          this._drawTurbineBlades(t.blades, sp.x, sp.y - 22, t.angle);
        }
      },
    });
  }

  // ─── Pollution vent dramatic smoke plume ─────────────────────────────────────
  private createPollutionVentSmoke() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'pollution_vent');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const px = nodeData.tileX * ts + ts / 2;
    const py = nodeData.tileY * ts + ts / 2;

    // Vent pipe
    const ventG = this.add.graphics().setDepth(4);
    ventG.fillStyle(0x455a64, 0.95);
    ventG.fillRect(px - 4, py - 6, 8, 14);
    ventG.fillStyle(0x607d8b, 0.8);
    ventG.fillRect(px - 6, py - 8, 12, 4);

    // Danger ring around vent
    const dangerRing = this.add.circle(px, py, 16, 0xff5722, 0.12).setDepth(3);
    this.tweens.add({
      targets: dangerRing,
      scaleX: 1.4, scaleY: 1.4, alpha: 0,
      duration: 1800, repeat: -1, ease: 'Quad.easeOut',
    });

    // Heavy smoke particles — layered: dark inner, lighter outer
    if (!this.textures.exists('smoke_particle')) {
      const sg = this.add.graphics();
      sg.fillStyle(0xffffff, 1);
      sg.fillCircle(6, 6, 6);
      sg.generateTexture('smoke_particle', 12, 12);
      sg.destroy();
    }

    // Layer 1 – dense dark smoke
    this.add.particles(px, py - 8, 'smoke_particle', {
      speed: { min: 10, max: 22 },
      angle: { min: 255, max: 285 },
      scale: { start: 0.5, end: 1.6 },
      alpha: { start: 0.55, end: 0 },
      lifespan: { min: 2000, max: 3800 },
      frequency: 300,
      blendMode: 'NORMAL',
      tint: [0x455a64, 0x546e7a, 0x37474f],
      quantity: 1,
    }).setDepth(6);

    // Layer 2 – lighter wisp
    this.add.particles(px, py - 10, 'smoke_particle', {
      speed: { min: 6, max: 14 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.3, end: 2.0 },
      alpha: { start: 0.25, end: 0 },
      lifespan: { min: 3000, max: 5000 },
      frequency: 500,
      blendMode: 'NORMAL',
      tint: [0x90a4ae, 0xb0bec5, 0xcfd8dc],
      quantity: 1,
    }).setDepth(5);
  }

  // ─── Water spring with concentric ripples and glow ────────────────────────────
  private createWaterSpring() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'clean_water_spring');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const sx = nodeData.tileX * ts + ts / 2;
    const sy = nodeData.tileY * ts + ts / 2;

    // Pool base
    const pool = this.add.ellipse(sx, sy + 2, 28, 14, 0x1565c0, 0.55).setDepth(2);
    this.tweens.add({
      targets: pool,
      scaleX: 1.05, scaleY: 1.08, alpha: 0.45,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Caustics shimmer on pool surface
    const caustic = this.add.ellipse(sx - 4, sy, 8, 4, 0x90caf9, 0.5).setDepth(3);
    this.tweens.add({
      targets: caustic,
      x: sx + 4,
      alpha: 0.15,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Concentric ripples (5 rings)
    for (let i = 0; i < 5; i++) {
      const ripple = this.add.circle(sx, sy, 5, 0x4fc3f7, 0.3).setDepth(3);
      this.tweens.add({
        targets: ripple,
        scaleX: 4,
        scaleY: 2.5,
        alpha: 0,
        duration: 2800,
        repeat: -1,
        delay: i * 560,
        ease: 'Quad.easeOut',
        onRepeat: () => { ripple.setScale(1).setAlpha(0.3); },
      });
    }

    // Blue ambient glow
    const glow = this.add.circle(sx, sy, 24, 0x29b6f6, 0.1).setDepth(2);
    this.tweens.add({
      targets: glow,
      alpha: 0.04,
      scaleX: 1.4, scaleY: 1.4,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Spray particles rising from spring
    this.add.particles(sx, sy - 4, 'icon_particle', {
      speed: { min: 15, max: 35 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.25, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: { min: 600, max: 1200 },
      blendMode: 'ADD',
      tint: [0x4fc3f7, 0x81d4fa, 0xb3e5fc],
      frequency: 200,
    }).setDepth(7);
  }

  // ─── Biomass pile bioluminescence ─────────────────────────────────────────────
  private createBiomassBioluminescence() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'biomass_pile');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const bx = nodeData.tileX * ts + ts / 2;
    const by = nodeData.tileY * ts + ts / 2;

    // Green bioluminescent glow that pulses
    for (let i = 0; i < 3; i++) {
      const offX = Phaser.Math.Between(-10, 10);
      const offY = Phaser.Math.Between(-8, 8);
      const orb = this.add.circle(bx + offX, by + offY, Phaser.Math.Between(4, 8), 0x00e676, 0.15).setDepth(3);
      this.tweens.add({
        targets: orb,
        alpha: 0.05,
        scaleX: 1.6, scaleY: 1.6,
        duration: Phaser.Math.Between(1200, 2500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1500),
      });
    }

    // Floating bio-motes rising from the pile
    this.add.particles(bx, by - 4, 'icon_particle', {
      speed: { min: 5, max: 18 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: { min: 1500, max: 3000 },
      blendMode: 'ADD',
      tint: [0x00e676, 0x69f0ae, 0xb9f6ca],
      frequency: 400,
    }).setDepth(5);
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
        // Double-ring glow
        const outerGlow = this.add.circle(nx, ny, 18, 0x00e676, 0.12).setDepth(0);
        this.tweens.add({
          targets: outerGlow,
          scaleX: 1.4, scaleY: 1.4, alpha: 0.04,
          duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        const innerGlow = this.add.circle(nx, ny, 10, 0xf1c40f, 0.3).setDepth(0);
        this.tweens.add({
          targets: innerGlow,
          scaleX: 1.2, scaleY: 1.2, alpha: 0.1,
          duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
          delay: 300,
        });
        this.questGlows.push(outerGlow);
        this.questGlows.push(innerGlow);
      }
    }
  }
}
