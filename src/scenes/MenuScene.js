// ============================================================
//  MENÚ PRINCIPAL — la "nave" de Safetop con los 4 modos,
//  el saldo de Safecoins, las misiones y el Almacén EPI
// ============================================================

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    hiDPI(this);
    addBackground(this, '#182a4a', '#0f1a2b', '#0a1220');
    addVignette(this, 0.5);

    // Franja superior con rayas de obra
    addTile(this, W / 2, 7, W, 14, 'stripes');

    // Saldo de Safecoins
    coinImage(this, W - 34, 50, 40);
    this.coinText = this.add.text(W - 62, 46, Wallet.coins(), {
      fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color: CSS.yellow
    }).setOrigin(1, 0.5);
    this.add.text(W - 62, 70, 'Safecoins', { fontFamily: FONT, fontSize: '12px', color: CSS.grey }).setOrigin(1, 0.5);

    // Sonido on/off y pantalla completa
    const snd = this.add.text(32, 50, Sfx.enabled() ? '🔊' : '🔇', { fontSize: '26px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    snd.on('pointerup', () => { Save.set('sound', !Sfx.enabled()); snd.setText(Sfx.enabled() ? '🔊' : '🔇'); Sfx.init(); Sfx.tap(); });
    if (this.scale.fullscreen.available) {
      const fs = this.add.text(82, 50, '⛶', { fontSize: '26px', color: CSS.grey }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      fs.on('pointerup', () => { if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen(); });
    }

    // Título con el logo
    coinImage(this, 96, 138, 74);
    this.add.text(140, 118, 'SAFETOP', {
      fontFamily: FONT, fontSize: '62px', fontStyle: '900', color: CSS.orange, letterSpacing: 1
    }).setOrigin(0, 0.5).setShadow(0, 4, 'rgba(0,0,0,0.5)', 6);
    this.add.text(144, 166, 'A R C A D E', {
      fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color: CSS.white
    }).setOrigin(0, 0.5).setShadow(0, 2, 'rgba(0,0,0,0.5)', 4);
    this.add.text(W / 2, 208, 'Protege a tu equipo. Bate tu récord.', {
      fontFamily: FONT, fontSize: '16px', color: CSS.grey
    }).setOrigin(0.5);

    // Operario que saluda
    const w = addImg(this, 60, 305, 'worker_harness', 0.9);
    this.tweens.add({ targets: w, y: 298, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Panel de misiones
    makePanelTexture(this, 'missions_panel', 410, 142, BRAND.navy2, 16);
    addImg(this, 315, 303, 'missions_panel');
    this.add.text(128, 244, '🎯 MISIONES', { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: CSS.orange });
    Missions.active().forEach((m, i) => {
      const y = 275 + i * 32;
      const pct = Math.min(1, m.value / m.target);
      this.add.text(128, y, m.text, { fontFamily: FONT, fontSize: '13px', color: CSS.white }).setOrigin(0, 0.5);
      const bar = this.add.graphics();
      bar.fillStyle(0x0a1220); bar.fillRoundedRect(128, y + 10, 300, 6, 3);
      bar.fillStyle(BRAND.green); bar.fillRoundedRect(128, y + 10, Math.max(6, 300 * pct), 6, 3);
      this.add.text(505, y - 6, Math.min(m.value, m.target) + '/' + m.target, { fontFamily: FONT, fontSize: '11px', color: CSS.grey }).setOrigin(1, 0.5);
      this.add.text(505, y + 9, '+' + m.reward, { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: CSS.yellow }).setOrigin(1, 0.5);
    });

    // Tarjetas de los 4 modos
    const cardW = 480, cardH = 96, startY = 436, gap = 12;
    makePanelTexture(this, 'card', cardW, cardH, BRAND.navy2, 20);
    const accents = [BRAND.blue, BRAND.orange, BRAND.green, BRAND.yellow];

    GAME_MODES.forEach((mode, i) => {
      const y = startY + i * (cardH + gap);
      const card = addImg(this, W / 2, y, 'card').setInteractive({ useHandCursor: true });
      const base = card.scaleX;
      const left = W / 2 - cardW / 2;

      // franja de color a la izquierda e icono en círculo
      const acc = this.add.graphics();
      acc.fillStyle(accents[i]); acc.fillRoundedRect(left, y - cardH / 2 + 12, 6, cardH - 24, 3);
      this.add.circle(left + 52, y, 30, accents[i], 0.18).setStrokeStyle(2, accents[i], 0.6);
      this.add.text(left + 52, y, mode.emoji, { fontSize: '30px' }).setOrigin(0.5);

      this.add.text(left + 100, y - 20, mode.title.toUpperCase(), {
        fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: CSS.white
      }).setOrigin(0, 0.5).setShadow(0, 2, 'rgba(0,0,0,0.4)', 3);
      this.add.text(left + 100, y + 14, mode.desc, {
        fontFamily: FONT, fontSize: '12px', color: CSS.grey, wordWrap: { width: 285 }
      }).setOrigin(0, 0.5);

      const best = Save.get('best_' + mode.key, 0);
      this.add.text(left + cardW - 22, y - 16, '▶', { fontFamily: FONT, fontSize: '26px', color: CSS.orange }).setOrigin(1, 0.5);
      this.add.text(left + cardW - 22, y + 18, 'Récord ' + best, { fontFamily: FONT, fontSize: '12px', color: CSS.yellow }).setOrigin(1, 0.5);

      card.on('pointerdown', () => card.setScale(base * 0.97));
      card.on('pointerup', () => { card.setScale(base); Sfx.init(); Sfx.tap(); this.scene.start(mode.key); });
      card.on('pointerout', () => card.setScale(base));
    });

    // Almacén EPI
    makeButton(this, W / 2, 884, 300, 60, '🏬  ALMACÉN EPI', BRAND.orange, () => this.scene.start('Almacen'), 22);

    this.add.text(W / 2, H - 22, 'Safetop · Asegurando la salud de tu equipo desde 1989', {
      fontFamily: FONT, fontSize: '12px', color: '#4a5670'
    }).setOrigin(0.5);
  }
}
