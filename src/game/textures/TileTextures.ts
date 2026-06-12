import Phaser from 'phaser';

export function generateTileGrass(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0x4a7c59, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x3d6b4b, 0.5);
  g.fillRect(0, 0, 32, 1);
  g.fillRect(0, 0, 1, 32);
  g.fillStyle(0x3d6b4b, 0.3);
  g.fillRect(3, 5, 7, 4);
  g.fillRect(20, 18, 9, 5);
  g.fillRect(14, 28, 6, 3);
  g.fillRect(25, 7, 5, 4);
  g.fillStyle(0x5a9c69, 0.35);
  g.fillRect(12, 2, 5, 3);
  g.fillRect(26, 22, 4, 3);
  g.fillRect(1, 20, 4, 2);
  g.fillStyle(0x3a7349, 0.7);
  const blades = [
    [4, 3], [8, 12], [14, 6], [20, 14], [26, 4], [30, 10],
    [6, 22], [11, 18], [18, 25], [24, 28], [2, 28], [29, 20],
    [3, 10], [16, 9], [22, 3], [27, 16], [12, 25], [7, 16],
  ];
  for (const [x, y] of blades) g.fillRect(x, y, 1, 3);
  g.fillStyle(0x6abc79, 0.5);
  const lightBlades = [
    [2, 8], [13, 4], [19, 8], [25, 12], [5, 18], [15, 21],
  ];
  for (const [x, y] of lightBlades) g.fillRect(x, y, 1, 2);
  g.fillStyle(0x8b7355, 0.15);
  g.fillRect(12, 26, 5, 4);
  g.fillRect(6, 2, 3, 2);
  g.generateTexture('tile_grass', 32, 32);
  g.destroy();
}

export function generateTileGrassDetail(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0x4a7c59, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x3d6b4b, 0.3);
  g.fillRect(1, 1, 30, 30);
  g.fillStyle(0x3a7349, 0.6);
  const darkBlades = [
    [3, 5], [9, 15], [16, 3], [22, 19], [28, 8], [5, 25],
    [14, 12], [20, 27], [27, 22], [1, 14], [11, 8], [25, 3],
  ];
  for (const [x, y] of darkBlades) g.fillRect(x, y, 1, 3);
  g.fillStyle(0xffeaa7, 0.9);
  g.fillCircle(6, 7, 1);
  g.fillCircle(22, 5, 1);
  g.fillCircle(14, 22, 1);
  g.fillCircle(28, 18, 1);
  g.fillStyle(0xf5cd7a, 0.9);
  g.fillCircle(17, 6, 1);
  g.fillCircle(10, 20, 1);
  g.fillCircle(25, 27, 1);
  g.fillCircle(3, 16, 1);
  g.fillStyle(0xff6b6b, 0.8);
  g.fillCircle(4, 26, 1);
  g.fillCircle(20, 14, 1);
  g.fillStyle(0x5a9c69, 0.3);
  g.fillRect(8, 16, 3, 2);
  g.fillRect(24, 10, 3, 2);
  g.generateTexture('tile_grass_detail', 32, 32);
  g.destroy();
}

export function generateTileWall(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0x3a3a4a, 1);
  g.fillRect(0, 0, 32, 32);
  const stones = [
    [0, 0, 10, 7], [11, 0, 10, 7], [22, 0, 10, 7],
    [4, 8, 9, 7], [14, 8, 9, 7], [24, 8, 8, 7],
    [0, 16, 10, 7], [11, 16, 10, 7], [22, 16, 10, 7],
    [4, 24, 9, 7], [14, 24, 9, 7], [24, 24, 8, 7],
  ];
  for (const [sx, sy, sw, sh] of stones) {
    const base = 0x5a5a7a + Math.floor(Math.random() * 16) * 0x010101;
    g.fillStyle(base, 1);
    g.fillRect(sx, sy, sw, sh);
    g.fillStyle(0xffffff, 0.12);
    g.fillRect(sx, sy, sw, 1);
    g.fillRect(sx, sy, 1, sh);
    g.fillStyle(0x000000, 0.15);
    g.fillRect(sx, sy + sh - 1, sw, 1);
    g.fillRect(sx + sw - 1, sy, 1, sh);
  }
  g.generateTexture('tile_wall', 32, 32);
  g.destroy();
}

export function generateTileLab(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0x2a5a8f, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x1a4a7f, 0.4);
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 8; col++)
      if ((row + col) % 2 === 0) g.fillRect(col * 4, row * 4, 4, 4);
  g.fillStyle(0x5a8abf, 0.3);
  g.fillRect(0, 0, 32, 1);
  g.fillRect(0, 0, 1, 32);
  g.fillStyle(0xcceeff, 0.15);
  g.fillRect(8, 2, 16, 28);
  g.fillStyle(0x6a9acf, 0.4);
  g.fillRect(14, 6, 4, 14);
  g.fillCircle(16, 12, 2);
  g.fillRect(11, 20, 10, 3);
  g.lineStyle(2, 0x8abaf0, 0.5);
  g.strokeCircle(16, 5, 6);
  g.lineStyle(1, 0xa0d0ff, 0.3);
  g.strokeRect(9, 2, 14, 14);
  g.generateTexture('tile_lab', 32, 32);
  g.destroy();
}

