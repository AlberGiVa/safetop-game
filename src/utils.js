// ============================================================
//  UTILIDADES COMPARTIDAS
//  - Texturas dibujadas por código (sin imágenes externas)
//  - Sonidos sintetizados (sin archivos de audio)
//  - Guardado local: Safecoins, récords, colección
//  - Widgets de interfaz reutilizables
// ============================================================

const W = 540;   // ancho lógico del juego (vertical)
const H = 960;   // alto lógico del juego
const FONT = 'Arial, Helvetica, sans-serif';

// ============================================================
//  TEXTURAS
// ============================================================

// Operario (72x132). opts: { wear: 'none'|'ffp'|'semi'|'hood', harness: bool, helmetColor }
function makeWorkerTexture(scene, key, vestColor, opts) {
  if (scene.textures.exists(key)) return;
  opts = opts || {};
  const g = scene.add.graphics();
  // piernas y botas
  g.fillStyle(0x2c3e66); g.fillRect(18, 96, 16, 30); g.fillRect(38, 96, 16, 30);
  g.fillStyle(0x1a1a1a); g.fillRect(16, 122, 20, 8); g.fillRect(36, 122, 20, 8);
  // cuerpo (chaleco)
  g.fillStyle(vestColor); g.fillRoundedRect(12, 52, 48, 48, 8);
  g.fillStyle(0xd9d9d9); g.fillRect(12, 70, 48, 5); g.fillRect(12, 84, 48, 5);
  // arnés
  if (opts.harness) {
    g.fillStyle(0xf58220);
    g.fillRect(20, 52, 6, 48); g.fillRect(46, 52, 6, 48); g.fillRect(12, 92, 48, 6);
    g.fillStyle(0x9aa7bd); g.fillCircle(36, 62, 5);
  }
  // brazos y manos
  g.fillStyle(vestColor); g.fillRoundedRect(2, 56, 12, 34, 5); g.fillRoundedRect(58, 56, 12, 34, 5);
  g.fillStyle(0xf1c27d); g.fillCircle(8, 92, 6); g.fillCircle(64, 92, 6);
  // cabeza
  g.fillStyle(0xf1c27d); g.fillCircle(36, 36, 16);
  // ojos
  g.fillStyle(0x222222); g.fillCircle(30, 34, 2); g.fillCircle(42, 34, 2);
  // protección respiratoria
  if (opts.wear === 'ffp') {
    g.fillStyle(0xffffff); g.fillRoundedRect(23, 38, 26, 14, 6);
    g.fillStyle(0xcccccc); g.fillCircle(42, 45, 3);
  } else if (opts.wear === 'semi') {
    g.fillStyle(0x555a66); g.fillRoundedRect(21, 37, 30, 16, 7);
    g.fillStyle(0xd06bd0); g.fillCircle(24, 48, 6); g.fillCircle(48, 48, 6);
  } else if (opts.wear === 'hood') {
    g.fillStyle(0x666d7a); g.fillRoundedRect(14, 14, 44, 42, 10);
    g.fillStyle(0x2bb0e6); g.fillRect(20, 28, 32, 12);
  }
  // casco
  if (opts.wear !== 'hood') {
    g.fillStyle(opts.helmetColor || 0xffc82e); g.fillEllipse(36, 26, 40, 24); g.fillRect(14, 26, 44, 5);
  }
  g.generateTexture(key, 72, 132);
  g.destroy();
}

