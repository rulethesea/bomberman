import { Scene } from 'phaser';

/**
 * The Preloader of the game, I put here all the required assets to use in the next scenes
 */

// Get base path from Vite (will be '/boom/' for production, '/' for dev)
const BASE_PATH = import.meta.env.BASE_URL || '/';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Little label to show loading process
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'LOADING GAME ...'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(15)
      .setColor('white')
      .setStroke('black', 2.5)
      .setOrigin(0.5, 0.5);

    // Load map of tiles
    this.load.tilemapTiledJSON('world', `${BASE_PATH}game/map/tilemap.json`);
    this.load.image('tilemap', `${BASE_PATH}game/map/hard-wall.png`);

    // Load spritesheets and other assets
    this.load.image('door', `${BASE_PATH}game/images/door.png`);
    this.load.image('bomb-up', `${BASE_PATH}game/images/power-up/bomb-up.png`);
    this.load.image('fire-up', `${BASE_PATH}game/images/power-up/fire-up.png`);
    this.load.image(
      'remote-control',
      `${BASE_PATH}game/images/power-up/remote-control.png`
    );
    this.load.image('menu-title', `${BASE_PATH}game/images/menu-title.png`);

    this.load.spritesheet(
      'bomberman-move',
      `${BASE_PATH}game/sprites/player/walking.png`,
      {
        frameWidth: 16,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'bomberman-dead',
      `${BASE_PATH}game/sprites/player/killing.png`,
      {
        frameWidth: 16,
        frameHeight: 21
      }
    );
    this.load.spritesheet('bomb', `${BASE_PATH}game/sprites/bomb/bomb.png`, {
      frameWidth: 17,
      frameHeight: 18
    });
    this.load.spritesheet('wall', `${BASE_PATH}game/sprites/wall/wall.png`, {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet(
      'wall-explosion',
      `${BASE_PATH}game/sprites/wall/wall-explosion.png`,
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet('ballom', `${BASE_PATH}game/sprites/enemies/ballom.png`, {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('onil', `${BASE_PATH}game/sprites/enemies/onil.png`, {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('minvo', `${BASE_PATH}game/sprites/enemies/minvo.png`, {
      frameWidth: 17,
      frameHeight: 16
    });
    this.load.spritesheet('dahl', `${BASE_PATH}game/sprites/enemies/dahl.png`, {
      frameWidth: 18,
      frameHeight: 16
    });
    this.load.spritesheet('ovape', `${BASE_PATH}game/sprites/enemies/ovape.png`, {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('pass', `${BASE_PATH}game/sprites/enemies/pass.png`, {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('pontan', `${BASE_PATH}game/sprites/enemies/pontan.png`, {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet(
      'explosion-center',
      `${BASE_PATH}game/sprites/bomb/explosion/explosion-center.png`,
      {
        frameWidth: 18,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'explosion-upper-lenght',
      `${BASE_PATH}game/sprites/bomb/explosion/explosion-upper-lenght.png`,
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-lower-lenght',
      `${BASE_PATH}game/sprites/bomb/explosion/explosion-lower-lenght.png`,
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-right-lenght',
      `${BASE_PATH}game/sprites/bomb/explosion/explosion-right-lenght.png`,
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-left-lenght',
      `${BASE_PATH}game/sprites/bomb/explosion/explosion-left-lenght.png`,
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-extension-horizontal',
      `${BASE_PATH}game/sprites/bomb/explosion/explosion-extension-horizontal.png`,
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-extension-vertical',
      `${BASE_PATH}game/sprites/bomb/explosion/explosion-extension-vertical.png`,
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'destroy-enemy',
      `${BASE_PATH}game/sprites/enemies/destroy-enemy/destroy-enemy.png`,
      {
        frameWidth: 14,
        frameHeight: 16
      }
    );

    // Load all the sounds
    this.load.audio('stage-theme', `${BASE_PATH}game/music/stage/stage-theme.mp3`);
    this.load.audio('bonus-theme', `${BASE_PATH}game/music/stage/bonus-theme.mp3`);
    this.load.audio('level-start', `${BASE_PATH}game/music/stage/level-start.mp3`);
    this.load.audio('level-complete', `${BASE_PATH}game/music/stage/level-complete.mp3`);
    this.load.audio('just-died', `${BASE_PATH}game/music/character/just-died.mp3`);
    this.load.audio('explosion', `${BASE_PATH}game/music/bomb/explosion.mp3`);
    this.load.audio('find-the-door', `${BASE_PATH}game/music/character/find_the_door.mp3`);
    this.load.audio('game-over', `${BASE_PATH}game/music/stage/game-over.mp3`);
    this.load.audio('menu-audio', `${BASE_PATH}game/music/stage/title-screen.mp3`);
    this.load.audio('walking-y', `${BASE_PATH}game/music/character/walk.mp3`);
    this.load.audio('walking-x', `${BASE_PATH}game/music/character/walk-2.mp3`);
    this.load.audio('put-bomb', `${BASE_PATH}game/music/bomb/put-bomb.wav`);
    this.load.audio('power-up', `${BASE_PATH}game/music/character/power-up.wav`);
    this.load.audio('lose', `${BASE_PATH}game/music/character/lose.wav`);
    this.load.audio('last-enemy', `${BASE_PATH}game/music/enemy/last-enemy.wav`);
  }

  create() {
    this.scene.start('MainMenu');
  }
}
