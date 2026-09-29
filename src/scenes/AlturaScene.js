// ============================================================
//  ALTURA — modo arneses
//  Sube por el andamio tocando la tabla a la que quieres
//  saltar. Las tablas agrietadas se rompen: si estás anclado
//  el arnés te salva; si no, caes. El polvo sube desde abajo.
//  Teclado: ← ↑ → para saltar, ESPACIO para anclar.
// ============================================================

class AlturaScene extends Phaser.Scene {
  constructor() { super('Altura'); }

  create() {
    const C = ALTURA_CONFIG;
    this.cameras.main.setBackgroundColor(BRAND.navy);
    this.lanesX = [110, 270, 430];
    this.groundY = 800;
    this.rows = {};
    this.row = 0; this.lane = 1;
    this.state = 'idle';
    this.score = 0;
    this.anchored = false;
    this.anchorRow = -99;
    this.anchorPoint = null;
    this.anchorRowsTotal = C.anchorRows + (Wallet.has('kutang') ? 3 : 0);
    this.retractilLeft = Wallet.has('retractil') ? 1 : 0;
    this.dangerY = this.groundY + 140;
    this.running = false;
    this.maxRow = 0;

    this.makeTextures();
    this.drawBackground();

    // Andamio: se generan filas por delante del jugador
    this.rowLayer = this.add.layer().setDepth(2);
    for (let r = 0; r <= 8; r++) this.makeRow(r);

    // Jugador
    this.player = this.add.image(this.lanesX[1], this.groundY, 'worker_harness').setOrigin(0.5, 1).setDepth(6).setScale(0.8);
    this.rope = this.add.graphics().setDepth(5);
    this.dust = this.add.graphics().setDepth(8);

    this.drawHud();
    this.cameras.main.scrollY = 0;

    // Teclado
    this.input.keyboard.on('keydown-LEFT',  () => this.tryJump(this.lane - 1));
    this.input.keyboard.on('keydown-UP',    () => this.tryJump(this.lane));
    this.input.keyboard.on('keydown-RIGHT', () => this.tryJump(this.lane + 1));
    this.input.keyboard.on('keydown-SPACE', () => this.tryAnchor());

    showTutorial(this, 'Altura', '🪢 ALTURA',
      'Toca la tabla del piso de arriba a la que quieres saltar.\n\nLas tablas agrietadas ⚠️ se rompen. Si estás anclado, el arnés Safetop te salva; si no, caes.\n\nAncla en las anillas 🟠 para ir seguro. ¡Y no dejes que el polvo te alcance!',
      () => {
        this.running = true;
        if (Wallet.has('kailas')) this.setAnchored(0, { x: this.lanesX[1], y: this.groundY - 30 });
      });
  }

  // ---------- Texturas propias ----------
  makeTextures() {
    if (!this.textures.exists('plank')) {
      const g = this.add.graphics();
      g.fillStyle(0xb07a3a); g.fillRoundedRect(0, 0, 130, 22, 4);
      g.fillStyle(0x8a5a2b); g.fillRect(0, 16, 130, 6);
      g.fillStyle(0x6a4420); g.fillRect(20, 4, 3, 10); g.fillRect(107, 4, 3, 10);
      g.generateTexture('plank', 130, 22); g.destroy();
    }
    if (!this.textures.exists('plank_cracked')) {
      const g = this.add.graphics();
      g.fillStyle(0x8f6430); g.fillRoundedRect(0, 0, 130, 22, 4);
      g.fillStyle(0x6a4420); g.fillRect(0, 16, 130, 6);
      g.lineStyle(2, 0x2b1a0a);
      g.lineBetween(50, 0, 62, 12); g.lineBetween(62, 12, 56, 22); g.lineBetween(62, 12, 78, 8);
      g.lineBetween(95, 22, 102, 10); g.lineBetween(102, 10, 112, 14);
      g.generateTexture('plank_cracked', 130, 22); g.destroy();
    }
    if (!this.textures.exists('anchor_ring')) {
      const g = this.add.graphics();
      g.lineStyle(6, BRAND.orange); g.strokeCircle(18, 18, 12);
      g.fillStyle(0x9aa7bd); g.fillRect(12, 28, 12, 8);
      g.generateTexture('anchor_ring', 36, 40); g.destroy();
    }
  }

