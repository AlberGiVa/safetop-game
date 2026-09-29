// ============================================================
//  TURNO DE TRABAJO — runner infinito
//  Corres por la obra. Toca la mitad izquierda para saltar y
//  la derecha para agacharte. Recoge EPI: cada zona de peligro
//  consume el EPI que la neutraliza. El arnés te salva de un hueco.
//  Teclado: ↑/ESPACIO saltar, ↓ agacharse.
// ============================================================

class RunnerScene extends Phaser.Scene {
  constructor() { super('Runner'); }

  create() {
    const C = RUNNER_CONFIG;
    this.cameras.main.setBackgroundColor(0x24406e);
    this.groundY = 720;
    this.px = 110;
    this.speed = C.speedStart;
    this.distance = 0;
    this.score = 0;
    this.coins = 0;
    this.lives = C.livesStart + (Wallet.has('arsenio') ? 1 : 0);
    this.gear = { mask: false, glasses: Wallet.has('perfekta'), helmet: Wallet.has('sync'), ears: false, harness: false };
    this.objects = [];
    this.pending = [];
    this.nextSpawn = 500;
    this.running = false;
    this.dead = false;
    this.invuln = 0;
    this.py = this.groundY; this.vy = 0; this.onGround = true;
    this.sliding = 0; this.animT = 0; this.frame = 0;
    this.lastZone = null;

    this.makeTextures();
    this.drawBackground();

    this.player = this.add.image(this.px, this.py, this.gearKey(0)).setOrigin(0.5, 1).setDepth(6);
    this.drawHud();

    // Controles táctiles: mitad izquierda salta, derecha se agacha
    this.input.on('pointerdown', p => { if (p.y < 110) return; if (p.x < W / 2) this.jump(); else this.slide(); });
    this.input.keyboard.on('keydown-UP', () => this.jump());
    this.input.keyboard.on('keydown-SPACE', () => this.jump());
    this.input.keyboard.on('keydown-DOWN', () => this.slide());

    showTutorial(this, 'Runner', '🏃 TURNO DE TRABAJO',
      'Toca la IZQUIERDA para saltar y la DERECHA para agacharte.\n\nSalta conos y huecos, agáchate bajo las vigas.\n\nRecoge EPI 😷 🥽 ⛑️ 🎧: cada zona de peligro consume el que te protege. Sin él, te lesionas. El arnés 🪢 te salva de un hueco.',
      () => { this.running = true; });
  }

  // ---------- Texturas ----------
  makeTextures() {
    if (!this.textures.exists('rn_ground')) {
      const g = this.add.graphics();
      g.fillStyle(0x3b527a); g.fillRect(0, 0, 88, 240);
      g.fillStyle(0x6c7a93); g.fillRect(0, 0, 88, 10);
      g.fillStyle(0xffc82e); g.fillRect(0, 10, 44, 6); g.fillStyle(0x111111); g.fillRect(44, 10, 44, 6);
      g.fillStyle(0x2f4468); g.fillRect(10, 40, 30, 20); g.fillRect(50, 90, 30, 20);
      g.generateTexture('rn_ground', 88, 240); g.destroy();
    }
    if (!this.textures.exists('rn_city')) {
      const g = this.add.graphics();
      g.fillStyle(0x1c3560);
      [[0, 120, 90, 300], [110, 60, 70, 360], [200, 160, 120, 260], [340, 90, 80, 330], [440, 140, 100, 280]].forEach(b => g.fillRect(b[0], 420 - b[3], b[2], b[3]));
      g.fillStyle(0x2a4a7a);
      for (let x = 10; x < 540; x += 30) for (let y = 130; y < 400; y += 40) if ((x + y) % 70 < 30) g.fillRect(x, y, 10, 14);
      g.generateTexture('rn_city', 540, 420); g.destroy();
    }
    if (!this.textures.exists('rn_cone')) {
      const g = this.add.graphics();
      g.fillStyle(0xf58220); g.fillTriangle(24, 0, 0, 52, 48, 52);
      g.fillStyle(0xffffff); g.fillRect(12, 26, 24, 8);
      g.fillStyle(0x222222); g.fillRect(0, 50, 48, 6);
      g.generateTexture('rn_cone', 48, 56); g.destroy();
    }
    if (!this.textures.exists('rn_beam')) {
      const g = this.add.graphics();
      g.fillStyle(0x6c7a93); g.fillRect(28, 0, 8, 100); g.fillRect(58, 0, 8, 100);
      g.fillStyle(0xf58220); g.fillRect(0, 100, 94, 30);
      g.fillStyle(0x111111); for (let i = 0; i < 4; i++) g.fillRect(i * 24 + 4, 100, 12, 30);
      g.generateTexture('rn_beam', 94, 130); g.destroy();
    }
  }

