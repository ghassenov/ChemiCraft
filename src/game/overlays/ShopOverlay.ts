import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';
import { ItemData } from '../data/types';

export function openShop(scene: Phaser.Scene) {
  const items = scene.cache.json.get('items') as Record<string, ItemData>;
  const shopItems = Object.values(items).filter(i => i.price && i.price > 0);

  const { width, height } = scene.cameras.main;
  const overlay = scene.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0).setDepth(50);

  const panel = scene.add.graphics().setDepth(51);
  panel.fillStyle(0x1a0e00, 0.95);
  panel.fillRoundedRect(width / 2 - 220, height / 2 - 180, 440, 360, 12);
  panel.lineStyle(2, 0xf39c12, 0.5);
  panel.strokeRoundedRect(width / 2 - 220, height / 2 - 180, 440, 360, 12);

  const title = scene.add.text(width / 2, height / 2 - 158, "SAL'S SUPPLIES", {
    fontFamily: '"Press Start 2P"', fontSize: '11px', color: '#f39c12',
  }).setOrigin(0.5).setDepth(52);

  const coinDisp = scene.add.text(width / 2, height / 2 - 135, `Coins: ${gameStore.getState().playerData.coins}`, {
    fontFamily: '"Inter"', fontSize: '13px', color: '#fdcb6e',
  }).setOrigin(0.5).setDepth(52);

  const itemsArr: Phaser.GameObjects.GameObject[] = [overlay, panel, title, coinDisp];

  let y = height / 2 - 110;
  for (const item of shopItems) {
    if (y > height / 2 + 140) break;

    const bg = scene.add.graphics().setDepth(52);
    bg.fillStyle(0x2a1a0a, 0.85);
    bg.fillRoundedRect(width / 2 - 190, y, 380, 44, 6);
    bg.lineStyle(1, 0xf39c12, 0.2);
    bg.strokeRoundedRect(width / 2 - 190, y, 380, 44, 6);

    const icon = scene.add.text(width / 2 - 170, y + 10, item.symbol, {
      fontSize: '18px', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(53);

    const name = scene.add.text(width / 2 - 140, y + 4, item.name, {
      fontFamily: '"Inter"', fontSize: '13px', color: item.color, fontStyle: 'bold',
    }).setDepth(53);

    const desc = scene.add.text(width / 2 - 140, y + 24, item.description.substring(0, 30), {
      fontFamily: '"Inter"', fontSize: '10px', color: '#7a6a4a',
    }).setDepth(53);

    const btnG = scene.add.graphics().setDepth(53);
    btnG.fillStyle(0xf39c12, 0.85);
    btnG.fillRoundedRect(width / 2 + 100, y + 5, 80, 26, 6);

    const btnT = scene.add.text(width / 2 + 140, y + 18, `${item.price}`, {
      fontFamily: '"Inter"', fontSize: '11px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(54);

    const zone = scene.add.zone(width / 2 + 140, y + 18, 80, 26)
      .setInteractive({ useHandCursor: true }).setDepth(55);

    zone.on('pointerdown', () => {
      if (gameStore.getState().playerData.coins >= item.price!) {
        gameStore.spendCoins(item.price!);
        gameStore.addToInventory(item.id, 1);
        scene.sound.play('sfx_coin', { volume: 0.5 });
        scene.cameras.main.flash(200, 243, 156, 18);
        btnT.setText('SOLD!');
        coinDisp.setText(`Coins: ${gameStore.getState().playerData.coins}`);
        scene.time.delayedCall(800, () => btnT.setText(`${item.price}`));
      } else {
        scene.cameras.main.shake(200, 0.005);
      }
    });

    itemsArr.push(bg, icon, name, desc, btnG, btnT, zone);
    y += 48;
  }

  const closeBtn = scene.add.text(width / 2 + 200, height / 2 - 170, '✕', {
    fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675',
  }).setOrigin(0.5).setDepth(55).setInteractive({ useHandCursor: true });
  closeBtn.on('pointerdown', () => itemsArr.forEach(i => i.destroy()));
  itemsArr.push(closeBtn);
}