  drawBackground() {
    // cielo con degradado (rectángulos apilados) y postes del andamio
    this.bg = this.add.graphics().setDepth(0).setScrollFactor(0);
    for (let i = 0; i < 12; i++) {
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0x0f1a2b), Phaser.Display.Color.ValueToColor(0x2a4a7a), 12, i);
      this.bg.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b));
      this.bg.fillRect(0, i * 80, W, 80);
    }
    // Postes verticales: un tileSprite que se mueve con la cámara
    if (!this.textures.exists('poles')) {
      const g = this.add.graphics();
      g.fillStyle(0x9aa7bd); [30, 190, 350, 510].forEach(x => g.fillRect(x - 5, 0, 10, 120));
      g.fillStyle(0x6c7a93); [30, 190, 350, 510].forEach(x => g.fillRect(x - 5, 0, 10, 6));
      g.generateTexture('poles', W, 120); g.destroy();
    }
    this.poles = this.add.tileSprite(W / 2, H / 2, W, H, 'poles').setDepth(1).setScrollFactor(0).setAlpha(0.7);
  }

  drawHud() {
    this.add.rectangle(W / 2, 55, W, 110, BRAND.navy).setScrollFactor(0).setDepth(19);
    this.scoreText = this.add.text(20, 28, '0', { fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: CSS.white }).setScrollFactor(0).setDepth(20);
    this.heightText = this.add.text(20, 74, 'Piso 0', { fontFamily: FONT, fontSize: '18px', color: CSS.grey }).setScrollFactor(0).setDepth(20);
    this.anchorText = this.add.text(W / 2 - 20, 48, 'SIN ANCLAR', { fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: CSS.red }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    const bar = makeTopBar(this, { coins: false });
    bar.exit.setScrollFactor(0);
    makeHelpButton(this, '🪢 ALTURA', 'Toca la tabla a la que quieres saltar (solo el piso de arriba).\n\n⚠️ Tabla agrietada = se rompe.\n🟠 Anilla = toca ANCLAR para ir seguro durante ' + this.anchorRowsTotal + ' pisos.\n\nEl polvo sube: ¡no te pares!').setScrollFactor(0);

    // Botón de anclar (aparece solo cuando hay anilla)
    this.anchorBtn = makeButton(this, W / 2, 890, 320, 64, '🔗 ANCLAR ARNÉS', BRAND.orange, () => this.tryAnchor(), 24);
    this.anchorBtn.img.setScrollFactor(0).setDepth(20); this.anchorBtn.txt.setScrollFactor(0).setDepth(21);
    this.anchorBtn.img.setVisible(false); this.anchorBtn.txt.setVisible(false);
    this.anchorProgress = this.add.graphics().setScrollFactor(0).setDepth(22);
  }

  // ---------- Filas del andamio ----------
  rowY(r) { return this.groundY - r * ALTURA_CONFIG.rowHeight; }

  makeRow(r) {
    if (this.rows[r]) return;
    const planks = [];
    if (r === 0) {
      // suelo: tabla completa
      const s = this.add.image(W / 2, this.groundY, 'plank').setOrigin(0.5, 0).setDisplaySize(W, 22);
      this.rowLayer.add(s);
      this.rows[r] = { planks: [{ lane: 0, sprite: s }, { lane: 1, sprite: s }, { lane: 2, sprite: s }], objs: [s] };
      return;
    }
    const crackProb = Math.min(0.45, 0.10 + r * 0.005);
    const count = r < 8 ? Phaser.Math.Between(2, 3) : Phaser.Math.Between(1, 3);
    const lanes = Phaser.Utils.Array.Shuffle([0, 1, 2]).slice(0, count);
    const objs = [];
    lanes.forEach(l => planks.push({ lane: l, cracked: Math.random() < crackProb }));
    // al menos una tabla sana
    if (planks.every(p => p.cracked)) Phaser.Utils.Array.GetRandom(planks).cracked = false;
    // anilla de anclaje cada N pisos, en una tabla sana
    const isAnchorRow = r % ALTURA_CONFIG.anchorEvery === 0;
    if (isAnchorRow) Phaser.Utils.Array.GetRandom(planks.filter(p => !p.cracked)).anchor = true;
    // Safecoin de puntos en algunas filas
    const coinPlank = (!isAnchorRow && Math.random() < 0.25) ? Phaser.Utils.Array.GetRandom(planks.filter(p => !p.cracked)) : null;

    // travesaño horizontal
    const bar = this.add.rectangle(W / 2, this.rowY(r) + 40, W - 40, 6, 0x6c7a93).setDepth(1);
    objs.push(bar);

    planks.forEach(p => {
      const x = this.lanesX[p.lane], y = this.rowY(r);
      p.sprite = this.add.image(x, y, p.cracked ? 'plank_cracked' : 'plank').setOrigin(0.5, 0);
      p.sprite.setInteractive(new Phaser.Geom.Rectangle(-15, -70, 160, 110), Phaser.Geom.Rectangle.Contains);
      p.sprite.on('pointerdown', () => { if (this.row === r - 1) this.tryJump(p.lane, r); });
      this.rowLayer.add(p.sprite);
      objs.push(p.sprite);
      if (p.cracked) { p.warn = this.add.text(x + 45, y - 14, '⚠️', { fontSize: '16px' }).setOrigin(0.5).setDepth(3); objs.push(p.warn); }
      if (p.anchor) {
        p.ring = this.add.image(x - 40, y - 26, 'anchor_ring').setDepth(3);
        this.tweens.add({ targets: p.ring, scale: { from: 1, to: 1.15 }, duration: 500, yoyo: true, repeat: -1 });
        objs.push(p.ring);
      }
      if (p === coinPlank) { p.coin = this.add.image(x, y - 40, 'safecoin').setScale(0.7).setDepth(3); objs.push(p.coin); }
    });
    this.rows[r] = { planks, objs };
  }

  plankAt(r, lane) { return this.rows[r] && this.rows[r].planks.find(p => p.lane === lane); }

  // ---------- Movimiento ----------
  tryJump(lane, targetRow) {
    if (!this.running || this.state !== 'idle') return;
    if (lane < 0 || lane > 2) return;
    const r = targetRow || this.row + 1;
    if (r !== this.row + 1) return;
    const p = this.plankAt(r, lane);
    if (!p) return;
    this.state = 'jumping';
    Sfx.jump();
    const fromX = this.player.x, fromY = this.player.y;
    const toX = this.lanesX[lane], toY = this.rowY(r);
    this.player.setFlipX(toX < fromX);
    this.tweens.addCounter({
      from: 0, to: 1, duration: 320, ease: 'Sine.out',
      onUpdate: t => {
        const k = t.getValue();
        this.player.x = fromX + (toX - fromX) * k;
        this.player.y = fromY + (toY - fromY) * k - Math.sin(k * Math.PI) * 90;
      },
      onComplete: () => this.land(r, lane, p)
    });
  }

  land(r, lane, p) {
    const prevRow = this.row, prevLane = this.lane;
    this.row = r; this.lane = lane;
    this.player.x = this.lanesX[lane]; this.player.y = this.rowY(r);
    if (p.coin) { p.coin.destroy(); p.coin = null; this.score += 50; Sfx.coin(); floatText(this, this.player.x, this.player.y - 120, '+50', CSS.yellow, 24); }

    if (p.cracked) { this.breakPlank(p, prevRow, prevLane); return; }

    if (r > this.maxRow) { this.maxRow = r; this.score += ALTURA_CONFIG.pointsPerRow; }
    if (this.anchored && r - this.anchorRow >= this.anchorRowsTotal) {
      this.anchored = false; this.anchorPoint = null; this.rope.clear();
      toast(this, 'Anclaje agotado\nBusca otra anilla 🟠', 300, 0x8a2b2b);
    }
    for (let k = r + 1; k <= r + 8; k++) this.makeRow(k);
    this.cleanupRows();
    this.refreshHud();
    this.state = 'idle';
  }

  breakPlank(p, prevRow, prevLane) {
    // la tabla se parte
    this.tweens.add({ targets: p.sprite, angle: 25, y: p.sprite.y + 300, alpha: 0, duration: 600, ease: 'Quad.in' });
    if (p.warn) p.warn.destroy();
    p.sprite.disableInteractive();
    this.rows[this.row].planks = this.rows[this.row].planks.filter(q => q !== p);
    this.cameras.main.shake(150, 0.008);

    const saved = this.anchored || this.retractilLeft > 0;
    if (!saved) { this.fall(); return; }

    let msg;
    if (this.anchored) { msg = '¡El arnés te ha salvado!'; this.anchored = false; this.anchorPoint = null; this.rope.clear(); }
    else { msg = '¡El RETRÁCTIL te ha salvado!'; this.retractilLeft--; }
    Sfx.anchor();
    floatText(this, W / 2, this.player.y - 160, msg, CSS.green, 24);
    // vuelve a la tabla anterior colgando
    this.state = 'jumping';
    const toX = this.lanesX[prevLane], toY = this.rowY(prevRow);
    this.tweens.add({ targets: this.player, y: toY + 40, duration: 250, ease: 'Quad.in', onComplete: () => {
      this.tweens.add({ targets: this.player, x: toX, y: toY, duration: 350, ease: 'Sine.inOut', onComplete: () => {
        this.row = prevRow; this.lane = prevLane; this.state = 'idle'; this.refreshHud();
      } });
    } });
  }

  fall() {
    this.state = 'dead'; this.running = false;
    Sfx.over();
    this.tweens.add({ targets: this.player, y: this.player.y + 900, angle: 180, duration: 900, ease: 'Quad.in' });
    this.time.delayedCall(900, () => this.scene.start('GameOver', { score: this.score, mode: 'Altura', stat: 'Has caído sin anclaje · Piso ' + this.maxRow }));
  }

  // ---------- Anclaje ----------
  tryAnchor() {
    if (!this.running || this.state !== 'idle' || this.anchored) return;
    const p = this.plankAt(this.row, this.lane);
    if (!p || !p.anchor) return;
    const point = { x: p.ring.x, y: p.ring.y };
    if (Wallet.has('aracar')) { this.setAnchored(this.row, point); return; }
    this.state = 'anchoring';
    const start = this.time.now, dur = ALTURA_CONFIG.anchorTime;
    const ev = this.time.addEvent({ delay: 16, loop: true, callback: () => {
      const k = Math.min(1, (this.time.now - start) / dur);
      this.anchorProgress.clear();
      this.anchorProgress.fillStyle(BRAND.green); this.anchorProgress.fillRoundedRect(W / 2 - 160, 926, 320 * k, 6, 3);
      if (k >= 1) { ev.remove(); this.anchorProgress.clear(); this.state = 'idle'; this.setAnchored(this.row, point); }
    } });
  }

  setAnchored(row, point) {
    this.anchored = true; this.anchorRow = row; this.anchorPoint = point;
    this.score += 30;
    Sfx.anchor();
    floatText(this, W / 2, this.player.y - 150, 'ANCLADO +30', CSS.green, 24);
    this.refreshHud();
  }

  // ---------- Bucle ----------
  update(time, delta) {
    if (!this.running && this.state !== 'dead') return;
    const dt = delta / 1000;

    // cámara sigue al jugador
    const target = this.player.y - 560;
    const cam = this.cameras.main;
    cam.scrollY += (target - cam.scrollY) * 0.1;
    this.poles.tilePositionY = cam.scrollY;

    if (this.running) {
      // el polvo sube; más rápido cuanto más lejos esté del jugador
      const C = ALTURA_CONFIG;
      let speed = Math.min(C.dangerSpeedMax, C.dangerSpeedStart + this.maxRow * 1.2);
      const gap = this.dangerY - this.player.y;
      if (gap > 700) speed *= 2.5;
      this.dangerY -= speed * dt;
      if (this.dangerY <= this.player.y - 40 && this.state !== 'dead') {
        this.state = 'dead'; this.running = false; Sfx.over();
        this.time.delayedCall(600, () => this.scene.start('GameOver', { score: this.score, mode: 'Altura', stat: 'El polvo te ha alcanzado · Piso ' + this.maxRow }));
      }
    }

    // dibujar el polvo
    this.dust.clear();
    const top = this.dangerY;
    this.dust.fillStyle(0x5c6a85, 0.92); this.dust.fillRect(0, top, W, 2000);
    this.dust.fillStyle(0x7d8aa3, 0.9);
    for (let i = 0; i < 8; i++) this.dust.fillCircle(i * 76 + 20, top + Math.sin(time / 400 + i) * 10, 46);

    // cuerda de anclaje
    this.rope.clear();
    if (this.anchored && this.anchorPoint) {
      this.rope.lineStyle(4, BRAND.orange);
      this.rope.lineBetween(this.anchorPoint.x, this.anchorPoint.y, this.player.x, this.player.y - 70);
    }

    // botón de anclar visible solo sobre una anilla
    const p = this.plankAt(this.row, this.lane);
    const show = this.running && this.state === 'idle' && !this.anchored && p && p.anchor;
    this.anchorBtn.img.setVisible(!!show); this.anchorBtn.txt.setVisible(!!show);
  }

  refreshHud() {
    this.scoreText.setText(this.score);
    this.heightText.setText('Piso ' + this.row);
    if (this.anchored) {
      const left = this.anchorRowsTotal - (this.row - this.anchorRow);
      this.anchorText.setText('ANCLADO · ' + left + ' pisos').setColor(CSS.green);
    } else {
      this.anchorText.setText(this.retractilLeft > 0 ? 'SIN ANCLAR (retráctil listo)' : 'SIN ANCLAR').setColor(CSS.red);
    }
  }

  cleanupRows() {
    const minRow = this.row - 6;
    Object.keys(this.rows).forEach(k => {
      if (parseInt(k) < minRow && parseInt(k) > 0) { this.rows[k].objs.forEach(o => o.destroy()); delete this.rows[k]; }
    });
  }
}
