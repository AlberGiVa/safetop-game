// ============================================================
//  UTILIDADES COMPARTIDAS
//  - Texturas dibujadas por código (sin imágenes externas)
//  - Sonidos sintetizados (sin archivos de audio)
//  - Guardado local: Safecoins, récords, colección
//  - Widgets de interfaz reutilizables
// ============================================================

const W = 540;   // ancho lógico del juego (vertical)
const H = 960;   // alto lógico del juego
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const DPR = Math.min(2, Math.max(1, Math.round((window.devicePixelRatio || 1) * 2) / 2));   // 1, 1.5 o 2
// Desplazamiento de la cámara por el zoom de alta resolución (ver hiDPI)
const CAM_OFF = { x: W * (1 - DPR) / 2, y: H * (1 - DPR) / 2 };

// Alta resolución: el lienzo mide W*DPR x H*DPR y la cámara hace zoom para que
// las coordenadas del juego sigan siendo 0..W x 0..H. Llamar al principio de create().
function hiDPI(scene) {
  scene.cameras.main.setZoom(DPR).centerOn(W / 2, H / 2);
}
// scrollY "lógico" de la cámara (0 = arriba del todo) teniendo en cuenta el zoom
function camTop(scene) { return scene.cameras.main.scrollY - CAM_OFF.y; }
function setCamTop(scene, y) { scene.cameras.main.scrollY = y + CAM_OFF.y; }
// Fija un objeto a la pantalla (HUD) en escenas con cámara desplazable
function hud(obj) { return obj.setScrollFactor(0).setPosition(obj.x - CAM_OFF.x, obj.y - CAM_OFF.y); }

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
  fail()  { this.beep(200, 0.25, 'sawtooth'); this.vibrate(80); },
  vibrate(ms) { try { if (this.enabled() && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} },
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

// Misiones: 3 activas a la vez; al cumplir una entra la siguiente
const Missions = {
  state() {
    const s = Save.get('missions', null);
    if (s) return s;
    const init = { active: [0, 1, 2], next: 3, progress: {}, done: [] };
    Save.set('missions', init);
    return init;
  },
  active() { return this.state().active.map(i => Object.assign({ index: i, value: this.state().progress[i] || 0 }, MISSIONS[i])); },
  // stats: { served, rows, hazards, meters, anchors, combo5, rounds, zones, coins, level5 }
  report(stats) {
    if (!stats) return [];
    const s = this.state();
    const completed = [];
    s.active.slice().forEach(i => {
      const m = MISSIONS[i];
      const v = stats[m.stat] || 0;
      if (!v) return;
      s.progress[i] = (s.progress[i] || 0) + v;
      if (s.progress[i] >= m.target) {
        completed.push(m);
        s.done.push(i);
        s.active = s.active.filter(x => x !== i);
        if (s.next < MISSIONS.length) { s.active.push(s.next); s.next++; }
      }
    });
    Save.set('missions', s);
    completed.forEach(m => Wallet.add(m.reward));
    return completed;
  }
};

// ============================================================
//  WIDGETS
// ============================================================

function makeButton(scene, x, y, w, h, label, color, onClick, fontSize) {
  const key = 'btn_' + w + 'x' + h + '_' + color;
  makePanelTexture(scene, key, w, h, color, 18);
  const img = addImg(scene, x, y, key).setInteractive({ useHandCursor: true });
  const txt = scene.add.text(x, y, label, {
    fontFamily: FONT, fontSize: (fontSize || 26) + 'px', fontStyle: 'bold', color: '#ffffff'
  }).setOrigin(0.5).setShadow(0, 2, 'rgba(0,0,0,0.35)', 2);
  const base = img.scaleX;
  img.on('pointerdown', () => { img.setScale(base * 0.95); txt.setScale(0.95); });
  img.on('pointerup', () => { img.setScale(base); txt.setScale(1); Sfx.init(); Sfx.tap(); onClick(); });
  img.on('pointerout', () => { img.setScale(base); txt.setScale(1); });
  return { img, txt, destroy() { img.destroy(); txt.destroy(); }, setDepth(d) { img.setDepth(d); txt.setDepth(d + 1); return this; } };
}

// Barra superior común: botón salir + saldo de Safecoins
function makeTopBar(scene, opts) {
  opts = opts || {};
  const exit = scene.add.text(W - 24, 48, '✕', { fontFamily: FONT, fontSize: '30px', color: CSS.dim })
    .setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });
  exit.on('pointerup', () => { Sfx.tap(); scene.scene.start(opts.back || 'Menu'); });
  if (opts.coins !== false) {
    const icon = coinImage(scene, W - 70, 48, 26).setDepth(20);
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
  makePanelTexture(scene, 'toast_' + (color || BRAND.orange), 420, 100, color || BRAND.orange, 20);
  const bg = addImg(scene, 0, 0, 'toast_' + (color || BRAND.orange));
  const t = scene.add.text(0, 0, msg, {
    fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color: CSS.white, align: 'center'
  }).setOrigin(0.5);
  c.add([bg, t]).setScale(0);
  scene.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.out' });
  scene.tweens.add({ targets: c, alpha: 0, delay: 1500, duration: 300, onComplete: () => c.destroy() });
  return c;
}

// Panel de tutorial con botón de empezar. Solo se muestra la primera vez.
const PC_HINTS = { ZonaSegura: 'Teclas 1-6', Altura: 'Flechas ← ↑ → y ESPACIO para anclar', Inspector: 'Ratón', Runner: '↑ o ESPACIO salta · ↓ agacha' };
function showTutorial(scene, key, title, body, onStart) {
  if (Save.get('tutorial_' + key, false)) { onStart(); return; }
  if (scene.sys.game.device.os.desktop && PC_HINTS[key]) body += '\n\n⌨️ En PC: ' + PC_HINTS[key];
  const c = scene.add.container(0, 0).setDepth(50);
  const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setInteractive();
  makePanelTexture(scene, 'tutorial_panel', W - 80, 380, BRAND.navy2, 24);
  const bg = addImg(scene, W / 2, 470, 'tutorial_panel');
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