  drawBackground() {
    this.city = this.add.tileSprite(W / 2, 470, W, 420, 'rn_city').setDepth(0).setAlpha(0.9);
    this.ground = this.add.tileSprite(W / 2, this.groundY + 120, W, 240, 'rn_ground').setDepth(2);
    // crane
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xffc82e); g.fillRect(470, 120, 10, 400); g.fillRect(200, 120, 300, 8);
    // zonas táctiles
    this.add.text(W * 0.25, 900, '▲ SALTAR', { fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setAlpha(0.35).setDepth(20);
    this.add.text(W * 0.75, 900, '▼ AGACHARSE', { fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setAlpha(0.35).setDepth(20);
    this.add.rectangle(W / 2, 55, W, 110, BRAND.navy).setDepth(19);
  }

  drawHud() {
    this.scoreText = this.add.text(20, 28, '0', { fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: CSS.white }).setDepth(20);
    this.distText = this.add.text(20, 74, '0 m', { fontFamily: FONT, fontSize: '18px', color: CSS.grey }).setDepth(20);
    // ranuras de EPI
    this.slots = {};
    const keys = ['helmet', 'glasses', 'mask', 'ears', 'harness'];
    keys.forEach((k, i) => {
      const x = 230 + i * 46;
      const bg = this.add.circle(x, 48, 20, BRAND.navy2).setDepth(20);
      const t = this.add.text(x, 48, RUNNER_EPIS[k].emoji, { fontSize: '22px' }).setOrigin(0.5).setDepth(21);
      this.slots[k] = { bg, t };
    });
    this.livesText = this.add.text(W - 150, 84, '', { fontFamily: FONT, fontSize: '14px', color: CSS.grey }).setOrigin(0.5).setDepth(20);
    makeTopBar(this, { coins: false });
    makeHelpButton(this, '🏃 TURNO DE TRABAJO', 'Izquierda = saltar · Derecha = agacharse\n\n🌫️ Polvo → 😷 Mascarilla FFP2 SERIE EMÉ\n✨ Chispas → 🥽 Gafa PHIBES-N\n🏗️ Carga → ⛑️ Casco CLIMBEX VENT\n🔊 Ruido → 🎧 SNEKKAR-350\n🕳️ Hueco → 🪢 Arnés (si no saltas)');
    this.refreshHud();
  }

  gearKey(frame) {
    const g = this.gear;
    const key = 'runner_' + frame + '_' + (g.mask ? 1 : 0) + (g.glasses ? 1 : 0) + (g.helmet ? 1 : 0) + (g.ears ? 1 : 0) + (g.harness ? 1 : 0);
    makeRunnerTexture(this, key, frame, g);
    return key;
  }

  // ---------- Controles ----------
  jump() {
    if (!this.running || !this.onGround || this.sliding > 0) return;
    this.vy = -RUNNER_CONFIG.jumpV; this.onGround = false; Sfx.jump();
  }
  slide() {
    if (!this.running || !this.onGround) return;
    this.sliding = 600;
  }

  // ---------- Generación ----------
  spawnEvent() {
    const r = Math.random();
    const x = W + 120;
    if (r < 0.22) this.addObj('cone', x);
    else if (r < 0.40) this.addObj('beam', x);
    else if (r < 0.58) this.addObj('gap', x, { w: Phaser.Math.Between(120, 190) });
    else if (r < 0.72) this.addObj('coin', x, { y: Math.random() < 0.5 ? this.groundY - 40 : this.groundY - 190 });
    else if (r < 0.82) {
      const k = Phaser.Utils.Array.GetRandom(['harness', 'mask', 'glasses', 'helmet', 'ears']);
      this.addObj('epi', x, { epi: k, y: Math.random() < 0.5 ? this.groundY - 40 : this.groundY - 190 });
    } else {
      // zona de peligro: antes aparece el EPI que la neutraliza
      let keys = Object.keys(RUNNER_HAZARDS).filter(k => k !== this.lastZone);
      const hz = Phaser.Utils.Array.GetRandom(keys);
      this.lastZone = hz;
      const epi = RUNNER_HAZARDS[hz].epi;
      if (!this.gear[epi]) this.addObj('epi', x, { epi, y: Math.random() < 0.6 ? this.groundY - 40 : this.groundY - 190 });
      this.pending.push({ at: this.distance + 750, type: 'zone', opts: { hz } });
      return 900;
    }
    return 0;
  }

  addObj(type, x, opts) {
    opts = opts || {};
    const o = { type, x, w: 48, objs: [], done: false };
    if (type === 'cone') {
      o.w = 48; o.h = 56; o.spr = this.add.image(x, this.groundY, 'rn_cone').setOrigin(0.5, 1).setDepth(5); o.objs.push(o.spr);
    } else if (type === 'beam') {
      o.w = 94; o.top = this.groundY - 190; o.bottom = this.groundY - 60;
      o.spr = this.add.image(x, o.top, 'rn_beam').setOrigin(0.5, 0).setDepth(5); o.objs.push(o.spr);
    } else if (type === 'gap') {
      o.w = opts.w;
      o.spr = this.add.rectangle(x, this.groundY - 2, o.w, 260, 0x0a1220).setOrigin(0.5, 0).setDepth(3); o.objs.push(o.spr);
      const e1 = this.add.rectangle(x - o.w / 2, this.groundY, 8, 20, BRAND.yellow).setOrigin(0.5, 0).setDepth(4);
      const e2 = this.add.rectangle(x + o.w / 2, this.groundY, 8, 20, BRAND.yellow).setOrigin(0.5, 0).setDepth(4);
      o.objs.push(e1, e2); o.edges = [e1, e2];
    } else if (type === 'coin') {
      o.w = 40; o.y = opts.y; o.spr = coinImage(this, x, o.y, 40).setDepth(5); o.objs.push(o.spr);
      this.tweens.add({ targets: o.spr, y: o.y - 10, duration: 400, yoyo: true, repeat: -1 });
    } else if (type === 'epi') {
      o.w = 56; o.y = opts.y; o.epi = opts.epi;
      const c = this.add.circle(x, o.y, 28, RUNNER_EPIS[o.epi].color).setStrokeStyle(4, 0xffffff).setDepth(5);
      const t = this.add.text(x, o.y, RUNNER_EPIS[o.epi].emoji, { fontSize: '28px' }).setOrigin(0.5).setDepth(6);
      o.spr = c; o.label = t; o.objs.push(c, t);
      this.tweens.add({ targets: [c, t], y: o.y - 10, duration: 450, yoyo: true, repeat: -1 });
    } else if (type === 'zone') {
      const hz = RUNNER_HAZARDS[opts.hz];
      o.hz = opts.hz; o.w = 260; o.entered = false;
      const colors = { polvo: 0x9aa7bd, chispas: 0xffc82e, carga: 0xff4d4d, ruido: 0xd06bd0 };
      o.spr = this.add.rectangle(x, 110, o.w, this.groundY - 110, colors[o.hz], 0.28).setOrigin(0.5, 0).setDepth(4);
      const e = this.add.text(x, 300, hz.emoji, { fontSize: '64px' }).setOrigin(0.5).setDepth(5);
      const l = this.add.text(x, 370, hz.label, { fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', color: CSS.white, stroke: CSS.navy, strokeThickness: 4 }).setOrigin(0.5).setDepth(5);
      const sign = this.add.text(x - 260, this.groundY - 120, '⚠️ ' + hz.label + '\nnecesitas ' + RUNNER_EPIS[hz.epi].emoji, { fontFamily: FONT, fontSize: '14px', fontStyle: 'bold', color: CSS.navy, backgroundColor: '#ffc82e', padding: { x: 6, y: 4 }, align: 'center' }).setOrigin(0.5).setDepth(5);
      o.objs.push(o.spr, e, l, sign); o.extra = [e, l]; o.sign = sign;
    }
    this.objects.push(o);
    return o;
  }

  // ---------- Bucle ----------
  update(time, delta) {
    if (!this.running) return;
    const dt = Math.min(delta, 50) / 1000;
    const C = RUNNER_CONFIG;

    // velocidad y distancia
    this.speed = Math.min(C.speedMax, this.speed + C.speedGain * dt);
    const dx = this.speed * dt;
    this.distance += dx;
    this.ground.tilePositionX += dx;
    this.city.tilePositionX += dx * 0.25;

    // física del jugador
    this.vy += C.gravity * dt;
    this.py += this.vy * dt;
    if (this.py >= this.groundY) { this.py = this.groundY; this.vy = 0; this.onGround = true; }
    if (this.sliding > 0) this.sliding -= delta;
    if (this.invuln > 0) this.invuln -= delta;
    this.player.y = this.py;
    this.animT += delta;
    if (this.onGround && this.animT > 110) { this.animT = 0; this.frame = 1 - this.frame; }
    this.player.setTexture(this.gearKey(this.sliding > 0 ? 2 : (this.onGround ? this.frame : 0)));
    this.player.setAlpha(this.invuln > 0 ? (Math.floor(time / 80) % 2 ? 0.3 : 1) : 1);

    // generación
    if (this.distance >= this.nextSpawn) {
      const extra = this.spawnEvent();
      this.nextSpawn = this.distance + Phaser.Math.Between(420, 760) * (this.speed / C.speedStart) + extra;
    }
    this.pending = this.pending.filter(p => { if (this.distance >= p.at) { this.addObj(p.type, W + 120, p.opts); return false; } return true; });

    // mover objetos y colisiones
    const ph = this.sliding > 0 ? 50 : 90;
    const pl = this.px - 18, pr = this.px + 18, pt = this.py - ph, pb = this.py;
    let inGap = false;
    this.objects.forEach(o => {
      o.x -= dx;
      o.objs.forEach(s => { s.x -= dx; });
      if (o.done) return;
      const ol = o.x - o.w / 2, or = o.x + o.w / 2;
      const overlapX = pr > ol && pl < or;
      if (!overlapX) {
        if (o.type === 'zone' && o.entered) { o.done = true; }
        return;
      }
      if (o.type === 'cone') { if (pb > this.groundY - o.h + 6 && this.onGround) this.hit(o, 'Te has tropezado con un cono'); }
      else if (o.type === 'beam') { if (pt < o.bottom) this.hit(o, 'Te has golpeado con la viga'); }
      else if (o.type === 'gap') { if (this.onGround && this.px - 10 > ol && this.px + 10 < or) inGap = o; }
      else if (o.type === 'coin') { if (Math.abs(this.py - ph / 2 - o.y) < 70) { o.done = true; o.objs.forEach(s => s.destroy()); this.coins++; this.score += 25; Sfx.coin(); burst(this, o.x, o.y, BRAND.yellow, 10); floatText(this, o.x, o.y - 20, '+25', CSS.yellow, 20); } }
      else if (o.type === 'epi') { if (Math.abs(this.py - ph / 2 - o.y) < 70) { o.done = true; o.objs.forEach(s => s.destroy()); this.pickEpi(o.epi); } }
      else if (o.type === 'zone' && !o.entered) { o.entered = true; this.enterZone(o); }
    });
    if (inGap) this.fallInGap(inGap);

    // limpiar
    this.objects = this.objects.filter(o => { if (o.x < -400) { o.objs.forEach(s => s.destroy()); return false; } return true; });

    this.score += dx * 0.25;
    this.refreshHud();
  }

  pickEpi(k) {
    if (this.gear[k]) { this.score += 50; floatText(this, this.px, this.py - 130, RUNNER_EPIS[k].label + ' ya puesto +50', CSS.yellow, 16); }
    else { this.gear[k] = true; floatText(this, this.px, this.py - 130, RUNNER_EPIS[k].label + ' ✓', CSS.green, 22); }
    Sfx.ok();
    burst(this, this.px, this.py - 50, RUNNER_EPIS[k].color, 12);
    this.refreshHud();
  }

  enterZone(o) {
    const hz = RUNNER_HAZARDS[o.hz];
    if (this.gear[hz.epi]) {
      this.gear[hz.epi] = false;
      this.zones = (this.zones || 0) + 1;
      this.score += 100;
      Sfx.level();
      floatText(this, this.px, this.py - 140, hz.epiName + ' te protege +100', CSS.green, 18);
      burst(this, this.px, this.py - 60, BRAND.green, 20);
      this.refreshHud();
    } else {
      this.hit(o, 'Zona de ' + hz.label.toLowerCase() + ' sin ' + RUNNER_EPIS[hz.epi].label.toLowerCase());
    }
  }

  fallInGap(o) {
    if (this.gear.harness) {
      this.gear.harness = false;
      o.done = true;
      this.vy = -RUNNER_CONFIG.jumpV * 0.9;
      this.onGround = false;
      Sfx.anchor();
      floatText(this, this.px, this.py - 140, '¡El arnés te ha salvado!', CSS.green, 20);
      this.refreshHud();
    } else {
      this.die('Has caído en un hueco sin arnés');
    }
  }

  hit(o, reason) {
    if (this.invuln > 0) return;
    o.done = true;
    if (this.lives > 1) {
      this.lives--;
      this.invuln = 1500;
      Sfx.fail();
      this.cameras.main.shake(200, 0.01);
      floatText(this, this.px, this.py - 140, reason + '\nARSENIO aguanta: -1 vida', CSS.red, 16);
      this.refreshHud();
    } else {
      this.die(reason);
    }
  }

  die(reason) {
    if (this.dead) return;
    this.dead = true; this.running = false;
    Sfx.over();
    this.cameras.main.shake(300, 0.015);
    this.tweens.add({ targets: this.player, angle: -90, y: this.py + 20, duration: 400 });
    const m = Math.floor(this.distance / 20);
    this.time.delayedCall(900, () => this.scene.start('GameOver', { score: Math.floor(this.score), mode: 'Runner', stat: reason + '\nDistancia: ' + m + ' m · Safecoins recogidos: ' + this.coins, stats: { meters: m, coins: this.coins, zones: this.zones || 0 } }));
  }

  refreshHud() {
    this.scoreText.setText(Math.floor(this.score));
    this.distText.setText(Math.floor(this.distance / 20) + ' m');
    Object.keys(this.slots).forEach(k => {
      const on = this.gear[k];
      this.slots[k].bg.setFillStyle(on ? RUNNER_EPIS[k].color : BRAND.navy2);
      this.slots[k].t.setAlpha(on ? 1 : 0.3);
    });
    this.livesText.setText(this.lives > 1 ? '❤️ x' + this.lives : '');
  }
}
