import Phaser from 'phaser';

export type ResourceType = 'coal' | 'water' | 'crystal' | 'air'
  | 'plastic_pile' | 'glass_pile' | 'metal_pile' | 'paper_pile' | 'compost_heap'
  | 'pollution_vent' | 'clean_water_spring' | 'biomass_pile'
  | 'crystal_cluster' | 'light_well' | 'prism_shard'
  | 'iron_vein' | 'magnetic_crystal' | 'copper_wire_spool' | 'energy_geyser';

export class ResourceNode extends Phaser.Physics.Arcade.Sprite {
  public resourceType: string;
  public amount: number;
  public emojiLabel: Phaser.GameObjects.Text | null = null;
  private prompt: Phaser.GameObjects.Container | null = null;
  private _isPlayerNear = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, type: string, amount: number) {
    let texture = 'tile_wall';
    if (['coal', 'metal_pile', 'iron_vein', 'copper_wire_spool'].includes(type)) texture = 'tile_wall';
    else if (['water', 'air', 'clean_water_spring', 'light_well', 'energy_geyser'].includes(type)) texture = 'tile_portal';
    else texture = 'tile_square';
    
    super(scene, x, y, texture);
    this.resourceType = type;
    this.amount = amount;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setSize(32, 32);
    
    const tints: Record<string, number> = {
      coal: 0x2d3436, water: 0x0984e3, crystal: 0x00cec9, air: 0xffffff,
      plastic_pile: 0xf1c40f, glass_pile: 0x80deea, metal_pile: 0xb0bec5,
      paper_pile: 0xfff9c4, compost_heap: 0x6d4c41,
      pollution_vent: 0x78909c, clean_water_spring: 0x29b6f6, biomass_pile: 0x66bb6a,
      crystal_cluster: 0xce93d8, light_well: 0xf5f5f5, prism_shard: 0xce93d8,
      iron_vein: 0x757575, magnetic_crystal: 0x7c4dff, copper_wire_spool: 0xff8f00,
      energy_geyser: 0xffd54f,
    };
    const alpha: Record<string, number> = {
      water: 0.7, air: 0.4, light_well: 0.6, energy_geyser: 0.8, pollution_vent: 0.8,
    };
    this.setTint(tints[type] || 0x636e72);
    if (alpha[type] !== undefined) this.setAlpha(alpha[type]);

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

    const toolMap: Record<string, string> = {
      coal: 'pickaxe', metal_pile: 'pickaxe', iron_vein: 'pickaxe',
      magnetic_crystal: 'pickaxe', copper_wire_spool: 'pickaxe',
      crystal_cluster: 'pickaxe', prism_shard: 'pickaxe',
      water: 'flask', air: 'flask', pollution_vent: 'flask',
      clean_water_spring: 'flask', light_well: 'flask',
      energy_geyser: 'flask', compost_heap: 'flask',
      plastic_pile: 'none', glass_pile: 'none', paper_pile: 'none',
      biomass_pile: 'none',
    };

    const requiredTool = toolMap[this.resourceType] || 'pickaxe';
    if (activeTool !== requiredTool) {
      return requiredTool;
    }

    this.amount--;
    
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
    
    const itemMap: Record<string, string> = {
      coal: 'reagent_C',
      water: ['reagent_H', 'reagent_O'][Math.floor(Math.random() * 2)],
      crystal: 'reagent_Na',
      air: ['reagent_N', 'reagent_O'][Math.floor(Math.random() * 2)],
      plastic_pile: 'plastic_waste',
      glass_pile: 'glass_waste',
      metal_pile: 'metal_waste',
      paper_pile: 'paper_waste',
      compost_heap: 'organic_waste',
      pollution_vent: 'pollution_sample',
      clean_water_spring: 'clean_water',
      biomass_pile: 'organic_waste',
      crystal_cluster: 'prism',
      light_well: 'white_light',
      prism_shard: 'prism',
      iron_vein: 'iron_filings',
      magnetic_crystal: ['magnet_n', 'magnet_s'][Math.floor(Math.random() * 2)],
      copper_wire_spool: 'copper_wire',
      energy_geyser: 'biofuel',
    };
    
    return itemMap[this.resourceType] || '';
  }

  destroy(fromScene?: boolean) {
    this.prompt?.destroy();
    this.emojiLabel?.destroy();
    super.destroy(fromScene);
  }
}
