import Phaser from 'phaser';

export function addHelpButton(scene: Phaser.Scene, lines: string[]) {
  const helpBtn = scene.add.text(610, 30, '?', {
    fontFamily: '"Inter"', fontSize: '18px', color: '#636e72', fontStyle: 'bold',
    backgroundColor: '#1a1a2ecc', padding: { x: 6, y: 2 },
  }).setOrigin(0.5).setDepth(45).setInteractive({ useHandCursor: true });

  let active = false;

  helpBtn.on('pointerdown', () => {
    if (active) return;
    active = true;

    const { width, height } = scene.cameras.main;
    const cx = width * 0.5 - 120;
    const overlay = scene.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0).setDepth(50);

    const panel = scene.add.graphics().setDepth(51);
    panel.fillStyle(0x1a1a3e, 0.95);
    panel.fillRoundedRect(cx - 180, height / 2 - 120, 360, 240, 12);
    panel.lineStyle(2, 0x6c5ce7, 0.5);
    panel.strokeRoundedRect(cx - 180, height / 2 - 120, 360, 240, 12);

    const title = scene.add.text(cx, height / 2 - 100, 'Room Guide', {
      fontFamily: '"Inter"', fontSize: '14px', color: '#a29bfe', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);

    const body = scene.add.text(cx, height / 2 - 30, lines.join('\n'), {
      fontFamily: '"Inter"', fontSize: '13px', color: '#c8d6e5',
      wordWrap: { width: 300 }, lineSpacing: 8, align: 'center',
    }).setOrigin(0.5).setDepth(52);

    const closeIcn = scene.add.text(cx + 160, height / 2 - 110, '✕', {
      fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675',
    }).setOrigin(0.5).setDepth(55).setInteractive({ useHandCursor: true });

    const all: Phaser.GameObjects.GameObject[] = [overlay, panel, title, body, closeIcn, helpBtn];

    const destroy = () => {
      all.forEach(i => i.destroy());
      active = false;
    };

    closeIcn.on('pointerdown', destroy);
    overlay.on('pointerdown', destroy);
  });
}
