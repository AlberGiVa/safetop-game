// ============================================================
//  ARRANQUE DEL JUEGO
//  Resolución lógica vertical 540x960; se escala a cualquier
//  pantalla (móvil, tablet, PC) manteniendo la proporción.
// ============================================================

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#0f1a2b',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: { pixelArt: false, antialias: true },
  input: { activePointers: 2 },
  scene: [BootScene, MenuScene, AlmacenScene, ZonaSeguraScene, AlturaScene, InspectorScene, RunnerScene, GameOverScene]
};

const game = new Phaser.Game(config);
