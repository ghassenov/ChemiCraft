import './styles/global.css';
import Phaser from 'phaser';
import { createGameConfig } from './game/config';

/**
 * Initializes the Phaser game instance.
 * Destroys any existing instance first.
 */
function bootGame() {
  const container = document.getElementById('game-container');
  if (container) {
    container.innerHTML = '';
  }
  const config = createGameConfig();
  new Phaser.Game(config);
}

bootGame();
