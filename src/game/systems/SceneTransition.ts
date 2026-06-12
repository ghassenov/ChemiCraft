import Phaser from 'phaser';

/**
 * Scene transition utility for fading between scenes.
 */
export class SceneTransition {
  static fadeOutIn(fromScene: Phaser.Scene, toSceneKey: string, data?: any) {
    fromScene.cameras.main.fadeOut(300, 0, 0, 0);
    
    // Disable input during transition
    fromScene.input.enabled = false;
    
    fromScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Keep HUD scene active if it's running
      const isHUDActive = fromScene.scene.isActive('HUDScene');
      fromScene.scene.start(toSceneKey, data);
      
      // We don't want to stop HUDScene, just start the new scene on top
      if (isHUDActive && toSceneKey !== 'HUDScene') {
          // If we want HUD on top, make sure it's brought to top
          fromScene.scene.bringToTop('HUDScene');
      }
    });
  }
}
