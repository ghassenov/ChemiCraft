import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';

interface Lesson {
  id: string;
  title: string;
  desc: string;
  reward: number;
}

interface Question {
  q: string;
  opts: string[];
  ans: number;
}

const lessons: Lesson[] = [
  { id: 'atoms', title: 'What is an Atom?', desc: 'Learn the basics of matter.', reward: 10 },
  { id: 'molecules', title: 'Building Molecules', desc: 'How atoms join together.', reward: 15 },
  { id: 'covalent', title: 'Covalent Bonds', desc: 'Sharing electrons.', reward: 20 },
  { id: 'reactions', title: 'Chemical Reactions', desc: 'Transforming matter.', reward: 25 },
  { id: 'states', title: 'States of Matter', desc: 'Solid, liquid, gas, and plasma.', reward: 15 },
  { id: 'periodic', title: 'Periodic Table', desc: 'Organizing the elements.', reward: 20 },
];

const quizzes: Record<string, Question[]> = {
  atoms: [
    { q: 'What is an atom?', opts: ['A type of bond', 'A basic building block of matter', 'A chemical reaction'], ans: 1 },
    { q: 'What particle orbits the nucleus?', opts: ['Proton', 'Neutron', 'Electron'], ans: 2 },
    { q: 'What charge do protons have?', opts: ['Negative', 'Neutral', 'Positive'], ans: 2 },
    { q: 'What is the atomic number of an element?', opts: ['Number of neutrons', 'Number of protons', 'Number of electrons in outer shell'], ans: 1 },
    { q: 'Which subatomic particle has no charge?', opts: ['Proton', 'Neutron', 'Electron'], ans: 1 },
  ],
  molecules: [
    { q: 'What is a molecule?', opts: ['A group of atoms bonded together', 'A single electron', 'A type of gas'], ans: 0 },
    { q: 'What is the chemical formula for water?', opts: ['HO₂', 'H₂O', 'H₂O₂'], ans: 1 },
    { q: 'How many atoms are in a water molecule?', opts: ['2', '3', '4'], ans: 1 },
    { q: 'What does the subscript number in CO₂ mean?', opts: ['Number of molecules', 'Number of atoms of that element', 'Charge of the atom'], ans: 1 },
    { q: 'Which of these is a diatomic molecule?', opts: ['CO₂', 'O₂', 'H₂O'], ans: 1 },
  ],
  covalent: [
    { q: 'What happens in a covalent bond?', opts: ['Atoms explode', 'Atoms steal protons', 'Atoms share electrons'], ans: 2 },
    { q: 'How many covalent bonds does N₂ have?', opts: ['1 (single)', '2 (double)', '3 (triple)'], ans: 2 },
    { q: 'Which bond is the strongest?', opts: ['Single bond', 'Double bond', 'Triple bond'], ans: 2 },
    { q: 'What type of bond joins hydrogen and oxygen in water?', opts: ['Ionic bond', 'Covalent bond', 'Metallic bond'], ans: 1 },
    { q: 'Electrons in a covalent bond are...', opts: ['Transferred between atoms', 'Shared between atoms', 'Destroyed in the reaction'], ans: 1 },
  ],
  reactions: [
    { q: 'What is the starting material in a reaction called?', opts: ['Reactant', 'Product', 'Catalyst'], ans: 0 },
    { q: 'What is a catalyst?', opts: ['A reaction product', 'A substance that speeds up a reaction', 'A type of molecule'], ans: 1 },
    { q: 'In a chemical reaction, atoms are...', opts: ['Created from energy', 'Destroyed into energy', 'Rearranged into new molecules'], ans: 2 },
    { q: 'What happens in an exothermic reaction?', opts: ['Heat is absorbed', 'Heat is released', 'No heat change'], ans: 1 },
    { q: 'What does it mean to balance a chemical equation?', opts: ['Equal reactants and products mass', 'Same number of each atom on both sides', 'Equal temperature on both sides'], ans: 1 },
  ],
  states: [
    { q: 'Which state of matter has a fixed shape and volume?', opts: ['Solid', 'Liquid', 'Gas'], ans: 0 },
    { q: 'What happens to molecules when a solid melts?', opts: ['They stop moving', 'They vibrate faster and break free', 'They disappear'], ans: 1 },
    { q: 'Which state of matter has the most energy?', opts: ['Solid', 'Liquid', 'Gas'], ans: 2 },
    { q: 'What is condensation?', opts: ['Solid to gas', 'Gas to liquid', 'Liquid to solid'], ans: 1 },
    { q: 'What is the fourth state of matter?', opts: ['Plasma', 'Crystal', 'Gel'], ans: 0 },
  ],
  periodic: [
    { q: 'Who created the periodic table?', opts: ['Einstein', 'Mendeleev', 'Newton'], ans: 1 },
    { q: 'Elements in the same column have the same number of...', opts: ['Neutrons', 'Valence electrons', 'Protons'], ans: 1 },
    { q: 'What are elements in the same row called?', opts: ['Group', 'Period', 'Block'], ans: 1 },
    { q: 'Where are metals on the periodic table?', opts: ['Right side', 'Left side', 'Diagonally across'], ans: 1 },
    { q: 'What is the lightest element?', opts: ['Helium', 'Hydrogen', 'Lithium'], ans: 1 },
  ],
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
      openLessonContent(scene, lesson, [...(quizzes[lesson.id] || [])]);
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

function openLessonContent(scene: Phaser.Scene, lesson: Lesson, remaining: Question[]) {
  const { width, height } = scene.cameras.main;

  let content = '';
  if (lesson.id === 'atoms') content = 'Atoms are the basic building blocks of all matter. They consist of a nucleus containing protons and neutrons, surrounded by electrons. Different types of atoms are called elements (like Hydrogen, Oxygen, Carbon).';
  else if (lesson.id === 'molecules') content = 'A molecule is a group of two or more atoms held together by chemical bonds. For example, O\u2082 is a molecule made of two oxygen atoms.';
  else if (lesson.id === 'covalent') content = 'Covalent bonds form when atoms share electrons to become stable. This is how non-metals typically bond together, like the Hydrogen and Oxygen in Water (H\u2082O).';
  else if (lesson.id === 'reactions') content = 'Chemical reactions involve breaking and making bonds to form new substances. The atoms you start with (reactants) are simply rearranged to form new molecules (products).';
  else if (lesson.id === 'states') content = 'Matter exists in four states: solid (fixed shape), liquid (flows), gas (expands to fill space), and plasma (ionized gas at extreme temperatures).';
  else if (lesson.id === 'periodic') content = 'The periodic table organizes all known elements by atomic number. Elements in the same column (group) have similar chemical properties because they have the same number of valence electrons.';

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

  const uiElements: Phaser.GameObjects.GameObject[] = [overlay, panel, closeIcn, title, text];

  function showNextQuestion() {
    if (remaining.length === 0) {
      const done = scene.add.text(width / 2, height / 2 + 10, 'All questions answered! +20 bonus coins!', {
        fontFamily: '"Inter"', fontSize: '13px', color: '#2ecc71', fontStyle: 'bold', align: 'center',
      }).setOrigin(0.5).setDepth(62);
      uiElements.push(done);
      gameStore.addCoins(20);
      scene.sound.play('sfx_coin', { volume: 0.5 });
      return;
    }

    const qData = remaining[0];
    const qTxt = scene.add.text(width / 2, height / 2 + 10, qData.q, {
      fontFamily: '"Inter"', fontSize: '12px', color: '#f1c40f', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5).setDepth(62);
    uiElements.push(qTxt);

    let qy = height / 2 + 40;
    for (const [idx, opt] of qData.opts.entries()) {
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
          scene.cameras.main.flash(200, 46, 204, 113);
          scene.sound.play('sfx_coin', { volume: 0.5 });
          gameStore.addCoins(lesson.reward);
          gameStore.addSkillPoints('equation_balancing', 1);

          remaining.shift();

          for (const el of [btnG, btnT, zone, qTxt]) {
            const i = uiElements.indexOf(el);
            if (i !== -1) uiElements.splice(i, 1);
            el.destroy();
          }

          showNextQuestion();
        } else {
          scene.cameras.main.shake(200, 0.01);
          qTxt.setText('Incorrect. Try again!');
          qTxt.setColor('#e74c3c');
        }
      });

      uiElements.push(btnG, btnT, zone);
      qy += 40;
    }
  }

  showNextQuestion();

  closeIcn.on('pointerdown', () => {
    uiElements.forEach(o => o.destroy());
  });
}
