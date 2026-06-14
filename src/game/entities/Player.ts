import Phaser from 'phaser';
import { Direction } from '../data/types';
import { gameStore } from '../../store/gameStore';

/**
 * Player — the controllable character with 8-direction movement,
 * collision, and interaction capability.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private _interactKey!: Phaser.Input.Keyboard.Key;
  private speed = 120;
  private _facing: Direction = Direction.Down;
  private _canMove = true;
  private interactionCallback: (() => void) | null = null;
  private nameLabel!: Phaser.GameObjects.Text;
  private _prevPadA = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_sheet', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(14, 14);
    this.setOffset(9, 16);
    this.setDepth(10);

    // Input keys
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this._interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    // Create animations
    this.createAnimations(scene);

    // Listen to consumed items
    window.addEventListener('chemicraft:consumed', this.handleItemConsumed);
    scene.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('chemicraft:consumed', this.handleItemConsumed);
      if (this.nameLabel) this.nameLabel.destroy();
    });

    // Name label above player
    const username = gameStore.getState().playerData.username;
    this.nameLabel = scene.add.text(x, y - 28, username, {
      fontFamily: '"Inter", sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(20);
  }

  private handleItemConsumed = (e: any) => {
    const { itemId } = e.detail;
    if (itemId === 'speed_potion') {
      this.speed = 180; // Boost speed
      // Particle effect
      const emitter = this.scene.add.particles(0, 0, 'icon_particle', {
        speed: 20, scale: { start: 0.5, end: 0 }, tint: 0xce93d8, blendMode: 'ADD', lifespan: 400
      });
      emitter.startFollow(this);
      
      this.scene.time.delayedCall(30000, () => { // 30 seconds
        this.speed = 120;
        emitter.destroy();
      });
    }
  };

  private createAnimations(scene: Phaser.Scene) {
    const dirs = ['down', 'up', 'left', 'right'];
    dirs.forEach((dir, i) => {
      const key = `player_${dir}`;
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: [{ key: 'player_sheet', frame: i * 2 }, { key: 'player_sheet', frame: i * 2 + 1 }],
          frameRate: 6,
          repeat: -1,
        });
      }
      const idleKey = `player_idle_${dir}`;
      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({
          key: idleKey,
          frames: [{ key: 'player_sheet', frame: i * 2 }],
          frameRate: 1,
        });
      }
    });
  }

  get facing(): Direction { return this._facing; }
  get canMove(): boolean { return this._canMove; }
  set canMove(v: boolean) { this._canMove = v; if (!v) this.setVelocity(0, 0); }
  get interactKey(): Phaser.Input.Keyboard.Key { return this._interactKey; }

  onInteract(cb: () => void) { this.interactionCallback = cb; }

  update() {
    this.nameLabel.setPosition(this.x, this.y - 28);
    this.nameLabel.setText(gameStore.getState().playerData.username);

    if (!this._canMove || gameStore.getState().isPaused) {
      this.setVelocity(0, 0);
      return;
    }

    let up = this.cursors?.up.isDown || this.wasd?.W.isDown;
    let down = this.cursors?.down.isDown || this.wasd?.S.isDown;
    let left = this.cursors?.left.isDown || this.wasd?.A.isDown;
    let right = this.cursors?.right.isDown || this.wasd?.D.isDown;

    // Gamepad support (left stick indices 0/1, D-pad indices 12-15)
    const pad = this.scene.input.gamepad?.pad1;
    if (pad) {
      const deadZone = 0.3;
      const ax = pad.leftStick?.x ?? 0;
      const ay = pad.leftStick?.y ?? 0;
      if (ay < -deadZone) up = true;
      else if (ay > deadZone) down = true;
      if (ax < -deadZone) left = true;
      else if (ax > deadZone) right = true;
      if (pad.buttons[12]?.pressed) up = true;
      if (pad.buttons[13]?.pressed) down = true;
      if (pad.buttons[14]?.pressed) left = true;
      if (pad.buttons[15]?.pressed) right = true;
    }

    let vx = 0, vy = 0;
    if (left) vx = -1;
    else if (right) vx = 1;
    if (up) vy = -1;
    else if (down) vy = 1;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      const norm = Math.SQRT1_2;
      vx *= norm; vy *= norm;
    }

    this.setVelocity(vx * this.speed, vy * this.speed);

    // Determine facing direction + animation
    if (vx !== 0 || vy !== 0) {
      if (vy < 0) this._facing = Direction.Up;
      else if (vy > 0) this._facing = Direction.Down;
      else if (vx < 0) this._facing = Direction.Left;
      else if (vx > 0) this._facing = Direction.Right;

      const dirKey = this.getDirectionKey();
      this.anims.play(`player_${dirKey}`, true);
    } else {
      const dirKey = this.getDirectionKey();
      this.anims.play(`player_idle_${dirKey}`, true);
    }

    // Interaction (keyboard E or gamepad A button index 0)
    const keyInteract = Phaser.Input.Keyboard.JustDown(this._interactKey);
    const padA = pad ? (pad.buttons[0]?.pressed ?? false) : false;
    const padInteract = padA && !this._prevPadA;
    this._prevPadA = padA;

    if ((keyInteract || padInteract) && this.interactionCallback) {
      this.interactionCallback();
    }
  }

  private getDirectionKey(): string {
    switch (this._facing) {
      case Direction.Up: case Direction.UpLeft: case Direction.UpRight: return 'up';
      case Direction.Down: case Direction.DownLeft: case Direction.DownRight: return 'down';
      case Direction.Left: return 'left';
      case Direction.Right: return 'right';
      default: return 'down';
    }
  }

  /** Get the tile position the player is facing */
  getFacingTile(tileSize: number): { x: number; y: number } {
    const tx = Math.floor(this.x / tileSize);
    const ty = Math.floor(this.y / tileSize);
    switch (this._facing) {
      case Direction.Up: return { x: tx, y: ty - 1 };
      case Direction.Down: return { x: tx, y: ty + 1 };
      case Direction.Left: return { x: tx - 1, y: ty };
      case Direction.Right: return { x: tx + 1, y: ty };
      default: return { x: tx, y: ty };
    }
  }
}
