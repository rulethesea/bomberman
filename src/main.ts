import { AUTO, Game } from 'phaser';

import { Boot } from '@game/Boot';
import { Preloader } from '@game/Preloader';
import { MainMenu } from '@game/scenes/MainMenu';
import { ChangeStage } from '@game/scenes/ChangeStage';
import { Game as BombermanGame } from '@game/scenes/Game';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024, // Always use original game dimensions
  height: 580, // Always use original game dimensions
  parent: 'bomberman-container',
  backgroundColor: '#000000',
  antialias: true,
  physics: {
    default: 'arcade'
    //arcade: { debug: true }
  },
  scene: [Boot, Preloader, MainMenu, ChangeStage, BombermanGame],
  scale: {
    mode: Phaser.Scale.FIT, // Use FIT to maintain aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 580,
    min: {
      width: 320,
      height: 180
    },
    max: {
      width: 3840, // Allow scaling to very large screens (4K)
      height: 2160
    },
    // Ensure game fills available space on mobile
    fullscreenTarget: 'bomberman-container',
    // Resize canvas to fill container
    resizeInterval: 250
  }
};

const game = new Game(config);

// Function to refresh game scale
function refreshGameScale() {
  // Force Phaser to recalculate scale
  const container = document.getElementById('bomberman-container');
  if (container) {
    // Ensure container has proper dimensions
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      // Refresh scale with current container dimensions
      game.scale.refresh();
    }
  } else {
    game.scale.refresh();
  }
}

// Handle window resize - let Phaser handle scaling
let resizeTimeout: number;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    refreshGameScale();
  }, 100);
});

// Also handle orientation change specifically for mobile
window.addEventListener('orientationchange', () => {
  // Wait for orientation to complete before refreshing
  setTimeout(() => {
    refreshGameScale();
    // Double refresh to ensure proper sizing
    setTimeout(() => {
      refreshGameScale();
    }, 100);
  }, 300);
});

// Handle visual viewport changes (for mobile browsers with address bar)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      refreshGameScale();
    }, 100);
  });
}

export default game;
