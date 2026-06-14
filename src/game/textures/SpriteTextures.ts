import Phaser from 'phaser';

export function generatePlayerSprite(scene: Phaser.Scene) {
  const frameW = 32;
  const frameH = 32;
  const totalFrames = 8;
  const sheetW = frameW * totalFrames;

  const g = scene.add.graphics();
  g.setVisible(false);

  for (let i = 0; i < totalFrames; i++) {
    const ox = i * frameW;
    const walkPhase = i % 2;
    const dir = Math.floor(i / 2);
    const bobY = walkPhase === 1 ? -1 : 0;

    const bodyY = 13 + bobY;
    const bodyW = 14;
    const bodyH = 12;

    const headCX = ox + 16;
    const headCY = 8;

    if (dir === 0) {
      g.fillStyle(0xffeaa7, 1);
      g.fillCircle(headCX, headCY, 5);
      g.fillStyle(0x4a3728, 1);
      g.fillRect(headCX - 5, headCY - 5, 10, 3);
      g.fillStyle(0x3a7bd5, 0.7);
      g.fillCircle(headCX - 2, headCY, 3);
      g.fillCircle(headCX + 2, headCY, 3);
      g.fillStyle(0x89b4f0, 0.4);
      g.fillCircle(headCX - 2, headCY, 2);
      g.fillCircle(headCX + 2, headCY, 2);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(headCX - 2, headCY, 1);
      g.fillCircle(headCX + 2, headCY, 1);
      g.fillStyle(0x2d3436, 1);
      g.fillCircle(headCX - 2, headCY, 0.6);
      g.fillCircle(headCX + 2, headCY, 0.6);
      g.fillStyle(0xecf0f1, 1);
      g.fillRoundedRect(ox + 9, bodyY, bodyW, bodyH, 2);
      g.fillStyle(0xd5dbdb, 0.5);
      g.fillRect(ox + 9, bodyY, bodyW, 2);
      g.fillStyle(0x2d3436, 1);
      const legW = 4;
      const legH = 6;
      if (walkPhase === 0) {
        g.fillRect(ox + 9, bodyY + bodyH, legW + 1, legH);
        g.fillRect(ox + 18, bodyY + bodyH, legW, legH - 1);
      } else {
        g.fillRect(ox + 9, bodyY + bodyH, legW, legH - 1);
        g.fillRect(ox + 17, bodyY + bodyH, legW + 1, legH);
      }
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(ox + 9, bodyY + bodyH + legH - 2, bodyW, 2);
      g.fillStyle(0xecf0f1, 1);
      g.fillRect(ox + 9, bodyY + 3, 3, 6);
      g.fillRect(ox + 20, bodyY + 3, 3, 6);
    } else if (dir === 1) {
      g.fillStyle(0x4a3728, 1);
      g.fillCircle(headCX, headCY, 5);
      g.fillStyle(0x3a2718, 1);
      g.fillRect(headCX - 5, headCY - 1, 10, 6);
      g.fillRect(headCX - 2, headCY + 2, 4, 2);
      g.fillStyle(0xecf0f1, 1);
      g.fillRoundedRect(ox + 9, bodyY, bodyW, bodyH, 2);
      g.fillStyle(0xd5dbdb, 0.5);
      g.fillRect(ox + 9, bodyY, bodyW, 2);
      g.fillStyle(0x2d3436, 1);
      if (walkPhase === 0) {
        g.fillRect(ox + 9, bodyY + bodyH, 5, 6);
        g.fillRect(ox + 18, bodyY + bodyH, 5, 5);
      } else {
        g.fillRect(ox + 9, bodyY + bodyH, 5, 5);
        g.fillRect(ox + 18, bodyY + bodyH, 5, 6);
      }
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(ox + 9, bodyY + bodyH + 5, 14, 2);
      g.fillStyle(0xecf0f1, 1);
      g.fillRect(ox + 9, bodyY + 3, 3, 6);
      g.fillRect(ox + 20, bodyY + 3, 3, 6);
    } else if (dir === 2) {
      g.fillStyle(0xffeaa7, 1);
      g.fillCircle(headCX, headCY, 5);
      g.fillStyle(0x4a3728, 1);
      g.fillRect(headCX - 1, headCY - 5, 6, 3);
      g.fillStyle(0x3a7bd5, 0.7);
      g.fillCircle(headCX - 1, headCY, 3);
      g.fillStyle(0x89b4f0, 0.4);
      g.fillCircle(headCX - 1, headCY, 2);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(headCX - 1, headCY, 1);
      g.fillStyle(0x2d3436, 1);
      g.fillCircle(headCX - 1, headCY, 0.6);
      g.fillStyle(0xecf0f1, 1);
      g.fillRoundedRect(ox + 9, bodyY, bodyW, bodyH, 2);
      g.fillStyle(0xd5dbdb, 0.5);
      g.fillRect(ox + 9, bodyY, bodyW, 2);
      g.fillStyle(0x2d3436, 1);
      if (walkPhase === 0) {
        g.fillRect(ox + 9, bodyY + bodyH, 6, 6);
        g.fillRect(ox + 16, bodyY + bodyH, 5, 5);
      } else {
        g.fillRect(ox + 9, bodyY + bodyH, 5, 5);
        g.fillRect(ox + 16, bodyY + bodyH, 6, 6);
      }
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(ox + 9, bodyY + bodyH + 4, 14, 2);
      g.fillStyle(0xecf0f1, 1);
      g.fillRect(ox + 9, bodyY + 4, 3, 6);
      g.fillRect(ox + 20, bodyY + 3, 3, 6);
    } else {
      g.fillStyle(0xffeaa7, 1);
      g.fillCircle(headCX, headCY, 5);
      g.fillStyle(0x4a3728, 1);
      g.fillRect(headCX - 5, headCY - 5, 6, 3);
      g.fillStyle(0x3a7bd5, 0.7);
      g.fillCircle(headCX + 1, headCY, 3);
      g.fillStyle(0x89b4f0, 0.4);
      g.fillCircle(headCX + 1, headCY, 2);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(headCX + 1, headCY, 1);
      g.fillStyle(0x2d3436, 1);
      g.fillCircle(headCX + 1, headCY, 0.6);
      g.fillStyle(0xecf0f1, 1);
      g.fillRoundedRect(ox + 9, bodyY, bodyW, bodyH, 2);
      g.fillStyle(0xd5dbdb, 0.5);
      g.fillRect(ox + 9, bodyY, bodyW, 2);
      g.fillStyle(0x2d3436, 1);
      if (walkPhase === 0) {
        g.fillRect(ox + 9, bodyY + bodyH, 6, 6);
        g.fillRect(ox + 16, bodyY + bodyH, 5, 5);
      } else {
        g.fillRect(ox + 9, bodyY + bodyH, 5, 5);
        g.fillRect(ox + 16, bodyY + bodyH, 6, 6);
      }
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(ox + 9, bodyY + bodyH + 4, 14, 2);
      g.fillStyle(0xecf0f1, 1);
      g.fillRect(ox + 9, bodyY + 3, 3, 6);
      g.fillRect(ox + 20, bodyY + 4, 3, 6);
    }
  }

  g.generateTexture('player_sheet', sheetW, frameH);
  g.destroy();

  if (scene.textures.exists('player_sheet')) {
    const texture = scene.textures.get('player_sheet');
    texture.add('__BASE', 0, 0, 0, sheetW, frameH);
    for (let i = 0; i < totalFrames; i++) {
      texture.add(i, 0, i * frameW, 0, frameW, frameH);
    }
  }
}

