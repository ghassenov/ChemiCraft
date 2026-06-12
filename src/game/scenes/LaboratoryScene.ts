import Phaser from 'phaser';
import { SceneTransition } from '../systems/SceneTransition';
import { CraftingSystem } from '../systems/CraftingSystem';
import { gameStore } from '../../store/gameStore';
import { RecipeData, ItemData, GameEvents } from '../data/types';

export class LaboratoryScene extends Phaser.Scene {
  private craftingSystem!: CraftingSystem;
  private inputSlots: (Phaser.GameObjects.Sprite | null)[] = [null, null, null, null, null];
  private selectedReagents: string[] = [];
  
  private chamberGroup!: Phaser.GameObjects.Group;
  private explanationText!: Phaser.GameObjects.Text;
  private resultIcon!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LaboratoryScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const { width, height } = this.cameras.main;

    // Load data
    const recipes = this.cache.json.get('recipes') as RecipeData[];
    const items = this.cache.json.get('items') as Record<string, ItemData>;
    this.craftingSystem = new CraftingSystem(recipes);

    // Background
    this.add.rectangle(0, 0, width, height, 0x131330).setOrigin(0);
    
    // Title
    this.add.text(width / 2, 40, 'Laboratory', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '24px', color: '#a29bfe'
    }).setOrigin(0.5);

    // Layout
    // Shelf (Left)
    this.add.rectangle(150, height/2, 250, height - 150, 0x1e1e3f).setStrokeStyle(2, 0x6c5ce7);
    this.add.text(150, 100, 'Reagents', { fontFamily: '"Inter"', fontSize: '18px', color: '#fff' }).setOrigin(0.5);

    // Render reagents from inventory
    this.renderShelf(items);

    // Reaction Chamber (Center)
    this.add.rectangle(width/2, height/2, 300, 300, 0x0a0a1a).setStrokeStyle(4, 0x00cec9);
    this.add.circle(width/2, height/2, 120, 0x131330).setStrokeStyle(2, 0x00cec9);
    this.resultIcon = this.add.text(width/2, height/2, '', { fontFamily: '"Inter"', fontSize: '48px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    
    this.chamberGroup = this.add.group();
    
    // Clear Button
    const clearBtn = this.add.text(width/2 - 70, height/2 + 180, '[ Clear ]', { fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675' })
        .setOrigin(0.5).setInteractive({ useHandCursor: true });
    clearBtn.on('pointerdown', () => this.clearChamber());

    // Craft Button
    const craftBtn = this.add.rectangle(width/2 + 70, height/2 + 180, 120, 40, 0x6c5ce7, 1)
        .setInteractive({ useHandCursor: true });
    const craftTxt = this.add.text(width/2 + 70, height/2 + 180, 'CRAFT', { fontFamily: '"Inter"', fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    craftBtn.on('pointerdown', () => this.attemptCraft(items));

    // Observation Panel (Right)
    this.add.rectangle(width - 200, height/2, 300, height - 150, 0x1e1e3f).setStrokeStyle(2, 0x6c5ce7);
    this.add.text(width - 200, 100, 'Observation', { fontFamily: '"Inter"', fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    this.explanationText = this.add.text(width - 320, 140, 'Add reagents to the reaction chamber and press Craft.', {
        fontFamily: '"Inter"', fontSize: '14px', color: '#dfe6e9', wordWrap: { width: 260 }, lineSpacing: 6
    });

    // Exit Button
    const exitBtn = this.add.text(40, 40, '← Exit', { fontFamily: '"Inter"', fontSize: '16px', color: '#dfe6e9' })
        .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => {
        SceneTransition.fadeOutIn(this, 'GameScene');
    });
  }

  private renderShelf(items: Record<string, ItemData>) {
    const inv = gameStore.getInventory();
    let y = 150;
    let x = 70;
    
    for (const invItem of inv) {
        const itemData = items[invItem.itemId];
        if (itemData && itemData.type === 'reagent') {
            const color = Phaser.Display.Color.HexStringToColor(itemData.color).color;
            const card = this.add.container(x, y);
            const bg = this.add.rectangle(0, 0, 60, 80, color, 0.2).setStrokeStyle(2, color);
            const txt = this.add.text(0, -10, itemData.symbol, { fontFamily: '"Inter"', fontSize: '24px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            const qty = this.add.text(0, 20, `x${invItem.quantity}`, { fontFamily: '"Inter"', fontSize: '12px', color: '#fff' }).setOrigin(0.5);
            
            card.add([bg, txt, qty]);
            card.setSize(60, 80);
            card.setInteractive({ useHandCursor: true });
            
            card.on('pointerdown', () => {
                if (this.selectedReagents.length < 5 && gameStore.hasItem(itemData.id, 1)) {
                    this.addToChamber(itemData);
                } else if (!gameStore.hasItem(itemData.id, 1)) {
                    this.explanationText.setText('Not enough reagents!');
                } else {
                    this.explanationText.setText('Chamber is full! (Max 5 reagents)');
                }
            });

            x += 80;
            if (x > 200) {
                x = 70;
                y += 100;
            }
        }
    }
  }

  private addToChamber(itemData: ItemData) {
    this.resultIcon.setText('');
    this.explanationText.setText('Ready to react...');
    
    // Find empty slot
    const slotIdx = this.selectedReagents.length;
    this.selectedReagents.push(itemData.symbol);
    
    // Position in circle around center
    const angle = (slotIdx * (Math.PI * 2) / 5) - Math.PI / 2;
    const { width, height } = this.cameras.main;
    const cx = width/2;
    const cy = height/2;
    const r = 60;
    
    const color = Phaser.Display.Color.HexStringToColor(itemData.color).color;
    const sprite = this.add.text(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r, itemData.symbol, {
        fontFamily: '"Inter"', fontSize: '32px', color: itemData.color, fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.chamberGroup.add(sprite);
    
    // Play subtle animation
    this.tweens.add({ targets: sprite, scale: 1.2, duration: 100, yoyo: true });
  }

  private clearChamber() {
    this.selectedReagents = [];
    this.chamberGroup.clear(true, true);
    this.resultIcon.setText('');
    this.explanationText.setText('Chamber cleared.');
  }

  private attemptCraft(items: Record<string, ItemData>) {
    if (this.selectedReagents.length === 0) return;

    const result = this.craftingSystem.craft(this.selectedReagents);
    
    if (result.success && result.result) {
        // Find molecule ID that matches output
        const outSymbol = result.result.output;
        let craftedItemId = '';
        for (const [id, data] of Object.entries(items)) {
            if (data.type === 'molecule' && data.symbol === outSymbol) {
                craftedItemId = id;
                break;
            }
        }
        
        if (craftedItemId) {
            // Deduct reagents
            // We just clear them logically since inventory deduction should happen if it's successful
            // Wait, we need to map symbols back to itemIds to deduct
            const symbolToId: Record<string, string> = {};
            for (const [id, data] of Object.entries(items)) {
                if (data.type === 'reagent') symbolToId[data.symbol] = id;
            }
            
            for (const sym of this.selectedReagents) {
                const id = symbolToId[sym];
                if (id) gameStore.removeFromInventory(id, 1);
            }
            
            // Add result
            gameStore.addToInventory(craftedItemId, 1);
            
            // Effects
            this.cameras.main.flash(200, 100, 255, 200);
            this.resultIcon.setText(result.result.output).setColor('#00b894');
            this.explanationText.setText(`Success! Crafted ${result.result.outputName}.\n\n${result.result.explanation}`);
            this.chamberGroup.clear(true, true);
            this.selectedReagents = [];
            
            // Re-render shelf to update quantities
            this.scene.restart(); // Simple way to refresh UI state for now
            
            this.events.emit(GameEvents.ItemCrafted, result.result.output);
        }
    } else {
        // Failure
        this.cameras.main.shake(200, 0.01);
        this.explanationText.setText(result.error || 'Reaction failed.');
        this.resultIcon.setText('❌').setColor('#ff7675');
    }
  }
}