export function generateTileLibrary(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0x6a4914, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x5a3914, 0.3);
  g.fillRect(0, 0, 16, 16);
  g.fillRect(16, 16, 16, 16);
  g.fillStyle(0x8a6934, 0.25);
  g.fillRect(0, 0, 32, 1);
  g.fillRect(0, 0, 1, 32);
  g.fillStyle(0x7a5914, 1);
  g.fillRect(4, 3, 8, 12);
  g.fillRect(20, 3, 8, 12);
  g.fillStyle(0xcca040, 0.2);
  for (let i = 0; i < 4; i++) {
    g.fillRect(5 + i * 2, 4 + i * 3, 6, 2);
    g.fillRect(21 + i * 2, 4 + i * 3, 6, 2);
  }
  g.lineStyle(1, 0x8a6a24, 0.6);
  g.strokeRect(4, 3, 8, 12);
  g.strokeRect(20, 3, 8, 12);
  g.fillStyle(0x5a3914, 0.5);
  g.fillRect(15, 0, 2, 32);
  g.generateTexture('tile_library', 32, 32);
  g.destroy();
}

export function generateTileShop(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0xc47f17, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0xa46f07, 0.35);
  g.fillRect(0, 0, 16, 16);
  g.fillRect(16, 16, 16, 16);
  g.fillStyle(0xe49f37, 0.25);
  g.fillRect(0, 0, 32, 1);
  g.fillRect(0, 0, 1, 32);
  g.lineStyle(1, 0xa46f07, 0.4);
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 4; col++)
      g.strokeRect(col * 8, row * 8, 8, 8);
  g.fillStyle(0xffd700, 0.35);
  g.fillCircle(16, 10, 4);
  g.fillStyle(0xffec8b, 0.20);
  g.fillCircle(16, 10, 2);
  g.fillStyle(0xcc8830, 0.3);
  g.fillRect(6, 20, 20, 3);
  g.fillRect(10, 24, 12, 3);
  g.generateTexture('tile_shop', 32, 32);
  g.destroy();
}

export function generateTileSquare(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0x7f8c8d, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x6f7c7d, 0.3);
  g.fillRect(0, 0, 8, 8);
  g.fillRect(16, 0, 8, 8);
  g.fillRect(8, 8, 8, 8);
  g.fillRect(24, 8, 8, 8);
  g.fillRect(0, 16, 8, 8);
  g.fillRect(16, 16, 8, 8);
  g.fillRect(8, 24, 8, 8);
  g.fillRect(24, 24, 8, 8);
  g.lineStyle(1, 0x5f6c6d, 0.4);
  for (let i = 0; i <= 4; i++) {
    g.lineBetween(i * 8, 0, i * 8, 32);
    g.lineBetween(0, i * 8, 32, i * 8);
  }
  g.fillStyle(0x6f7c7d, 0.2);
  g.fillRect(1, 1, 6, 6);
  g.fillRect(17, 1, 6, 6);
  g.fillRect(9, 9, 6, 6);
  g.fillRect(25, 9, 6, 6);
  g.fillStyle(0xffffff, 0.08);
  g.fillRect(10, 12, 2, 2);
  g.fillRect(20, 22, 2, 2);
  g.fillRect(4, 14, 2, 1);
  g.generateTexture('tile_square', 32, 32);
  g.destroy();
}

export function generateTilePortal(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0x2d1b69, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x4a2b9f, 0.5);
  g.fillCircle(16, 16, 12);
  g.fillStyle(0x6b4bcf, 0.4);
  g.fillCircle(16, 16, 9);
  g.fillStyle(0x8b6bff, 0.3);
  g.fillCircle(16, 16, 6);
  g.fillStyle(0xab8bff, 0.2);
  g.fillCircle(16, 16, 3);
  g.lineStyle(2, 0x8b6bff, 0.3);
  g.strokeCircle(16, 16, 10);
  g.lineStyle(1, 0xab8bff, 0.2);
  g.strokeCircle(16, 16, 7);
  g.fillStyle(0xffffff, 0.15);
  g.fillCircle(14, 13, 1);
  g.fillCircle(18, 15, 1);
  g.fillStyle(0xab8bff, 0.1);
  g.fillRect(0, 0, 32, 32);
  g.generateTexture('tile_portal', 32, 32);
  g.destroy();
}

export function generateTileEntrance(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.setVisible(false);
  g.fillStyle(0x2ecc71, 0.9);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x27ae60, 0.4);
  g.fillRect(0, 0, 16, 16);
  g.fillRect(16, 16, 16, 16);
  g.fillStyle(0xffffff, 0.2);
  g.fillTriangle(16, 4, 6, 24, 26, 24);
  g.fillStyle(0x2ecc71, 0.3);
  g.fillTriangle(16, 8, 8, 22, 24, 22);
  g.fillStyle(0xffffff, 0.15);
  g.fillRect(8, 0, 16, 1);
  g.fillRect(0, 8, 1, 16);
  g.generateTexture('entrance_marker', 32, 32);
  g.destroy();
}
