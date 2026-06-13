import Phaser from 'phaser';
import { BaseGameScene } from '../../BaseGameScene';

export class EcoVilleScene extends BaseGameScene {
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
}
