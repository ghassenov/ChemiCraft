import Phaser from 'phaser';

export function generateUITextures(scene: Phaser.Scene) {
  const g1 = scene.add.graphics();
  g1.setVisible(false);
  g1.fillStyle(0x0a0a0a, 0.85);
  g1.fillRoundedRect(0, 0, 120, 30, 8);
  g1.lineStyle(1, 0xf39c12, 0.5);
  g1.strokeRoundedRect(0, 0, 120, 30, 8);
  g1.generateTexture('prompt_bg', 120, 30);
  g1.destroy();

  const g2 = scene.add.graphics();
  g2.setVisible(false);
  g2.fillStyle(0x1a0e00, 0.95);
  g2.fillRoundedRect(0, 0, 800, 160, 12);
  g2.lineStyle(2, 0xf39c12, 0.4);
  g2.strokeRoundedRect(0, 0, 800, 160, 12);
  g2.generateTexture('dialogue_bg', 800, 160);
  g2.destroy();

  const g3 = scene.add.graphics();
  g3.setVisible(false);
  g3.fillStyle(0xf39c12, 1);
  g3.fillRoundedRect(0, 0, 160, 40, 8);
  g3.generateTexture('btn_primary', 160, 40);
  g3.destroy();

  const g4 = scene.add.graphics();
  g4.setVisible(false);
  g4.fillStyle(0x2a1a0a, 1);
  g4.fillRoundedRect(0, 0, 160, 40, 8);
  g4.lineStyle(1, 0xf39c12, 0.5);
  g4.strokeRoundedRect(0, 0, 160, 40, 8);
  g4.generateTexture('btn_secondary', 160, 40);
  g4.destroy();

  const g5 = scene.add.graphics();
  g5.setVisible(false);
  g5.fillStyle(0x0a0a0a, 0.8);
  g5.fillRoundedRect(0, 0, 200, 40, 8);
  g5.lineStyle(1, 0xf39c12, 0.3);
  g5.strokeRoundedRect(0, 0, 200, 40, 8);
  g5.generateTexture('hud_panel', 200, 40);
  g5.destroy();

  const g6 = scene.add.graphics();
  g6.setVisible(false);
  g6.fillStyle(0x1a0e00, 0.9);
  g6.fillRoundedRect(0, 0, 48, 48, 6);
  g6.lineStyle(1, 0xf39c12, 0.3);
  g6.strokeRoundedRect(0, 0, 48, 48, 6);
  g6.generateTexture('inv_slot', 48, 48);
  g6.destroy();

  const g7 = scene.add.graphics();
  g7.setVisible(false);
  g7.fillStyle(0x1a0e00, 0.95);
  g7.fillRoundedRect(0, 0, 600, 400, 16);
  g7.lineStyle(2, 0xf39c12, 0.35);
  g7.strokeRoundedRect(0, 0, 600, 400, 16);
  g7.generateTexture('panel_bg', 600, 400);
  g7.destroy();
}
