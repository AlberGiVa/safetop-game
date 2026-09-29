// ============================================================
//  ZONA SEGURA — modo guantes
//  Llegan operarios con un trabajo. Toca el guante que le
//  protege antes de que se agote su paciencia.
//  Teclado: 1-6 para los guantes.
// ============================================================

class ZonaSeguraScene extends Phaser.Scene {
  constructor() { super('ZonaSegura'); }

  create() {
    const C = ZONA_SEGURA_CONFIG;
    this.cameras.main.setBackgroundColor(BRAND.navy);

    // ---- Estado ----
    this.score = 0;
    this.combo = 1;
    this.lives = C.livesStart + (Wallet.has('g131ky') ? 1 : 0) + (Wallet.has('polysafed') ? 1 : 0);
    this.maxLives = this.lives;
    this.served = 0;
    this.level = 1;
    this.unlocked = C.glovesAtStart + (Wallet.has('tactylux') ? 1 : 0);
    this.queue = [];
    this.front = null;
    this.busy = false;
    this.running = false;
    this.lastTask = null;
    this.comboShield = Wallet.has('xalo');   // perk XALO
    this.patienceMult = (Wallet.has('terrytop') ? 1.15 : 1) * (Wallet.has('4d') ? 1.10 : 1);   // perks TERRYTOP y 4-D

    this.drawScenery();
    this.drawHud();
    this.drawGloveButtons();

    for (let i = 0; i < 3; i++) this.spawnWorker(i);

    // Teclado
    this.input.keyboard.on('keydown', e => {
      const n = parseInt(e.key);
      if (n >= 1 && n <= 6 && this.gloveButtons[n - 1].unlockedState) this.onGlove(GLOVES[n - 1]);
    });

    showTutorial(this, 'ZonaSegura', '🧤 ZONA SEGURA',
      'Cada operario llega a la caseta con un trabajo.\n\nToca el guante Safetop que le protege antes de que se agote su paciencia.\n\nAcierta seguido para multiplicar puntos. Cada nivel desbloquea un guante nuevo.',
      () => this.startRound());
  }

  // ---------- Escenario ----------
  drawScenery() {
    const g = this.add.graphics();
    g.fillStyle(0x1c2d4f); g.fillRect(0, 110, W, 400);
    // ventana
    g.fillStyle(0x6fb7e8); g.fillRoundedRect(380, 150, 130, 100, 10);
    g.fillStyle(0xffffff, 0.8); g.fillCircle(420, 190, 14); g.fillCircle(438, 184, 18); g.fillCircle(458, 192, 13);
    g.fillStyle(0x1c2d4f); g.fillRect(443, 150, 6, 100); g.fillRect(380, 197, 130, 6);
    // cartel
    g.fillStyle(BRAND.orange); g.fillRoundedRect(40, 150, 210, 60, 8);
    this.add.text(145, 180, 'CASETA EPI', { fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: CSS.white }).setOrigin(0.5);
    // estantería con guantes de fondo
    g.fillStyle(0x15233f); g.fillRoundedRect(300, 260, 220, 120, 6);
    g.fillStyle(0x2c3e66); g.fillRect(300, 300, 220, 4); g.fillRect(300, 340, 220, 4);
    // suelo y mostrador
    g.fillStyle(0x233a63); g.fillRect(0, 510, W, 100);
    const m = this.add.graphics().setDepth(5);
    m.fillStyle(0x8a5a2b); m.fillRect(0, 500, W, 22);
    m.fillStyle(0x6a4420); m.fillRect(0, 522, W, 60);
    for (let i = 0; i < 13; i++) { m.fillStyle(i % 2 === 0 ? BRAND.yellow : 0x111111); m.fillRect(i * 44, 574, 44, 8); }
  }

  // ---------- HUD ----------
  drawHud() {
    this.scoreText = this.add.text(20, 28, '0', { fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: CSS.white }).setDepth(20);
    this.comboText = this.add.text(20, 74, '', { fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: CSS.yellow }).setDepth(20);
    this.levelText = this.add.text(W / 2 - 30, 48, 'NIVEL 1', { fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: CSS.grey }).setOrigin(0.5).setDepth(20);
    this.lifeIcons = [];
    for (let i = 0; i < this.maxLives; i++) {
      this.lifeIcons.push(this.add.text(W / 2 + 60 + i * 30, 48, '⛑️', { fontSize: '24px' }).setOrigin(0.5).setDepth(20));
    }
    makeTopBar(this, { coins: false });
    makeHelpButton(this, '🧤 ZONA SEGURA', 'Toca el guante que protege del trabajo que trae cada operario.\n\n' +
      GLOVES.map(g => TASKS[g.task].emoji + ' ' + TASKS[g.task].label + ' → ' + g.name).join('\n'));
  }

