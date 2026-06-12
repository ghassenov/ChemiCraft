import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';

interface Lesson {
  id: string;
  title: string;
  desc: string;
  reward: number;
}

const lessons: Lesson[] = [
  { id: 'atoms', title: 'What is an Atom?', desc: 'Learn the basics of matter.', reward: 10 },
  { id: 'molecules', title: 'Building Molecules', desc: 'How atoms join together.', reward: 15 },
  { id: 'covalent', title: 'Covalent Bonds', desc: 'Sharing electrons.', reward: 20 },
  { id: 'reactions', title: 'Chemical Reactions', desc: 'Transforming matter.', reward: 25 },
];

const quizzes: Record<string, { q: string; opts: string[]; ans: number }> = {
  atoms: { q: 'What is an atom?', opts: ['A type of bond', 'A basic building block of matter', 'A chemical reaction'], ans: 1 },
  molecules: { q: 'What is a molecule?', opts: ['A group of atoms bonded together', 'A single electron', 'A type of gas'], ans: 0 },
  covalent: { q: 'What happens in a covalent bond?', opts: ['Atoms explode', 'Atoms steal protons', 'Atoms share electrons'], ans: 2 },
  reactions: { q: 'What is the starting material in a reaction called?', opts: ['Reactant', 'Product', 'Catalyst'], ans: 0 }
};

