import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';
import type { MapData, MapPortal } from '../data/types';
import { SceneTransition } from './SceneTransition';

export class MapManager {
  private scene: Phaser.Scene;
  private mapCache: Map<string, MapData> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initializes the map cache from the loaded JSON data.
   * Call this in BootScene or early in GameScene.
   */
  init(mapsJson: Record<string, MapData>) {
    for (const [key, mapData] of Object.entries(mapsJson)) {
      this.mapCache.set(key, mapData);
    }
  }

  getMapData(mapKey: string): MapData | null {
    return this.mapCache.get(mapKey) || null;
  }

  getCurrentMapData(): MapData | null {
    const currentMapKey = gameStore.getCurrentMap();
    return this.getMapData(currentMapKey);
  }

  /**
   * Checks if a portal is locked based on its unlockCondition.
   */
  isPortalLocked(portal: MapPortal): boolean {
    if (portal.unlockCondition === 'none') {
        return false;
    }
    
    if (portal.unlockCondition === 'all_quests') {
       const currentMap = gameStore.getCurrentMap();
       const progress = gameStore.getState().playerData.mapProgress[currentMap];
       // A map is considered complete if it has been explicitly marked as completed
       // (usually by a quest completion trigger)
       return !progress || !progress.completed;
    }

    return true;
  }

  /**
   * Handles transitioning from the current map to the target map.
   */
  travelToMap(portal: MapPortal) {
    if (this.isPortalLocked(portal)) {
      this.scene.events.emit('ui:notification', {
        title: 'Portal Locked',
        message: 'You must complete the main quests here first!',
        icon: '🔒'
      });
      return;
    }

    const targetMapData = this.getMapData(portal.targetMap);
    if (!targetMapData) {
        console.error(`MapManager: Target map ${portal.targetMap} not found!`);
        return;
    }

    // Unlock the map in the store if it isn't already
    gameStore.unlockMap(portal.targetMap);
    
    // Play transition animation
    SceneTransition.travelTransition(this.scene, targetMapData.name, () => {
        // Update store with new map
        const success = gameStore.travelToMap(portal.targetMap);
        
        if (success) {
            // We pass the spawn coordinates from the portal as init data to GameScene
            this.scene.scene.restart({
                spawnX: portal.spawnTileX,
                spawnY: portal.spawnTileY
            });
        }
    });
  }
}
