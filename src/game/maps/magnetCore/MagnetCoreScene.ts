import { BaseGameScene } from '../../BaseGameScene';

export class MagnetCoreScene extends BaseGameScene {
  private magnetAngle = 0;
  private magnetArcs: { g: Phaser.GameObjects.Graphics; cx: number; cy: number; radius: number; color: number }[] = [];

  constructor() {
    super('MagnetCoreScene');
  }

  getMapKey(): string {
    return 'magnetCore';
  }

  protected applyTileTint(tile: Phaser.GameObjects.Image, tileVal: number, _x: number, _y: number) {
    const theme = this.mapData.theme;
    if (tileVal === 0 || (tileVal >= 2 && tileVal <= 4)) {
      // Dark charcoal-iron ground with subtle variation
      tile.setTint(0x3a2a1a);
    } else if (tileVal === 1) {
      tile.setTint(theme.wallColor);
    } else if (tileVal === 5) {
      // Path — hot-metal orange
      tile.setTint(0xb04010);
    }
  }

  protected getResourceNodeEmojiOverlay(): Record<string, string> {
    return {
      iron_vein: '⚙️',
      magnetic_crystal: '🔮',
      copper_wire_spool: '🌀',
      energy_geyser: '⚡',
    };
  }

  protected createMapDecorations() {
    this.createLavaCrackOverlay();
    this.createForgeAtmosphere();
    this.createMagnetArcFields();
    this.createIronVeinSparks();
    this.createCopperChargeEffect();
    this.createEnergyGeyserBurst();
    this.createMagneticCrystalGlow();
    this.createMagnetPulseRings();
    this.addQuestIndicatorGlow();
    this.startMagnetArcAnimation();
  }

