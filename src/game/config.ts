import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { LabInteriorScene } from './scenes/LabInteriorScene';
import { LibraryInteriorScene } from './scenes/LibraryInteriorScene';
import { ShopInteriorScene } from './scenes/ShopInteriorScene';
import { HUDScene } from './scenes/HUDScene';
import { LaboratoryScene } from './scenes/LaboratoryScene';
import { LibraryScene } from './scenes/LibraryScene';
import { ShopScene } from './scenes/ShopScene';
import { AtomMeadowsScene } from './maps/atomMeadows/AtomMeadowsScene';
import { RecyclingFieldsScene } from './maps/recyclingFields/RecyclingFieldsScene';
import { EcoVilleScene } from './maps/ecoVille/EcoVilleScene';
import { PrismHeightsScene } from './maps/prismHeights/PrismHeightsScene';
import { MagnetCoreScene } from './maps/magnetCore/MagnetCoreScene';

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    parent: 'game-container',
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    backgroundColor: '#0a0a1a',
    input: {
      gamepad: true,
    },
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
      fullscreenTarget: '#game-container',
    },
    scene: [
      BootScene,
      MainMenuScene,
      AtomMeadowsScene,
      RecyclingFieldsScene,
      EcoVilleScene,
      PrismHeightsScene,
      MagnetCoreScene,
      LabInteriorScene,
      LibraryInteriorScene,
      ShopInteriorScene,
      HUDScene,
      LaboratoryScene,
      LibraryScene,
      ShopScene,
    ],
  };
}
