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

  static travelTransition(fromScene: Phaser.Scene, mapName: string, onComplete: () => void) {
      // Fade out
      fromScene.cameras.main.fadeOut(500, 0, 0, 0);
      fromScene.input.enabled = false;

      fromScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          // Create a temporary overlay scene for the text
          const overlayKey = 'TravelOverlayScene_' + Date.now();
          
          fromScene.scene.add(overlayKey, {
              create: function() {
                  const scene = this as any;
                  scene.cameras.main.setBackgroundColor('#000000');
                  
                  const text = scene.add.text(
                      scene.cameras.main.width / 2, 
                      scene.cameras.main.height / 2, 
                      `Traveling to ${mapName}...`, 
                      { fontFamily: 'monospace', fontSize: '24px', color: '#ffffff' }
                  ).setOrigin(0.5);

                  scene.tweens.add({
                      targets: text,
                      alpha: { from: 0, to: 1 },
                      duration: 500,
                      yoyo: true,
                      hold: 1000,
                      onComplete: () => {
                          onComplete();
                          fromScene.scene.remove(overlayKey);
                      }
                  });
              }
          }, true);
      });
  }
}
