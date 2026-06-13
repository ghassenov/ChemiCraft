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
    return data && (data.type === 'reagent' || data.type === 'molecule' || data.type === 'material') && invItem.quantity > 0;
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

  const titleTxt = scene.add.text(width / 2, height / 2 - 130, 'SELECT ITEM', {
    fontFamily: '"Inter"', fontSize: '14px', color: '#a29bfe', fontStyle: 'bold',
  }).setOrigin(0.5).setDepth(52);

  const closeIcn = scene.add.text(width / 2 + 140, height / 2 - 140, '✕', {
    fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675',
  }).setOrigin(0.5).setDepth(55).setInteractive({ useHandCursor: true });

  const allElements: Phaser.GameObjects.GameObject[] = [overlay, panel, titleTxt, closeIcn];
  closeIcn.on('pointerdown', () => allElements.forEach(e => e.destroy()));

  const scrollUp = scene.add.text(width / 2, height / 2 - 90, '▲', {
    fontFamily: '"Inter"', fontSize: '12px', color: '#636e72',
  }).setOrigin(0.5).setDepth(52).setAlpha(0);

  const scrollDown = scene.add.text(width / 2, height / 2 + 115, '▼', {
    fontFamily: '"Inter"', fontSize: '12px', color: '#636e72',
  }).setOrigin(0.5).setDepth(52).setAlpha(0);

  allElements.push(scrollUp, scrollDown);

  const itemContainer = scene.add.container(0, 0).setDepth(52);

  const maskShape = scene.add.graphics().setDepth(51);
  maskShape.fillStyle(0xffffff);
  maskShape.fillRect(width / 2 - 155, height / 2 - 85, 310, 195);
  const mask = maskShape.createGeometryMask();
  itemContainer.setMask(mask);
  allElements.push(maskShape);

  const scrollArea = { y: 0 };
  const itemRows = Math.max(Math.ceil(available.length / 2), 1);
  const rowHeight = 72;
  const contentHeight = itemRows * rowHeight;
  const visibleHeight = 195;
  const maxScroll = Math.max(0, contentHeight - visibleHeight);

  function updateScrollIndicators() {
    scrollUp.setAlpha(scrollArea.y > 0 ? 1 : 0);
    scrollDown.setAlpha(scrollArea.y < maxScroll ? 1 : 0);
  }

  let row = 0;
  let col = 0;

  for (const invItem of available) {
    const data = callbacks.getCraftingItems()[invItem.itemId];
    const bx = width / 2 - 120 + col * 110;
    const by = height / 2 - 90 + row * rowHeight;

    const bg = scene.add.graphics();
    bg.fillStyle(0x2a2a4f, 0.9);
    bg.fillRoundedRect(bx, by, 100, 55, 6);
    bg.lineStyle(1, Phaser.Display.Color.HexStringToColor(data.color).color, 0.5);
    bg.strokeRoundedRect(bx, by, 100, 55, 6);

    const txt = scene.add.text(bx + 50, by + 15, data.symbol, {
      fontFamily: '"Inter"', fontSize: '20px', color: data.color, fontStyle: 'bold',
    }).setOrigin(0.5);

    const qty = scene.add.text(bx + 50, by + 38, `x${invItem.quantity}`, {
      fontFamily: '"Inter"', fontSize: '11px', color: '#636e72',
    }).setOrigin(0.5);

    const zone = scene.add.zone(bx + 50, by + 27, 100, 55).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      callbacks.onSelectReagent(data.symbol);
      allElements.forEach(e => e.destroy());
      itemContainer.destroy();
      const st = callbacks.getStatusText();
      if (st) st.setText(`Carrying: ${data.symbol}\nBring it to the workbench.`);
    });

    itemContainer.add([bg, txt, qty, zone]);
    allElements.push(bg, txt, qty, zone);
    col++;
    if (col >= 2) { col = 0; row++; }
  }

  // Wheel scroll
  const wheelHandler = (_p: any, _g: any, _dx: number, dy: number) => {
    scrollArea.y = Phaser.Math.Clamp(scrollArea.y + dy * 0.5, 0, maxScroll);
    itemContainer.y = -scrollArea.y;
    updateScrollIndicators();
  };
  scene.input.on('wheel', wheelHandler);

  // Drag scroll
  let dragging = false;
  let dragStartY = 0;
  let dragScrollStart = 0;

  const pointerDownHandler = (p: Phaser.Input.Pointer) => {
    const px = p.x;
    const py = p.y;
    const inBounds = px >= width / 2 - 155 && px <= width / 2 + 155 &&
                     py >= height / 2 - 85 && py <= height / 2 + 110;
    if (inBounds) {
      dragging = true;
      dragStartY = p.y;
      dragScrollStart = scrollArea.y;
    }
  };
  const pointerMoveHandler = (p: Phaser.Input.Pointer) => {
    if (dragging) {
      const dy = dragStartY - p.y;
      scrollArea.y = Phaser.Math.Clamp(dragScrollStart + dy, 0, maxScroll);
      itemContainer.y = -scrollArea.y;
      updateScrollIndicators();
    }
  };
  const pointerUpHandler = () => {
    dragging = false;
  };

  scene.input.on('pointerdown', pointerDownHandler);
  scene.input.on('pointermove', pointerMoveHandler);
  scene.input.on('pointerup', pointerUpHandler);

  updateScrollIndicators();

  const cleanup = () => {
    scene.input.off('wheel', wheelHandler);
    scene.input.off('pointerdown', pointerDownHandler);
    scene.input.off('pointermove', pointerMoveHandler);
    scene.input.off('pointerup', pointerUpHandler);
  };

  const closeBtn = scene.add.text(width / 2, height / 2 + 130, 'Cancel', {
    fontFamily: '"Inter"', fontSize: '12px', color: '#ff7675',
  }).setOrigin(0.5).setDepth(53).setInteractive({ useHandCursor: true });
  closeBtn.on('pointerdown', () => {
    cleanup();
    allElements.forEach(e => e.destroy());
    itemContainer.destroy();
  });
  allElements.push(closeBtn);

  // Patch existing close handlers to also call cleanup
  closeIcn.on('pointerdown', () => {
    cleanup();
    allElements.forEach(e => e.destroy());
    itemContainer.destroy();
  });
}
