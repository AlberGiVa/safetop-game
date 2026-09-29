// ============================================================
//  FIN DE PARTIDA — puntos, récord, Safecoins ganados
//  data: { score, mode, stat }
// ============================================================

class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) { this.d = data || { score: 0, mode: 'ZonaSegura', stat: '' }; }

  create() {
    const d = this.d;
    const mode = GAME_MODES.find(m => m.key === d.mode);
    const prevBest = Save.get('best_' + d.mode, 0);
    const isRecord = d.score > 0 && d.score > prevBest;
    if (isRecord) Save.set('best_' + d.mode, d.score);
    const coins = Wallet.reward(d.score, isRecord, d.coinMult);

    this.cameras.main.setBackgroundColor(BRAND.navy);

    this.add.text(W / 2, 130, mode.emoji + ' ' + mode.title.toUpperCase(), { fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: CSS.grey }).setOrigin(0.5);
    this.add.text(W / 2, 200, isRecord ? '🏆 ¡NUEVO RÉCORD!' : 'FIN DEL TURNO', {
      fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: isRecord ? CSS.yellow : CSS.orange
    }).setOrigin(0.5);

    const s = this.add.text(W / 2, 310, '0', { fontFamily: FONT, fontSize: '96px', fontStyle: 'bold', color: CSS.white }).setOrigin(0.5);
    this.tweens.addCounter({ from: 0, to: d.score, duration: 800, ease: 'Quad.out', onUpdate: t => s.setText(Math.floor(t.getValue())) });
    this.add.text(W / 2, 375, 'puntos', { fontFamily: FONT, fontSize: '20px', color: CSS.grey }).setOrigin(0.5);

    this.add.text(W / 2, 430, (d.stat || '') + '\nRécord: ' + Math.max(prevBest, d.score), {
      fontFamily: FONT, fontSize: '19px', color: CSS.white, align: 'center', lineSpacing: 8
    }).setOrigin(0.5);

    // Safecoins ganados
    const c = this.add.container(W / 2, 530);
    const bg = this.add.graphics(); bg.fillStyle(BRAND.navy2); bg.fillRoundedRect(-170, -36, 340, 72, 18);
    const ic = this.add.image(-120, 0, 'safecoin').setScale(0.9);
    const t = this.add.text(-85, 0, '+' + coins + ' Safecoins' + (isRecord ? '  (bono récord)' : ''), { fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: CSS.yellow }).setOrigin(0, 0.5);
    c.add([bg, ic, t]).setScale(0);
    this.tweens.add({ targets: c, scale: 1, duration: 400, delay: 600, ease: 'Back.out', onStart: () => Sfx.coin() });
    this.add.text(W / 2, 585, 'Total: ' + Wallet.coins() + ' Safecoins', { fontFamily: FONT, fontSize: '14px', color: CSS.grey }).setOrigin(0.5);

    const w = this.add.image(W / 2, 660, 'worker_orange').setScale(0.8);
    this.tweens.add({ targets: w, angle: { from: -4, to: 4 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    makeButton(this, W / 2, 760, 320, 66, 'REINTENTAR', BRAND.orange, () => this.scene.start(d.mode), 26);
    makeButton(this, W / 2 - 85, 840, 150, 54, 'MENÚ', BRAND.navy2, () => this.scene.start('Menu'), 20);
    makeButton(this, W / 2 + 85, 840, 150, 54, 'ALMACÉN', BRAND.navy2, () => this.scene.start('Almacen'), 20);
  }
}
