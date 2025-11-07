import { Animations, Physics, Scene } from 'phaser';

// Sprites
import BombGroup from '@game/sprites/bomb/BombGroup';

// Helpers
import PlayerControlsManager from '@game/managers/controls-manager/PlayerControlsManager';

// Interfaces
import { ISpritePosition } from '@game/common/interfaces/ISpritePosition';
import { IGameSaved } from '@game/common/interfaces/IGameSaved';
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';

// Enums
import { PLAYER_DIRECTION_ENUM } from '@game/common/enums/PlayerDirectionEnum';
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';

interface IPlayerProps {
  scene: Scene;
  x: number;
  y: number;
  gameStage: IGameInitialStage;
  bombGroup: BombGroup;
  savedGame: IGameSaved | null;
}

/**
 * This class represents the player with properties (powerUps, control keys, etc.)
 */
export class Player extends Physics.Arcade.Sprite {
  private _direction: PLAYER_DIRECTION_ENUM;

  private _controlsManager?: PlayerControlsManager;

  private _speed: number;
  private _hasWallPassPowerUp: boolean;
  private _hasBombPassPowerUp: boolean;
  private _hasFlamePassPowerUp: boolean;
  private _lastTilePassedPosition: ISpritePosition;

  private _savedGame: IGameSaved | null;

  private _bombGroup: BombGroup;

  constructor({ scene, x, y, bombGroup, gameStage, savedGame }: IPlayerProps) {
    super(scene, x, y, 'bomberman-move');

    this._direction = PLAYER_DIRECTION_ENUM.LEFT;

    this._speed = 125;
    this._hasWallPassPowerUp = false;
    this._hasBombPassPowerUp = false;
    this._hasFlamePassPowerUp = false;

    // Last tile passed: is a position taken from the "free positions" (MapManager)
    // With this value it makes easy where to put the bomb and control the explosion collisions ...
    this._lastTilePassedPosition = { x, y };

    this._bombGroup = bombGroup;

    this._savedGame = savedGame;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale player to match tile size (tile spacing is 40px, sprite is 16x16)
    // Target size ~40px to match tile grid, so scale = 40/16 = 2.5
    this.setScale(2.2);

    // Set physics body as circle - smaller radius to easily pass through gaps between obstacles
    // Visual sprite is ~35px (16*2.2), tile spacing is 40px
    // Smaller radius (6px) allows easier passage through narrow gaps between walls
    // Circular body is better for diagonal movement and prevents getting stuck in corners
    const bodyRadius = 6.0; // Smaller size to easily pass through gaps between obstacles
    
    // Set body as circle - this automatically centers the body
    this.setCircle(bodyRadius);
    
    // Ensure body is properly centered and collision is working correctly
    if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
      // Circle body is automatically centered, no offset needed
      // But we can still set offset if needed for fine-tuning
      // No offset needed for circular body centered in sprite
      
      // Ensure body is not immovable and collision is enabled
      this.body.setImmovable(false);
      // Ensure body is active for collision detection
      this.body.enable = true;
      // Set body to pushable (can be pushed by other objects)
      this.body.pushable = true;
      
      // Don't collide with world bounds - let collision with map handle boundaries
      this.body.setCollideWorldBounds(false);
      
      // Set drag to 0 for instant stop/start - prevents getting stuck
      this.body.setDrag(0, 0);
      
      // Reduce collision padding for easier passage through gaps
      // Smaller padding means collision detection is tighter to the body
      this.body.setSize(this.body.width, this.body.height, true);
      
      // Set friction to 0 to allow smooth movement
      //this.body.setFriction(0.5, 0.5);
    }

    // Debug border removed

    this._validateSavedPlayer(gameStage);
    this._setUpControls();
    this._setUpAnimations();

