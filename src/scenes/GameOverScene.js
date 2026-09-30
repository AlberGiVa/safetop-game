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
    const missions = Missions.report(d.stats);

    hiDPI(this);
    addBackground(this, '#182a4a', '#0f1a2b', '#0a1220');
    addVignette(this, 0.5);

    this.add.text(W / 2, 130, mode.emoji + ' ' + mode.title.toUpperCase(), { fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: CSS.grey }).setOrigin(0.5);
    this.add.text(W / 2, 200, isRecord ? '🏆 ¡NUEVO RÉCORD!' : 'FIN DEL TURNO', {
      fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: isRecord ? CSS.yellow : CSS.orange
    }).setOrigin(0.5);

    const s = this.add.text(W / 2, 310, '0', { fontFamily: FONT, fontSize: '96px', fontStyle: '900', color: CSS.white }).setOrigin(0.5).setShadow(0, 4, 'rgba(0,0,0,0.5)', 8);
    this.tweens.addCounter({ from: 0, to: d.score, duration: 800, ease: 'Quad.out', onUpdate: t => s.setText(Math.floor(t.getValue())) });
    this.add.text(W / 2, 375, 'puntos', { fontFamily: FONT, fontSize: '20px', color: CSS.grey }).setOrigin(0.5);

    this.add.text(W / 2, 430, (d.stat || '') + '\nRécord: ' + Math.max(prevBest, d.score), {
      fontFamily: FONT, fontSize: '19px', color: CSS.white, align: 'center', lineSpacing: 8
    }).setOrigin(0.5);

    // Safecoins ganados
    const c = this.add.container(W / 2, 530);
    makePanelTexture(this, 'coins_panel', 340, 72, BRAND.navy2, 18);
    const bg = addImg(this, 0, 0, 'coins_panel');
    const ic = coinImage(this, -120, 0, 40);
    const t = this.add.text(-85, 0, '+' + coins + ' Safecoins' + (isRecord ? '  (bono récord)' : ''), { fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: CSS.yellow }).setOrigin(0, 0.5);
    c.add([bg, ic, t]).setScale(0);
    this.tweens.add({ targets: c, scale: 1, duration: 400, delay: 600, ease: 'Back.out', onStart: () => Sfx.coin() });
    this.add.text(W / 2, 585, 'Total: ' + Wallet.coins() + ' Safecoins', { fontFamily: FONT, fontSize: '14px', color: CSS.grey }).setOrigin(0.5);

    // Misiones cumplidas en esta partida
    if (missions.length) {
      const lines = missions.map(m => '🎯 Misión cumplida: ' + m.text + '  +' + m.reward).join('\n');
      const mt = this.add.text(W / 2, 650, lines, { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: CSS.green, align: 'center', wordWrap: { width: 460 } }).setOrigin(0.5);
      this.tweens.add({ targets: mt, scale: { from: 0, to: 1 }, duration: 400, delay: 1000, ease: 'Back.out', onStart: () => Sfx.level() });
    } else {
      const w = addImg(this, W / 2, 660, 'worker_orange', 0.8);
      this.tweens.add({ targets: w, angle: { from: -4, to: 4 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    makeButton(this, W / 2, 760, 320, 66, 'REINTENTAR', BRAND.orange, () => this.scene.start(d.mode), 26);
    makeButton(this, W / 2 - 85, 840, 150, 54, 'MENÚ', BRAND.navy2, () => this.scene.start('Menu'), 20);
    makeButton(this, W / 2 + 85, 840, 150, 54, 'ALMACÉN', BRAND.navy2, () => this.scene.start('Almacen'), 20);
    if (navigator.share) {
      makeButton(this, W / 2, 910, 320, 48, '📣 COMPARTIR RÉCORD', BRAND.navy2, () => {
        navigator.share({ title: 'Safetop Arcade', text: 'He hecho ' + d.score + ' puntos en ' + mode.title + ' de Safetop Arcade. ¿Me superas?', url: location.href.split('#')[0] }).catch(() => {});
      }, 18);
    }
  }
}