function generateNPC(scene: Phaser.Scene, key: string, color: number, accent: number, role: string) {
  const g = scene.add.graphics();
  g.setVisible(false);

  g.fillStyle(color, 1);
  g.fillRoundedRect(7, 10, 18, 14, 3);
  g.fillStyle(0xffeaa7, 1);
  g.fillCircle(16, 8, 6);

  if (role === 'worker') {
    g.fillStyle(accent, 1);
    g.fillRect(9, 1, 14, 5);
    g.fillStyle(0xf1c40f, 0.8);
    g.fillRect(12, 2, 8, 3);
    g.fillStyle(0x2d3436, 1);
    g.fillCircle(14, 7, 1.5);
    g.fillCircle(18, 7, 1.5);
    g.fillStyle(0x7f8c8d, 0.5);
    g.fillRect(9, 6, 14, 1);
  } else if (role === 'scholar') {
    g.fillStyle(0x2d3436, 0.5);
    g.fillRect(9, 2, 14, 3);
    g.fillCircle(12, 5, 1);
    g.fillStyle(0xecf0f1, 0.8);
    g.fillCircle(13, 4, 1);
    g.fillStyle(0x2d3436, 1);
    g.fillCircle(14, 7, 1);
    g.fillCircle(18, 7, 1);
    g.fillStyle(0xecf0f1, 0.6);
    g.fillCircle(15, 3, 1);
  } else if (role === 'merchant') {
    g.fillStyle(accent, 1);
    g.fillRect(9, 2, 14, 5);
    g.fillStyle(0x2d3436, 1);
    g.fillCircle(14, 7, 1.5);
    g.fillCircle(18, 7, 1.5);
    g.fillStyle(0xf1c40f, 0.6);
    g.fillRect(12, 3, 8, 3);
  } else if (role === 'mayor') {
    g.fillStyle(0xf1c40f, 0.6);
    g.fillRect(9, 1, 14, 3);
    g.fillStyle(0x2d3436, 1);
    g.fillCircle(14, 7, 1.5);
    g.fillCircle(18, 7, 1.5);
    g.fillStyle(0xf1c40f, 0.4);
    g.fillCircle(16, 20, 4);
    g.fillStyle(0xecf0f1, 0.3);
    g.fillRect(9, 2, 14, 1);
  } else if (role === 'assistant') {
    g.fillStyle(0x00b894, 1);
    g.fillRect(9, 0, 14, 5);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(12, 3, 2);
    g.fillCircle(20, 3, 2);
    g.fillStyle(0xdfe6e9, 0.3);
    g.fillCircle(12, 3, 1);
    g.fillCircle(20, 3, 1);
    g.fillStyle(0x2d3436, 1);
    g.fillCircle(14, 7, 1.5);
    g.fillCircle(18, 7, 1.5);
    g.fillStyle(0x009874, 0.8);
    g.fillRect(10, 12, 12, 2);
  }

  if (role === 'worker') {
    g.fillStyle(0x2d3436, 1);
    g.fillRect(9, 24, 5, 6);
    g.fillRect(18, 24, 5, 6);
  } else {
    g.fillStyle(0x2d3436, 1);
    g.fillRect(9, 24, 6, 6);
    g.fillRect(17, 24, 6, 6);
  }

  g.generateTexture(key, 32, 32);
  g.destroy();
}

