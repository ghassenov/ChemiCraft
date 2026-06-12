import './styles/global.css';
import Phaser from 'phaser';
import { createGameConfig } from './game/config';
import { renderAuthScreen } from './components/AuthScreen';
import { gameStore } from './store/gameStore';

/**
 * Initializes the Phaser game instance.
 * Destroys any existing instance first.
 */
function bootGame() {
  // Clear any existing game
  const container = document.getElementById('game-container');
  if (container) {
    container.innerHTML = '';
  }
  
  // Start game
  const config = createGameConfig();
  new Phaser.Game(config);
}

// Check if we should show auth or boot directly
// We boot directly if there is a last user saved and it's loaded automatically?
// The auth screen can handle "Continue", but let's show the auth screen first always
// unless they were already authenticated in the store (they won't be on fresh load).

// Initialize the app immediately since module scripts are deferred
renderAuthScreen(() => {
    bootGame();
});