  // ---------- Botones de guantes ----------
  drawGloveButtons() {
    const cols = 3, bw = 160, bh = 150;
    const xs = [95, 270, 445], ys = [690, 850];
    makePanelTexture(this, 'glovebtn', bw, bh, BRAND.navy2, 18);
    makePanelTexture(this, 'glovebtn_locked', bw, bh, 0x131f36, 18);

    this.gloveButtons = GLOVES.map((glove, i) => {
      const x = xs[i % cols], y = ys[Math.floor(i / cols)];
      const c = this.add.container(x, y).setDepth(10);
      const panel = this.add.image(0, 0, 'glovebtn');
      const img = productImage(this, 0, -22, glove.id, 72);
      const name = this.add.text(0, 36, glove.name, { fontFamily: FONT, fontSize: '15px', fontStyle: 'bold', color: CSS.white }).setOrigin(0.5);
      const desc = this.add.text(0, 56, TASKS[glove.task].emoji + ' ' + TASKS[glove.task].label, { fontFamily: FONT, fontSize: '11px', color: CSS.grey }).setOrigin(0.5);
      const num = this.add.text(-68, -62, String(i + 1), { fontFamily: FONT, fontSize: '12px', color: CSS.dim });
      const lock = this.add.text(0, 0, '🔒', { fontSize: '40px' }).setOrigin(0.5);
      c.add([panel, img, name, desc, num, lock]);

      panel.setInteractive({ useHandCursor: true });
      panel.on('pointerdown', () => { if (c.unlockedState) c.setScale(0.93); });
      panel.on('pointerup', () => { c.setScale(1); if (c.unlockedState) this.onGlove(glove); });
      panel.on('pointerout', () => c.setScale(1));

      Object.assign(c, { panel, img, name, desc, lock });
      this.setGloveUnlocked(c, i < this.unlocked, false);
      return c;
    });
  }

  setGloveUnlocked(c, unlocked, animate) {
    c.unlockedState = unlocked;
    c.panel.setTexture(unlocked ? 'glovebtn' : 'glovebtn_locked');
    c.img.setVisible(unlocked); c.name.setVisible(unlocked); c.desc.setVisible(unlocked);
    c.lock.setVisible(!unlocked);
    if (unlocked && animate) {
      c.setScale(0.5);
      this.tweens.add({ targets: c, scale: 1, duration: 500, ease: 'Back.out' });
    }
  }

  // ---------- Operarios ----------
  queueX(i) { return 200 + i * 130; }

  spawnWorker(pos) {
    const tasks = GLOVES.slice(0, this.unlocked).map(g => g.task);
    let task;
    do { task = Phaser.Utils.Array.GetRandom(tasks); } while (tasks.length > 1 && task === this.lastTask && Math.random() < 0.7);
    this.lastTask = task;
    const vip = this.level >= 2 && Math.random() < 0.12;
    const skin = vip ? 'worker_vip' : Phaser.Utils.Array.GetRandom(['worker_orange', 'worker_yellow', 'worker_green']);
    const sprite = this.add.image(W + 80, 440, skin).setDepth(3 - pos * 0.1);
    const worker = { sprite, task, vip, bubble: null, patience: 0, patienceMax: 0 };
    if (vip) { worker.star = this.add.text(W + 80, 350, '⭐', { fontSize: '24px' }).setOrigin(0.5).setDepth(4); this.tweens.add({ targets: worker.star, x: this.queueX(pos), duration: 450, ease: 'Quad.out' }); }
    this.queue.push(worker);
    this.tweens.add({ targets: sprite, x: this.queueX(pos), duration: 450, ease: 'Quad.out' });
    return worker;
  }

  startRound() { this.running = true; this.setFront(); }

  patienceForLevel() {
    const C = ZONA_SEGURA_CONFIG;
    return Math.max(C.patienceMin, C.patienceStart - (this.level - 1) * C.patienceStep) * this.patienceMult;
  }