// Corredor lateral (mira a la derecha), 64x96. frame: 0,1 = correr; 2 = agachado
function makeRunnerTexture(scene, key, frame, gear) {
  if (scene.textures.exists(key)) return;
  gear = gear || {};
  const g = scene.add.graphics();
  const vest = 0xf58220;
  if (frame === 2) {
    // agachado
    g.fillStyle(0x2c3e66); g.fillRect(14, 72, 36, 12);
    g.fillStyle(0x1a1a1a); g.fillRect(44, 80, 16, 8);
    g.fillStyle(vest); g.fillRoundedRect(10, 46, 44, 30, 8);
    g.fillStyle(0xd9d9d9); g.fillRect(10, 58, 44, 4);
    g.fillStyle(0xf1c27d); g.fillCircle(46, 36, 14);
    g.fillStyle(0x222222); g.fillCircle(52, 34, 2);
    if (gear.mask) { g.fillStyle(0xffffff); g.fillRoundedRect(46, 38, 16, 10, 4); }
    if (gear.glasses) { g.fillStyle(0x2bb0e6); g.fillRoundedRect(46, 29, 16, 7, 3); }
    g.fillStyle(gear.helmet ? 0xffc82e : 0xf1c27d); g.fillEllipse(46, 27, 34, 20);
    if (gear.helmet) { g.fillStyle(0xffc82e); g.fillRect(28, 27, 36, 4); }
    if (gear.ears) { g.fillStyle(0x3ddc84); g.fillCircle(38, 38, 6); }
  } else {
    // piernas (alternan)
    g.fillStyle(0x2c3e66);
    if (frame === 0) { g.fillRect(18, 62, 12, 26); g.fillRect(34, 60, 12, 20); }
    else { g.fillRect(14, 60, 12, 20); g.fillRect(36, 62, 12, 26); }
    g.fillStyle(0x1a1a1a);
    if (frame === 0) { g.fillRect(16, 86, 18, 8); g.fillRect(36, 78, 16, 8); }
    else { g.fillRect(12, 78, 16, 8); g.fillRect(36, 86, 18, 8); }
    // cuerpo
    g.fillStyle(vest); g.fillRoundedRect(14, 26, 36, 40, 8);
    g.fillStyle(0xd9d9d9); g.fillRect(14, 40, 36, 4); g.fillRect(14, 52, 36, 4);
    if (gear.harness) { g.fillStyle(0xf58220); g.fillRect(20, 26, 5, 40); g.fillRect(38, 26, 5, 40); g.fillStyle(0x9aa7bd); g.fillCircle(31, 36, 4); }
    // brazo
    g.fillStyle(vest); g.fillRoundedRect(frame === 0 ? 40 : 10, 32, 10, 24, 4);
    // cabeza
    g.fillStyle(0xf1c27d); g.fillCircle(38, 14, 13);
    g.fillStyle(0x222222); g.fillCircle(44, 12, 2);
    if (gear.mask) { g.fillStyle(0xffffff); g.fillRoundedRect(38, 16, 14, 10, 4); }
    if (gear.glasses) { g.fillStyle(0x2bb0e6); g.fillRoundedRect(38, 8, 14, 7, 3); }
    if (gear.ears) { g.fillStyle(0x3ddc84); g.fillCircle(30, 16, 6); }
    if (gear.helmet) { g.fillStyle(0xffc82e); g.fillEllipse(38, 5, 32, 18); g.fillRect(22, 5, 34, 4); }
  }
  g.generateTexture(key, 64, 96);
  g.destroy();
}

// Guante del color del producto (80x90)
function makeGloveTexture(scene, key, color) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const dark = Phaser.Display.Color.IntegerToColor(color).darken(25).color;
  g.fillStyle(dark); g.fillRoundedRect(20, 66, 40, 20, 4);
  g.fillStyle(color); g.fillRoundedRect(18, 30, 44, 42, 10);
  for (let i = 0; i < 4; i++) g.fillRoundedRect(20 + i * 11, 6 + (i === 0 || i === 3 ? 8 : 0), 9, 34, 4);
  g.fillRoundedRect(4, 34, 16, 10, 5);
  g.fillStyle(0xffffff, 0.18); g.fillRoundedRect(24, 36, 14, 22, 6);
  g.generateTexture(key, 80, 90);
  g.destroy();
}

// Arnés (icono 80x90)
function makeHarnessTexture(scene, key, color) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  g.lineStyle(8, color);
  g.strokeRoundedRect(16, 10, 48, 60, 10);
  g.lineBetween(16, 40, 64, 40);
  g.lineBetween(40, 10, 40, 70);
  g.lineBetween(24, 70, 24, 84); g.lineBetween(56, 70, 56, 84);
  g.fillStyle(0x9aa7bd); g.fillCircle(40, 24, 8);
  g.fillStyle(0x333333); g.fillCircle(40, 24, 4);
  g.generateTexture(key, 80, 90);
  g.destroy();
}