    // The camera follows always the player in the map
    this.scene.cameras.main.startFollow(this, true);
    this.scene.cameras.main.setFollowOffset(0, 0);
    this.scene.cameras.main.setDeadzone(0, 0);
  }

  // Debug border helpers removed

  /**
   * This method set the position of the player if the stage is a saved game
   * @param gameStage instance of game stage
   */
  private _validateSavedPlayer(gameStage: IGameInitialStage) {
    if (gameStage.status === GAME_STATUS_ENUM.LOADED_GAME && this._savedGame) {
      const { player } = this._savedGame;

      this.setPosition(player.x, player.y);
    }
  }

  private _setUpControls() {
    this._controlsManager = new PlayerControlsManager(this.scene);
  }

  private _setUpAnimations() {
    this.anims.create({
      key: PLAYER_DIRECTION_ENUM.LEFT,
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [0, 1, 2] // Take a look to the sprite to check what are these numbers ...
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: PLAYER_DIRECTION_ENUM.RIGH,
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [3, 4, 5]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: PLAYER_DIRECTION_ENUM.DOWN,
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [6, 7, 8]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: PLAYER_DIRECTION_ENUM.UP,
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [9, 10, 11]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNumbers('bomberman-dead'),
      frameRate: 8
    });
  }

  /**
   * This is a little workaround, it fix a problem when the "walking" audio is playing over and over
   * Using the approach of this.scene.sound.play() doesn't work well
   * @param key key of the audio to play
   */
  private _playSoundByKey(key: string) {
    let sound = this.scene.sound.get(key);

    if (sound === null) {
      sound = this.scene.sound.add(key);
    }

    if (!sound.isPlaying) {
      sound.play({ volume: 0.4 });
    }
  }

  // Play animation or frame by movement (left, right, up, down)
  private _playAnimationByKey(
    key: PLAYER_DIRECTION_ENUM,
    soundWalkingKey: string
  ) {
    if (this._direction != key) {
      this.play(key);
      this._direction = key;

      return;
    }

    if (!this.anims.isPlaying) this.anims.nextFrame();

    this._playSoundByKey(soundWalkingKey);
  }

  addControlsListener() {
    if (this.body?.enable) {
      let isMoving = false;
      let velocityX = 0;
      let velocityY = 0;

      // Check all input directions independently for smooth responsive movement
      // Store the state first to check all directions
      const right = this._controlsManager?.cursorKeys?.right.isDown ?? false;
      const left = this._controlsManager?.cursorKeys?.left.isDown ?? false;
      const up = this._controlsManager?.cursorKeys?.up.isDown ?? false;
      const down = this._controlsManager?.cursorKeys?.down.isDown ?? false;
      
      // Count how many directions are pressed
      const horizontalPressed = (left ? 1 : 0) + (right ? 1 : 0);
      const verticalPressed = (up ? 1 : 0) + (down ? 1 : 0);
      const totalPressed = horizontalPressed + verticalPressed;
      
      // If only one direction is pressed, use it directly
      // If multiple directions, prioritize based on which axis has more input
      if (totalPressed === 1) {
        // Single direction - use it directly
        if (right) {
          velocityX = this._speed;
          velocityY = 0;
          this._playAnimationByKey(PLAYER_DIRECTION_ENUM.RIGH, 'walking-x');
          isMoving = true;
        } else if (left) {
          velocityX = -this._speed;
          velocityY = 0;
          this._playAnimationByKey(PLAYER_DIRECTION_ENUM.LEFT, 'walking-x');
          isMoving = true;
        } else if (up) {
          velocityX = 0;
          velocityY = -this._speed;
          this._playAnimationByKey(PLAYER_DIRECTION_ENUM.UP, 'walking-y');
          isMoving = true;
        } else if (down) {
          velocityX = 0;
          velocityY = this._speed;
          this._playAnimationByKey(PLAYER_DIRECTION_ENUM.DOWN, 'walking-y');
          isMoving = true;
        }
      } else if (totalPressed > 1) {
        // Multiple directions - allow quick direction changes for turning into gaps
        // Priority: allow the perpendicular direction to take over immediately for responsive turning
        
        // Check current movement direction to allow perpendicular turning
        const currentVelX = this.body?.velocity.x ?? 0;
        const currentVelY = this.body?.velocity.y ?? 0;
        const wasMovingHorizontal = Math.abs(currentVelX) > Math.abs(currentVelY);
        const wasMovingVertical = Math.abs(currentVelY) > Math.abs(currentVelX);
        const isCurrentlyMoving = Math.abs(currentVelX) > 0.1 || Math.abs(currentVelY) > 0.1;
        
        // If currently moving, prioritize the perpendicular direction for easy turning
        if (isCurrentlyMoving) {
          if (wasMovingHorizontal && verticalPressed > 0) {
            // Currently moving horizontally, allow vertical turn (into gap)
            if (up) {
              velocityX = 0;
              velocityY = -this._speed;
              this._playAnimationByKey(PLAYER_DIRECTION_ENUM.UP, 'walking-y');
              isMoving = true;
            } else if (down) {
              velocityX = 0;
              velocityY = this._speed;
              this._playAnimationByKey(PLAYER_DIRECTION_ENUM.DOWN, 'walking-y');
              isMoving = true;
            }
          } else if (wasMovingVertical && horizontalPressed > 0) {
            // Currently moving vertically, allow horizontal turn (into gap)
            if (right) {
              velocityX = this._speed;
              velocityY = 0;
              this._playAnimationByKey(PLAYER_DIRECTION_ENUM.RIGH, 'walking-x');
              isMoving = true;
            } else if (left) {
              velocityX = -this._speed;
              velocityY = 0;
              this._playAnimationByKey(PLAYER_DIRECTION_ENUM.LEFT, 'walking-x');
              isMoving = true;
            }
          } else {
            // Not clearly moving in one direction, or both directions pressed
            // Prioritize based on which axis has more input
            if (verticalPressed >= horizontalPressed) {
              if (up) {
                velocityX = 0;
                velocityY = -this._speed;
                this._playAnimationByKey(PLAYER_DIRECTION_ENUM.UP, 'walking-y');
                isMoving = true;
              } else if (down) {
                velocityX = 0;
                velocityY = this._speed;
                this._playAnimationByKey(PLAYER_DIRECTION_ENUM.DOWN, 'walking-y');
                isMoving = true;
              }
            } else {
              if (right) {
                velocityX = this._speed;
                velocityY = 0;
                this._playAnimationByKey(PLAYER_DIRECTION_ENUM.RIGH, 'walking-x');
                isMoving = true;
              } else if (left) {
                velocityX = -this._speed;
                velocityY = 0;
                this._playAnimationByKey(PLAYER_DIRECTION_ENUM.LEFT, 'walking-x');
                isMoving = true;
              }
            }
          }
        } else {
          // Not currently moving - prioritize based on input count
          if (verticalPressed >= horizontalPressed) {
            if (up) {
              velocityX = 0;
              velocityY = -this._speed;
              this._playAnimationByKey(PLAYER_DIRECTION_ENUM.UP, 'walking-y');
              isMoving = true;
            } else if (down) {
              velocityX = 0;
              velocityY = this._speed;
              this._playAnimationByKey(PLAYER_DIRECTION_ENUM.DOWN, 'walking-y');
              isMoving = true;
            }
          } else {
            if (right) {
              velocityX = this._speed;
              velocityY = 0;
              this._playAnimationByKey(PLAYER_DIRECTION_ENUM.RIGH, 'walking-x');
              isMoving = true;
            } else if (left) {
              velocityX = -this._speed;
              velocityY = 0;
              this._playAnimationByKey(PLAYER_DIRECTION_ENUM.LEFT, 'walking-x');
              isMoving = true;
            }
          }
        }
      }

      // IMPORTANT: Always set velocity, even if 0, to prevent getting stuck
      // This ensures player stops immediately when no input
      this.setVelocityX(velocityX);
      this.setVelocityY(velocityY);
      
      // Force update body velocity immediately for instant response
      if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
        this.body.velocity.x = velocityX;
        this.body.velocity.y = velocityY;
      }

      // Set up put bomb control - can be used while moving
      if (this._controlsManager?.putBombControl?.isDown) {
        this._bombGroup.putBomb(
          this._lastTilePassedPosition.x,
          this._lastTilePassedPosition.y
        );
      }

      // Set up exploit bomb control - can be used while moving
      if (this._controlsManager?.exploitBombControl?.isDown) {
        this._bombGroup.exploitNextBomb();
      }

      // Stop current animation to avoid infinite loop ("walking")
      if (!isMoving && this._direction != PLAYER_DIRECTION_ENUM.IDLE) {
        this.stop();
        this._direction = PLAYER_DIRECTION_ENUM.IDLE;
      }
    }
  }

  /**
   * Update method called every frame
   */
  // preUpdate removed (debug border only)

  kill() {
    // Stop motion!
    this.setVelocity(0);

    // Disable events from colliders or overlaps
    this.disableBody(false);

    // Fix player to screen and also disable control keys
    this.setImmovable(true);

    // Debug graphics removed

    this.scene.game.sound.stopAll();
    this.scene.sound.play('lose');

    this.play({
      key: 'die',
      hideOnComplete: true
    }).on(
      Animations.Events.ANIMATION_COMPLETE,
      () => {
        this.scene.sound.play('just-died');
      },
      this
    );
  }

  /**
   * This method verifies if the player is on the center of tile
   * @param tile body of the tile
   * @returns if the center of the player is aligned or not
   */
  validateTileOverlap(tile: Physics.Arcade.Image): boolean {
    if (tile.body && this.body) {
      const playerCenterX = Math.round(this.body.center.x);
      const playerCenterY = Math.round(this.body.center.y);
      const tileCenterX = Math.floor(tile.body.center.x);
      const tileCenterY = Math.floor(tile.body.center.y);

      const deltaX = Math.abs(playerCenterX - tileCenterX);
      const deltaY = Math.abs(playerCenterY - tileCenterY);

      return deltaX <= 10 && deltaY <= 10;
    }

    return false;
  }

  /**
   * This method returns the position of the player for local storage
   * @returns position in x, y
   */
  getSavedState(): ISpritePosition {
    return {
      x: this.body?.center.x ?? 0,
      y: this.body?.center.y ?? 0
    };
  }

  public get speed() {
    return this._speed;
  }

  public set speed(v: number) {
    this._speed = v;
  }

  public get hasWallPassPowerUp() {
    return this._hasWallPassPowerUp;
  }

  public set hasWallPassPowerUp(v: boolean) {
    this._hasWallPassPowerUp = v;
  }

  public get hasBombPassPowerUp() {
    return this._hasBombPassPowerUp;
  }

  public set hasBombPassPowerUp(v: boolean) {
    this._hasBombPassPowerUp = v;
  }

  public get hasFlamePassPowerUp() {
    return this._hasFlamePassPowerUp;
  }

  public set hasFlamePassPowerUp(v: boolean) {
    this._hasFlamePassPowerUp = v;
  }

  public get lastTilePassedPosition() {
    return this._lastTilePassedPosition;
  }

  public set lastTilePassedPosition(v: ISpritePosition) {
    this._lastTilePassedPosition = v;
  }
}
