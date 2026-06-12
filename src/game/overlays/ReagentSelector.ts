import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';
import { ItemData } from '../data/types';

export interface ReagentSelectorCallbacks {
  onSelectReagent(symbol: string): void;
  getStatusText(): Phaser.GameObjects.Text | null;
  getCraftingItems(): Record<string, ItemData>;
}

export function openReagentSelector(scene: Phaser.Scene, callbacks: ReagentSelectorCallbacks) {
  const inv = gameStore.getInventory();
  const available = inv.filter(invItem => {
    const data = callbacks.getCraftingItems()[invItem.itemId];
    return data && data.type === 'reagent' && invItem.quantity > 0;
  });

  if (available.length === 0) {
    const st = callbacks.getStatusText();
    if (st) st.setText('No reagents available!\nBuy some from the shop or complete quests.');
    return;
  }

  const { width, height } = scene.cameras.main;
  const overlay = scene.add.rectangle(0, 0, width, height, 0x000, 0.7).setOrigin(0).setDepth(50);

  const panel = scene.add.graphics();
  panel.fillStyle(0x1a1a3e, 0.95);
  panel.fillRoundedRect(width / 2 - 160, height / 2 - 150, 320, 300, 12);
  panel.lineStyle(2, 0x6c5ce7, 0.5);
  panel.strokeRoundedRect(width / 2 - 160, height / 2 - 150, 320, 300, 12);
  panel.setDepth(51);

  const titleTxt = scene.add.text(width / 2, height / 2 - 130, 'SELECT REAGENT', {
    fontFamily: '"Inter"', fontSize: '14px', color: '#a29bfe', fontStyle: 'bold',
  }).setOrigin(0.5).setDepth(52);

  const closeIcn = scene.add.text(width / 2 + 140, height / 2 - 140, '✕', {
    fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675',
  }).setOrigin(0.5).setDepth(55).setInteractive({ useHandCursor: true });

  const items: Phaser.GameObjects.GameObject[] = [overlay, panel, titleTxt, closeIcn];
  closeIcn.on('pointerdown', () => items.forEach(i => i.destroy()));
  let row = 0;
  let col = 0;

  for (const invItem of available) {
    const data = callbacks.getCraftingItems()[invItem.itemId];
    const bx = width / 2 - 120 + col * 110;
    const by = height / 2 - 90 + row * 70;

    const bg = scene.add.graphics();
    bg.fillStyle(0x2a2a4f, 0.9);
    bg.fillRoundedRect(bx, by, 100, 55, 6);
    bg.lineStyle(1, Phaser.Display.Color.HexStringToColor(data.color).color, 0.5);
    bg.strokeRoundedRect(bx, by, 100, 55, 6);
    bg.setDepth(52);

    const txt = scene.add.text(bx + 50, by + 15, data.symbol, {
      fontFamily: '"Inter"', fontSize: '20px', color: data.color, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(53);

    const qty = scene.add.text(bx + 50, by + 38, `x${invItem.quantity}`, {
      fontFamily: '"Inter"', fontSize: '11px', color: '#636e72',
    }).setOrigin(0.5).setDepth(53);

    const zone = scene.add.zone(bx + 50, by + 27, 100, 55).setInteractive({ useHandCursor: true }).setDepth(54);
    zone.on('pointerdown', () => {
      callbacks.onSelectReagent(data.symbol);
      items.forEach(i => i.destroy());
      const st = callbacks.getStatusText();
      if (st) st.setText(`Carrying: ${data.symbol}\nBring it to the workbench.`);
    });

    items.push(bg, txt, qty, zone);
    col++;
    if (col >= 2) { col = 0; row++; }
  }

  const closeBtn = scene.add.text(width / 2, height / 2 + 130, 'Cancel', {
    fontFamily: '"Inter"', fontSize: '12px', color: '#ff7675',
  }).setOrigin(0.5).setDepth(53).setInteractive({ useHandCursor: true });
  closeBtn.on('pointerdown', () => items.forEach(i => i.destroy()));
  items.push(closeBtn);
}
