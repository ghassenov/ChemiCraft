import Phaser from 'phaser';
import { BaseGameScene } from '../../BaseGameScene';

export class AtomMeadowsScene extends BaseGameScene {
  constructor() {
    super('AtomMeadowsScene');
  }

  getMapKey(): string {
    return 'atomMeadows';
  }

  protected createMapDecorations() {
    const ts = this.mapData.tileSize;
    const mapW = this.mapData.width * ts;
    const mapH = this.mapData.height * ts;


    // ─── Lush Grass Patches & Wildflowers ───
    const grassG = this.add.graphics().setDepth(1);
    const flowerColors = [0xffc107, 0xe91e63, 0x03a9f4, 0x9c27b0, 0xffeb3b];
    
    for (let y = 2; y < this.mapData.height - 2; y++) {
      for (let x = 2; x < this.mapData.width - 2; x++) {
        if (this.mapData.ground[y][x] === 0 && Math.random() < 0.4) {
          const px = x * ts + ts / 2;
          const py = y * ts + ts / 2;
          
          // Grass tint patch
          grassG.fillStyle(0x7cb342, 0.15);
          grassG.fillCircle(px, py, Phaser.Math.Between(10, 18));
          
          // Individual grass blades
          const bladeCount = Phaser.Math.Between(3, 7);
          grassG.fillStyle(0x558b2f, 0.6);
          for (let b = 0; b < bladeCount; b++) {
            const bx = px + Phaser.Math.Between(-12, 12);
            const by = py + Phaser.Math.Between(-12, 12);
            grassG.fillRect(bx, by, 1, Phaser.Math.Between(3, 6));
          }

          // Occasional tiny wildflowers
          if (Math.random() < 0.3) {
            const c = flowerColors[Phaser.Math.Between(0, flowerColors.length - 1)];
            const fx = px + Phaser.Math.Between(-8, 8);
            const fy = py + Phaser.Math.Between(-8, 8);
            grassG.fillStyle(c, 0.8);
            grassG.fillCircle(fx, fy, 1.5);
          }
        }
      }
    }

    // ─── Animated Butterflies & Bees ───
    const bugs = ['🦋', '🐝', '🐞', '✨'];
    for (let i = 0; i < 20; i++) {
      const bx = Phaser.Math.Between(2, this.mapData.width - 3) * ts + Phaser.Math.Between(-10, 10);
      const by = Phaser.Math.Between(2, this.mapData.height - 3) * ts + Phaser.Math.Between(-10, 10);
      
      const emoji = bugs[Phaser.Math.Between(0, bugs.length - 1)];
      const bugText = this.add.text(bx, by, emoji, { fontSize: emoji === '✨' ? '16px' : '10px' })
        .setOrigin(0.5).setDepth(14).setAlpha(0.6);
      
      const duration = Phaser.Math.Between(3000, 6000);
      this.tweens.add({
        targets: bugText,
        x: bx + Phaser.Math.Between(-30, 30),
        y: by + Phaser.Math.Between(-20, 20),
        angle: Phaser.Math.Between(-15, 15),
        duration: duration,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
      // Bobbing motion
      this.tweens.add({
        targets: bugText,
        y: '-=5',
        duration: duration / 4,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    }

    // ─── Central Village Well / Monument ───
    // Atom Meadows has a central path area around (10, 10)
    const wellX = 10 * ts + ts / 2;
    const wellY = 10 * ts + ts / 2;
    
    // Water puddle around the well
    const wellPuddle = this.add.ellipse(wellX, wellY + 8, 30, 15, 0x4fc3f7, 0.3).setDepth(1);
    this.tweens.add({
      targets: wellPuddle, scaleX: 1.1, scaleY: 0.9, alpha: 0.2,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    const wellG = this.add.graphics().setDepth(2);
    // Well base shadow
    wellG.fillStyle(0x000000, 0.2);
    wellG.fillEllipse(wellX, wellY + 12, 28, 12);
    
    // Stone base
    wellG.fillStyle(0x90a4ae, 1);
    wellG.fillRoundedRect(wellX - 14, wellY - 6, 28, 16, 4);
    wellG.fillStyle(0x607d8b, 0.4); // Shading
    wellG.fillRoundedRect(wellX, wellY - 6, 14, 16, { tl: 0, tr: 4, bl: 0, br: 4 } as any);
    
    // Wooden pillars
    wellG.fillStyle(0x5d4037, 1);
    wellG.fillRect(wellX - 12, wellY - 24, 4, 18);
    wellG.fillRect(wellX + 8, wellY - 24, 4, 18);
    
    // Wooden roof
    wellG.fillStyle(0x795548, 1);
    wellG.fillTriangle(wellX - 16, wellY - 22, wellX, wellY - 32, wellX + 16, wellY - 22);
    wellG.lineStyle(2, 0x4e342e, 1);
    wellG.strokeTriangle(wellX - 16, wellY - 22, wellX, wellY - 32, wellX + 16, wellY - 22);

    // Well water glowing center
    const wellGlow = this.add.circle(wellX, wellY - 2, 8, 0x00bcd4, 0.8).setDepth(2);
    this.tweens.add({
      targets: wellGlow, alpha: 0.4, scaleX: 1.2, scaleY: 1.2,
      duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // ─── Path borders (cobblestone edges) ───
    const pathBorderG = this.add.graphics().setDepth(1);
    for (let y = 0; y < this.mapData.height; y++) {
      for (let x = 0; x < this.mapData.width; x++) {
        if (this.mapData.ground[y][x] === 5) { // Path tile
          const px = x * ts;
          const py = y * ts;
          pathBorderG.fillStyle(0xbcaaa4, 0.4);
          
          // Random scattered stones on the path
          for (let s = 0; s < 3; s++) {
            pathBorderG.fillCircle(
              px + Phaser.Math.Between(4, ts - 4),
              py + Phaser.Math.Between(4, ts - 4),
              Phaser.Math.Between(1, 2)
            );
          }
        }
      }
    }

    // ─── Bunting / String Lights between Buildings ───
    const lightG = this.add.graphics().setDepth(16);
    lightG.lineStyle(1, 0x4e342e, 0.6);
    
    // Connect Lab (8,3) to Library (14,4)
    const lx1 = 8 * ts + ts;
    const ly1 = 3 * ts + ts;
    const lx2 = 14 * ts;
    const ly2 = 4 * ts + ts;
    
    // Draw a hanging curve using line segments
    lightG.beginPath();
    lightG.moveTo(lx1, ly1);
    const steps = 6;
    for (let i = 1; i <= steps + 1; i++) {
      const t = i / (steps + 1);
      const cpX = (lx1 + lx2) / 2;
      const cpY = Math.max(ly1, ly2) + 15;
      const bx = (1 - t) * (1 - t) * lx1 + 2 * (1 - t) * t * cpX + t * t * lx2;
      const by = (1 - t) * (1 - t) * ly1 + 2 * (1 - t) * t * cpY + t * t * ly2;
      lightG.lineTo(bx, by);
    }
    lightG.strokePath();

    // Add glowing bulbs along the string
    for (let i = 1; i <= steps; i++) {
      const t = i / (steps + 1);
      // Quadratic bezier calculation
      const cpX = (lx1 + lx2) / 2;
      const cpY = Math.max(ly1, ly2) + 15;
      const bx = (1 - t) * (1 - t) * lx1 + 2 * (1 - t) * t * cpX + t * t * lx2;
      const by = (1 - t) * (1 - t) * ly1 + 2 * (1 - t) * t * cpY + t * t * ly2;
      
      const bulbColor = [0xffeb3b, 0xffb300, 0xff9800][i % 3];
      lightG.fillStyle(0x000000, 0.8);
      lightG.fillRect(bx - 1, by - 3, 2, 3); // Socket
      lightG.fillStyle(bulbColor, 1);
      lightG.fillCircle(bx, by + 1, 3); // Bulb
      
      const bulbGlow = this.add.circle(bx, by + 1, 10, bulbColor, 0.3).setDepth(15);
      this.tweens.add({
        targets: bulbGlow, alpha: 0.1, scaleX: 1.2, scaleY: 1.2,
        duration: 1000 + (i * 200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    }

    // ─── Wind / Pollen overlay ───
    this.add.particles(0, 0, 'icon_particle', {
      x: { min: -100, max: mapW },
      y: { min: -100, max: mapH },
      lifespan: 8000,
      speed: { min: 10, max: 25 },
      angle: { min: 20, max: 40 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: [0xfff59d, 0xffe082, 0xffffff, 0xc5e1a5],
      frequency: 250,
      blendMode: 'ADD',
    }).setDepth(17);
  }
}