export function openLessonSelector(scene: Phaser.Scene) {
  const { width, height } = scene.cameras.main;
  const overlay = scene.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0).setDepth(50);

  const panel = scene.add.graphics().setDepth(51);
  panel.fillStyle(0x1a1510, 0.95);
  panel.fillRoundedRect(width / 2 - 200, height / 2 - 160, 400, 320, 12);
  panel.lineStyle(2, 0x8b6914, 0.5);
  panel.strokeRoundedRect(width / 2 - 200, height / 2 - 160, 400, 320, 12);

  const title = scene.add.text(width / 2, height / 2 - 140, 'SELECT A LESSON', {
    fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#d4a855',
  }).setOrigin(0.5).setDepth(52);

  const closeIcn = scene.add.text(width / 2 + 180, height / 2 - 150, '✕', {
    fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675',
  }).setOrigin(0.5).setDepth(55).setInteractive({ useHandCursor: true });

  const items: Phaser.GameObjects.GameObject[] = [overlay, panel, title, closeIcn];
  closeIcn.on('pointerdown', () => items.forEach(i => i.destroy()));

  let y = height / 2 - 100;
  for (const lesson of lessons) {
    const bg = scene.add.graphics().setDepth(52);
    bg.fillStyle(0x2a1e17, 0.85);
    bg.fillRoundedRect(width / 2 - 170, y, 340, 46, 6);
    bg.lineStyle(1, 0x8b6914, 0.3);
    bg.strokeRoundedRect(width / 2 - 170, y, 340, 46, 6);

    const lt = scene.add.text(width / 2 - 150, y + 6, lesson.title, {
      fontFamily: '"Inter"', fontSize: '14px', color: '#f1c40f', fontStyle: 'bold',
    }).setDepth(53);

    const ld = scene.add.text(width / 2 - 150, y + 26, lesson.desc, {
      fontFamily: '"Inter"', fontSize: '11px', color: '#8a7a6a',
    }).setDepth(53);

    const btnG = scene.add.graphics().setDepth(52);
    btnG.fillStyle(0x3498db, 0.85);
    btnG.fillRoundedRect(width / 2 + 70, y + 6, 80, 26, 6);
    const btnT = scene.add.text(width / 2 + 110, y + 19, 'OPEN', {
      fontFamily: '"Inter"', fontSize: '11px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(53);

    const zone = scene.add.zone(width / 2 + 110, y + 19, 80, 26)
      .setInteractive({ useHandCursor: true }).setDepth(54);
    zone.on('pointerdown', () => {
      items.forEach(i => i.destroy());
      openLessonContent(scene, lesson);
    });

    items.push(bg, lt, ld, btnG, btnT, zone);
    y += 54;
  }

  const closeBtn = scene.add.text(width / 2, height / 2 + 145, 'Close', {
    fontFamily: '"Inter"', fontSize: '12px', color: '#636e72',
  }).setOrigin(0.5).setDepth(53).setInteractive({ useHandCursor: true });
  closeBtn.on('pointerdown', () => items.forEach(i => i.destroy()));
  items.push(closeBtn);
}

function openLessonContent(scene: Phaser.Scene, lesson: Lesson) {
  const { width, height } = scene.cameras.main;

  let content = '';
  if (lesson.id === 'atoms') content = 'Atoms are the basic building blocks of all matter. They consist of a nucleus containing protons and neutrons, surrounded by electrons. Different types of atoms are called elements (like Hydrogen, Oxygen, Carbon).';
  else if (lesson.id === 'molecules') content = 'A molecule is a group of two or more atoms held together by chemical bonds. For example, O\u2082 is a molecule made of two oxygen atoms.';
  else if (lesson.id === 'covalent') content = 'Covalent bonds form when atoms share electrons to become stable. This is how non-metals typically bond together, like the Hydrogen and Oxygen in Water (H\u2082O).';
  else if (lesson.id === 'reactions') content = 'Chemical reactions involve breaking and making bonds to form new substances. The atoms you start with (reactants) are simply rearranged to form new molecules (products).';

  const overlay = scene.add.rectangle(0, 0, width, height, 0x000, 0.85).setOrigin(0).setDepth(60);

  const panel = scene.add.graphics().setDepth(61);
  panel.fillStyle(0x1a1510, 0.95);
  panel.fillRoundedRect(width / 2 - 240, height / 2 - 180, 480, 360, 12);
  panel.lineStyle(2, 0x3498db, 0.5);
  panel.strokeRoundedRect(width / 2 - 240, height / 2 - 180, 480, 360, 12);

  const closeIcn = scene.add.text(width / 2 + 220, height / 2 - 170, '✕', {
    fontFamily: '"Inter"', fontSize: '16px', color: '#ff7675',
  }).setOrigin(0.5).setDepth(65).setInteractive({ useHandCursor: true });

  const title = scene.add.text(width / 2, height / 2 - 155, lesson.title, {
    fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#3498db',
  }).setOrigin(0.5).setDepth(62);

  const text = scene.add.text(width / 2, height / 2 - 60, content, {
    fontFamily: '"Inter"', fontSize: '14px', color: '#c8b89a',
    wordWrap: { width: 400 }, lineSpacing: 6,
  }).setOrigin(0.5).setDepth(62);

  const qData = quizzes[lesson.id];
  const qTxt = scene.add.text(width / 2, height / 2 + 10, qData.q, {
    fontFamily: '"Inter"', fontSize: '12px', color: '#f1c40f', fontStyle: 'bold', align: 'center'
  }).setOrigin(0.5).setDepth(62);

  const uiElements: Phaser.GameObjects.GameObject[] = [overlay, panel, closeIcn, title, text, qTxt];

  let qy = height / 2 + 40;
  qData.opts.forEach((opt, idx) => {
    const btnG = scene.add.graphics().setDepth(62);
    btnG.fillStyle(0x3d2b1f, 0.85);
    btnG.fillRoundedRect(width / 2 - 120, qy, 240, 30, 6);
    btnG.lineStyle(1, 0x8b6914, 0.5);
    btnG.strokeRoundedRect(width / 2 - 120, qy, 240, 30, 6);

    const btnT = scene.add.text(width / 2, qy + 15, opt, {
      fontFamily: '"Inter"', fontSize: '11px', color: '#fff',
    }).setOrigin(0.5).setDepth(63);

    const zone = scene.add.zone(width / 2, qy + 15, 240, 30).setInteractive({ useHandCursor: true }).setDepth(64);

    zone.on('pointerdown', () => {
      if (idx === qData.ans) {
        // Correct
        scene.cameras.main.flash(200, 46, 204, 113);
        scene.sound.play('sfx_coin', { volume: 0.5 });
        gameStore.addCoins(lesson.reward);
        gameStore.addSkillPoints('equation_balancing', 1);
        qTxt.setText(`CORRECT! +${lesson.reward} Coins & +1 Eq. Balancing`);
        qTxt.setColor('#2ecc71');
      } else {
        // Incorrect
        scene.cameras.main.shake(200, 0.01);
        qTxt.setText('INCORRECT. Try again later.');
        qTxt.setColor('#e74c3c');
      }
      
      scene.time.delayedCall(1500, () => {
        uiElements.forEach(o => o.destroy());
      });
    });

    uiElements.push(btnG, btnT, zone);
    qy += 40;
  });

  closeIcn.on('pointerdown', () => {
    uiElements.forEach(o => o.destroy());
  });
}
