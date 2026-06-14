import Phaser from 'phaser';
import { gameStore } from '../../store/gameStore';
import { GameEvents } from '../data/types';

/**
 * DialogueBox — RPG-style dialogue overlay with typewriter effect.
 */
export class DialogueBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private nameText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private continueText: Phaser.GameObjects.Text;
  private portrait: Phaser.GameObjects.Graphics;
  private lines: string[] = [];
  private currentLine = 0;
  private isTyping = false;
  private fullText = '';
  private charIndex = 0;
  private typeTimer: Phaser.Time.TimerEvent | null = null;
  private onComplete: (() => void) | null = null;
  private isVisible = false;
  // Quest acceptance support
  private questId: string | null = null;
  private showQuestPrompt = false;
  private questBtns: Phaser.GameObjects.Container[] = [];
  private portraitInitial: Phaser.GameObjects.Text | null = null;
  private boxCenterY: number;
  private _prevPadA = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.cameras.main;
    const boxY = height - 110;
    this.boxCenterY = boxY;

    // Dialogue box spans the game area left of the right-side HUD panels
    const panelLeftEdge = (width - 150) - 115 + 10;
    const boxLeft = 35;
    const boxWidth = panelLeftEdge - boxLeft - 100;
    const boxCenterX = boxLeft + boxWidth / 2;

    // Background
    const bg = scene.add.image(boxCenterX, boxY, 'dialogue_bg')
      .setDisplaySize(boxWidth, 150).setScrollFactor(0);

    // Portrait circle
    this.portrait = scene.add.graphics().setScrollFactor(0);

    // NPC name
    this.nameText = scene.add.text(boxLeft + 100, boxY - 50, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#fdcb6e',
    }).setScrollFactor(0);

    // Body text
    this.bodyText = scene.add.text(boxLeft + 100, boxY - 25, '', {
      fontFamily: '"Inter", sans-serif', fontSize: '14px', color: '#dfe6e9',
      wordWrap: { width: boxWidth - 130 }, lineSpacing: 6,
    }).setScrollFactor(0);

    // Continue prompt
    this.continueText = scene.add.text(boxCenterX + boxWidth / 2 - 20, boxY + 45, '▼', {
      fontFamily: '"Inter", sans-serif', fontSize: '16px', color: '#6c5ce7',
    }).setScrollFactor(0).setOrigin(0.5);

    scene.tweens.add({
      targets: this.continueText, y: boxY + 50, duration: 600, yoyo: true, repeat: -1,
    });

    this.container = scene.add.container(0, 0, [bg, this.portrait, this.nameText, this.bodyText, this.continueText]);
    this.container.setDepth(100).setAlpha(0).setScrollFactor(0);

    // Click / E to advance
    scene.input.on('pointerdown', () => this.advance());
    if (scene.input.keyboard) {
      scene.input.keyboard.on('keydown-E', () => this.advance());
      scene.input.keyboard.on('keydown-SPACE', () => this.advance());
      scene.input.keyboard.on('keydown-ENTER', () => this.advance());
    }

    // Gamepad A (button index 0) to advance
    const gamepadCheck = () => {
      if (!this.isVisible) return;
      const pad = scene.input.gamepad?.pad1;
      if (!pad) return;
      const aPressed = pad.buttons[0]?.pressed ?? false;
      if (aPressed && !this._prevPadA) this.advance();
      this._prevPadA = aPressed;
    };
    scene.events.on('update', gamepadCheck);
    scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off('update', gamepadCheck);
    });
  }

  show(name: string, lines: string[], portraitColor: string, questId?: string, onComplete?: () => void) {
    this.lines = lines;
    this.currentLine = 0;
    this.onComplete = onComplete || null;
    this.questId = questId || null;
    this.showQuestPrompt = false;
    this.isVisible = true;

    gameStore.setDialogueOpen(true);

    // Set name
    this.nameText.setText(name);

    // Draw portrait
    this.portrait.clear();
    const color = Phaser.Display.Color.HexStringToColor(portraitColor).color;
    this.portrait.fillStyle(color, 0.3);
    this.portrait.fillCircle(70, this.scene.cameras.main.height - 90, 30);
    this.portrait.fillStyle(color, 1);
    this.portrait.fillCircle(70, this.scene.cameras.main.height - 90, 20);
    // Initial of name (reuse to avoid leaks)
    if (this.portraitInitial) {
      this.portraitInitial.setText(name[0]);
    } else {
      this.portraitInitial = this.scene.add.text(70, this.scene.cameras.main.height - 90, name[0], {
        fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#fff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
      this.container.add(this.portraitInitial);
    }

    // Show container
    this.scene.tweens.add({
      targets: this.container, alpha: 1, duration: 200,
    });

    this.typeLine(this.lines[0]);
  }

  private typeLine(text: string) {
    this.fullText = text;
    this.charIndex = 0;
    this.bodyText.setText('');
    this.isTyping = true;
    this.continueText.setAlpha(0);

    this.typeTimer = this.scene.time.addEvent({
      delay: 25, callback: () => {
        this.charIndex++;
        this.bodyText.setText(this.fullText.substring(0, this.charIndex));
        if (this.charIndex >= this.fullText.length) {
          this.isTyping = false;
          this.typeTimer?.destroy();
          this.continueText.setAlpha(1);
          // Show quest prompt if last line and has quest
          if (this.questId && this.currentLine === this.lines.length - 1 && !gameStore.isQuestActive(this.questId) && !gameStore.isQuestCompleted(this.questId)) {
            this.showQuestAccept();
          }
        }
      }, loop: true,
    });
  }

  private advance() {
    if (!this.isVisible) return;
    if (this.showQuestPrompt) return; // wait for quest choice

    if (this.isTyping) {
      // Skip to end of line
      this.isTyping = false;
      this.typeTimer?.destroy();
      this.bodyText.setText(this.fullText);
      this.continueText.setAlpha(1);
      if (this.questId && this.currentLine === this.lines.length - 1 && !gameStore.isQuestActive(this.questId) && !gameStore.isQuestCompleted(this.questId)) {
        this.showQuestAccept();
      }
      return;
    }

    this.currentLine++;
    if (this.currentLine < this.lines.length) {
      this.typeLine(this.lines[this.currentLine]);
    } else {
      this.hide();
    }
  }

  private showQuestAccept() {
    this.showQuestPrompt = true;
    const { width, height } = this.scene.cameras.main;
    const panelLeftEdge = (width - 150) - 115 + 10;
    const boxWidth = panelLeftEdge - 35 - 100;
    const boxCenterX = 35 + boxWidth / 2;
    const y = this.boxCenterY + 45;

    const acceptBtn = this.createDialogueButton(boxCenterX - 80, y, 'Accept Quest', 0x00b894, () => {
      if (this.questId) {
        gameStore.acceptQuest(this.questId);
        this.scene.events.emit(GameEvents.QuestAccepted, this.questId);
      }
      this.clearQuestBtns();
      this.hide();
    });

    const declineBtn = this.createDialogueButton(boxCenterX + 80, y, 'Not Now', 0x636e72, () => {
      this.clearQuestBtns();
      this.hide();
    });

    this.questBtns.push(acceptBtn, declineBtn);
  }

  private createDialogueButton(x: number, y: number, label: string, color: number, cb: () => void): Phaser.GameObjects.Container {
    const g = this.scene.add.graphics().setScrollFactor(0);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-60, -14, 120, 28, 6);
    const t = this.scene.add.text(0, 0, label, {
      fontFamily: '"Inter"', fontSize: '11px', fontStyle: 'bold', color: '#fff',
    }).setOrigin(0.5).setScrollFactor(0);
    const c = this.scene.add.container(x, y, [g, t]).setDepth(102).setScrollFactor(0);
    c.setSize(120, 28).setInteractive({ useHandCursor: true });
    c.on('pointerdown', cb);
    return c;
  }

  private clearQuestBtns() {
    this.questBtns.forEach(b => b.destroy());
    this.questBtns = [];
    this.showQuestPrompt = false;
  }

  hide() {
    this.isVisible = false;
    this.clearQuestBtns();
    this.scene.tweens.add({
      targets: this.container, alpha: 0, duration: 200,
      onComplete: () => { gameStore.setDialogueOpen(false); this.onComplete?.(); },
    });
  }

  get visible(): boolean { return this.isVisible; }
}
