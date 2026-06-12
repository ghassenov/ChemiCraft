import Phaser from 'phaser';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';
import { ItemData } from '../data/types';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const { width, height } = this.cameras.main;

    const items = this.cache.json.get('items') as Record<string, ItemData>;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1200).setOrigin(0); // brownish tint
    
    // Title
    this.add.text(width / 2, 40, 'Sal\'s Science Supply', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: '#f39c12'
    }).setOrigin(0.5);

    // Coins
    const coinTxt = this.add.text(width - 40, 40, `🪙 ${gameStore.getState().playerData.coins}`, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#fdcb6e'
    }).setOrigin(1, 0.5);

    // Subscribe to store updates
    const unsub = gameStore.subscribe(() => {
        coinTxt.setText(`🪙 ${gameStore.getState().playerData.coins}`);
    });
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => unsub());

    // Shopkeeper portrait
    this.add.rectangle(150, 150, 100, 100, 0x2c1e00).setStrokeStyle(2, 0xf39c12);
    this.add.circle(150, 140, 30, 0xf39c12); // head
    this.add.text(150, 220, '"Need some supplies?"', { fontFamily: '"Inter"', fontSize: '14px', color: '#dfe6e9', fontStyle: 'italic' }).setOrigin(0.5);

    // Items list (Filter by price > 0)
    let y = 120;
    const shopItems = Object.values(items).filter(i => i.price && i.price > 0);
    
    for (const item of shopItems) {
        const row = this.add.container(350, y);
        
        const bg = this.add.rectangle(0, 0, 450, 60, 0x2c1e00, 0.8).setOrigin(0, 0.5).setStrokeStyle(1, 0xf39c12);
        const icon = this.add.text(30, 0, item.symbol, { fontSize: '24px' }).setOrigin(0.5);
        const name = this.add.text(70, -10, item.name, { fontFamily: '"Inter"', fontSize: '16px', color: item.color, fontStyle: 'bold' });
        const desc = this.add.text(70, 10, item.description.substring(0, 40) + '...', { fontFamily: '"Inter"', fontSize: '12px', color: '#636e72' });
        
        const btnBg = this.add.rectangle(380, 0, 80, 30, 0xf39c12, 1).setInteractive({ useHandCursor: true });
        const btnTxt = this.add.text(380, 0, `🪙 ${item.price}`, { fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        
        btnBg.on('pointerdown', () => {
            if (gameStore.getState().playerData.coins >= item.price!) {
                gameStore.spendCoins(item.price!);
                gameStore.addToInventory(item.id, 1);
                
                // Feedback
                this.cameras.main.flash(200, 243, 156, 18); // orange flash
                btnTxt.setText('BOUGHT!');
                this.time.delayedCall(1000, () => btnTxt.setText(`🪙 ${item.price}`));
            } else {
                this.cameras.main.shake(200, 0.005);
            }
        });

        row.add([bg, icon, name, desc, btnBg, btnTxt]);
        y += 70;
    }

    // Exit
    const exitBtn = this.add.text(40, 40, '← Exit', { fontFamily: '"Inter"', fontSize: '16px', color: '#dfe6e9' })
        .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => {
        SceneTransition.fadeOutIn(this, 'GameScene');
    });
  }
}
