import Phaser from 'phaser';

/**
 * NPC — non-player character with idle animation and interaction zone.
 */
export class NPC extends Phaser.Physics.Arcade.Sprite {
  public npcId: string;
  public npcName: string;
  public questId: string | null;
  private prompt: Phaser.GameObjects.Container | null = null;
  private bobTween: Phaser.Tweens.Tween | null = null;
  private _isPlayerNear = false;

  constructor(scene: Phaser.Scene, x: number, y: number, npcId: string, name: string, spriteKey: string, questId: string | null) {
    super(scene, x, y, spriteKey);
    this.npcId = npcId;
    this.npcName = name;
    this.questId = questId;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.setSize(24, 24);
    this.setOffset(4, 4);
    this.setDepth(9);
    this.setImmovable(true);

    // Idle bob animation
    this.bobTween = scene.tweens.add({
      targets: this, y: y - 2, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Create interaction prompt (hidden by default)
    this.createPrompt(scene);
  }

  private createPrompt(scene: Phaser.Scene) {
    const bg = scene.add.image(0, 0, 'prompt_bg').setDisplaySize(100, 26);
    const text = scene.add.text(0, 0, '[ E ] Talk', {
      fontFamily: '"Inter", sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#a29bfe',
    }).setOrigin(0.5);
    this.prompt = scene.add.container(this.x, this.y - 30, [bg, text]);
    this.prompt.setDepth(20).setAlpha(0).setScale(0.8);
  }

  get isPlayerNear(): boolean { return this._isPlayerNear; }

  showPrompt() {
    if (this._isPlayerNear) return;
    this._isPlayerNear = true;
    if (this.prompt) {
      this.scene.tweens.add({ targets: this.prompt, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' });
    }
  }

  hidePrompt() {
    if (!this._isPlayerNear) return;
    this._isPlayerNear = false;
    if (this.prompt) {
      this.scene.tweens.add({ targets: this.prompt, alpha: 0, scale: 0.8, duration: 150 });
    }
  }

  updatePromptPosition() {
    if (this.prompt) {
      this.prompt.setPosition(this.x, this.y - 30);
    }
  }

  destroy(fromScene?: boolean) {
    this.prompt?.destroy();
    this.bobTween?.destroy();
    super.destroy(fromScene);
  }
}