  // ─── Lava-crack ground overlay ────────────────────────────────────────────────
  private createLavaCrackOverlay() {
    const ts = this.mapData.tileSize;
    const g = this.add.graphics().setDepth(1).setAlpha(0.22);

    for (let y = 1; y < this.mapData.height - 1; y++) {
      for (let x = 1; x < this.mapData.width - 1; x++) {
        if (this.mapData.ground[y][x] !== 0) continue;
        const hash = (x * 31 + y * 73) % 7;
        const colors = [0x3a1a0a, 0x2e1508, 0x4a2010, 0x1e0e04, 0x3d1a0c, 0x261008, 0x421c0e];
        g.fillStyle(colors[hash], 1);
        g.fillRect(x * ts + 1, y * ts + 1, ts - 2, ts - 2);
      }
    }

    // Glowing lava crack lines
    const crackG = this.add.graphics().setDepth(2).setAlpha(0.35);
    const cracks = [
      { x1: 2, y1: 8, x2: 7, y2: 12 },
      { x1: 10, y1: 12, x2: 15, y2: 16 },
      { x1: 3, y1: 15, x2: 6, y2: 18 },
      { x1: 13, y1: 6, x2: 17, y2: 9 },
      { x1: 7, y1: 17, x2: 12, y2: 18 },
    ];
    crackG.lineStyle(1.5, 0xff4500, 0.7);
    for (const c of cracks) {
      crackG.lineBetween(c.x1 * ts + ts / 2, c.y1 * ts + ts / 2, c.x2 * ts + ts / 2, c.y2 * ts + ts / 2);
    }

    // Pulsing lava glow along cracks
    for (const c of cracks) {
      const mx = ((c.x1 + c.x2) / 2) * ts + ts / 2;
      const my = ((c.y1 + c.y2) / 2) * ts + ts / 2;
      const glow = this.add.circle(mx, my, 8, 0xff3300, 0.12).setDepth(2);
      this.tweens.add({
        targets: glow,
        alpha: 0.04,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  // ─── Atmospheric ember storm + heat-haze light flicker ───────────────────────
  private createForgeAtmosphere() {
    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;

    // Deep red ambient light patches that flicker
    for (let i = 0; i < 12; i++) {
      const ax = Phaser.Math.Between(2, this.mapData.width - 2) * ts;
      const ay = Phaser.Math.Between(2, this.mapData.height - 2) * ts;
      const patch = this.add.circle(ax, ay, Phaser.Math.Between(16, 40), 0xcc2200, 0.07).setDepth(1);
      this.tweens.add({
        targets: patch,
        alpha: Phaser.Math.FloatBetween(0.01, 0.04),
        scaleX: Phaser.Math.FloatBetween(0.8, 1.3),
        scaleY: Phaser.Math.FloatBetween(0.8, 1.3),
        duration: Phaser.Math.Between(800, 2500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    // Horizontal heat-shimmer streaks
    for (let i = 0; i < 5; i++) {
      const sy = Phaser.Math.Between(ts * 3, mapH - ts * 3);
      const streak = this.add.rectangle(-40, sy, Phaser.Math.Between(20, 60), 1, 0xff6600, 0.15)
        .setDepth(3).setOrigin(0, 0.5);
      this.tweens.add({
        targets: streak,
        x: mapW + 60,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 7000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 5000),
        ease: 'Linear',
        onRepeat: () => {
          streak.y = Phaser.Math.Between(ts * 3, mapH - ts * 3);
          streak.setAlpha(0.15);
          streak.x = -40;
        },
      });
    }
  }

  // ─── Rotating magnetic arc fields around magnet decorations ──────────────────
  private createMagnetArcFields() {
    const ts = this.mapData.tileSize;
    const magnetPositions = this.mapData.decorations
      .filter(d => d.type === 'magnet')
      .map(d => ({ x: d.tileX * ts + ts / 2, y: d.tileY * ts + ts / 2 }));

    for (const mp of magnetPositions) {
      // Magnetic field ring — drawn each tick
      const arcG = this.add.graphics().setDepth(3);
      this.magnetArcs.push({ g: arcG, cx: mp.x, cy: mp.y, radius: 18, color: 0xff2200 });

      // Static outer glow
      const glow = this.add.circle(mp.x, mp.y, 20, 0xff4400, 0.1).setDepth(2);
      this.tweens.add({
        targets: glow,
        alpha: 0.04,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: Phaser.Math.Between(900, 1800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1000),
      });

      // Tiny iron-filing particles swirling toward the magnet
      this.add.particles(mp.x, mp.y, 'icon_particle', {
        speed: { min: 5, max: 20 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.12, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: { min: 400, max: 900 },
        blendMode: 'ADD',
        tint: [0xff4400, 0xff8800, 0xffcc00],
        frequency: 120,
      }).setDepth(4);
    }
  }

  // ─── Spinning arc animation loop ─────────────────────────────────────────────
  private startMagnetArcAnimation() {
    this.time.addEvent({
      delay: 33,
      loop: true,
      callback: () => {
        this.magnetAngle += 0.04;
        for (const arc of this.magnetArcs) {
          arc.g.clear();
          // Draw 3 rotating arcs around each magnet
          for (let a = 0; a < 3; a++) {
            const baseAngle = this.magnetAngle + (a * Math.PI * 2) / 3;
            const startDeg = Phaser.Math.RadToDeg(baseAngle);
            arc.g.lineStyle(1.5, arc.color, 0.6);
            arc.g.beginPath();
            arc.g.arc(arc.cx, arc.cy, arc.radius, baseAngle, baseAngle + 1.2, false);
            arc.g.strokePath();
          }
        }
      },
    });
  }

  // ─── Iron vein sparks ────────────────────────────────────────────────────────
  private createIronVeinSparks() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'iron_vein');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const vx = nodeData.tileX * ts + ts / 2;
    const vy = nodeData.tileY * ts + ts / 2;

    // Rock body
    const rock = this.add.graphics().setDepth(3);
    rock.fillStyle(0x4a3a2a, 0.95);
    rock.fillRoundedRect(vx - 12, vy - 8, 24, 16, 4);
    rock.fillStyle(0x6a5a4a, 0.5);
    rock.fillRoundedRect(vx - 8, vy - 4, 10, 6, 2);
    // Iron-ore veins
    rock.lineStyle(1, 0x8a6a3a, 0.7);
    rock.lineBetween(vx - 8, vy - 2, vx + 4, vy + 4);
    rock.lineBetween(vx - 4, vy - 5, vx + 6, vy - 1);

    // Metallic sheen
    rock.fillStyle(0xaaaaaa, 0.2);
    rock.fillEllipse(vx - 2, vy - 3, 8, 4);

    // Spark burst
    this.add.particles(vx, vy - 6, 'icon_particle', {
      speed: { min: 25, max: 60 },
      angle: { min: 230, max: 310 },
      scale: { start: 0.22, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: { min: 200, max: 500 },
      blendMode: 'ADD',
      tint: [0xffdd00, 0xff8800, 0xffffff],
      frequency: 250,
    }).setDepth(6);

    // Pulsing amber glow
    const glow = this.add.circle(vx, vy, 18, 0xff8800, 0.12).setDepth(2);
    this.tweens.add({
      targets: glow, alpha: 0.04, scaleX: 1.4, scaleY: 1.4,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // ─── Copper wire spool charge effect ─────────────────────────────────────────
  private createCopperChargeEffect() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'copper_wire_spool');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const cx = nodeData.tileX * ts + ts / 2;
    const cy = nodeData.tileY * ts + ts / 2;

    // Spool body
    const spool = this.add.graphics().setDepth(3);
    spool.fillStyle(0xb87333, 0.95); // copper colour
    spool.fillRect(cx - 10, cy - 8, 20, 16);
    spool.fillStyle(0xd4944a, 0.7);
    spool.fillRect(cx - 12, cy - 10, 24, 5);
    spool.fillRect(cx - 12, cy + 5, 24, 5);
    // Wire wrapping lines
    spool.lineStyle(1, 0xe8a060, 0.6);
    for (let i = 0; i < 4; i++) {
      spool.lineBetween(cx - 10, cy - 5 + i * 3, cx + 10, cy - 5 + i * 3);
    }

    // Electric arc travelling around the spool
    for (let i = 0; i < 4; i++) {
      const arcDot = this.add.circle(cx, cy - 8, 2, 0x00ffff, 0.8).setDepth(5);
      this.tweens.add({
        targets: arcDot,
        x: cx + Math.cos((i * Math.PI) / 2) * 12,
        y: cy + Math.sin((i * Math.PI) / 2) * 10,
        alpha: 0,
        duration: 800,
        repeat: -1,
        delay: i * 200,
        ease: 'Quad.easeOut',
        onRepeat: () => { arcDot.setPosition(cx, cy - 8).setAlpha(0.8); },
      });
    }

    // Cyan electromagnetic glow
    const glow = this.add.circle(cx, cy, 20, 0x00cccc, 0.1).setDepth(2);
    this.tweens.add({
      targets: glow, alpha: 0.04, scaleX: 1.5, scaleY: 1.5,
      duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Electric spark particles
    this.add.particles(cx, cy, 'icon_particle', {
      speed: { min: 15, max: 35 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 200, max: 500 },
      blendMode: 'ADD',
      tint: [0x00ffff, 0x80dfff, 0xffffff],
      frequency: 200,
    }).setDepth(6);
  }

  // ─── Energy geyser eruption ───────────────────────────────────────────────────
  private createEnergyGeyserBurst() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'energy_geyser');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const gx = nodeData.tileX * ts + ts / 2;
    const gy = nodeData.tileY * ts + ts / 2;

    // Geyser vent ring
    const ventG = this.add.graphics().setDepth(3);
    ventG.fillStyle(0x2a1a0a, 0.95);
    ventG.fillEllipse(gx, gy + 4, 30, 12);
    ventG.fillStyle(0xff4400, 0.6);
    ventG.fillEllipse(gx, gy + 2, 20, 8);

    // Danger ring pulses
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(gx, gy, 14, 0xff2200, 0.2).setDepth(3);
      this.tweens.add({
        targets: ring,
        scaleX: 2.5, scaleY: 2.5, alpha: 0,
        duration: 2000, repeat: -1, delay: i * 650,
        ease: 'Quad.easeOut',
      });
    }

    // Main eruption column — large fiery particles shooting upward
    this.add.particles(gx, gy - 4, 'icon_particle', {
      speed: { min: 30, max: 80 },
      angle: { min: 255, max: 285 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 600, max: 1400 },
      blendMode: 'ADD',
      tint: [0xff2200, 0xff6600, 0xffaa00, 0xffee44],
      frequency: 80,
    }).setDepth(7);

    // Secondary fine sparks
    this.add.particles(gx, gy - 6, 'icon_particle', {
      speed: { min: 50, max: 120 },
      angle: { min: 245, max: 295 },
      scale: { start: 0.25, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 300, max: 700 },
      blendMode: 'ADD',
      tint: [0xffee00, 0xffffff],
      frequency: 120,
    }).setDepth(8);

    // Ground lava glow
    const lavaGlow = this.add.circle(gx, gy + 2, 22, 0xff3300, 0.2).setDepth(2);
    this.tweens.add({
      targets: lavaGlow,
      alpha: 0.06, scaleX: 1.6, scaleY: 1.6,
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // ─── Magnetic crystal shimmer ─────────────────────────────────────────────────
  private createMagneticCrystalGlow() {
    const nodeData = this.mapData.resourceNodes?.find(n => n.type === 'magnetic_crystal');
    if (!nodeData) return;
    const ts = this.mapData.tileSize;
    const mcx = nodeData.tileX * ts + ts / 2;
    const mcy = nodeData.tileY * ts + ts / 2;

    // Crystal facets
    const crystalG = this.add.graphics().setDepth(3);
    crystalG.fillStyle(0x8b00ff, 0.85);
    crystalG.fillTriangle(mcx, mcy - 14, mcx - 8, mcy + 4, mcx + 8, mcy + 4);
    crystalG.fillStyle(0xda70d6, 0.5);
    crystalG.fillTriangle(mcx - 2, mcy - 14, mcx - 10, mcy + 4, mcx + 4, mcy + 4);
    crystalG.lineStyle(1, 0xe0b0ff, 0.7);
    crystalG.strokeTriangle(mcx, mcy - 14, mcx - 8, mcy + 4, mcx + 8, mcy + 4);

    // Pulsing purple glow rings
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(mcx, mcy, 10, 0x9400d3, 0.2).setDepth(2);
      this.tweens.add({
        targets: ring,
        scaleX: 3, scaleY: 3, alpha: 0,
        duration: 2200, repeat: -1, delay: i * 720,
        ease: 'Quad.easeOut',
      });
    }

    // Shimmer sparkle particles
    this.add.particles(mcx, mcy, 'icon_particle', {
      speed: { min: 8, max: 25 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 600, max: 1400 },
      blendMode: 'ADD',
      tint: [0x9400d3, 0xda70d6, 0xe0b0ff, 0xffffff],
      frequency: 150,
    }).setDepth(6);

    // Levitation sway on the crystal graphic
    this.tweens.add({
      targets: crystalG,
      y: -3, rotation: 0.05,
      duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // ─── Pulsing magnetic field rings emanating from magnet clusters ──────────────
  private createMagnetPulseRings() {
    const ts = this.mapData.tileSize;
    // Central field convergence at middle of map
    const cx = 10 * ts;
    const cy = 10 * ts;
    for (let i = 0; i < 4; i++) {
      const ring = this.add.circle(cx, cy, 20, 0xff3300, 0.08).setDepth(1);
      this.tweens.add({
        targets: ring,
        scaleX: 6, scaleY: 6, alpha: 0,
        duration: 4000, repeat: -1, delay: i * 1000,
        ease: 'Quad.easeOut',
      });
    }
  }

  // ─── Quest indicator glow ─────────────────────────────────────────────────────
  private addQuestIndicatorGlow() {
    const ts = this.mapData.tileSize;
    for (const npcSpawn of this.mapData.npcs) {
      const allNpcs = this.cache.json.get('npcs') as Record<string, any>;
      const npcData = allNpcs[npcSpawn.npcId];
      if (!npcData || !npcData.questId) continue;

      if (this.questSystem?.canAcceptQuest(npcData.questId)) {
        const nx = npcSpawn.tileX * ts + ts / 2;
        const ny = npcSpawn.tileY * ts + ts / 2;
        const outerGlow = this.add.circle(nx, ny, 18, 0xff8800, 0.15).setDepth(0);
        this.tweens.add({
          targets: outerGlow,
          scaleX: 1.5, scaleY: 1.5, alpha: 0.04,
          duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        const innerGlow = this.add.circle(nx, ny, 10, 0xf1c40f, 0.35).setDepth(0);
        this.tweens.add({
          targets: innerGlow,
          scaleX: 1.2, scaleY: 1.2, alpha: 0.1,
          duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 300,
        });
      }
    }
  }
}
