// ============================================================
//  BOOT — genera todas las texturas y pasa al menú
// ============================================================

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Imágenes reales opcionales (ver src/data/assets.js). Si falla la carga, se usa el dibujo.
    Object.keys(PRODUCT_IMAGES).forEach(id => this.load.image('prod_' + id, PRODUCT_IMAGES[id]));
    if (LOGO_IMAGE) this.load.image('safecoin', LOGO_IMAGE);
    this.load.on('loaderror', f => console.warn('No se pudo cargar', f.key));
  }

  create() {
    // Operarios de pie con distintos chalecos
    makeWorkerTexture(this, 'worker_orange', 0xf58220);
    makeWorkerTexture(this, 'worker_yellow', 0xffc82e);
    makeWorkerTexture(this, 'worker_green',  0x3ddc84);
    makeWorkerTexture(this, 'worker_harness', 0xf58220, { harness: true });

    // Operarios del modo Inspector: chaleco x protección puesta
    ['orange', 'yellow', 'green', 'blue'].forEach(v => {
      const color = { orange: 0xf58220, yellow: 0xffc82e, green: 0x3ddc84, blue: 0x3a6fd8 }[v];
      ['none', 'ffp', 'semi', 'hood'].forEach(wear => makeWorkerTexture(this, 'insp_' + v + '_' + wear, color, { wear }));
    });

    // Corredor (todas las combinaciones de equipo se generan bajo demanda en el modo Runner)
    makeRunnerTexture(this, 'runner_0', 0, {});
    makeRunnerTexture(this, 'runner_1', 1, {});
    makeRunnerTexture(this, 'runner_2', 2, {});

    // Iconos de todos los productos
    Object.keys(PRODUCTS).forEach(id => makeProductTexture(this, id));
    makeSafecoinTexture(this);

    // Bono de bienvenida
    if (!Save.get('welcomed', false)) {
      Save.set('welcomed', true);
      Wallet.add(ECONOMY.firstPlayBonus);
    }

    // El audio se activa con el primer toque (requisito de los navegadores)
    this.input.once('pointerdown', () => Sfx.init());

    this.scene.start('Menu');
  }
}
