// ============================================================
//  ARRANQUE DEL JUEGO
//  Resolución lógica vertical 540x960 (W x H). El lienzo real
//  es W*DPR x H*DPR y cada escena llama a hiDPI(this) para que
//  las coordenadas del juego sigan siendo las lógicas.
// ============================================================

// Los textos se renderizan a la resolución del dispositivo para verse nítidos
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
  style = Object.assign({ resolution: DPR }, style || {});
  return this.displayList.add(new Phaser.GameObjects.Text(this.scene, x, y, text, style));
};

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: W * DPR,
  height: H * DPR,
  backgroundColor: '#0f1a2b',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: { antialias: true, roundPixels: false },
  input: { activePointers: 2 },
  scene: [BootScene, MenuScene, AlmacenScene, ZonaSeguraScene, AlturaScene, InspectorScene, RunnerScene, GameOverScene]
};

const game = new Phaser.Game(config);