export function generateNPCSprites(scene: Phaser.Scene) {
  generateNPC(scene, 'npc_panting_pete', 0xe74c3c, 0xc0392b, 'worker');
  generateNPC(scene, 'npc_professor_knowitall', 0x3498db, 0x2980b9, 'scholar');
  generateNPC(scene, 'npc_shopkeeper_sal', 0xf39c12, 0xe67e22, 'merchant');
  generateNPC(scene, 'npc_mayor_molecule', 0x9b59b6, 0x8e44ad, 'mayor');
  generateNPC(scene, 'npc_lab_assistant', 0x00b894, 0x009874, 'assistant');
  generateNPC(scene, 'npc_carbon_researcher', 0x26a69a, 0x1a8a7a, 'scholar');
  generateNPC(scene, 'npc_waste_manager', 0xf39c12, 0xe67e22, 'worker');
  generateNPC(scene, 'npc_materials_scientist', 0x2196f3, 0x1976d2, 'scholar');
  generateNPC(scene, 'npc_green_dealer', 0x4caf50, 0x388e3c, 'merchant');
  generateNPC(scene, 'npc_eco_educator', 0x8bc34a, 0x689f38, 'scholar');
  generateNPC(scene, 'npc_climate_scientist', 0x26a69a, 0x1a8a7a, 'scholar');
  generateNPC(scene, 'npc_green_mayor', 0x4caf50, 0x388e3c, 'mayor');
  generateNPC(scene, 'npc_energy_engineer', 0xffd54f, 0xffa726, 'worker');
  generateNPC(scene, 'npc_eco_activist', 0x00b894, 0x009874, 'assistant');
}
