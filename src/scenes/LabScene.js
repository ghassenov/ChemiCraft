import Phaser from 'phaser';
import { solveReaction } from '../utils/chemistry.js';
import { DialogueBox } from '../ui/DialogueBox.js';

export class LabScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LabScene' });
  }

  init() {
    this.questManager = this.registry.get('questManager') || null;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(w / 2, 30, '🧪 Laboratory', {
      fontFamily: 'monospace', fontSize: '28px', color: '#44ff88', fontStyle: 'bold',
    }).setOrigin(0.5);

    const reagents = ['H', 'O', 'N', 'C'];
    const reagentNames = { H: 'Hydrogen', O: 'Oxygen', N: 'Nitrogen', C: 'Carbon' };
    const reagentColors = { H: '#ffffff', O: '#ff6666', N: '#6666ff', C: '#999999' };

    this.add.text(w / 2, 70, 'Reagents Shelf:', {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaaacc',
    }).setOrigin(0.5);

    this.selectedReagents = [];
    this.resultText = null;
    this.reagentButtons = {};

    const startX = w / 2 - 120;
    const btnY = 110;

    reagents.forEach((id, i) => {
      const btn = this.add.text(startX + i * 80, btnY, id, {
        fontFamily: 'monospace', fontSize: '24px', color: reagentColors[id],
        backgroundColor: '#333355', padding: { x: 12, y: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => this._addReagent(id));

      const label = this.add.text(startX + i * 80, btnY + 35, reagentNames[id], {
        fontFamily: 'monospace', fontSize: '9px', color: '#888888',
      }).setOrigin(0.5);

      this.reagentButtons[id] = btn;
    });

    this.mixArea = this.add.text(w / 2, 190, 'Mixing Beaker: [ ]', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
      backgroundColor: '#222244', padding: { x: 20, y: 12 },
    }).setOrigin(0.5);

    const craftBtn = this.add.text(w / 2 - 60, 250, '[ Craft ]', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
      backgroundColor: '#446644', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    craftBtn.on('pointerover', () => craftBtn.setColor('#88ff88'));
    craftBtn.on('pointerout', () => craftBtn.setColor('#ffffff'));
    craftBtn.on('pointerdown', () => this._craft());

    const clearBtn = this.add.text(w / 2 + 80, 250, '[ Clear ]', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
      backgroundColor: '#664444', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    clearBtn.on('pointerover', () => clearBtn.setColor('#ff8888'));
    clearBtn.on('pointerout', () => clearBtn.setColor('#ffffff'));
    clearBtn.on('pointerdown', () => this._clear());

    this.resultText = this.add.text(w / 2, 310, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffdd44',
      wordWrap: { width: 500 }, align: 'center',
    }).setOrigin(0.5);

    if (this.questManager) {
      const state = this.questManager.getState();
      if (state.activeQuest) {
        this.add.text(w / 2, 360, `Current Quest: ${state.activeQuest.title}`, {
          fontFamily: 'monospace', fontSize: '12px', color: '#ffdd44',
        }).setOrigin(0.5);
      }
    }

    const backBtn = this.add.text(w / 2, h - 40, '[ Back to Map ]', {
      fontFamily: 'monospace', fontSize: '16px', color: '#aaaacc',
      backgroundColor: '#333355', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#aaaacc'));
    backBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }

  _addReagent(id) {
    if (this.selectedReagents.length >= 4) return;
    this.selectedReagents.push(id);
    this._updateMixArea();
  }

  _updateMixArea() {
    const contents = this.selectedReagents.length === 0 ? '' : this.selectedReagents.join(' + ');
    this.mixArea.setText(`Mixing Beaker: [ ${contents} ]`);
  }

  _clear() {
    this.selectedReagents = [];
    this._updateMixArea();
    if (this.resultText) this.resultText.setText('');
  }

  _craft() {
    if (this.selectedReagents.length === 0) {
      this.resultText.setText('The beaker is empty! Add some reagents first.');
      this.resultText.setColor('#ff6666');
      return;
    }

    const result = solveReaction(this.selectedReagents);
    if (result) {
      this.resultText.setText(`✅ ${result.name}: ${result.description}`);
      this.resultText.setColor('#44ff88');

      if (this.questManager) {
        const completed = this.questManager.checkCompletion(result.product);
        if (completed) {
          this.resultText.setText(`✅ ${result.name} created! Quest complete! Return to the NPC.`);
          this.resultText.setColor('#ffdd44');
          this.time.delayedCall(2000, () => {
            this.scene.start('GameScene');
          });
        }
      }
    } else {
      this.resultText.setText('❌ No reaction. Try a different combination.');
      this.resultText.setColor('#ff6666');
    }

    this.selectedReagents = [];
    this._updateMixArea();
  }
}
