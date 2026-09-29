// ============================================================
//  INSPECTOR — modo respiratoria
//  En cada ronda hay operarios trabajando. Algunos no llevan
//  la protección respiratoria que exige su tarea. Tócalos
//  antes de que se acabe el tiempo. Tocar a uno que va bien
//  protegido resta segundos.
// ============================================================

class InspectorScene extends Phaser.Scene {
  constructor() { super('Inspector'); }

  create() {
    const C = INSPECTOR_CONFIG;
    this.cameras.main.setBackgroundColor(BRAND.navy);
    this.score = 0;
    this.round = 0;
    this.totalFound = 0;
    this.running = false;
    this.roundTime = C.roundTime + (Wallet.has('ffp3') ? 5 : 0);
    this.timeLeft = this.roundTime;
    this.workers = [];
    this.slots = [];
    [300, 470, 640, 810].forEach(y => [110, 270, 430].forEach(x => this.slots.push({ x, y })));

    this.drawBackground();
    this.drawHud();

    showTutorial(this, 'Inspector', '😷 INSPECTOR',
      'Recorre la obra y toca a los operarios que NO llevan la protección respiratoria que exige su tarea.\n\n🪚 🧱 Polvo → mascarilla FFP\n🎨 🧪 Gases y vapores → semimáscara con filtros\n⚡ Soldadura → capucha AIRFLOW\n\nTocar a quien va bien protegido resta ' + C.wrongPenalty + ' s.',
      () => this.nextRound());
  }

  drawBackground() {
    const g = this.add.graphics().setDepth(0);
    // cielo y edificio en obra
    g.fillStyle(0x24406e); g.fillRect(0, 110, W, 750);
    g.fillStyle(0x1a2f52); g.fillRect(0, 860, W, 100);
    // pilares y forjados
    g.fillStyle(0x3b527a);
    [70, 230, 390].forEach(x => g.fillRect(x, 140, 14, 720));
    [310, 480, 650, 820].forEach(y => g.fillRect(0, y, W, 12));
    // grúa
    g.fillStyle(0xffc82e); g.fillRect(500, 120, 8, 740); g.fillRect(300, 120, 240, 8);
    g.lineStyle(2, 0xffc82e); g.lineBetween(420, 128, 420, 200);
    g.fillStyle(0x9aa7bd); g.fillRect(405, 200, 30, 20);
    // franja HUD
    g.fillStyle(BRAND.navy); g.fillRect(0, 0, W, 110);
  }

  drawHud() {
    this.scoreText = this.add.text(20, 28, '0', { fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: CSS.white }).setDepth(20);
    this.roundText = this.add.text(20, 74, 'Ronda 1', { fontFamily: FONT, fontSize: '18px', color: CSS.grey }).setDepth(20);
    this.timerText = this.add.text(W / 2 - 30, 40, '30', { fontFamily: FONT, fontSize: '44px', fontStyle: 'bold', color: CSS.green }).setOrigin(0.5).setDepth(20);
    this.foundText = this.add.text(W / 2 - 30, 80, '', { fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: CSS.yellow }).setOrigin(0.5).setDepth(20);
    makeTopBar(this, { coins: false });
    makeHelpButton(this, '😷 INSPECTOR', 'Toca a los operarios que NO llevan la protección que exige su tarea.\n\n🪚 🧱 ☣️ Polvo → mascarilla FFP\n🎨 🧪 Gases → semimáscara con filtros\n⚡ Soldadura → capucha AIRFLOW\n📋 📏 ☕ No necesitan nada\n\nUna FFP no protege de gases.');

    // Pista (perk AIRFLOW)
    if (Wallet.has('airflow')) {
      this.hintBtn = makeButton(this, W / 2, 910, 220, 50, '💡 PISTA', BRAND.navy2, () => this.useHint(), 18).setDepth(20);
    }
  }

  // ---------- Rondas ----------
  nextRound() {
    const C = INSPECTOR_CONFIG;
    this.round++;
    this.workers.forEach(w => w.objs.forEach(o => o.destroy()));
    this.workers = [];
    this.timeLeft = this.roundTime;
    this.wrongFree = Wallet.has('semi4600');
    this.hintUsed = false;
    if (this.hintBtn) this.hintBtn.img.setAlpha(1);

    const count = Math.min(C.workersMax, C.workersStart + Math.floor((this.round - 1) * 1.2));
    const hazards = Math.min(count - 1, C.hazardsStart + Math.floor((this.round - 1) / 2));
    const slots = Phaser.Utils.Array.Shuffle(this.slots.slice()).slice(0, count);
    const riskActs = ACTIVITIES.filter(a => a.need !== 'none');
    const safeActs = ACTIVITIES.filter(a => a.need === 'none');

    slots.forEach((s, i) => {
      const isHazard = i < hazards;
      let act, wear;
      if (isHazard) {
        act = Phaser.Utils.Array.GetRandom(riskActs);
        // protección insuficiente para esa tarea
        const bad = { ffp: ['none'], semi: ['none', 'ffp'], hood: ['none', 'ffp', 'semi'] }[act.need];
        wear = Phaser.Utils.Array.GetRandom(bad);
      } else if (Math.random() < 0.55) {
        act = Phaser.Utils.Array.GetRandom(riskActs);
        const good = { ffp: ['ffp', 'semi'], semi: ['semi', 'hood'], hood: ['hood'] }[act.need];
        wear = Phaser.Utils.Array.GetRandom(good);
      } else {
        act = Phaser.Utils.Array.GetRandom(safeActs);
        wear = Phaser.Utils.Array.GetRandom(['none', 'none', 'ffp']);
      }
      this.makeWorker(s.x, s.y, act, wear, isHazard);
    });

    this.hazardsLeft = hazards;
    this.roundText.setText('Ronda ' + this.round);
    this.refreshHud();
    this.running = true;
    if (this.round > 1) toast(this, 'RONDA ' + this.round + '\n' + hazards + ' riesgos', 480);

    // perk SEMIMÁSCARA A2P3: los riesgos parpadean 1 s
    if (Wallet.has('semiA2P3')) {
      this.workers.filter(w => w.isHazard).forEach(w => this.tweens.add({ targets: w.sprite, alpha: 0.2, duration: 150, yoyo: true, repeat: 3 }));
    }
  }

