import Phaser from 'phaser';
import { SceneTransition } from '../systems/SceneTransition';
import { gameStore } from '../../store/gameStore';

export class LibraryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LibraryScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1e1510).setOrigin(0); 
    
    // Title
    this.add.text(width / 2, 40, 'Library of Elements', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: '#8b6914'
    }).setOrigin(0.5);

    // Prof Portrait
    this.add.rectangle(150, 150, 100, 100, 0x131e2c).setStrokeStyle(2, 0x3498db);
    this.add.circle(150, 140, 30, 0x3498db); 
    this.add.text(150, 220, '"Select a lesson to begin."', { fontFamily: '"Inter"', fontSize: '14px', color: '#dfe6e9', fontStyle: 'italic' }).setOrigin(0.5);

    // Lessons menu
    const lessons = [
        { id: 'atoms', title: 'What is an Atom?', desc: 'Learn the basics of matter.', reward: 10 },
        { id: 'molecules', title: 'Building Molecules', desc: 'How atoms join together.', reward: 15 },
        { id: 'covalent', title: 'Covalent Bonds', desc: 'Sharing electrons.', reward: 20 },
        { id: 'reactions', title: 'Chemical Reactions', desc: 'Transforming matter.', reward: 25 },
    ];

    let y = 120;
    for (const lesson of lessons) {
        const row = this.add.container(350, y);
        
        const bg = this.add.rectangle(0, 0, 400, 60, 0x2a1e17, 0.8).setOrigin(0, 0.5).setStrokeStyle(1, 0x8b6914);
        const title = this.add.text(20, -10, lesson.title, { fontFamily: '"Inter"', fontSize: '16px', color: '#f1c40f', fontStyle: 'bold' });
        const desc = this.add.text(20, 10, lesson.desc, { fontFamily: '"Inter"', fontSize: '12px', color: '#636e72' });
        
        const btnBg = this.add.rectangle(330, 0, 100, 30, 0x3498db, 1).setInteractive({ useHandCursor: true });
        const btnTxt = this.add.text(330, 0, 'Learn', { fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        
        btnBg.on('pointerdown', () => this.startLesson(lesson));

        row.add([bg, title, desc, btnBg, btnTxt]);
        y += 70;
    }

    // Exit
    const exitBtn = this.add.text(40, 40, '← Exit', { fontFamily: '"Inter"', fontSize: '16px', color: '#dfe6e9' })
        .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => {
        SceneTransition.fadeOutIn(this, 'GameScene');
    });
  }

  private startLesson(lesson: any) {
    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(0, 0, width, height, 0x000, 0.8).setOrigin(0);
    const panel = this.add.rectangle(width/2, height/2, 500, 400, 0x131330).setStrokeStyle(2, 0x3498db);
    
    const title = this.add.text(width/2, height/2 - 160, lesson.title, { fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#3498db' }).setOrigin(0.5);
    
    let content = '';
    if (lesson.id === 'atoms') content = 'Atoms are the basic building blocks of all matter. They consist of a nucleus containing protons and neutrons, surrounded by electrons. Different types of atoms are called elements (like Hydrogen, Oxygen, Carbon).';
    else if (lesson.id === 'molecules') content = 'A molecule is a group of two or more atoms held together by chemical bonds. For example, O₂ is a molecule made of two oxygen atoms.';
    else if (lesson.id === 'covalent') content = 'Covalent bonds form when atoms share electrons to become stable. This is how non-metals typically bond together, like the Hydrogen and Oxygen in Water (H₂O).';
    else if (lesson.id === 'reactions') content = 'Chemical reactions involve breaking and making bonds to form new substances. The atoms you start with (reactants) are simply rearranged to form new molecules (products).';

    const text = this.add.text(width/2, height/2 - 50, content, { fontFamily: '"Inter"', fontSize: '14px', color: '#dfe6e9', wordWrap: { width: 400 }, lineSpacing: 8 }).setOrigin(0.5);
    
    // Quiz part
    const qTxt = this.add.text(width/2, height/2 + 50, 'Did you understand?', { fontFamily: '"Inter"', fontSize: '14px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
    
    const finishBtn = this.add.rectangle(width/2, height/2 + 120, 150, 40, 0x2ecc71, 1).setInteractive({ useHandCursor: true });
    const finishTxt = this.add.text(width/2, height/2 + 120, `Finish (+${lesson.reward} 🪙)`, { fontFamily: '"Inter"', fontSize: '12px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    
    finishBtn.on('pointerdown', () => {
        gameStore.addCoins(lesson.reward);
        [overlay, panel, title, text, qTxt, finishBtn, finishTxt].forEach(o => o.destroy());
    });
  }
}
