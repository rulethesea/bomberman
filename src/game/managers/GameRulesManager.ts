import { GameObjects, Scene, Time } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';
import { EnemyGroup } from '@game/sprites/enemy/EnemyGroup';

// Interfaces
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';

// Enums
import { ENEMY_ENUM } from '@game/common/enums/EnemyEnum';
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';
import { LOCAL_STORAGE_KEYS_ENUM } from '@game/common/enums/LocalStorageKeysEnum';
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';

interface GameRulesManagerProps {
  scene: Scene;
  gameStage: IGameInitialStage;
  player: Player;
  enemiesGroup: EnemyGroup;
}

/**
 * This class manage the logic when the player wins or loses the game, it also organize the statistics to show (time, lifes, etc.)
 */
export class GameRulesManager {
  private _scene: Scene;
  private _gameStage: IGameInitialStage;
  private _player: Player;
  private _enemiesGroup: EnemyGroup;

  private _labels: GameObjects.Group;

  private _timers: Map<number, Time.TimerEvent>;
 
  constructor({
    scene,
    gameStage,
    player,
    enemiesGroup
  }: GameRulesManagerProps) {
    this._scene = scene;
    this._gameStage = gameStage;
    this._player = player;
    this._enemiesGroup = enemiesGroup;

    this._labels = this._scene.add.group();

    this._timers = new Map<number, Time.TimerEvent>();

    this._setUp();
  }