  makeWorker(x, y, act, wear, isHazard) {
    const vest = Phaser.Utils.Array.GetRandom(['orange', 'yellow', 'green', 'blue']);
    const sprite = this.add.image(x, y, 'insp_' + vest + '_' + wear).setOrigin(0.5, 1).setScale(0.95).setDepth(3);
    sprite.setInteractive(new Phaser.Geom.Rectangle(-10, -20, 92, 150), Phaser.Geom.Rectangle.Contains);
    const bubble = this.add.graphics().setDepth(4);
    bubble.fillStyle(0xffffff); bubble.fillRoundedRect(x - 26, y - 168, 52, 40, 10); bubble.fillTriangle(x - 6, y - 130, x + 6, y - 130, x, y - 122);
    const emoji = this.add.text(x, y - 148, act.emoji, { fontSize: '26px' }).setOrigin(0.5).setDepth(5);
    const w = { sprite, act, wear, vest, isHazard, found: false, objs: [sprite, bubble, emoji] };
    sprite.on('pointerdown', () => this.tapWorker(w));
    // pequeña animación de "trabajar"
    this.tweens.add({ targets: sprite, y: y - 3, duration: 400 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.workers.push(w);
    return w;
  }

  tapWorker(w) {
    if (!this.running || w.found) return;
    const x = w.sprite.x, y = w.sprite.y - 190;
    if (w.isHazard) {
      w.found = true;
      this.hazardsLeft--;
      this.totalFound++;
      const pts = INSPECTOR_CONFIG.pointsPerHazard;
      this.score += pts;
      Sfx.ok();
      // el operario recibe el EPI correcto
      const fixWear = w.act.need;
      w.sprite.setTexture('insp_' + w.vest + '_' + fixWear);
      const tag = this.add.text(x, y + 40, '✅ ' + w.act.fix, { fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: CSS.navy, backgroundColor: '#3ddc84', padding: { x: 5, y: 3 } }).setOrigin(0.5).setDepth(6);
      w.objs.push(tag);
      floatText(this, x, y, '+' + pts, CSS.green, 26);
      burst(this, x, y + 90, BRAND.green, 16);
      this.refreshHud();
      if (this.hazardsLeft <= 0) this.roundClear();
    } else {
      const reason = w.act.need === 'none' ? w.act.label + ': no necesita protección' : 'Va bien protegido (' + WEAR_LABEL[w.wear] + ')';
      if (this.wrongFree) {
        this.wrongFree = false;
        floatText(this, x, y, reason + '\nSEMIMÁSCARA 4600 te perdona', CSS.yellow, 14);
      } else {
        this.timeLeft -= INSPECTOR_CONFIG.wrongPenalty;
        Sfx.fail();
        this.cameras.main.shake(120, 0.006);
        floatText(this, x, y, '-' + INSPECTOR_CONFIG.wrongPenalty + ' s\n' + reason, CSS.red, 14);
      }
    }
  }

  useHint() {
    if (!this.running || this.hintUsed) return;
    const h = this.workers.find(w => w.isHazard && !w.found);
    if (!h) return;
    this.hintUsed = true;
    this.hintBtn.img.setAlpha(0.4);
    Sfx.tap();
    const ring = this.add.circle(h.sprite.x, h.sprite.y - 60, 70).setStrokeStyle(5, BRAND.yellow).setDepth(7);
    this.tweens.add({ targets: ring, scale: 1.3, alpha: 0, duration: 900, repeat: 2, onComplete: () => ring.destroy() });
  }

  roundClear() {
    this.running = false;
    const bonus = Math.max(0, Math.floor(this.timeLeft)) * 10;
    this.score += bonus;
    Sfx.level();
    toast(this, '¡OBRA SEGURA!\nBono de tiempo +' + bonus, 480, 0x1b7a4f);
    this.refreshHud();
    this.time.delayedCall(1600, () => this.nextRound());
  }

  update(time, delta) {
    if (!this.running) return;
    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) { this.timeLeft = 0; this.gameOver(); }
    this.refreshHud();
  }

  refreshHud() {
    this.scoreText.setText(this.score);
    const t = Math.ceil(this.timeLeft);
    this.timerText.setText(t).setColor(t > 10 ? CSS.green : t > 5 ? CSS.yellow : CSS.red);
    this.foundText.setText('Riesgos: ' + this.hazardsLeft + ' por encontrar');
  }

  gameOver() {
    this.running = false;
    Sfx.over();
    // revela los que faltaban
    this.workers.filter(w => w.isHazard && !w.found).forEach(w => {
      const t = this.add.text(w.sprite.x, w.sprite.y - 150, '❌ ' + w.act.fix, { fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: CSS.white, backgroundColor: '#ff4d4d', padding: { x: 5, y: 3 } }).setOrigin(0.5).setDepth(6);
      w.objs.push(t);
    });
    this.time.delayedCall(1800, () => this.scene.start('GameOver', { score: this.score, mode: 'Inspector', stat: 'Rondas: ' + this.round + ' · Riesgos detectados: ' + this.totalFound, stats: { hazards: this.totalFound, rounds: this.round - 1 } }));
  }
}