// Mascarilla / semimáscara (icono 80x90)
function makeMaskTexture(scene, key, type, color) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  if (type === 'ffp') {
    g.fillStyle(color); g.fillRoundedRect(10, 25, 60, 40, 14);
    g.fillStyle(0xcccccc); g.fillCircle(52, 48, 7);
    g.lineStyle(3, 0xffffff); g.lineBetween(10, 32, 2, 20); g.lineBetween(70, 32, 78, 20);
  } else if (type === 'semi') {
    g.fillStyle(color); g.fillRoundedRect(12, 20, 56, 44, 16);
    g.fillStyle(0xd06bd0); g.fillCircle(16, 56, 12); g.fillCircle(64, 56, 12);
    g.fillStyle(0x222222); g.fillRoundedRect(32, 50, 16, 10, 4);
  } else {
    g.fillStyle(color); g.fillRoundedRect(12, 6, 56, 74, 14);
    g.fillStyle(0x2bb0e6); g.fillRoundedRect(20, 24, 40, 20, 6);
    g.fillStyle(0x333333); g.fillRoundedRect(28, 60, 24, 12, 4);
  }
  g.generateTexture(key, 80, 90);
  g.destroy();
}

// Icono genérico por familia (80x90)
function makeGenericTexture(scene, key, family, color) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  if (family === 'cabeza') {
    g.fillStyle(color); g.fillEllipse(40, 44, 64, 44); g.fillRoundedRect(4, 44, 72, 10, 4);
    g.fillStyle(0xffffff, 0.2); g.fillEllipse(30, 34, 18, 10);
  } else if (family === 'ocular') {
    g.fillStyle(color); g.fillRoundedRect(4, 30, 72, 26, 12);
    g.fillStyle(0x0f1a2b, 0.5); g.fillRoundedRect(10, 35, 26, 16, 6); g.fillRoundedRect(44, 35, 26, 16, 6);
  } else if (family === 'auditiva') {
    g.lineStyle(8, color); g.beginPath(); g.arc(40, 46, 30, Math.PI, 0, false); g.strokePath();
    g.fillStyle(color); g.fillRoundedRect(4, 44, 20, 30, 6); g.fillRoundedRect(56, 44, 20, 30, 6);
  } else if (family === 'calzado') {
    g.fillStyle(color); g.fillRoundedRect(20, 10, 30, 50, 6); g.fillRoundedRect(10, 50, 64, 26, 8);
    g.fillStyle(0x222222); g.fillRoundedRect(10, 70, 64, 10, 4);
  } else {
    g.fillStyle(color); g.fillCircle(40, 45, 32);
  }
  g.generateTexture(key, 80, 90);
  g.destroy();
}

// Icono de producto según familia
function makeProductTexture(scene, id) {
  const p = PRODUCTS[id];
  const key = 'prod_' + id;
  if (p.family === 'guantes') makeGloveTexture(scene, key, p.color);
  else if (p.family === 'anticaidas') makeHarnessTexture(scene, key, p.color);
  else if (p.family === 'respiratoria') makeMaskTexture(scene, key, id.startsWith('ffp') ? 'ffp' : id.startsWith('semi') ? 'semi' : 'hood', p.color);
  else makeGenericTexture(scene, key, p.family, p.color);
  return key;
}

// Rectángulo redondeado como textura (para botones y paneles)
function makePanelTexture(scene, key, w, h, color, radius) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  g.fillStyle(color); g.fillRoundedRect(0, 0, w, h, radius || 16);
  g.generateTexture(key, w, h);
  g.destroy();
}

// Moneda Safecoin (40x40). Cuando tengamos el logo de Safetop, se sustituye aquí.
function makeSafecoinTexture(scene) {
  if (scene.textures.exists('safecoin')) return;
  const g = scene.add.graphics();
  g.fillStyle(0xc65f0c); g.fillCircle(20, 22, 18);
  g.fillStyle(0xf58220); g.fillCircle(20, 19, 18);
  g.fillStyle(0xffb066); g.fillCircle(20, 19, 13);
  g.fillStyle(0xf58220); g.fillCircle(20, 19, 10);
  // "S" hecha con arcos
  g.lineStyle(4, 0xffffff);
  g.beginPath(); g.arc(20, 15, 4.5, Math.PI * 1.1, Math.PI * 0.6, true); g.strokePath();
  g.beginPath(); g.arc(20, 23, 4.5, Math.PI * 0.1, Math.PI * 1.6, true); g.strokePath();
  g.generateTexture('safecoin', 40, 44);
  g.destroy();
}

