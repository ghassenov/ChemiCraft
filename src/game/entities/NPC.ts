import Phaser from 'phaser';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public npcId: string;
  public npcName: string;
  public questId: string | null;
  private prompt: Phaser.GameObjects.Container | null = null;
  private _isPlayerNear = false;
  private startX: number;
  private startY: number;
  private wanderTimer: Phaser.Time.TimerEvent | null = null;
  private isWandering = false;
  private indicator: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, npcId: string, name: string, spriteKey: string, questId: string | null) {
    super(scene, x, y, spriteKey);
    this.npcId = npcId;
    this.npcName = name;
    this.questId = questId;
    this.startX = x;
    this.startY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this, false); // Dynamic body
    (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    this.setSize(24, 24);
    this.setOffset(4, 4);
    this.setDepth(9);

    this.createPrompt(scene);
    this.createIndicator(scene);
    this.startWanderLogic(scene);
  }

  get isPlayerNear(): boolean { return this._isPlayerNear; }
  set isPlayerNear(v: boolean) { this._isPlayerNear = v; }

  private createPrompt(scene: Phaser.Scene) {
    const bg = scene.add.image(0, 0, 'prompt_bg').setDisplaySize(100, 26);
    const text = scene.add.text(0, 0, '[ E ] Talk', {
      fontFamily: '"Inter", sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#a29bfe',
    }).setOrigin(0.5);
    this.prompt = scene.add.container(this.x, this.y - 30, [bg, text]);
    this.prompt.setDepth(20).setAlpha(0).setScale(0.8);
  }

  private createIndicator(scene: Phaser.Scene) {
    if (this.questId) {
      this.indicator = scene.add.sprite(this.x, this.y - 24, 'icon_particle');
      this.indicator.setTint(0xf1c40f);
      this.indicator.setDepth(20);
      scene.tweens.add({
        targets: this.indicator,
        y: this.y - 28,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private startWanderLogic(scene: Phaser.Scene) {
    this.wanderTimer = scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: this.doWander,
      callbackScope: this,
      loop: true
    });
  }

  private doWander() {
    if (this._isPlayerNear || !this.scene) {
      this.setVelocity(0, 0);
      this.isWandering = false;
      return;
    }

    if (this.isWandering) {
      // Stop wandering
      this.setVelocity(0, 0);
      this.isWandering = false;
      this.wanderTimer!.reset({ delay: Phaser.Math.Between(2000, 4000), callback: this.doWander, callbackScope: this, loop: true });
    } else {
      // Start wandering
      this.isWandering = true;
      const targetX = this.startX + Phaser.Math.Between(-40, 40);
      const targetY = this.startY + Phaser.Math.Between(-40, 40);
      this.scene.physics.moveTo(this, targetX, targetY, 20);
      this.wanderTimer!.reset({ delay: Phaser.Math.Between(1500, 2500), callback: this.doWander, callbackScope: this, loop: true });
      
      // Face direction of movement
      if (targetX < this.x) {
        this.setFlipX(true);
      } else {
        this.setFlipX(false);
      }
    }
  }

  showPrompt() {
    if (this._isPlayerNear) return;
    this._isPlayerNear = true;
    this.setVelocity(0, 0); // Stop moving when player approaches
    if (this.prompt) {
      this.scene.tweens.add({ targets: this.prompt, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' });
    }
    if (this.indicator) {
      this.scene.tweens.add({ targets: this.indicator, alpha: 0, duration: 200 });
    }
  }

  hidePrompt() {
    if (!this._isPlayerNear) return;
    this._isPlayerNear = false;
    if (this.prompt) {
      this.scene.tweens.add({ targets: this.prompt, alpha: 0, scale: 0.8, duration: 150 });
    }
    if (this.indicator) {
      this.scene.tweens.add({ targets: this.indicator, alpha: 1, duration: 200 });
    }
  }

  updatePromptPosition() {
    if (this.prompt) {
      this.prompt.setPosition(this.x, this.y - 30);
    }
    if (this.indicator) {
      this.indicator.setPosition(this.x, this.y - 24);
    }
  }

  update() {
    // If we've strayed too far, head back to start
    if (this.isWandering) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.startX, this.startY);
      if (dist > 60) {
        this.scene.physics.moveTo(this, this.startX, this.startY, 20);
      }
    }
  }

  destroy(fromScene?: boolean) {
    this.prompt?.destroy();
    this.indicator?.destroy();
    this.wanderTimer?.destroy();
    super.destroy(fromScene);
  }
}
