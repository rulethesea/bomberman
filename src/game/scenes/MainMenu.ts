import { Scene, VERSION } from 'phaser';

// Helpers
import getInitialGameStage from '@game/common/helpers/getInitialGameStage';

// Managers
import { SaveGameManager } from '@game/managers/SaveGameManager';

// Enums
import { LOCAL_STORAGE_KEYS_ENUM } from '@game/common/enums/LocalStorageKeysEnum';

/**
 * The menu screen to choose any option to start the game
 */
export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    // Change backgound color to black
    this.cameras.main.backgroundColor =
      Phaser.Display.Color.HexStringToColor('#000000');

    // Detect mobile screen size
    const isMobile = this.cameras.main.width < 768;
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Adjust sizes and spacing for mobile
    const titleScale = isMobile ? 1.2 : 2.4;
    const fontSize = isMobile ? 16 : 20;
    const fontSizeHover = isMobile ? 17 : 21;
    const buttonSpacingX = isMobile ? 80 : 230; // Horizontal spacing between buttons
    const buttonY = centerY + (isMobile ? 80 : 120);
    const infoFontSize = isMobile ? 10 : 12;
    const infoYOffset = isMobile ? 160 : 220;

    // Add a serie of images and texts with different locations (X, Y) and styles
    this.add
      .sprite(
        centerX,
        centerY - (isMobile ? 40 : 80),
        'menu-title'
      )
      .setScale(titleScale);

    const startButton = this.add
      .text(
        centerX - (buttonSpacingX / 2),
        buttonY,
        'START'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(fontSize)
      .setColor('white')
      .setStroke('black', 2.5)
      .setInteractive({ useHandCursor: true })
      // UI effects
      .on(
        Phaser.Input.Events.POINTER_OVER,
        () => {
          startButton.setFontSize(fontSizeHover).setColor('#bdbd16');
        },
        this
      )
      .on(
        Phaser.Input.Events.POINTER_OUT,
        () => {
          startButton.setFontSize(fontSize).setColor('white');
        },
        this
      )
      // Event to start a new game
      .on(
        Phaser.Input.Events.POINTER_DOWN,
        () => {
          this.sound.stopAll();

          const stageBomberman = getInitialGameStage();

          this.scene.start('ChangeStage', stageBomberman);
        },
        this
      );

    const continueButton = this.add
      .text(
        centerX + (buttonSpacingX / 2),
        buttonY,
        'CONTINUE'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(fontSize)
      .setColor('white')
      .setStroke('black', 2.5)
      .setInteractive({ useHandCursor: true })
      .on(
        Phaser.Input.Events.POINTER_OVER,
        () => {
          continueButton.setFontSize(fontSizeHover).setColor('#bdbd16');
        },
        this
      )
      .on(
        Phaser.Input.Events.POINTER_OUT,
        () => {
          continueButton.setFontSize(fontSize).setColor('white');
        },
        this
      )
      .on(
        Phaser.Input.Events.POINTER_DOWN,
        () => {
          const state = SaveGameManager.getLoadedGame();

          if (state) {
            this.scene.start('ChangeStage', state.gameStage);
          }
        },
        this
      );

    // TOP label and score
    const scoreY = buttonY + (isMobile ? 25 : 30);
    this.add
      .text(
        centerX - (buttonSpacingX / 2),
        scoreY,
        'TOP'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(fontSize)
      .setColor('white')
      .setStroke('black', 2.5);

    // Show highest score
    const highScore =
      localStorage.getItem(LOCAL_STORAGE_KEYS_ENUM.HIGHEST_SCORE_KEY) ?? 0;

    this.add
      .text(
        centerX + (buttonSpacingX / 2),
        scoreY,
        highScore.toString()
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(fontSize)
      .setColor('white')
      .setStroke('black', 2.5);

    const infoText = this.add
      .text(
        centerX,
        centerY + infoYOffset,
        `This little game was born as an inspiration \n to learn about the awesome universe of the Web Game Development`
      )
      .setOrigin(0.5)
      .setAlign('center')
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(infoFontSize)
      .setColor('white')
      .setStroke('black', 2.5);
    
    if (isMobile) {
      infoText.setWordWrapWidth(this.cameras.main.width - 20);
    }

    this.add
      .text(
        centerX,
        centerY + infoYOffset + (isMobile ? 20 : 30),
        `Phaser ${VERSION} ❤️`
      )
      .setOrigin(0.5)
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(infoFontSize + 1)
      .setColor('#bdbd16')
      .setStroke('#8e001c', 2.5);

    this.sound.play('menu-audio', { loop: true, volume: 0.5 });
  }
}
