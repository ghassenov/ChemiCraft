import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';

interface Ray {
  angle: number;
  color: number;
}

interface LevelDef {
  id: number;
  name: string;
  hint: string;
  check: (raysAtTarget: Ray[], allRays: Ray[][]) => boolean;
  reward: string | null;
  rewardQty?: number;
}

const COMPONENTS = [
  { id: 'prism', symbol: '🔷', name: 'Prism' },
  { id: 'convex_lens', symbol: '🔍', name: 'Convex Lens' },
  { id: 'red_filter', symbol: '🔴', name: 'Red Filter' },
  { id: 'green_filter', symbol: '🟢', name: 'Green Filter' },
  { id: 'blue_filter', symbol: '🔵', name: 'Blue Filter' },
  { id: 'color_filter_set', symbol: '🎨', name: 'Color Filter Set' },
];

const BEAM_SCALE = 0.7;

function processBeam(incomingRays: Ray[], slotContent: string | null): Ray[] {
  if (!slotContent) return incomingRays;
  switch (slotContent) {
    case 'prism':
      return incomingRays.flatMap(r => [
        { angle: r.angle - 12, color: 0xff4444 },
        { angle: r.angle, color: 0x44ff44 },
        { angle: r.angle + 12, color: 0x4444ff },
      ]);
    case 'convex_lens':
      return incomingRays.map(r => ({ ...r, angle: r.angle * 0.5 }));
    case 'red_filter':
      return incomingRays.filter(r => (r.color >> 16 & 0xff) > (r.color >> 8 & 0xff) + 20 && (r.color >> 16 & 0xff) > (r.color & 0xff) + 20);
    case 'green_filter':
      return incomingRays.filter(r => (r.color >> 8 & 0xff) > (r.color >> 16 & 0xff) + 20 && (r.color >> 8 & 0xff) > (r.color & 0xff) + 20);
    case 'blue_filter':
      return incomingRays.filter(r => (r.color & 0xff) > (r.color >> 16 & 0xff) + 20 && (r.color & 0xff) > (r.color >> 8 & 0xff) + 20);
    case 'color_filter_set': {
      const hasR = incomingRays.some(r => (r.color >> 16 & 0xff) > (r.color >> 8 & 0xff) + 20 && (r.color >> 16 & 0xff) > (r.color & 0xff) + 20);
      const hasG = incomingRays.some(r => (r.color >> 8 & 0xff) > (r.color >> 16 & 0xff) + 20 && (r.color >> 8 & 0xff) > (r.color & 0xff) + 20);
      const hasB = incomingRays.some(r => (r.color & 0xff) > (r.color >> 16 & 0xff) + 20 && (r.color & 0xff) > (r.color >> 8 & 0xff) + 20);
      if (hasR && hasG && hasB) return [{ angle: 0, color: 0xffffff }];
      return incomingRays;
    }
    default:
      return incomingRays;
  }
}

const LEVELS: LevelDef[] = [
  {
    id: 1, name: 'Split the Light',
    hint: 'Place a prism to split white light into colors!',
    check: (_raysAtTarget, allRays) => {
      const final = allRays[allRays.length - 1] || [];
      return final.length >= 3;
    },
    reward: 'rainbow_gem', rewardQty: 1,
  },
  {
    id: 2, name: 'Color Mixing',
    hint: 'Use a color filter to pass only one pure color!',
    check: (raysAtTarget) => raysAtTarget.length === 1 && raysAtTarget[0].color !== 0xffffff,
    reward: 'color_filter_set', rewardQty: 1,
  },
  {
    id: 3, name: 'Lens Creation',
    hint: 'Use a convex lens to focus light to a tight spot!',
    check: (_raysAtTarget, allRays) => {
      const final = allRays[allRays.length - 1] || [];
      if (final.length === 0) return false;
      const wasSplit = allRays.some(g => g.length >= 3);
      const avgAngle = final.reduce((s, r) => s + Math.abs(r.angle), 0) / final.length;
      return avgAngle < 8 && (wasSplit || final.length === 1);
    },
    reward: 'convex_lens', rewardQty: 1,
  },
  {
    id: 4, name: 'Full Spectrum',
    hint: 'Split light with a prism, then keep only red!',
    check: (raysAtTarget) => {
      if (raysAtTarget.length !== 1) return false;
      const r = (raysAtTarget[0].color >> 16) & 0xff;
      const g = (raysAtTarget[0].color >> 8) & 0xff;
      const b = raysAtTarget[0].color & 0xff;
      return r > 200 && g < 100 && b < 100;
    },
    reward: 'rainbow_gem', rewardQty: 2,
  },
  {
    id: 5, name: 'Rainbow Bridge',
    hint: 'Split then recombine all colors back into white light!',
    check: (raysAtTarget, allRays) => {
      const wasSplit = allRays.some(g => g.length >= 3);
      return raysAtTarget.length === 1 && raysAtTarget[0].color === 0xffffff && wasSplit;
    },
    reward: null,
  },
];

