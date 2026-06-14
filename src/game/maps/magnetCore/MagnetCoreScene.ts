import { BaseGameScene } from '../../BaseGameScene';

export class MagnetCoreScene extends BaseGameScene {
  constructor() {
    super('MagnetCoreScene');
  }

  getMapKey(): string {
    return 'magnetCore';
  }
}