// ============================================================
//  SONIDO (sintetizado con WebAudio)
// ============================================================
const Sfx = {
  ctx: null,
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) this.ctx = new AC();
  },
  enabled() { return Save.get('sound', true); },
  beep(freq, dur, type, vol) {
    if (!this.ctx || !this.enabled()) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.value = freq;
    o.connect(g); g.connect(this.ctx.destination);
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(vol || 0.07, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur);
  },
  ok()    { this.beep(660, 0.08); setTimeout(() => this.beep(990, 0.12), 70); },
  fail()  { this.beep(200, 0.25, 'sawtooth'); },
  tap()   { this.beep(440, 0.05, 'triangle', 0.05); },
  coin()  { this.beep(1200, 0.06, 'sine', 0.06); setTimeout(() => this.beep(1600, 0.1, 'sine', 0.06), 50); },
  jump()  { this.beep(300, 0.12, 'triangle', 0.05); },
  anchor(){ this.beep(500, 0.08, 'square', 0.05); setTimeout(() => this.beep(700, 0.15, 'square', 0.05), 80); },
  level() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.beep(f, 0.12), i * 90)); },
  over()  { [400, 350, 300, 200].forEach((f, i) => setTimeout(() => this.beep(f, 0.2, 'sawtooth', 0.05), i * 150)); }
};

// ============================================================
//  GUARDADO
// ============================================================
const Save = {
  get(key, def) {
    try { const v = localStorage.getItem('safetop_' + key); return v === null ? def : JSON.parse(v); }
    catch (e) { return def; }
  },
  set(key, val) {
    try { localStorage.setItem('safetop_' + key, JSON.stringify(val)); } catch (e) {}
  }
};

// Cartera de Safecoins y colección de productos
const Wallet = {
  coins() { return Save.get('safecoins', 0); },
  add(n) { Save.set('safecoins', this.coins() + n); },
  spend(n) { if (this.coins() < n) return false; Save.set('safecoins', this.coins() - n); return true; },
  owned() {
    const base = Object.keys(PRODUCTS).filter(id => PRODUCTS[id].price === 0);
    return base.concat(Save.get('owned', []));
  },
  has(id) { return this.owned().includes(id); },
  buy(id) {
    if (this.has(id)) return false;
    if (!this.spend(PRODUCTS[id].price)) return false;
    const o = Save.get('owned', []); o.push(id); Save.set('owned', o);
    return true;
  },
  // Convierte puntos en Safecoins al acabar una partida
  reward(score, isRecord, mult) {
    let c = Math.floor(score / ECONOMY.coinsPerPoints) + (isRecord ? ECONOMY.recordBonus : 0);
    if (this.has('snekkar')) c = Math.floor(c * 1.25);
    if (mult) c = Math.floor(c * mult);
    this.add(c);
    return c;
  }
};

// ============================================================
//  WIDGETS
// ============================================================

function makeButton(scene, x, y, w, h, label, color, onClick, fontSize) {
  const key = 'btn_' + w + 'x' + h + '_' + color;
  makePanelTexture(scene, key, w, h, color, 18);
  const img = scene.add.image(x, y, key).setInteractive({ useHandCursor: true });
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT, fontSize: (fontSize || 26) + 'px', fontStyle: 'bold', color: '#ffffff'
  }).setOrigin(0.5);
  img.on('pointerdown', () => { img.setScale(0.95); txt.setScale(0.95); });
  img.on('pointerup', () => { img.setScale(1); txt.setScale(1); Sfx.init(); Sfx.tap(); onClick(); });
  img.on('pointerout', () => { img.setScale(1); txt.setScale(1); });
  return { img, txt, destroy() { img.destroy(); txt.destroy(); }, setDepth(d) { img.setDepth(d); txt.setDepth(d + 1); return this; } };
}

