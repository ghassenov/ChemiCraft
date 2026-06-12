import Phaser from 'phaser';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';

interface Lesson {
  id: string;
  title: string;
  desc: string;
  reward: number;
}

export class LibraryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LibraryScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const { width, height } = this.cameras.main;

    this.drawBackground(width, height);
    this.drawBookshelves(width, height);
    this.drawProfessor(width, height);
    this.drawDecor(width, height);

    this.add.text(width / 2, 30, 'LIBRARY OF ELEMENTS', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#d4a855',
    }).setOrigin(0.5);

    const lessons: Lesson[] = [
      { id: 'atoms', title: 'What is an Atom?', desc: 'Learn the basics of matter.', reward: 10 },
      { id: 'molecules', title: 'Building Molecules', desc: 'How atoms join together.', reward: 15 },
      { id: 'covalent', title: 'Covalent Bonds', desc: 'Sharing electrons.', reward: 20 },
      { id: 'reactions', title: 'Chemical Reactions', desc: 'Transforming matter.', reward: 25 },
    ];

    let y = 130;
    for (const lesson of lessons) {
      const row = this.add.container(350, y);

      const bg = this.add.graphics();
      bg.fillStyle(0x2a1e17, 0.85);
      bg.fillRoundedRect(-180, -25, 380, 50, 6);
      bg.lineStyle(1, 0x8b6914, 0.4);
      bg.strokeRoundedRect(-180, -25, 380, 50, 6);

      bg.fillStyle(0x8b6914, 0.15);
      bg.fillCircle(-155, 0, 16);

      const icon = this.add.text(-155, 0, '\u{1F4D6}', { fontSize: '16px' }).setOrigin(0.5);
      const title = this.add.text(-125, -8, lesson.title, {
        fontFamily: '"Inter"', fontSize: '15px', color: '#f1c40f', fontStyle: 'bold',
      });
      const desc = this.add.text(-125, 10, lesson.desc, {
        fontFamily: '"Inter"', fontSize: '12px', color: '#8a7a6a',
      });

      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x3498db, 0.85);
      btnBg.fillRoundedRect(120, -14, 80, 28, 6);
      btnBg.lineStyle(1, 0x5ab8fb, 0.5);
      btnBg.strokeRoundedRect(120, -14, 80, 28, 6);

      const btnTxt = this.add.text(160, 0, 'LEARN', {
        fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5);

      const hitZone = this.add.zone(160, 0, 80, 28).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => this.startLesson(lesson));
      hitZone.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x5ab8fb, 0.9);
        btnBg.fillRoundedRect(120, -14, 80, 28, 6);
        btnBg.lineStyle(1, 0x7ad8ff, 0.6);
        btnBg.strokeRoundedRect(120, -14, 80, 28, 6);
      });
      hitZone.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3498db, 0.85);
        btnBg.fillRoundedRect(120, -14, 80, 28, 6);
        btnBg.lineStyle(1, 0x5ab8fb, 0.5);
        btnBg.strokeRoundedRect(120, -14, 80, 28, 6);
      });

      row.add([bg, icon, title, desc, btnBg, btnTxt, hitZone]);
      y += 65;
    }

    const exitBg = this.add.rectangle(50, 30, 80, 26, 0x1e1510, 0.8)
      .setStrokeStyle(1, 0x8b6914, 0.4).setInteractive({ useHandCursor: true });
    const exitTxt = this.add.text(50, 30, 'EXIT', {
      fontFamily: '"Inter"', fontSize: '11px', color: '#dfe6e9', fontStyle: 'bold',
    }).setOrigin(0.5);
    exitBg.on('pointerdown', () => SceneTransition.fadeOutIn(this, 'GameScene'));
    exitTxt.on('pointerdown', () => SceneTransition.fadeOutIn(this, 'GameScene'));

    this.startDustMotes(width, height);
  }

  private drawBackground(w: number, h: number) {
    const g = this.add.graphics();

    g.fillStyle(0x1e1510, 1);
    g.fillRect(0, 0, w, h);

    g.fillStyle(0x2a1e17, 1);
    g.fillRect(0, 0, w, h - 80);

    g.fillStyle(0x3a2a1f, 0.3);
    for (let row = 0; row < 30; row++) {
      g.fillRect(0, row * 22, w, 1);
    }

    g.fillStyle(0x8B7355, 0.4);
    g.fillRect(0, h - 80, w, 80);

    g.fillStyle(0x6a5335, 0.2);
    g.fillRect(0, h - 80, w, 2);

    g.fillStyle(0x9B8365, 0.2);
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * w;
      const ry = h - 80 + Math.random() * 70;
      g.fillRect(rx, ry, 2 + Math.random() * 4, 2 + Math.random() * 3);
    }

    g.fillStyle(0x3a2010, 0.5);
    g.fillRect(0, 70, w, 2);

    g.fillStyle(0xd4a855, 0.04);
    g.fillCircle(650, 120, 100);
  }

  private drawBookshelves(w: number, h: number) {
    const g = this.add.graphics();
    const shelves = [
      { x: 5, y: 90, w: 100, h: h - 190 },
    ];

    for (const s of shelves) {
      g.fillStyle(0x3d2515, 0.85);
      g.fillRect(s.x, s.y, s.w, s.h);
      g.lineStyle(2, 0x5c3a1e, 0.5);
      g.strokeRect(s.x, s.y, s.w, s.h);

      for (let i = 0; i < 5; i++) {
        g.fillStyle(0x4a3020, 0.6);
        g.fillRect(s.x + 2, s.y + 10 + i * 45, s.w - 4, 4);
      }

      const bookColors = [
        0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xd4a017,
        0x2c3e50, 0x7f8c8d, 0x16a085, 0xe67e22, 0x3498db,
        0x1abc9c, 0x9b59b6, 0xe74c3c, 0x2ecc71, 0xf1c40f,
      ];

      for (let row = 0; row < 4; row++) {
        const ry = s.y + 16 + row * 45;
        let bx = s.x + 4;
        while (bx < s.x + s.w - 8) {
          const bw = 6 + Math.floor(Math.random() * 8);
          const bh = 24 + Math.floor(Math.random() * 6);
          const bc = bookColors[Math.floor(Math.random() * bookColors.length)];

          g.fillStyle(bc, 0.7);
          g.fillRect(bx, ry + (30 - bh), bw, bh);

          g.fillStyle(0xffffff, 0.08);
          g.fillRect(bx + 1, ry + (30 - bh) + 2, 2, bh - 6);

          if (Math.random() > 0.6) {
            g.fillStyle(0xffffff, 0.1);
            g.fillRect(bx, ry + (30 - bh), bw, 2);
          }

          bx += bw + 2;
        }
      }
    }
  }

  private drawProfessor(w: number, h: number) {
    const g = this.add.graphics();
    const px = 110;
    const py = h / 2 - 20;

    g.fillStyle(0x3d2b1f, 0.8);
    g.fillRoundedRect(px - 55, py - 55, 110, 120, 8);
    g.lineStyle(2, 0x8b6914, 0.4);
    g.strokeRoundedRect(px - 55, py - 55, 110, 120, 8);

    g.fillStyle(0xecf0f1, 0.9);
    g.fillRect(px - 18, py + 10, 36, 42);

    g.fillStyle(0x2d3436, 0.8);
    g.fillRect(px - 18, py + 10, 36, 1);

    g.fillStyle(0xffeaa7, 1);
    g.fillCircle(px, py - 5, 16);

    g.fillStyle(0xecf0f1, 0.9);
    g.fillCircle(px - 6, py - 7, 4);
    g.fillCircle(px + 6, py - 7, 4);
    g.fillCircle(px, py - 11, 5);

    g.fillStyle(0x2d3436, 0.7);
    g.fillCircle(px - 6, py - 7, 1.5);
    g.fillCircle(px + 6, py - 7, 1.5);

    g.lineStyle(1, 0x636e72, 0.5);
    g.strokeCircle(px - 6, py - 7, 5);
    g.strokeCircle(px + 6, py - 7, 5);

    g.fillStyle(0xffffff, 0.2);
    g.fillCircle(px - 5, py - 8, 1);
    g.fillCircle(px + 7, py - 8, 1);

    g.fillStyle(0x2d3436, 0.6);
    g.fillRect(px - 12, py - 20, 24, 4);
    g.fillRect(px - 8, py - 24, 16, 6);

    g.fillStyle(0x636e72, 0.5);
    g.fillRect(px - 15, py + 16, 6, 14);
    g.fillRect(px + 9, py + 16, 6, 14);

    g.fillStyle(0x2d3436, 1);
    g.fillRect(px - 8, py + 50, 6, 10);
    g.fillRect(px + 2, py + 50, 6, 10);

    g.fillStyle(0x8b6914, 0.5);
    g.fillRect(px - 25, py + 18, 16, 24);

    const bookC = [0xc0392b, 0x2980b9, 0x27ae60];
    for (let i = 0; i < 3; i++) {
      g.fillStyle(bookC[i], 0.6);
      g.fillRect(px + 25, py + 18 + i * 10, 12, 9);
    }

    g.fillStyle(0x2d3436, 0.3);
    g.fillRect(px - 30, py - 40, 60, 2);
  }

  private drawDecor(w: number, h: number) {
    const d = this.add.graphics();

    d.fillStyle(0xd4a855, 0.06);
    d.fillRoundedRect(600, 85, 160, h - 180, 8);

    d.lineStyle(2, 0xd4a855, 0.15);
    d.strokeRoundedRect(600, 85, 160, h - 180, 8);

    d.fillStyle(0xd4a855, 0.04);
    for (let i = 0; i < 3; i++) {
      d.fillCircle(620 + i * 50, 120, 18);
    }

    d.fillStyle(0xd4a855, 0.06);
    d.fillCircle(680, 140, 35);

    d.fillStyle(0xd4a855, 0.03);
    d.fillTriangle(650, 100, 620, 160, 680, 160);
  }

  private startDustMotes(w: number, h: number) {
    if (!this.textures.exists('dust_particle')) {
      const g = this.add.graphics();
      g.fillStyle(0xd4a855, 0.4);
      g.fillCircle(2, 2, 2);
      g.generateTexture('dust_particle', 4, 4);
      g.destroy();
    }

    for (let i = 0; i < 12; i++) {
      const dx = 600 + Math.random() * 160;
      const dy = 100 + Math.random() * (h - 200);
      const particle = this.add.image(dx, dy, 'dust_particle')
        .setAlpha(0.1 + Math.random() * 0.3)
        .setScale(0.5 + Math.random() * 1.5);

      this.tweens.add({
        targets: particle,
        y: particle.y - 30 - Math.random() * 40,
        x: particle.x + (Math.random() - 0.5) * 20,
        alpha: 0,
        duration: 3000 + Math.random() * 4000,
        delay: Math.random() * 5000,
        repeat: -1,
        onRepeat: () => {
          particle.setPosition(600 + Math.random() * 160, 100 + Math.random() * (h - 200));
          particle.setAlpha(0.1 + Math.random() * 0.3);
        },
      });
    }
  }

  private startLesson(lesson: Lesson) {
    const { width, height } = this.cameras.main;

    const overlay = this.add.rectangle(0, 0, width, height, 0x000, 0.85).setOrigin(0);

    const panelG = this.add.graphics();
    panelG.fillStyle(0x1a1510, 0.95);
    panelG.fillRoundedRect(width / 2 - 230, height / 2 - 180, 460, 360, 12);
    panelG.lineStyle(2, 0x8b6914, 0.5);
    panelG.strokeRoundedRect(width / 2 - 230, height / 2 - 180, 460, 360, 12);

    panelG.fillStyle(0xd4a855, 0.04);
    panelG.fillCircle(width / 2, height / 2 - 100, 40);

    const title = this.add.text(width / 2, height / 2 - 150, lesson.title, {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#d4a855',
    }).setOrigin(0.5);

    const iconG = this.add.graphics();
    iconG.fillStyle(0x8b6914, 0.15);
    iconG.fillCircle(width / 2, height / 2 - 100, 24);
    const icon = this.add.text(width / 2, height / 2 - 100, '\u{1F4D6}', {
      fontSize: '24px',
    }).setOrigin(0.5);

    let content = '';
    if (lesson.id === 'atoms') {
      content = 'Atoms are the basic building blocks of all matter. They consist of a nucleus containing protons and neutrons, surrounded by electrons. Different types of atoms are called elements (like Hydrogen, Oxygen, Carbon).';
    } else if (lesson.id === 'molecules') {
      content = 'A molecule is a group of two or more atoms held together by chemical bonds. For example, O\u2082 is a molecule made of two oxygen atoms.';
    } else if (lesson.id === 'covalent') {
      content = 'Covalent bonds form when atoms share electrons to become stable. This is how non-metals typically bond together, like the Hydrogen and Oxygen in Water (H\u2082O).';
    } else if (lesson.id === 'reactions') {
      content = 'Chemical reactions involve breaking and making bonds to form new substances. The atoms you start with (reactants) are simply rearranged to form new molecules (products).';
    }

    const text = this.add.text(width / 2, height / 2 - 30, content, {
      fontFamily: '"Inter"', fontSize: '14px', color: '#c8b89a',
      wordWrap: { width: 380 }, lineSpacing: 6,
    }).setOrigin(0.5);

    const qTxt = this.add.text(width / 2, height / 2 + 70, 'Did you understand?', {
      fontFamily: '"Inter"', fontSize: '14px', color: '#f1c40f', fontStyle: 'bold',
    }).setOrigin(0.5);

    const finishG = this.add.graphics();
    finishG.fillStyle(0x27ae60, 0.85);
    finishG.fillRoundedRect(width / 2 - 80, height / 2 + 100, 160, 38, 8);
    finishG.lineStyle(1, 0x4ace80, 0.5);
    finishG.strokeRoundedRect(width / 2 - 80, height / 2 + 100, 160, 38, 8);

    const finishT = this.add.text(width / 2, height / 2 + 119, 'FINISH', {
      fontFamily: '"Inter"', fontSize: '13px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const finishZone = this.add.zone(width / 2, height / 2 + 119, 160, 38)
      .setInteractive({ useHandCursor: true });

    finishZone.on('pointerdown', () => {
      gameStore.addCoins(lesson.reward);
      [overlay, panelG, title, iconG, icon, text, qTxt, finishG, finishT, finishZone]
        .forEach(o => o.destroy());
    });
  }
}
