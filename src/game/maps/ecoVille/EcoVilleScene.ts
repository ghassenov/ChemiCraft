import { BaseGameScene } from '../../BaseGameScene';

export class EcoVilleScene extends BaseGameScene {
  constructor() {
    super('EcoVilleScene');
  }

  getMapKey(): string {
    return 'ecoVille';
  }
}
