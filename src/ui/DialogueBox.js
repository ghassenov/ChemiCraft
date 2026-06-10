export class DialogueBox {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.npcName = config.npcName || 'NPC';
    this.lines = config.lines || [];
    this.onAccept = config.onAccept || null;
    this.onDecline = config.onDecline || null;

    this.container = null;
    this.currentLine = 0;
    this.textObj = null;
    this.nameObj = null;
    this.isTyping = false;
    this.typeTimer = null;
    this.buffer = '';

    this._build();
  }

  _build() {
    const w = this.scene.cameras.main.width;
    const h = this.scene.cameras.main.height;

    this.container = this.scene.add.container(0, 0).setDepth(100);
    this.container.setScrollFactor(0);

    const boxBg = this.scene.add.graphics();
    boxBg.fillStyle(0x111122, 0.92);
    boxBg.fillRoundedRect(w / 2 - 300, h - 180, 600, 160, 12);
    boxBg.lineStyle(2, 0x44ff88);
    boxBg.strokeRoundedRect(w / 2 - 300, h - 180, 600, 160, 12);
    this.container.add(boxBg);

    this.nameObj = this.scene.add.text(w / 2 - 280, h - 170, this.npcName, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#44ff88',
      fontStyle: 'bold',
    });
    this.container.add(this.nameObj);

    this.textObj = this.scene.add.text(w / 2 - 280, h - 140, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 540 },
      lineSpacing: 6,
    });
    this.container.add(this.textObj);

    this.hintObj = this.scene.add.text(w / 2 + 280, h - 40, '[SPACE]', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(1, 0);
    this.container.add(this.hintObj);

    this.container.setVisible(false);

    this.scene.input.keyboard.on('keydown-SPACE', () => this._advance());
    this.scene.input.keyboard.on('keydown-ENTER', () => this._advance());
  }

  show() {
    this.currentLine = 0;
    this.container.setVisible(true);
    this.scene.input.keyboard.enabled = true;
    this._typeLine(0);
  }

  hide() {
    this.container.setVisible(false);
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }
  }

  isVisible() {
    return this.container.visible;
  }

  destroy() {
    if (this.typeTimer) this.typeTimer.destroy();
    this.container.destroy();
  }

  _typeLine(index) {
    if (index >= this.lines.length) return;
    const fullText = this.lines[index];
    this.textObj.setText('');
    this.hintObj.setText('[SPACE]');
    this.isTyping = true;
    this.buffer = fullText;

    let charIndex = 0;
    if (this.typeTimer) this.typeTimer.destroy();

    this.typeTimer = this.scene.time.addEvent({
      delay: 30,
      callback: () => {
        if (charIndex >= fullText.length) {
          this.isTyping = false;
          if (this.typeTimer) {
            this.typeTimer.destroy();
            this.typeTimer = null;
          }
          if (index === this.lines.length - 1) {
            this.hintObj.setText('[SPACE] Close / [ENTER] Accept');
          } else {
            this.hintObj.setText('[SPACE]');
          }
          return;
        }
        charIndex++;
        this.textObj.setText(fullText.substring(0, charIndex));
      },
      loop: true,
    });
  }

  _advance() {
    if (!this.container.visible) return;

    if (this.isTyping) {
      if (this.typeTimer) this.typeTimer.destroy();
      this.typeTimer = null;
      this.textObj.setText(this.buffer);
      this.isTyping = false;
      if (this.currentLine === this.lines.length - 1) {
        this.hintObj.setText('[SPACE] Close / [ENTER] Accept');
      } else {
        this.hintObj.setText('[SPACE]');
      }
      return;
    }

    this.currentLine++;

    if (this.currentLine >= this.lines.length) {
      this.hide();
      if (this.onAccept) this.onAccept();
      return;
    }

    this._typeLine(this.currentLine);
  }
}