  setFront() {
    this.front = this.queue[0];
    if (!this.front) return;
    const w = this.front;
    w.patienceMax = this.patienceForLevel() * (w.vip ? 0.6 : 1);
    w.patience = w.patienceMax;
    const t = TASKS[w.task];
    const b = this.add.container(200, 300).setDepth(8);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff); bg.fillRoundedRect(-95, -60, 190, 120, 18); bg.fillTriangle(-16, 58, 16, 58, 0, 80);
    const emoji = this.add.text(0, -18, t.emoji, { fontSize: '54px' }).setOrigin(0.5);
    const label = this.add.text(0, 32, (w.vip ? '⭐ x3 · ' : '') + t.label, { fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: w.vip ? '#b8860b' : CSS.navy2 }).setOrigin(0.5);
    const barBg = this.add.graphics(); barBg.fillStyle(0xdde3ee); barBg.fillRoundedRect(-80, 46, 160, 8, 4);
    const bar = this.add.graphics();
    b.add([bg, emoji, label, barBg, bar]);
    b.bar = bar; b.setScale(0);
    this.tweens.add({ targets: b, scale: 1, duration: 300, ease: 'Back.out' });
    w.bubble = b;
    this.busy = false;
  }

  update(time, delta) {
    if (this.running && this.needFront) { this.needFront = false; this.setFront(); }
    if (!this.running || !this.front || this.busy) return;
    const w = this.front;
    w.patience -= delta;
    const ratio = Math.max(0, w.patience / w.patienceMax);
    const bar = w.bubble.bar;
    bar.clear();
    bar.fillStyle(ratio > 0.5 ? BRAND.green : ratio > 0.25 ? BRAND.yellow : BRAND.red);
    bar.fillRoundedRect(-80, 46, Math.max(4, 160 * ratio), 8, 4);
    if (ratio < 0.25) w.sprite.x = this.queueX(0) + Math.sin(time / 30) * 3;
    if (w.patience <= 0) this.fail(w, '¡Se ha ido sin protección!');
  }

  // ---------- Acciones ----------
  onGlove(glove) {
    if (!this.running || !this.front || this.busy) return;
    const w = this.front;
    if (glove.task === w.task) this.success(w, glove);
    else this.fail(w, 'Necesitaba ' + GLOVES.find(g => g.task === w.task).name);
  }

  success(w, glove) {
    this.busy = true;
    const C = ZONA_SEGURA_CONFIG;
    let pts = C.pointsBase * this.combo;
    if (glove.task === 'corte' && Wallet.has('gripcut')) pts *= 2;    // perk GRIPCUT
    if (glove.task === 'calor' && Wallet.has('tornolux')) pts *= 2;   // perk TORNOLUX-N
    if (w.vip) pts *= 3;
    this.score += pts;
    this.served++;
    Sfx.ok();
    floatText(this, 200, 250, '+' + pts + (this.combo > 1 ? '  x' + this.combo : ''), CSS.green);
    burst(this, w.sprite.x, 420, BRAND.green, 16);
    this.combo = Math.min(C.comboMax, this.combo + 1);
    this.maxCombo = Math.max(this.maxCombo || 1, this.combo);
    if (Wallet.has('xalo') && this.served % 5 === 0) this.comboShield = true;
    this.refreshHud();

    const gimg = productImage(this, w.sprite.x, 440, glove.id, 54).setDepth(9);
    this.tweens.add({ targets: gimg, y: 400, alpha: 0, duration: 500, onComplete: () => gimg.destroy() });
    w.bubble.destroy();
    if (w.star) w.star.destroy();
    this.tweens.add({ targets: w.sprite, x: -100, duration: 450, ease: 'Quad.in', onComplete: () => w.sprite.destroy() });

    if (this.served % C.servedPerLevel === 0) this.levelUp();
    this.nextWorker();
  }

  fail(w, msg) {
    this.busy = true;
    this.lives--;
    if (this.comboShield && this.combo > 1) {
      this.comboShield = false;
      floatText(this, 200, 200, 'XALO salva el combo', CSS.yellow, 16);
    } else {
      this.combo = 1;
    }
    Sfx.fail();
    this.cameras.main.shake(200, 0.01);
    floatText(this, 200, 250, msg, CSS.red, 18);
    this.refreshHud();

    w.bubble.destroy();
    if (w.star) w.star.destroy();
    const face = this.add.text(w.sprite.x, 400, '😰', { fontSize: '40px' }).setOrigin(0.5).setDepth(9);
    this.tweens.add({ targets: [w.sprite, face], x: -100, duration: 500, ease: 'Quad.in', onComplete: () => { w.sprite.destroy(); face.destroy(); } });

    if (this.lives <= 0) { this.gameOver(); return; }
    this.nextWorker();
  }

  nextWorker() {
    this.queue.shift();
    this.queue.forEach((w, i) => this.tweens.add({ targets: w.star ? [w.sprite, w.star] : w.sprite, x: this.queueX(i), duration: 300 }));
    this.spawnWorker(this.queue.length);
    this.front = null;
    this.time.delayedCall(350, () => { this.needFront = true; });
  }

  levelUp() {
    this.level++;
    Sfx.level();
    let msg = '¡NIVEL ' + this.level + '!';
    if (this.unlocked < GLOVES.length) {
      const g = GLOVES[this.unlocked];
      this.unlocked++;
      this.setGloveUnlocked(this.gloveButtons[this.unlocked - 1], true, true);
      msg += '\nNuevo guante: ' + g.name + '\n' + g.norm;
    }
    this.levelText.setText('NIVEL ' + this.level);
    toast(this, msg);
  }

  gameOver() {
    this.running = false;
    Sfx.over();
    this.time.delayedCall(700, () => {
      this.scene.start('GameOver', { score: this.score, mode: 'ZonaSegura', stat: 'Operarios protegidos: ' + this.served + ' · Nivel ' + this.level,
        coinMult: Wallet.has('naturlux') ? 1.10 : 1,
        stats: { served: this.served, combo5: this.maxCombo >= 5 ? 1 : 0, level5: this.level >= 5 ? 1 : 0 } });
    });
  }

  refreshHud() {
    this.scoreText.setText(this.score);
    this.comboText.setText(this.combo > 1 ? 'COMBO x' + this.combo : '');
    this.lifeIcons.forEach((ic, i) => ic.setAlpha(i < this.lives ? 1 : 0.2));
  }
}
