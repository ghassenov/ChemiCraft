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
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }
}