export function openLightPuzzle(scene: Phaser.Scene) {
  const { width, height } = scene.cameras.main;
  let currentLevel = 0;
  let slots: (string | null)[] = [null, null, null];
  let selectedComponent: string | null = null;
  let hasCheckedCurrent = false;

  const uiElements: Phaser.GameObjects.GameObject[] = [];
  const slotZones: Phaser.GameObjects.Zone[] = [];
  const slotGraphics: Phaser.GameObjects.Graphics[] = [];
  const slotLabels: Phaser.GameObjects.Text[] = [];
  const trayButtons: { zone: Phaser.GameObjects.Zone; graphic: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text }[] = [];

  function destroyAll() {
    for (const el of trayButtons.flatMap(t => [t.zone, t.graphic, t.label])) el.destroy();
    for (const g of slotGraphics) g.destroy();
    for (const l of slotLabels) l.destroy();
    for (const z of slotZones) z.destroy();
    for (const el of uiElements) el.destroy();
    trayButtons.length = 0;
    slotGraphics.length = 0;
    slotLabels.length = 0;
    slotZones.length = 0;
  }

  function drawRaySegment(g: Phaser.GameObjects.Graphics, rays: Ray[], x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1;
    for (const ray of rays) {
      const offsetY = Math.tan(ray.angle * Math.PI / 180) * dx * BEAM_SCALE;
      const endY = y2 + offsetY;

      g.lineStyle(6, ray.color, 0.15);
      g.lineBetween(x1, y1, x2, endY);
      g.lineStyle(2, ray.color, 0.85);
      g.lineBetween(x1, y1, x2, endY);

      const midX = (x1 + x2) / 2;
      const midY = (y1 + endY) / 2;
      g.fillStyle(ray.color, 0.7);
      g.fillCircle(midX, midY, 2);
    }
  }

  function drawBeam(): { raysAtTarget: Ray[]; allRays: Ray[][] } {
    const old = uiElements.find(e => (e as any).__isBeam) as Phaser.GameObjects.Graphics | undefined;
    if (old) old.destroy();

    const beamGraphics = scene.add.graphics().setDepth(70);
    (beamGraphics as any).__isBeam = true;
    uiElements.push(beamGraphics);

    const startX = 140;
    const midY = height / 2;
    const slotGap = 110;
    const slotCX = width / 2;
    const slotPos = [slotCX - slotGap, slotCX, slotCX + slotGap];
    const targetX = width - 100;

    const allRays: Ray[][] = [];
    let currentRays: Ray[] = [{ angle: 0, color: 0xffffff }];
    allRays.push([...currentRays]);

    // Source → slot 1
    drawRaySegment(beamGraphics, currentRays, startX, midY, slotPos[0] - 20, midY);

    for (let i = 0; i < 3; i++) {
      currentRays = processBeam(currentRays, slots[i]);
      allRays.push([...currentRays]);

      const nextX = i < 2 ? slotPos[i + 1] - 20 : targetX;
      drawRaySegment(beamGraphics, currentRays, slotPos[i] + 20, midY, nextX, midY);
    }

    return { raysAtTarget: currentRays, allRays };
  }

  function checkLevelComplete(raysAtTarget: Ray[], allRays: Ray[][]) {
    if (slots.every(s => s === null)) return;
    if (hasCheckedCurrent) return;

    const level = LEVELS[currentLevel];
    if (level.check(raysAtTarget, allRays)) {
      hasCheckedCurrent = true;
      if (level.reward) {
        gameStore.addToInventory(level.reward, level.rewardQty || 1);
      }
      scene.sound.play('sfx_coin', { volume: 0.5 });
      scene.cameras.main.flash(300, 46, 204, 113);

      if (currentLevel < LEVELS.length - 1) {
        succeedLevel();
      } else {
        allComplete();
      }
    } else {
      scene.cameras.main.shake(200, 0.008);
      const fb = scene.add.text(width / 2, height / 2 + 100, '✗ Not quite — try a different arrangement!', {
        fontFamily: '"Inter"', fontSize: '12px', color: '#ff7675',
      }).setOrigin(0.5).setDepth(80);
      uiElements.push(fb);
      scene.time.delayedCall(1800, () => { fb.destroy(); const i = uiElements.indexOf(fb); if (i !== -1) uiElements.splice(i, 1); });
    }
  }

  function succeedLevel() {
    const msg = scene.add.text(width / 2, height / 2, '✓ Level Complete!', {
      fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#2ecc71',
    }).setOrigin(0.5).setDepth(80);
    uiElements.push(msg);

    scene.time.delayedCall(1500, () => {
      msg.destroy();
      const idx = uiElements.indexOf(msg);
      if (idx !== -1) uiElements.splice(idx, 1);
      currentLevel++;
      slots = [null, null, null];
      selectedComponent = null;
      hasCheckedCurrent = false;
      renderLevel();
    });
  }

  function allComplete() {
    destroyAll();
    const bg = scene.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0).setDepth(50);
    const msg = scene.add.text(width / 2, height / 2, 'All Light Puzzles Solved!\nRainbow bridge restored!', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#f1c40f', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5).setDepth(51);
    const close = scene.add.text(width / 2, height / 2 + 60, '[ CLOSE ]', {
      fontFamily: '"Inter"', fontSize: '14px', color: '#00cec9', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => { bg.destroy(); msg.destroy(); close.destroy(); });
  }

  function renderTray() {
    for (const tb of trayButtons) {
      tb.zone.destroy(); tb.graphic.destroy(); tb.label.destroy();
    }
    trayButtons.length = 0;

    const trayY = height - 60;
    const trayStartX = width / 2 - (COMPONENTS.length * 60) / 2;

    for (let i = 0; i < COMPONENTS.length; i++) {
      const cx = trayStartX + i * 60 + 30;
      const comp = COMPONENTS[i];

      const g = scene.add.graphics().setDepth(76);
      g.fillStyle(selectedComponent === comp.id ? 0x6c5ce7 : 0x3d2b1f, 0.85);
      g.fillRoundedRect(cx - 24, trayY - 20, 48, 40, 6);
      g.lineStyle(1, 0x8b6914, 0.5);
      g.strokeRoundedRect(cx - 24, trayY - 20, 48, 40, 6);
      uiElements.push(g);

      const sym = scene.add.text(cx, trayY - 4, comp.symbol, {
        fontFamily: '"Inter"', fontSize: '16px',
      }).setOrigin(0.5).setDepth(77);
      uiElements.push(sym);

      const nm = scene.add.text(cx, trayY + 14, comp.name, {
        fontFamily: '"Inter"', fontSize: '8px', color: '#bcc6db',
      }).setOrigin(0.5).setDepth(77);
      uiElements.push(nm);

      const z = scene.add.zone(cx, trayY, 48, 40).setInteractive({ useHandCursor: true }).setDepth(78);
      z.on('pointerdown', () => {
        selectedComponent = selectedComponent === comp.id ? null : comp.id;
        renderTray();
      });
      uiElements.push(z);
      trayButtons.push({ zone: z, graphic: g, label: sym });
    }
  }

  function renderSlots() {
    for (const g of slotGraphics) g.destroy();
    for (const l of slotLabels) l.destroy();
    for (const z of slotZones) z.destroy();
    slotGraphics.length = 0;
    slotLabels.length = 0;
    slotZones.length = 0;

    const slotCX = width / 2;
    const slotGap = 110;
    const slotY = height / 2;
    const positions = [slotCX - slotGap, slotCX, slotCX + slotGap];

    for (let i = 0; i < 3; i++) {
      const sx = positions[i];
      const sg = scene.add.graphics().setDepth(72);
      sg.fillStyle(slots[i] ? 0x2a1e17 : 0x1a1a3e, 0.85);
      sg.fillRoundedRect(sx - 24, slotY - 24, 48, 48, 8);
      sg.lineStyle(2, slots[i] ? 0x6c5ce7 : 0x3a3a5a, 0.6);
      sg.strokeRoundedRect(sx - 24, slotY - 24, 48, 48, 8);
      uiElements.push(sg);
      slotGraphics.push(sg);

      const slotVal = slots[i];
      if (slotVal) {
        const comp = COMPONENTS.find(c => c.id === slotVal);
        const label = scene.add.text(sx, slotY, comp ? comp.symbol : '?', {
          fontFamily: '"Inter"', fontSize: '20px',
        }).setOrigin(0.5).setDepth(73);
        uiElements.push(label);
        slotLabels.push(label);
      } else {
        const label = scene.add.text(sx, slotY, `${i + 1}`, {
          fontFamily: '"Inter"', fontSize: '14px', color: '#636e72',
        }).setOrigin(0.5).setDepth(73);
        uiElements.push(label);
        slotLabels.push(label);
      }

      const z = scene.add.zone(sx, slotY, 48, 48).setInteractive({ useHandCursor: true }).setDepth(74);
      z.on('pointerdown', () => {
        slots[i] = slots[i] !== null ? null : (selectedComponent || slots[i]);
        selectedComponent = null;
        renderSlots();
        renderTray();
        drawBeam();
      });
      uiElements.push(z);
      slotZones.push(z);
    }
  }

  function renderLevel() {
    const level = LEVELS[currentLevel];

    const title = scene.add.text(width / 2, 40, `Level ${level.id}: ${level.name}`, {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#f1c40f',
    }).setOrigin(0.5).setDepth(60);
    uiElements.push(title);

    const hint = scene.add.text(width / 2, 70, level.hint, {
      fontFamily: '"Inter"', fontSize: '12px', color: '#bcc6db',
    }).setOrigin(0.5).setDepth(60);
    uiElements.push(hint);

    const lightSrc = scene.add.text(140, height / 2, '💡', {
      fontSize: '28px',
    }).setOrigin(0.5).setDepth(71);
    uiElements.push(lightSrc);

    const target = scene.add.text(width - 100, height / 2, '🎯', {
      fontSize: '28px',
    }).setOrigin(0.5).setDepth(71);
    uiElements.push(target);

    const closeBtn = scene.add.text(width - 30, 20, '✕', {
      fontFamily: '"Inter"', fontSize: '20px', color: '#ff7675',
    }).setOrigin(0.5).setDepth(80).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => { destroyAll(); });
    uiElements.push(closeBtn);

    const testBtn = scene.add.text(width / 2, 100, '[  TEST BEAM  ]', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#00cec9', fontStyle: 'bold',
      backgroundColor: '#1a1a3e', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setDepth(65).setInteractive({ useHandCursor: true });
    testBtn.on('pointerdown', () => {
      const result = drawBeam();
      checkLevelComplete(result.raysAtTarget, result.allRays);
    });
    uiElements.push(testBtn);

    const resetBtn = scene.add.text(width / 2 + 140, 100, '[ RESET ]', {
      fontFamily: '"Inter"', fontSize: '12px', color: '#ff7675', fontStyle: 'bold',
      backgroundColor: '#1a1a3e', padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setDepth(65).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      slots = [null, null, null];
      selectedComponent = null;
      renderSlots();
      renderTray();
      const oldBeam = uiElements.find(e => (e as any).__isBeam);
      if (oldBeam) { oldBeam.destroy(); const i = uiElements.indexOf(oldBeam); if (i !== -1) uiElements.splice(i, 1); }
    });
    uiElements.push(resetBtn);

    renderSlots();
    renderTray();
    drawBeam();
  }

  const overlay = scene.add.rectangle(0, 0, width, height, 0x000, 0.85).setOrigin(0).setDepth(50);
  uiElements.push(overlay);

  renderLevel();
}
