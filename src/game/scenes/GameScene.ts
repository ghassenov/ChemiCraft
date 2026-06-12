import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DialogueBox } from '../ui/DialogueBox';
import { QuestSystem } from '../systems/QuestSystem';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';
import { MapData, NPCData, QuestData, GameEvents, Direction } from '../data/types';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private npcs: Phaser.GameObjects.Group;
  private dialogueBox!: DialogueBox;
  private questSystem!: QuestSystem;
  private mapData!: MapData;
  private buildings: Phaser.Physics.Arcade.StaticGroup;
  private groundLayer!: Phaser.GameObjects.Group;
  
  constructor() {
    super({ key: 'GameScene' });
    this.npcs = null as any;
    this.buildings = null as any;
  }

  create() {
    // Launch HUD Scene
    if (!this.scene.isActive('HUDScene')) {
      this.scene.launch('HUDScene');
    }
    
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const { width, height } = this.cameras.main;

    // Load data
    this.mapData = this.cache.json.get('maps').atomMeadows as MapData;
    const allNpcs = this.cache.json.get('npcs') as Record<string, NPCData>;
    const quests = this.cache.json.get('quests') as Record<string, QuestData>;

    // Init systems
    this.questSystem = new QuestSystem(this, quests);
    this.dialogueBox = new DialogueBox(this);

    // Build map
    this.buildMap();

    // Spawns
    const spawnData = this.mapData.playerSpawn;
    const ts = this.mapData.tileSize;
    
    // Find player position from store or map default
    const savedMap = gameStore.getState().playerData.currentMap;
    // Assuming spawn for now
    let spawnX = spawnData.x * ts + ts/2;
    let spawnY = spawnData.y * ts + ts/2;

    this.player = new Player(this, spawnX, spawnY);
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.mapData.width * ts, this.mapData.height * ts);
    this.cameras.main.setBounds(0, 0, this.mapData.width * ts, this.mapData.height * ts);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    // NPCs
    this.npcs = this.add.group();
    for (const npcSpawn of this.mapData.npcSpawns) {
      const data = allNpcs[npcSpawn.npcId];
      if (data) {
        const npc = new NPC(
          this, 
          npcSpawn.x * ts + ts/2, 
          npcSpawn.y * ts + ts/2, 
          data.id, 
          data.name, 
          `npc_${data.id}`, 
          data.questId
        );
        this.npcs.add(npc);
      }
    }

    // Collisions
    this.physics.add.collider(this.player, this.buildings);
    this.physics.add.collider(this.player, this.npcs);

    // Interactions
    this.player.onInteract(() => this.handleInteraction(allNpcs));
    
    // Listen for state changes
    const unsub = gameStore.subscribe(() => {
      const state = gameStore.getState();
      this.player.canMove = !state.isDialogueOpen && !state.isPaused;
    });
    
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsub();
    });
  }

  update() {
    this.player.update();
    
    // NPC Proximity
    this.npcs.getChildren().forEach((child) => {
      const npc = child as NPC;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < 40) {
        npc.showPrompt();
      } else {
        npc.hidePrompt();
      }
      npc.updatePromptPosition();
    });
    
    // Check building entry via proximity
    const ts = this.mapData.tileSize;
    const px = Math.floor(this.player.x / ts);
    const py = Math.floor(this.player.y / ts);
    
    for (const b of this.mapData.buildings) {
        if (b.entrance.x === px && b.entrance.y === py) {
            // Player is standing on entrance
            // Check if they are facing the door (up)
            if (this.player.facing === Direction.Up) {
               this.player.y += 10; // push back slightly so they don't immediately re-trigger on return
               SceneTransition.fadeOutIn(this, b.scene);
            }
        }
    }
  }

  private handleInteraction(allNpcs: Record<string, NPCData>) {
    // Find closest NPC facing
    const facingTile = this.player.getFacingTile(this.mapData.tileSize);
    const ts = this.mapData.tileSize;
    
    let closestNpc: NPC | null = null;
    let minDist = 1000;
    
    this.npcs.getChildren().forEach((child) => {
        const npc = child as NPC;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
        
        // Check distance and roughly facing
        if (dist < 50) {
            const dx = npc.x - this.player.x;
            const dy = npc.y - this.player.y;
            
            // simple angle check based on facing direction
            let valid = false;
            if (this.player.facing === Direction.Up && dy < 0 && Math.abs(dx) < 20) valid = true;
            else if (this.player.facing === Direction.Down && dy > 0 && Math.abs(dx) < 20) valid = true;
            else if (this.player.facing === Direction.Left && dx < 0 && Math.abs(dy) < 20) valid = true;
            else if (this.player.facing === Direction.Right && dx > 0 && Math.abs(dy) < 20) valid = true;
            
            if (valid && dist < minDist) {
                minDist = dist;
                closestNpc = npc;
            }
        }
    });

    if (closestNpc && (closestNpc as NPC).npcId) {
      const data = allNpcs[(closestNpc as NPC).npcId];
      if (data) {
        // Special case for Shopkeeper if quest logic isn't primary
        if (data.id === 'shopkeeper_sal') {
             this.dialogueBox.show(data.name, data.dialogue.default, data.spriteColor, undefined, () => {
                 SceneTransition.fadeOutIn(this, 'ShopScene');
             });
        } else if (data.id === 'professor_knowitall') {
            this.dialogueBox.show(data.name, data.dialogue.default, data.spriteColor, undefined, () => {
                 SceneTransition.fadeOutIn(this, 'LibraryScene');
             });
        } else {
             // Check if we can turn in an active quest
             if (data.questId && gameStore.isQuestActive(data.questId)) {
                 const quest = this.questSystem.getQuest(data.questId);
                 if (quest && quest.objectiveType === 'craft') {
                     // Find the item ID for the target molecule symbol
                     const targetSymbol = quest.target;
                     let targetItemId = '';
                     const items = this.cache.json.get('items') as any;
                     for (const [id, itemData] of Object.entries(items)) {
                         if ((itemData as any).symbol === targetSymbol) {
                             targetItemId = id;
                             break;
                         }
                     }
                     // If player has the item, remove it and complete the quest
                     if (targetItemId && gameStore.hasItem(targetItemId, quest.targetAmount || 1)) {
                         gameStore.removeFromInventory(targetItemId, quest.targetAmount || 1);
                         this.questSystem.completeQuest(data.questId);
                     }
                 }
             }

             const lines = this.questSystem.getNpcDialogue(data);
             // Check if quest can be accepted
             let questToOffer: string | undefined;
             if (data.questId && this.questSystem.canAcceptQuest(data.questId)) {
                 questToOffer = data.questId;
             }
             this.dialogueBox.show(data.name, lines, data.spriteColor, questToOffer);
        }
      }
    }
  }

  private buildMap() {
    const ts = this.mapData.tileSize;
    this.groundLayer = this.add.group();
    this.buildings = this.physics.add.staticGroup();

    // Draw ground
    for (let y = 0; y < this.mapData.height; y++) {
      for (let x = 0; x < this.mapData.width; x++) {
        const tileVal = this.mapData.ground[y][x];
        const tileType = this.mapData.tileTypes[tileVal.toString()];
        
        let texture = 'tile_grass'; // default
        if (tileVal === 0) texture = Math.random() > 0.8 ? 'tile_grass_detail' : 'tile_grass';
        if (tileVal === 1) texture = 'tile_wall';
        if (tileVal === 5) texture = 'tile_square';
        if (tileVal === 6) texture = 'tile_portal';
        
        const tile = this.add.image(x * ts + ts/2, y * ts + ts/2, texture);
        
        if (tileType && tileType.collision) {
            const body = this.buildings.create(x * ts + ts/2, y * ts + ts/2, texture);
            body.setAlpha(0); // Make collision body invisible as it overlaps the image
        }
      }
    }

    // Draw Buildings
    for (const b of this.mapData.buildings) {
      let texture = 'tile_wall'; // fallback
      if (b.id === 'laboratory') texture = 'tile_lab';
      if (b.id === 'library') texture = 'tile_library';
      if (b.id.startsWith('shop')) texture = 'tile_shop';
      
      for (const [bx, by] of b.tiles) {
          this.add.image(bx * ts + ts/2, by * ts + ts/2, texture);
          const body = this.buildings.create(bx * ts + ts/2, by * ts + ts/2, texture);
          body.setAlpha(0);
      }
      
      // Entrance marker
      this.add.image(b.entrance.x * ts + ts/2, b.entrance.y * ts + ts/2, 'entrance_marker').setAlpha(0.5);
    }
  }
}