  /**
   * This method places the time, score and lifes of the player
   */
  private _setUp() {
    // Detect mobile screen size
    const cameraWidth = this._scene.cameras.main.width;
    const isMobile = cameraWidth < 768;

    // Adjust font size for mobile
    const fontSize = isMobile ? 12 : 15;
    const style = {
      font: `${fontSize}px BitBold`,
      fill: 'white',
      stroke: 'black',
      strokeThickness: 2.5
    };

    // Calculate responsive positions based on screen width
    // On mobile, use percentage-based positioning to ensure visibility
    const baseX = isMobile ? Math.max(8, cameraWidth * 0.02) : 22;
    const baseY = isMobile ? Math.max(8, cameraWidth * 0.02) : 22;

    // Spacing between labels
    const spacing1 = isMobile ? Math.min(120, cameraWidth * 0.35) : 170;
    const spacing2 = isMobile ? Math.min(100, cameraWidth * 0.28) : 128;

    let distanceX = baseX;

    const information = this._scene.add.text(
      distanceX,
      baseY,
      `TIME ${this._gameStage.time}`,
      style
    );

    information.setScrollFactor(0, 0);
    information.setDepth(1000); // Ensure label is on top
    information.name = 'TIME';
    this._labels.add(information);

    distanceX += spacing1;

    const score = this._scene.add.text(
      distanceX,
      baseY,
      this._gameStage.stageScore.toString(),
      style
    );

    score.setScrollFactor(0, 0);
    score.setDepth(1000); // Ensure label is on top
    score.name = 'SCORE';
    this._labels.add(score);

    distanceX += spacing2;

    // For LEFT label, ensure it's always visible within camera bounds
    // If it would go outside, adjust position to fit within screen
    const leftLabelWidth = isMobile ? 80 : 100; // Approximate width of "LEFT X"
    const rightPadding = isMobile ? 8 : 10;
    const maxX = cameraWidth - leftLabelWidth - rightPadding;

    // If LEFT would go outside camera bounds, adjust its position
    if (distanceX > maxX) {
      distanceX = maxX;
    }

    const lives = this._scene.add.text(
      distanceX,
      baseY,
      `LEFT ${this._gameStage.lives}`,
      style
    );

    lives.setScrollFactor(0, 0);
    lives.setDepth(1000); // Ensure label is on top
    lives.name = 'LEFT';
    this._labels.add(lives);

    // Add version badge next to LEFT label
    const versionText = this._scene.add.text(
      distanceX + leftLabelWidth + (isMobile ? 8 : 12),
      baseY,
      'v2.0.6',
      {
        font: `${fontSize - 2}px BitBold`,
        
        stroke: 'black',
        strokeThickness: 1.5
      }
    );
    versionText.setScrollFactor(0, 0);
    versionText.setDepth(1000);
    versionText.name = 'VERSION';

    const _timerGame = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._gameStage.time,
      callback: () => {
        const { repeatCount } = _timerGame;

        // If the game time is run out then all the enemies are PONTAN (pink coin)
        if (repeatCount <= 0) {
          this._enemiesGroup.replaceAllByType(ENEMY_ENUM.PONTAN);
        }

        this._gameStage.time = repeatCount;

        this._setLabelTextByKey('TIME', `TIME ${repeatCount}`);
      },
      callbackScope: this
    });

    this._scene.time.addEvent(_timerGame);
    this._timers.set(TIMER_GAME_ENUM.GAME, _timerGame);
  }

  win() {
    this._scene.game.sound.stopAll();

    // Check highest score
    const highScore =
      localStorage.getItem(LOCAL_STORAGE_KEYS_ENUM.HIGHEST_SCORE_KEY) ?? 0;

    if (highScore < localStorage.stage_points)
      localStorage.setItem(
        LOCAL_STORAGE_KEYS_ENUM.HIGHEST_SCORE_KEY,
        localStorage.stage_points
      );

    // Freeze player
    this._player.disableBody(false);
    this._player.setImmovable(true);

    // Update game object
    this._gameStage.stageScore += 450;
    this._gameStage.totalScore = this._gameStage.stageScore;
    this._gameStage.status = GAME_STATUS_ENUM.NEXT_STAGE;

    this._setLabelTextByKey('SCORE', this._gameStage.stageScore.toString());

    this._scene.sound.play('level-complete');

    const _timerNextStage = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: 5,
      callback: () => {
        const { repeatCount } = _timerNextStage;

        if (repeatCount <= 0) {
          // Validate final stage
          if (this._gameStage.stage === GAME_STAGE_ENUM.FINAL_BONUS) {
            this._gameStage.status = GAME_STATUS_ENUM.COMPLETED;
          }

          // Or show next stage
          this._scene.scene.start('ChangeStage', this._gameStage);
        }
      },
      callbackScope: this
    });

    this._scene.time.addEvent(_timerNextStage);
  }

  lose() {
    const _timerGame = this._timers.get(TIMER_GAME_ENUM.GAME);

    if (_timerGame) {
      _timerGame.paused = true;
    }

    this._gameStage.stageScore = 0;

    this._player.kill();

    // Decrease lives immediately when player dies
    this._gameStage.lives--;

    // Update LEFT label immediately to show new lives count
    this._setLabelTextByKey('LEFT', `LEFT ${this._gameStage.lives}`);

    const _timerLose = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: 4,
      callback: () => {
        const { repeatCount } = _timerLose;

        if (repeatCount <= 0) {
          // Restart of Game Over
          if (this._gameStage.lives >= 0) {
            this._gameStage.status = GAME_STATUS_ENUM.RESTART;
          } else {
            this._gameStage.status = GAME_STATUS_ENUM.GAME_OVER;
          }

          this._scene.scene.start('ChangeStage', this._gameStage);
        }
      },
      callbackScope: this
    });

    this._scene.time.addEvent(_timerLose);
  }

  /**
   * Simple method with boilerplate to change the text of a label
   * @param keyName key of the label to access
   * @param value new value to change
   */
  private _setLabelTextByKey(keyName: string, value: string) {
    const _label = this._labels.getMatching('name', keyName)[0];

    if (_label) {
      (_label as GameObjects.Text).setText(value);
    }
  }

  public get score() {
    return this._gameStage.stageScore;
  }

  public set score(v: number) {
    this._gameStage.stageScore = v;

    this._setLabelTextByKey('SCORE', this._gameStage.stageScore.toString());
  }
}
