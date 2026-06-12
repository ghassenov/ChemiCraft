import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { LaboratoryScene } from './scenes/LaboratoryScene';
import { LibraryScene } from './scenes/LibraryScene';
import { ShopScene } from './scenes/ShopScene';
import { HUDScene } from './scenes/HUDScene';

/** Creates and returns the Phaser game configuration */
export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#0a0a1a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
      BootScene,
      MainMenuScene,
      GameScene,
      LaboratoryScene,
      LibraryScene,
      ShopScene,
      HUDScene,
    ],
  };
}