// Barra superior común: botón salir + saldo de Safecoins
function makeTopBar(scene, opts) {
  opts = opts || {};
  const exit = scene.add.text(W - 24, 48, '✕', { fontFamily: FONT, fontSize: '30px', color: CSS.dim })
    .setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });
  exit.on('pointerup', () => { Sfx.tap(); scene.scene.start(opts.back || 'Menu'); });
  if (opts.coins !== false) {
    makeSafecoinTexture(scene);
    const icon = scene.add.image(W - 70, 48, 'safecoin').setScale(0.6).setDepth(20);
    const txt = scene.add.text(W - 92, 48, Wallet.coins(), {
      fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: CSS.yellow
    }).setOrigin(1, 0.5).setDepth(20);
    return { exit, icon, txt, refresh() { txt.setText(Wallet.coins()); } };
  }
  return { exit };
}

// Explosión de partículas (aciertos, recogidas, anclajes)
function burst(scene, x, y, color, count) {
  if (!scene.textures.exists('dot')) {
    const g = scene.add.graphics(); g.fillStyle(0xffffff); g.fillCircle(6, 6, 6); g.generateTexture('dot', 12, 12); g.destroy();
  }
  const e = scene.add.particles(x, y, 'dot', {
    speed: { min: 120, max: 320 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 },
    lifespan: 600, gravityY: 400, tint: color || 0xffffff, emitting: false
  }).setDepth(35);
  e.explode(count || 18);
  scene.time.delayedCall(800, () => e.destroy());
}

// Texto flotante que sube y desaparece
function floatText(scene, x, y, msg, color, size) {
  const t = scene.add.text(x, y, msg, {
    fontFamily: FONT, fontSize: (size || 30) + 'px', fontStyle: 'bold', color, align: 'center',
    stroke: CSS.navy, strokeThickness: 4
  }).setOrigin(0.5).setDepth(30);
  scene.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 900, ease: 'Quad.out', onComplete: () => t.destroy() });
  return t;
}

// Aviso grande centrado que desaparece solo
function toast(scene, msg, y, color) {
  const c = scene.add.container(W / 2, y || 380).setDepth(40);
  const bg = scene.add.graphics();
  bg.fillStyle(color || BRAND.orange); bg.fillRoundedRect(-210, -50, 420, 100, 20);
  const t = scene.add.text(0, 0, msg, {
    fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color: CSS.white, align: 'center'
  }).setOrigin(0.5);
  c.add([bg, t]).setScale(0);
  scene.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.out' });
  scene.tweens.add({ targets: c, alpha: 0, delay: 1500, duration: 300, onComplete: () => c.destroy() });
  return c;
}

// Panel de tutorial con botón de empezar. Solo se muestra la primera vez.
function showTutorial(scene, key, title, body, onStart) {
  if (Save.get('tutorial_' + key, false)) { onStart(); return; }
  const c = scene.add.container(0, 0).setDepth(50);
  const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setInteractive();
  const bg = scene.add.graphics();
  bg.fillStyle(BRAND.navy2); bg.fillRoundedRect(40, 280, W - 80, 380, 24);
  const t1 = scene.add.text(W / 2, 330, title, { fontFamily: FONT, fontSize: '30px', fontStyle: 'bold', color: CSS.orange }).setOrigin(0.5);
  const t2 = scene.add.text(W / 2, 460, body, { fontFamily: FONT, fontSize: '19px', color: CSS.white, align: 'center', lineSpacing: 5, wordWrap: { width: W - 130 } }).setOrigin(0.5);
  c.add([dim, bg, t1, t2]);
  const btn = makeButton(scene, W / 2, 605, 260, 60, '¡A TRABAJAR!', BRAND.orange, () => {
    Save.set('tutorial_' + key, true);
    c.destroy(); btn.destroy();
    onStart();
  }).setDepth(51);
}

// Pantalla de pausa/ayuda rápida (botón "?")
function makeHelpButton(scene, title, body) {
  const b = scene.add.text(W - 74, 48, '?', { fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: CSS.dim })
    .setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });
  b.on('pointerup', () => {
    if (scene.helpOpen) return;
    scene.helpOpen = true;
    const wasRunning = scene.running;
    scene.running = false;
    scene.tweens.pauseAll();
    Save.set('tutorial_' + scene.scene.key, false);
    showTutorial(scene, scene.scene.key, title, body, () => {
      scene.helpOpen = false;
      scene.tweens.resumeAll();
      scene.running = wasRunning;
    });
  });
  return b;
}
