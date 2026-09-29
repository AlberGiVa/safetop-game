// ============================================================
//  MENÚ PRINCIPAL — la "nave" de Safetop con los 4 modos,
//  el saldo de Safecoins y el acceso al Almacén EPI
// ============================================================

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.cameras.main.setBackgroundColor(BRAND.navy);

    // Franja superior con rayas de obra
    const stripe = this.add.graphics();
    for (let i = -1; i < 14; i++) {
      stripe.fillStyle(i % 2 === 0 ? BRAND.yellow : 0x111111);
      stripe.fillRect(i * 44, 0, 44, 14);
    }

    // Saldo de Safecoins
    coinImage(this, W - 30, 48, 36);
    this.coinText = this.add.text(W - 58, 48, Wallet.coins(), {
      fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color: CSS.yellow
    }).setOrigin(1, 0.5);
    this.add.text(W - 58, 72, 'Safecoins', { fontFamily: FONT, fontSize: '12px', color: CSS.grey }).setOrigin(1, 0.5);

    // Sonido on/off
    const snd = this.add.text(30, 48, Sfx.enabled() ? '🔊' : '🔇', { fontSize: '26px' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    snd.on('pointerup', () => { Save.set('sound', !Sfx.enabled()); snd.setText(Sfx.enabled() ? '🔊' : '🔇'); Sfx.init(); Sfx.tap(); });

    // Pantalla completa (Android y PC; en iPhone se consigue instalando la app en la pantalla de inicio)
    if (this.scale.fullscreen.available) {
      const fs = this.add.text(80, 48, '⛶', { fontSize: '26px', color: CSS.grey }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      fs.on('pointerup', () => { if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen(); });
    }

    // Título
    this.add.text(W / 2, 120, 'SAFETOP', {
      fontFamily: FONT, fontSize: '66px', fontStyle: 'bold', color: CSS.orange
    }).setOrigin(0.5);
    this.add.text(W / 2, 172, 'A R C A D E', {
      fontFamily: FONT, fontSize: '30px', fontStyle: 'bold', color: CSS.white
    }).setOrigin(0.5);
    this.add.text(W / 2, 208, 'Protege a tu equipo. Bate tu récord.', {
      fontFamily: FONT, fontSize: '17px', color: CSS.grey
    }).setOrigin(0.5);

    // Operario que saluda
    const w = this.add.image(60, 305, 'worker_harness').setScale(0.9);
    this.tweens.add({ targets: w, y: 298, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Panel de misiones
    const mp = this.add.graphics();
    mp.fillStyle(BRAND.navy2); mp.fillRoundedRect(110, 232, 410, 142, 16);
    this.add.text(128, 244, '🎯 MISIONES', { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: CSS.orange });
    Missions.active().forEach((m, i) => {
      const y = 275 + i * 32;
      const pct = Math.min(1, m.value / m.target);
      this.add.text(128, y, m.text, { fontFamily: FONT, fontSize: '13px', color: CSS.white }).setOrigin(0, 0.5);
      const bar = this.add.graphics();
      bar.fillStyle(0x0f1a2b); bar.fillRoundedRect(128, y + 10, 300, 6, 3);
      bar.fillStyle(BRAND.green); bar.fillRoundedRect(128, y + 10, Math.max(6, 300 * pct), 6, 3);
      this.add.text(505, y - 6, Math.min(m.value, m.target) + '/' + m.target, { fontFamily: FONT, fontSize: '11px', color: CSS.grey }).setOrigin(1, 0.5);
      this.add.text(505, y + 9, '+' + m.reward, { fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color: CSS.yellow }).setOrigin(1, 0.5);
    });

    // Tarjetas de los 4 modos
    const cardW = 480, cardH = 96, startY = 436, gap = 12;
    makePanelTexture(this, 'card', cardW, cardH, BRAND.navy2, 20);

    GAME_MODES.forEach((mode, i) => {
      const y = startY + i * (cardH + gap);
      const card = this.add.image(W / 2, y, 'card').setInteractive({ useHandCursor: true });
      const left = W / 2 - cardW / 2;

      this.add.text(left + 22, y, mode.emoji, { fontSize: '42px' }).setOrigin(0, 0.5);
      this.add.text(left + 88, y - 20, mode.title.toUpperCase(), {
        fontFamily: FONT, fontSize: '23px', fontStyle: 'bold', color: CSS.white
      }).setOrigin(0, 0.5);
      this.add.text(left + 88, y + 14, mode.desc, {
        fontFamily: FONT, fontSize: '13px', color: CSS.grey, wordWrap: { width: 290 }
      }).setOrigin(0, 0.5);

      const best = Save.get('best_' + mode.key, 0);
      this.add.text(left + cardW - 20, y - 18, '▶', { fontFamily: FONT, fontSize: '28px', color: CSS.orange }).setOrigin(1, 0.5);
      this.add.text(left + cardW - 20, y + 18, 'Récord ' + best, { fontFamily: FONT, fontSize: '13px', color: CSS.yellow }).setOrigin(1, 0.5);

      card.on('pointerdown', () => card.setScale(0.97));
      card.on('pointerup', () => { card.setScale(1); Sfx.init(); Sfx.tap(); this.scene.start(mode.key); });
      card.on('pointerout', () => card.setScale(1));
    });

    // Almacén EPI
    makeButton(this, W / 2, 884, 300, 60, '🏬  ALMACÉN EPI', BRAND.orange, () => this.scene.start('Almacen'), 22);

    this.add.text(W / 2, H - 22, 'Safetop · Asegurando la salud de tu equipo desde 1989', {
      fontFamily: FONT, fontSize: '12px', color: '#4a5670'
    }).setOrigin(0.5);
  }
}
