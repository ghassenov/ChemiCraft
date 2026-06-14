import { BaseGameScene } from '../../BaseGameScene';

export class PrismHeightsScene extends BaseGameScene {
  constructor() {
    super('PrismHeightsScene');
  }

  getMapKey(): string {
    return 'prismHeights';
  }
}
