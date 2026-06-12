import Phaser from 'phaser';

export type ResourceType = 'coal' | 'water' | 'crystal' | 'air';

export class ResourceNode extends Phaser.Physics.Arcade.Sprite {
  public resourceType: ResourceType;
  public amount: number;
  private prompt: Phaser.GameObjects.Container | null = null;
  private _isPlayerNear = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, type: ResourceType, amount: number) {
    let texture = 'tile_wall'; // fallback
    if (type === 'coal') texture = 'tile_wall'; // Can be colored differently
    if (type === 'water') texture = 'tile_portal';
    if (type === 'crystal') texture = 'tile_square';
    if (type === 'air') texture = 'tile_square';
    
    super(scene, x, y, texture);
    this.resourceType = type;
    this.amount = amount;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body
    this.setSize(32, 32);
    
    if (type === 'coal') this.setTint(0x2d3436);
    if (type === 'water') this.setTint(0x0984e3).setAlpha(0.7);
    if (type === 'crystal') this.setTint(0x00cec9);
    if (type === 'air') this.setTint(0xffffff).setAlpha(0.4);

    this.createPrompt(scene);
  }

  get isPlayerNear(): boolean { return this._isPlayerNear; }
  set isPlayerNear(v: boolean) { this._isPlayerNear = v; }

  private createPrompt(scene: Phaser.Scene) {
    const bg = scene.add.image(0, 0, 'prompt_bg').setDisplaySize(120, 26);
    const text = scene.add.text(0, 0, `[ E ] Gather`, {
      fontFamily: '"Inter", sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#00cec9',
    }).setOrigin(0.5);
    this.prompt = scene.add.container(this.x, this.y - 30, [bg, text]);
    this.prompt.setDepth(20).setAlpha(0).setScale(0.8);
  }

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

  gather(activeTool: string) {
    if (this.amount <= 0) return null;

    let requiredTool = 'pickaxe';
    if (this.resourceType === 'water' || this.resourceType === 'air') {
      requiredTool = 'flask';
    }

    if (activeTool !== requiredTool) {
      // Return a specific object or string to indicate wrong tool
      return 'wrong_tool';
    }

    this.amount--;
    
    // Simple visual effect
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.8,
      yoyo: true,
      duration: 100,
    });
    
    if (this.amount <= 0) {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => {
          this.active = false;
          this.destroy();
        }
      });
    }
    
    let itemId = '';
    // Note: item IDs should match what is in items.json (e.g., reagent_C, reagent_H)
    if (this.resourceType === 'coal') itemId = 'reagent_C';
    if (this.resourceType === 'water') itemId = ['reagent_H', 'reagent_O'][Math.floor(Math.random() * 2)];
    if (this.resourceType === 'crystal') itemId = 'reagent_Na';
    if (this.resourceType === 'air') itemId = ['reagent_N', 'reagent_O'][Math.floor(Math.random() * 2)];
    
    return itemId;
  }

  destroy(fromScene?: boolean) {
    this.prompt?.destroy();
    super.destroy(fromScene);
  }
}
