import { Input, Scene, Types } from 'phaser';

class PlayerControlsManager {
  private _cursorKeys?: Types.Input.Keyboard.CursorKeys;
  private _putBombControl?: Input.Keyboard.Key;
  private _exploitBombControl?: Input.Keyboard.Key;
  
  // Virtual touch controls for mobile
  private _touchControls: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    putBomb: boolean;
    exploitBomb: boolean;
  };

  constructor(scene: Scene) {
    this._touchControls = {
      up: false,
      down: false,
      left: false,
      right: false,
      putBomb: false,
      exploitBomb: false
    };
    
    this._setUpControls(scene);
    this._setUpTouchControls();
  }

  private _setUpControls(scene: Scene) {
    if (scene.input.keyboard) {
      this._cursorKeys = scene.input.keyboard.createCursorKeys();

      this._putBombControl = scene.input.keyboard.addKey(
        Input.Keyboard.KeyCodes.X
      );
      this._exploitBombControl = scene.input.keyboard.addKey(
        Input.Keyboard.KeyCodes.SPACE
      );
    }
  }

  private _setUpTouchControls() {
    // Create virtual keys for touch controls
    if (typeof window !== 'undefined') {
      // Expose touch control methods globally so HTML buttons can call them
      (window as any).touchControlUp = (pressed: boolean) => {
        this._touchControls.up = pressed;
      };
      (window as any).touchControlDown = (pressed: boolean) => {
        this._touchControls.down = pressed;
      };
      (window as any).touchControlLeft = (pressed: boolean) => {
        this._touchControls.left = pressed;
      };
      (window as any).touchControlRight = (pressed: boolean) => {
        this._touchControls.right = pressed;
      };
      (window as any).touchControlPutBomb = (pressed: boolean) => {
        this._touchControls.putBomb = pressed;
      };
      (window as any).touchControlExploitBomb = (pressed: boolean) => {
        this._touchControls.exploitBomb = pressed;
      };
    }
  }

  public get cursorKeys() {
    // Return virtual cursor keys that combine keyboard and touch controls
    if (!this._cursorKeys) {
      // Create a mock cursor keys object if keyboard is not available
      const mockKeys = {
        up: { isDown: false } as Input.Keyboard.Key,
        down: { isDown: false } as Input.Keyboard.Key,
        left: { isDown: false } as Input.Keyboard.Key,
        right: { isDown: false } as Input.Keyboard.Key
      };
      
      // Override isDown to check touch controls
      Object.defineProperty(mockKeys.up, 'isDown', {
        get: () => this._touchControls.up
      });
      Object.defineProperty(mockKeys.down, 'isDown', {
        get: () => this._touchControls.down
      });
      Object.defineProperty(mockKeys.left, 'isDown', {
        get: () => this._touchControls.left
      });
      Object.defineProperty(mockKeys.right, 'isDown', {
        get: () => this._touchControls.right
      });
      
      return mockKeys as Types.Input.Keyboard.CursorKeys;
    }

    // Wrap original keys to also check touch controls
    const wrappedKeys = {
      up: { ...this._cursorKeys.up },
      down: { ...this._cursorKeys.down },
      left: { ...this._cursorKeys.left },
      right: { ...this._cursorKeys.right }
    };

    Object.defineProperty(wrappedKeys.up, 'isDown', {
      get: () => this._cursorKeys!.up.isDown || this._touchControls.up
    });
    Object.defineProperty(wrappedKeys.down, 'isDown', {
      get: () => this._cursorKeys!.down.isDown || this._touchControls.down
    });
    Object.defineProperty(wrappedKeys.left, 'isDown', {
      get: () => this._cursorKeys!.left.isDown || this._touchControls.left
    });
    Object.defineProperty(wrappedKeys.right, 'isDown', {
      get: () => this._cursorKeys!.right.isDown || this._touchControls.right
    });

    return wrappedKeys as Types.Input.Keyboard.CursorKeys;
  }

  public get putBombControl() {
    if (!this._putBombControl) {
      const mockKey = { isDown: false } as Input.Keyboard.Key;
      Object.defineProperty(mockKey, 'isDown', {
        get: () => this._touchControls.putBomb
      });
      return mockKey;
    }

    const wrappedKey = { ...this._putBombControl };
    Object.defineProperty(wrappedKey, 'isDown', {
      get: () => this._putBombControl!.isDown || this._touchControls.putBomb
    });
    return wrappedKey;
  }

  public get exploitBombControl() {
    if (!this._exploitBombControl) {
      const mockKey = { isDown: false } as Input.Keyboard.Key;
      Object.defineProperty(mockKey, 'isDown', {
        get: () => this._touchControls.exploitBomb
      });
      return mockKey;
    }

    const wrappedKey = { ...this._exploitBombControl };
    Object.defineProperty(wrappedKey, 'isDown', {
      get: () => this._exploitBombControl!.isDown || this._touchControls.exploitBomb
    });
    return wrappedKey;
  }

  // Reset touch controls (useful when player dies or scene changes)
  public resetTouchControls() {
    this._touchControls.up = false;
    this._touchControls.down = false;
    this._touchControls.left = false;
    this._touchControls.right = false;
    this._touchControls.putBomb = false;
    this._touchControls.exploitBomb = false;
  }
}

export default PlayerControlsManager;
