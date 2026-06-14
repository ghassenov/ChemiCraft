import Phaser from 'phaser';
import { BaseGameScene } from '../../BaseGameScene';
import { gameStore } from '../../../store/gameStore';

export class RecyclingFieldsScene extends BaseGameScene {
  constructor() {
    super('RecyclingFieldsScene');
  }

  getMapKey(): string {
    return 'recyclingFields';
  }

  protected getResourceNodeEmojiOverlay(): Record<string, string> {
    return {
      plastic_pile: '♻️', glass_pile: '🪟', metal_pile: '🔩',
      paper_pile: '📄', compost_heap: '🌿',
    };
  }

  protected onQuestCompleteHook(questId: string) {
    if (questId === 'waste_crisis') this.clearRecyclingNodes();
  }

  protected createMapDecorations() {
    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;
    const theme = this.mapData.theme;

    // ─── Ground stains / oil patches scattered on open ground ───
    const stainG = this.add.graphics().setDepth(1).setAlpha(0.12);
    const stainPositions = [
      { x: 3, y: 7 }, { x: 10, y: 13 }, { x: 16, y: 15 },
      { x: 7, y: 10 }, { x: 13, y: 6 }, { x: 5, y: 15 },
      { x: 11, y: 16 }, { x: 17, y: 9 }, { x: 2, y: 12 },
    ];
    for (const s of stainPositions) {
      const val = this.mapData.ground[s.y]?.[s.x];
      if (val === 0) {
        const sx = s.x * ts + ts / 2;
        const sy = s.y * ts + ts / 2;
        const radius = Phaser.Math.Between(8, 16);
        stainG.fillStyle(0x4a3520, 0.5);
        stainG.fillCircle(sx + Phaser.Math.Between(-4, 4), sy + Phaser.Math.Between(-4, 4), radius);
        stainG.fillStyle(0x3d2b1f, 0.3);
        stainG.fillCircle(sx + Phaser.Math.Between(-6, 6), sy + Phaser.Math.Between(-6, 6), radius * 0.6);
      }
    }

    // ─── Puddle reflections with animated shimmer ───
    const puddleSpots = [
      { x: 3, y: 9 }, { x: 11, y: 15 }, { x: 17, y: 3 }, { x: 15, y: 16 },
    ];
    for (const p of puddleSpots) {
      const val = this.mapData.ground[p.y]?.[p.x];
      if (val === 0) {
        const px = p.x * ts + ts / 2;
        const py = p.y * ts + ts / 2;
        const puddle = this.add.ellipse(px, py + 2, 18, 10, 0x5a8faa, 0.15).setDepth(1);
        const shimmer = this.add.ellipse(px - 3, py, 6, 3, 0xa8d8ea, 0.25).setDepth(1);
        this.tweens.add({
          targets: shimmer, alpha: 0.08, x: px + 3,
          duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        this.tweens.add({
          targets: puddle, scaleX: 1.05, scaleY: 0.95,
          duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }
    }

    // ─── Moss / weed patches near walls ───
    const mossG = this.add.graphics().setDepth(2).setAlpha(0.5);
    for (let y = 1; y < this.mapData.height - 1; y++) {
      for (let x = 1; x < this.mapData.width - 1; x++) {
        if (this.mapData.ground[y][x] !== 0) continue;
        // Check if adjacent to a wall
        const neighbors = [
          this.mapData.ground[y - 1]?.[x], this.mapData.ground[y + 1]?.[x],
          this.mapData.ground[y]?.[x - 1], this.mapData.ground[y]?.[x + 1],
        ];
        if (neighbors.some(n => n === 1) && Math.random() < 0.35) {
          const mx = x * ts + Phaser.Math.Between(4, ts - 4);
          const my = y * ts + Phaser.Math.Between(4, ts - 4);
          const mossColors = [0x4caf50, 0x388e3c, 0x2e7d32, 0x66bb6a];
          mossG.fillStyle(mossColors[Phaser.Math.Between(0, mossColors.length - 1)]);
          for (let i = 0; i < Phaser.Math.Between(2, 4); i++) {
            mossG.fillCircle(
              mx + Phaser.Math.Between(-5, 5),
              my + Phaser.Math.Between(-5, 5),
              Phaser.Math.Between(1, 3)
            );
          }
        }
      }
    }

    // ─── Eco-graffiti ground labels near each bin ───
    const binLabelMap: Record<string, { text: string; color: string }> = {
      yellow: { text: 'PLASTIC', color: '#f1c40f' },
      green: { text: 'GLASS', color: '#00b894' },
      grey: { text: 'METAL', color: '#b2bec3' },
      blue: { text: 'PAPER', color: '#74b9ff' },
      brown: { text: 'ORGANIC', color: '#a0522d' },
    };
    if (!gameStore.isQuestCompleted('waste_crisis')) {
      for (const decor of this.mapData.decorations) {
        if (decor.type !== 'bin') continue;
        const info = binLabelMap[decor.color || 'green'];
        if (!info) continue;
        const lx = decor.tileX * ts + ts / 2;
        const ly = decor.tileY * ts + ts / 2 + 18;
        this.add.text(lx, ly, info.text, {
          fontFamily: '"Inter"', fontSize: '7px', color: info.color,
          fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(2).setAlpha(0.55);

        // Warning stripe arc around the bin
        const stripeG = this.add.graphics().setDepth(1);
        stripeG.lineStyle(2, Phaser.Display.Color.HexStringToColor(info.color).color, 0.12);
        stripeG.strokeCircle(lx, ly - 18, 20);
      }
    }

    // ─── Animated recycling symbol emojis floating around the map ───
    const recycleEmojis = ['♻️', '🌱', '🍃', '🌍', '💧'];
    for (let i = 0; i < 18; i++) {
      const fx = Phaser.Math.Between(2, this.mapData.width - 3) * ts + Phaser.Math.Between(-10, 10);
      const fy = Phaser.Math.Between(2, this.mapData.height - 3) * ts + Phaser.Math.Between(-10, 10);
      // Make sure we're on open ground
      const tileX = Math.floor(fx / ts);
      const tileY = Math.floor(fy / ts);
      const val = this.mapData.ground[tileY]?.[tileX];
      if (val !== 0) continue;
      // Check not too close to buildings
      let blocked = false;
      for (const b of this.mapData.buildings) {
        for (const [bx, by] of b.tiles) {
          if (Math.abs(fx - bx * ts) < ts && Math.abs(fy - by * ts) < ts) { blocked = true; break; }
        }
        if (blocked) break;
      }
      if (blocked) continue;

      const emoji = recycleEmojis[Phaser.Math.Between(0, recycleEmojis.length - 1)];
      const symbol = this.add.text(fx, fy, emoji, { fontSize: '12px' })
        .setOrigin(0.5).setDepth(2).setAlpha(0.45);
      this.tweens.add({
        targets: symbol,
        y: symbol.y - Phaser.Math.Between(2, 4),
        angle: Phaser.Math.Between(-8, 8),
        alpha: 0.2,
        duration: 2500 + Phaser.Math.Between(0, 1500),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // ─── Central recycling facility emblem ───
    const centerX = 10 * ts + ts / 2;
    const centerY = 10 * ts + ts / 2;
    // Outer ring
    const emblemRing = this.add.circle(centerX, centerY, 28, 0x00b894, 0.08).setDepth(1);
    this.tweens.add({
      targets: emblemRing, scaleX: 1.15, scaleY: 1.15, alpha: 0.03,
      duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    // Inner glow
    const emblemGlow = this.add.circle(centerX, centerY, 16, 0x00cec9, 0.12).setDepth(1);
    this.tweens.add({
      targets: emblemGlow, scaleX: 1.3, scaleY: 1.3, alpha: 0.04,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
    // Center recycling icon
    const emblemIcon = this.add.text(centerX, centerY, '♻️', { fontSize: '22px' })
      .setOrigin(0.5).setDepth(3).setAlpha(0.4);
    this.tweens.add({
      targets: emblemIcon, angle: 360, duration: 15000, repeat: -1,
    });

    // ─── Fence posts along inner perimeter ───
    const fenceG = this.add.graphics().setDepth(2);
    for (let x = 2; x < this.mapData.width - 2; x += 3) {
      // Top fence (row 1 → just inside top wall)
      const ftx = x * ts + ts / 2;
      const fty = 1 * ts + ts / 2 + 6;
      if (this.mapData.ground[1]?.[x] === 0) {
        fenceG.fillStyle(0x6d4c41, 0.7);
        fenceG.fillRect(ftx - 2, fty - 6, 4, 12);
        fenceG.fillStyle(0x8d6e63, 0.5);
        fenceG.fillRect(ftx - 1, fty - 8, 2, 3);
      }
      // Bottom fence
      const fby = (this.mapData.height - 2) * ts + ts / 2 - 6;
      if (this.mapData.ground[this.mapData.height - 2]?.[x] === 0) {
        fenceG.fillStyle(0x6d4c41, 0.7);
        fenceG.fillRect(ftx - 2, fby - 6, 4, 12);
        fenceG.fillStyle(0x8d6e63, 0.5);
        fenceG.fillRect(ftx - 1, fby - 8, 2, 3);
      }
    }
    // Horizontal fence wires
    for (let x = 2; x < this.mapData.width - 2; x++) {
      if (this.mapData.ground[1]?.[x] === 0) {
        fenceG.fillStyle(0x8d6e63, 0.2);
        fenceG.fillRect(x * ts, 1 * ts + ts / 2 + 2, ts, 1);
        fenceG.fillRect(x * ts, 1 * ts + ts / 2 + 6, ts, 1);
      }
    }

    // ─── Drifting litter particle emitter ───
    this.add.particles(0, 0, 'icon_particle', {
      x: { min: 0, max: mapW },
      y: { min: mapH * 0.3, max: mapH * 0.9 },
      lifespan: 6000,
      speed: { min: 3, max: 10 },
      angle: { min: 160, max: 200 },
      scale: { start: 0.12, end: 0 },
      alpha: { start: 0.2, end: 0 },
      tint: [0xb2bec3, 0x636e72, 0x8d6e63, 0xdfe6e9],
      frequency: 800,
      blendMode: 'NORMAL',
    }).setDepth(14);

    // ─── Path tile decorative arrows (direction markings on walkways) ───
    const arrowG = this.add.graphics().setDepth(1).setAlpha(0.08);
    for (let y = 0; y < this.mapData.height; y++) {
      for (let x = 0; x < this.mapData.width; x++) {
        if (this.mapData.ground[y][x] !== 5) continue;
        const ax = x * ts + ts / 2;
        const ay = y * ts + ts / 2;
        // Simple chevron marks on paths
        arrowG.lineStyle(1.5, 0xffffff, 1);
        arrowG.lineBetween(ax - 4, ay + 2, ax, ay - 3);
        arrowG.lineBetween(ax, ay - 3, ax + 4, ay + 2);
      }
    }

    // ─── Animated "sorting zone" text near the main path area ───
    const sortZoneText = this.add.text(
      9 * ts + ts / 2, 7 * ts + ts / 2 - 4,
      '— SORTING ZONE —',
      {
        fontFamily: '"Inter"', fontSize: '7px', color: '#00cec9',
        fontStyle: 'bold', letterSpacing: 2,
      }
    ).setOrigin(0.5).setDepth(3).setAlpha(0.35);
    this.tweens.add({
      targets: sortZoneText, alpha: 0.15,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // ─── Green ground tint patches (vegetation reclaiming ground) ───
    const vegG = this.add.graphics().setDepth(1);
    const vegSpots = [
      { x: 2, y: 6 }, { x: 17, y: 14 }, { x: 3, y: 16 },
      { x: 15, y: 3 }, { x: 11, y: 12 }, { x: 6, y: 14 },
      { x: 14, y: 17 }, { x: 8, y: 12 },
    ];
    for (const v of vegSpots) {
      const val = this.mapData.ground[v.y]?.[v.x];
      if (val !== 0) continue;
      const vx = v.x * ts + ts / 2;
      const vy = v.y * ts + ts / 2;
      vegG.fillStyle(0x4caf50, 0.06);
      vegG.fillCircle(vx, vy, Phaser.Math.Between(12, 22));
      // Tiny grass blades
      const grassG = this.add.graphics().setDepth(2);
      grassG.fillStyle(0x66bb6a, 0.4);
      for (let i = 0; i < 3; i++) {
        const gx = vx + Phaser.Math.Between(-8, 8);
        const gy = vy + Phaser.Math.Between(-4, 4);
        grassG.fillRect(gx, gy - 5, 1, 5);
        grassG.fillRect(gx + 2, gy - 3, 1, 3);
      }
    }

    // ─── Subtle hazard stripes on conveyor area ───
    for (const decor of this.mapData.decorations) {
      if (decor.type !== 'conveyor') continue;
      const cx = decor.tileX * ts + ts / 2;
      const cy = decor.tileY * ts + ts / 2;
      const hazardG = this.add.graphics().setDepth(1);
      for (let i = 0; i < 4; i++) {
        hazardG.fillStyle(i % 2 === 0 ? 0xf39c12 : 0x2d3436, 0.12);
        hazardG.fillRect(cx - 18 + i * 9, cy + 8, 9, 3);
      }
    }

    // ─── Pipe runs connecting buildings ───
    const pipeG = this.add.graphics().setDepth(1);
    pipeG.lineStyle(2, 0x546e7a, 0.15);
    // Horizontal pipe from lab to shop
    const labX = 8 * ts + ts / 2;
    const shopX = 13 * ts + ts / 2;
    const pipeY = 6 * ts + ts / 2 + 8;
    pipeG.lineBetween(labX + 16, pipeY, shopX - 16, pipeY);
    // Pipe joints
    pipeG.fillStyle(0x78909c, 0.2);
    pipeG.fillCircle(labX + 16, pipeY, 3);
    pipeG.fillCircle(shopX - 16, pipeY, 3);
    pipeG.fillCircle((labX + shopX) / 2, pipeY, 3);

    // ─── Crate clusters in open areas ───
    const cratePositions = [
      { x: 2, y: 8 }, { x: 17, y: 12 }, { x: 3, y: 3 },
    ];
    for (const cp of cratePositions) {
      const val = this.mapData.ground[cp.y]?.[cp.x];
      if (val !== 0) continue;
      const crateG = this.add.graphics().setDepth(2);
      const cx = cp.x * ts + ts / 2;
      const cy = cp.y * ts + ts / 2;
      // Main crate
      crateG.fillStyle(0x8d6e63, 0.6);
      crateG.fillRect(cx - 7, cy - 7, 14, 14);
      crateG.lineStyle(1, 0x5d4037, 0.4);
      crateG.strokeRect(cx - 7, cy - 7, 14, 14);
      // Cross straps
      crateG.lineStyle(1, 0x6d4c41, 0.5);
      crateG.lineBetween(cx - 7, cy - 7, cx + 7, cy + 7);
      crateG.lineBetween(cx + 7, cy - 7, cx - 7, cy + 7);
      // Stacked smaller crate offset
      crateG.fillStyle(0x795548, 0.4);
      crateG.fillRect(cx - 2, cy - 14, 10, 8);
      crateG.lineStyle(1, 0x5d4037, 0.3);
      crateG.strokeRect(cx - 2, cy - 14, 10, 8);
    }
  }
}
