// ============================================================
//  ARTE — todas las texturas dibujadas por código con Canvas 2D
//  Se dibujan a doble resolución (TEX = 2) para verse nítidas
//  en pantallas de móvil. Usa addImg() para colocarlas.
// ============================================================

const TEX = 2;   // factor de resolución de las texturas generadas

// ---------- helpers de dibujo ----------
function hex(n) { return '#' + ('000000' + (n >>> 0).toString(16)).slice(-6); }
function shade(n, amt) {   // amt: -1..1 (oscurece/aclara)
  const c = Phaser.Display.Color.IntegerToColor(n);
  const f = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return '#' + [f(c.red), f(c.green), f(c.blue)].map(v => ('0' + v.toString(16)).slice(-2)).join('');
}
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function grad(ctx, x0, y0, x1, y1, c0, c1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g;
}
const OUTLINE = '#0b1424';

// Crea una textura canvas de w x h (lógicos) y ejecuta draw(ctx)
function tex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return key;
  const t = scene.textures.createCanvas(key, Math.ceil(w * TEX), Math.ceil(h * TEX));
  const ctx = t.getContext();
  ctx.scale(TEX, TEX);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  draw(ctx, w, h);
  t.refresh();
  return key;
}

// Coloca una textura generada a su tamaño lógico (scale = 1 → tamaño de diseño)
function addImg(scene, x, y, key, scale) {
  return scene.add.image(x, y, key).setScale((scale || 1) / TEX);
}
function addTile(scene, x, y, w, h, key) {
  return scene.add.tileSprite(x, y, w, h, key).setTileScale(1 / TEX);
}

// Imagen de producto escalada a un tamaño máximo (sirve para dibujos y fotos reales)
function productImage(scene, x, y, id, size) {
  const img = scene.add.image(x, y, 'prod_' + id);
  return img.setScale(size / Math.max(img.width, img.height));
}
// Icono de Safecoin (logo de Safetop) a un tamaño dado
function coinImage(scene, x, y, size) {
  const img = scene.add.image(x, y, 'safecoin');
  return img.setScale(size / Math.max(img.width, img.height));
}

// ---------- piezas de personaje ----------
function drawHelmet(ctx, cx, cy, w, color) {
  const h = w * 0.62;
  ctx.fillStyle = grad(ctx, cx - w / 2, cy - h, cx + w / 2, cy, shade(color, 0.25), shade(color, -0.2));
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(cx, cy, w / 2, h, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  // visera
  rr(ctx, cx - w / 2 - 4, cy - 3, w + 8, 7, 3); ctx.fillStyle = shade(color, -0.1); ctx.fill(); ctx.stroke();
  // brillo
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(cx - w * 0.2, cy - h * 0.55, w * 0.16, h * 0.25, -0.5, 0, Math.PI * 2); ctx.fill();
}
function drawHead(ctx, cx, cy, r) {
  ctx.fillStyle = grad(ctx, cx, cy - r, cx, cy + r, '#f6cf9a', '#e0a96d');
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}
function drawHair(ctx, cx, cy, r) {
  ctx.fillStyle = '#5a3a1e'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(cx + r * 0.3, cy - r * 0.5, cx - r * 0.2, cy - r * 0.35); ctx.closePath(); ctx.fill(); ctx.stroke();
}
function drawEyes(ctx, cx, cy, sep) {
  ctx.fillStyle = OUTLINE;
  ctx.beginPath(); ctx.arc(cx - sep, cy, 2, 0, Math.PI * 2); ctx.arc(cx + sep, cy, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy + 4, 5, 0.2, Math.PI - 0.2); ctx.stroke();
}
function drawVest(ctx, x, y, w, h, color) {
  ctx.fillStyle = grad(ctx, x, y, x, y + h, shade(color, 0.18), shade(color, -0.22));
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 9); ctx.fill(); ctx.stroke();
  // bandas reflectantes
  ctx.fillStyle = grad(ctx, x, 0, x + w, 0, '#c9cfd8', '#f4f6f8');
  ctx.fillRect(x + 2, y + h * 0.36, w - 4, 5); ctx.fillRect(x + 2, y + h * 0.66, w - 4, 5);
  ctx.strokeStyle = 'rgba(11,20,36,0.35)'; ctx.lineWidth = 1;
  ctx.strokeRect(x + 2, y + h * 0.36, w - 4, 5); ctx.strokeRect(x + 2, y + h * 0.66, w - 4, 5);
}
function drawLimb(ctx, x, y, w, h, color) {
  ctx.fillStyle = grad(ctx, x, 0, x + w, 0, shade(color, 0.15), shade(color, -0.25));
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, Math.min(6, w / 2)); ctx.fill(); ctx.stroke();
}
function drawBoot(ctx, x, y, w, h) {
  ctx.fillStyle = grad(ctx, x, y, x, y + h, '#3a3a3a', '#141414');
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 3); ctx.fill(); ctx.stroke();
}

// Operario (72x132). opts: { wear: 'none'|'ffp'|'semi'|'hood', harness: bool, helmetColor }
function makeWorkerTexture(scene, key, vestColor, opts) {
  opts = opts || {};
  tex(scene, key, 72, 132, ctx => {
    // sombra en el suelo
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(36, 128, 26, 4, 0, 0, Math.PI * 2); ctx.fill();
    drawLimb(ctx, 17, 94, 17, 30, 0x2c3e66); drawLimb(ctx, 38, 94, 17, 30, 0x2c3e66);
    drawBoot(ctx, 14, 120, 22, 9); drawBoot(ctx, 36, 120, 22, 9);
    drawLimb(ctx, 1, 55, 13, 36, vestColor); drawLimb(ctx, 58, 55, 13, 36, vestColor);
    drawVest(ctx, 12, 50, 48, 50, vestColor);
    if (opts.harness) {
      ctx.fillStyle = '#eb5d1a'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
      [[19, 50, 7, 50], [46, 50, 7, 50], [12, 90, 48, 7]].forEach(r => { ctx.fillRect(...r); ctx.strokeRect(...r); });
      ctx.fillStyle = '#cfd6e0'; ctx.beginPath(); ctx.arc(36, 62, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    // manos
    ctx.fillStyle = '#e8b57f'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(7, 92, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(65, 92, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // cabeza
    drawHead(ctx, 36, 36, 16);
    drawEyes(ctx, 36, 34, 6);
    // protección respiratoria
    if (opts.wear === 'ffp') {
      ctx.fillStyle = grad(ctx, 0, 38, 0, 52, '#ffffff', '#d6dbe3'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
      rr(ctx, 22, 38, 28, 14, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#b8c0cc'; ctx.beginPath(); ctx.arc(42, 45, 3, 0, Math.PI * 2); ctx.fill();
    } else if (opts.wear === 'semi') {
      ctx.fillStyle = grad(ctx, 0, 36, 0, 54, '#6b7180', '#3f4552'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
      rr(ctx, 20, 37, 32, 17, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c96bd0'; ctx.beginPath(); ctx.arc(23, 49, 6, 0, Math.PI * 2); ctx.arc(49, 49, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (opts.wear === 'hood') {
      ctx.fillStyle = grad(ctx, 0, 14, 0, 58, '#7c8494', '#4d5563'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
      rr(ctx, 13, 13, 46, 44, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = grad(ctx, 0, 27, 0, 41, '#7fd4f5', '#1f8fc4'); rr(ctx, 19, 27, 34, 14, 4); ctx.fill(); ctx.stroke();
    }
    if (opts.wear !== 'hood') drawHelmet(ctx, 36, 27, 40, opts.helmetColor || 0xffc82e);
  });
}

// Corredor lateral (64x96). frame: 0,1 = correr; 2 = agachado
function makeRunnerTexture(scene, key, frame, gear) {
  gear = gear || {};
  const vest = 0xeb5d1a;
  tex(scene, key, 64, 96, ctx => {
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(34, 93, 22, 3, 0, 0, Math.PI * 2); ctx.fill();
    if (frame === 2) {
      drawLimb(ctx, 12, 70, 38, 13, 0x2c3e66); drawBoot(ctx, 42, 80, 18, 8);
      drawVest(ctx, 8, 44, 46, 32, vest);
      drawHead(ctx, 46, 36, 13);
      ctx.fillStyle = OUTLINE; ctx.beginPath(); ctx.arc(52, 34, 2, 0, Math.PI * 2); ctx.fill();
      if (gear.mask) { ctx.fillStyle = '#fff'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; rr(ctx, 45, 38, 17, 10, 4); ctx.fill(); ctx.stroke(); }
      if (gear.glasses) { ctx.fillStyle = 'rgba(43,176,230,0.85)'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; rr(ctx, 45, 29, 17, 7, 3); ctx.fill(); ctx.stroke(); }
      if (gear.ears) { ctx.fillStyle = '#3ddc84'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(37, 38, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      if (gear.helmet) drawHelmet(ctx, 46, 29, 32, 0xffc82e); else drawHair(ctx, 46, 36, 13);
    } else {
      if (frame === 0) { drawLimb(ctx, 17, 60, 13, 28, 0x2c3e66); drawLimb(ctx, 33, 58, 13, 22, 0x2c3e66); drawBoot(ctx, 15, 85, 19, 8); drawBoot(ctx, 35, 77, 17, 8); }
      else { drawLimb(ctx, 13, 58, 13, 22, 0x2c3e66); drawLimb(ctx, 35, 60, 13, 28, 0x2c3e66); drawBoot(ctx, 11, 77, 17, 8); drawBoot(ctx, 35, 85, 19, 8); }
      drawVest(ctx, 13, 24, 38, 42, vest);
      if (gear.harness) { ctx.fillStyle = '#eb5d1a'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; [[19, 24, 6, 42], [38, 24, 6, 42]].forEach(r => { ctx.fillRect(...r); ctx.strokeRect(...r); }); ctx.fillStyle = '#cfd6e0'; ctx.beginPath(); ctx.arc(31, 36, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      drawLimb(ctx, frame === 0 ? 40 : 9, 30, 11, 26, vest);
      drawHead(ctx, 38, 14, 13);
      ctx.fillStyle = OUTLINE; ctx.beginPath(); ctx.arc(44, 12, 2, 0, Math.PI * 2); ctx.fill();
      if (gear.mask) { ctx.fillStyle = '#fff'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; rr(ctx, 37, 16, 15, 10, 4); ctx.fill(); ctx.stroke(); }
      if (gear.glasses) { ctx.fillStyle = 'rgba(43,176,230,0.85)'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; rr(ctx, 37, 7, 15, 7, 3); ctx.fill(); ctx.stroke(); }
      if (gear.ears) { ctx.fillStyle = '#3ddc84'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(29, 16, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      if (gear.helmet) drawHelmet(ctx, 38, 7, 32, 0xffc82e); else drawHair(ctx, 38, 14, 13);
    }
  });
}

// ---------- iconos de producto (80x90) ----------
function makeGloveTexture(scene, key, color) {
  tex(scene, key, 80, 90, ctx => {
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
    const fill = grad(ctx, 10, 0, 70, 90, shade(color, 0.22), shade(color, -0.25));
    // dedos
    for (let i = 0; i < 4; i++) { ctx.fillStyle = fill; rr(ctx, 20 + i * 11, 6 + (i === 0 || i === 3 ? 8 : 0), 10, 36, 5); ctx.fill(); ctx.stroke(); }
    // pulgar
    ctx.fillStyle = fill; ctx.save(); ctx.translate(12, 40); ctx.rotate(-0.6); rr(ctx, -6, -8, 12, 24, 6); ctx.fill(); ctx.stroke(); ctx.restore();
    // palma
    ctx.fillStyle = fill; rr(ctx, 18, 30, 44, 42, 10); ctx.fill(); ctx.stroke();
    // puño con costillas
    ctx.fillStyle = shade(color, -0.35); rr(ctx, 20, 66, 40, 20, 4); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(24 + i * 6, 68); ctx.lineTo(24 + i * 6, 84); ctx.stroke(); }
    // brillo
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; rr(ctx, 23, 35, 12, 24, 6); ctx.fill();
  });
}
function makeHarnessTexture(scene, key, color) {
  tex(scene, key, 80, 90, ctx => {
    ctx.lineWidth = 10; ctx.strokeStyle = OUTLINE;
    const path = () => { rr(ctx, 16, 10, 48, 60, 12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(16, 40); ctx.lineTo(64, 40); ctx.moveTo(40, 10); ctx.lineTo(40, 70); ctx.moveTo(24, 70); ctx.lineTo(24, 84); ctx.moveTo(56, 70); ctx.lineTo(56, 84); ctx.stroke(); };
    path();
    ctx.lineWidth = 6.5; ctx.strokeStyle = grad(ctx, 0, 10, 0, 84, shade(color, 0.25), shade(color, -0.25));
    path();
    // anilla D metálica
    ctx.fillStyle = grad(ctx, 32, 16, 48, 32, '#eef2f7', '#8a97ab'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(40, 24, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a3342'; ctx.beginPath(); ctx.arc(40, 24, 4, 0, Math.PI * 2); ctx.fill();
  });
}
function makeMaskTexture(scene, key, type, color) {
  tex(scene, key, 80, 90, ctx => {
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
    if (type === 'ffp') {
      ctx.strokeStyle = '#dfe5ee'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(12, 34); ctx.quadraticCurveTo(2, 22, 6, 12); ctx.moveTo(68, 34); ctx.quadraticCurveTo(78, 22, 74, 12); ctx.stroke();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
      ctx.fillStyle = grad(ctx, 0, 25, 0, 68, '#ffffff', '#cfd6e0'); rr(ctx, 10, 25, 60, 42, 16); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(11,20,36,0.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(14, 46); ctx.lineTo(66, 46); ctx.stroke();
      ctx.fillStyle = grad(ctx, 46, 42, 60, 56, '#dfe5ee', '#9aa7bd'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(53, 49, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c0392b'; rr(ctx, 30, 30, 20, 6, 3); ctx.fill();
    } else if (type === 'semi') {
      ctx.fillStyle = grad(ctx, 0, 20, 0, 66, shade(color, 0.3), shade(color, -0.3)); rr(ctx, 12, 18, 56, 48, 18); ctx.fill(); ctx.stroke();
      ctx.fillStyle = grad(ctx, 0, 44, 0, 68, '#e08be6', '#9b3aa3');
      ctx.beginPath(); ctx.arc(17, 57, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(63, 57, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1d2330'; rr(ctx, 31, 50, 18, 11, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; rr(ctx, 20, 24, 22, 10, 5); ctx.fill();
    } else {
      ctx.fillStyle = grad(ctx, 0, 6, 0, 82, shade(color, 0.3), shade(color, -0.3)); rr(ctx, 12, 6, 56, 76, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = grad(ctx, 0, 24, 0, 46, '#8fe0ff', '#1f8fc4'); rr(ctx, 20, 24, 40, 22, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; rr(ctx, 24, 27, 14, 6, 3); ctx.fill();
      ctx.fillStyle = '#1d2330'; rr(ctx, 28, 60, 24, 12, 4); ctx.fill(); ctx.stroke();
    }
  });
}
function makeGenericTexture(scene, key, family, color) {
  tex(scene, key, 80, 90, ctx => {
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
    if (family === 'cabeza') {
      drawHelmet(ctx, 40, 50, 62, color);
    } else if (family === 'ocular') {
      ctx.fillStyle = grad(ctx, 0, 30, 0, 58, shade(color, 0.2), shade(color, -0.3)); rr(ctx, 4, 30, 72, 28, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(15,26,43,0.55)'; rr(ctx, 10, 35, 26, 18, 6); ctx.fill(); rr(ctx, 44, 35, 26, 18, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; rr(ctx, 13, 37, 10, 5, 2); ctx.fill(); rr(ctx, 47, 37, 10, 5, 2); ctx.fill();
    } else if (family === 'auditiva') {
      ctx.lineWidth = 9; ctx.strokeStyle = OUTLINE; ctx.beginPath(); ctx.arc(40, 46, 30, Math.PI, 0); ctx.stroke();
      ctx.lineWidth = 5; ctx.strokeStyle = shade(color, -0.1); ctx.beginPath(); ctx.arc(40, 46, 30, Math.PI, 0); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = OUTLINE;
      ctx.fillStyle = grad(ctx, 0, 44, 0, 76, shade(color, 0.2), shade(color, -0.3)); rr(ctx, 4, 42, 22, 34, 8); ctx.fill(); ctx.stroke(); rr(ctx, 54, 42, 22, 34, 8); ctx.fill(); ctx.stroke();
    } else if (family === 'calzado') {
      ctx.fillStyle = grad(ctx, 10, 0, 74, 0, shade(color, 0.2), shade(color, -0.3));
      ctx.beginPath(); ctx.moveTo(22, 10); ctx.lineTo(50, 10); ctx.lineTo(50, 46); ctx.quadraticCurveTo(74, 48, 74, 66); ctx.lineTo(74, 72); ctx.lineTo(10, 72); ctx.lineTo(10, 52); ctx.quadraticCurveTo(22, 52, 22, 40); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1d2330'; rr(ctx, 8, 68, 68, 12, 4); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(26, 18 + i * 9); ctx.lineTo(46, 18 + i * 9); ctx.stroke(); }
    } else {
      ctx.fillStyle = hex(color); ctx.beginPath(); ctx.arc(40, 45, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  });
}
function makeProductTexture(scene, id) {
  const p = PRODUCTS[id];
  const key = 'prod_' + id;
  if (p.family === 'guantes') makeGloveTexture(scene, key, p.color);
  else if (p.family === 'anticaidas') makeHarnessTexture(scene, key, p.color);
  else if (p.family === 'respiratoria') makeMaskTexture(scene, key, id.startsWith('ffp') ? 'ffp' : id.startsWith('semi') ? 'semi' : 'hood', p.color);
  else makeGenericTexture(scene, key, p.family, p.color);
  return key;
}

// ---------- interfaz ----------
// Panel con degradado, borde sutil y sombra. Se coloca con addImg.
function makePanelTexture(scene, key, w, h, color, radius) {
  const pad = 8;
  tex(scene, key, w + pad * 2, h + pad * 2, ctx => {
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    ctx.fillStyle = grad(ctx, 0, pad, 0, pad + h, shade(color, 0.12), shade(color, -0.12));
    rr(ctx, pad, pad, w, h, radius || 16); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.5; rr(ctx, pad + 0.75, pad + 0.75, w - 1.5, h - 1.5, radius || 16); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; rr(ctx, pad + 2, pad + 2, w - 4, h * 0.45, radius || 16); ctx.fill();
  });
}
// Fondo con degradado vertical (w x h lógicos, dibujado a baja resolución)
function makeGradientTexture(scene, key, w, h, c0, c1, c2) {
  if (scene.textures.exists(key)) return key;
  const t = scene.textures.createCanvas(key, 64, 256);
  const ctx = t.getContext();
  const g = ctx.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, c0); if (c2) { g.addColorStop(0.55, c1); g.addColorStop(1, c2); } else g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 256);
  t.refresh();
  return key;
}
function addBackground(scene, c0, c1, c2) {
  const key = 'bg_' + c0 + c1 + (c2 || '');
  makeGradientTexture(scene, key, W, H, c0, c1, c2);
  return scene.add.image(W / 2, H / 2, key).setDisplaySize(W, H).setDepth(-10);
}
// Viñeta: oscurece los bordes para dar profundidad
function addVignette(scene, strength) {
  if (!scene.textures.exists('vignette')) {
    const t = scene.textures.createCanvas('vignette', 135, 240);
    const ctx = t.getContext();
    const g = ctx.createRadialGradient(67, 110, 40, 67, 120, 150);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 135, 240);
    t.refresh();
  }
  return scene.add.image(W / 2, H / 2, 'vignette').setDisplaySize(W, H).setAlpha(strength || 0.6).setDepth(18);
}
// Rayas de obra amarillo/negro (tira horizontal)
function makeStripesTexture(scene) {
  tex(scene, 'stripes', 88, 12, ctx => {
    ctx.fillStyle = '#ffc82e'; ctx.fillRect(0, 0, 88, 12);
    ctx.fillStyle = '#151515'; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(60, 0); ctx.lineTo(44, 12); ctx.lineTo(14, 12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(74, 0); ctx.lineTo(88, 0); ctx.lineTo(88, 12); ctx.lineTo(58, 12); ctx.closePath(); ctx.fill();
  });
  return 'stripes';
}

// ---------- escenario ----------
function makePlankTextures(scene) {
  tex(scene, 'plank', 130, 22, ctx => {
    ctx.fillStyle = grad(ctx, 0, 0, 0, 22, '#c98a43', '#8f5a25'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; rr(ctx, 1, 1, 128, 20, 4); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(80,40,10,0.45)'; ctx.lineWidth = 1;
    [5, 10, 15].forEach(y => { ctx.beginPath(); ctx.moveTo(8, y); ctx.bezierCurveTo(40, y + 2, 90, y - 2, 122, y + 1); ctx.stroke(); });
    ctx.fillStyle = '#3a2a1a'; [22, 108].forEach(x => { ctx.beginPath(); ctx.arc(x, 11, 2.2, 0, Math.PI * 2); ctx.fill(); });
  });
  tex(scene, 'plank_cracked', 130, 22, ctx => {
    ctx.fillStyle = grad(ctx, 0, 0, 0, 22, '#a8702f', '#6d4218'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; rr(ctx, 1, 1, 128, 20, 4); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2b1a0a'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(50, 1); ctx.lineTo(62, 12); ctx.lineTo(56, 21); ctx.moveTo(62, 12); ctx.lineTo(78, 8); ctx.moveTo(95, 21); ctx.lineTo(102, 10); ctx.lineTo(112, 14); ctx.stroke();
    ctx.fillStyle = '#3a2a1a'; [22, 108].forEach(x => { ctx.beginPath(); ctx.arc(x, 11, 2.2, 0, Math.PI * 2); ctx.fill(); });
  });
  tex(scene, 'anchor_ring', 36, 40, ctx => {
    ctx.fillStyle = grad(ctx, 12, 28, 24, 38, '#dfe5ee', '#8a97ab'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; rr(ctx, 12, 27, 12, 10, 2); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 9; ctx.strokeStyle = OUTLINE; ctx.beginPath(); ctx.arc(18, 17, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 5.5; ctx.strokeStyle = grad(ctx, 6, 5, 30, 29, '#ff9a5c', '#c8450c'); ctx.beginPath(); ctx.arc(18, 17, 12, 0, Math.PI * 2); ctx.stroke();
  });
  tex(scene, 'poles', W, 120, ctx => {
    [30, 190, 350, 510].forEach(x => {
      ctx.fillStyle = grad(ctx, x - 6, 0, x + 6, 0, '#b8c2d1', '#5c6a85'); ctx.fillRect(x - 6, 0, 12, 120);
      ctx.fillStyle = '#3a4657'; ctx.fillRect(x - 8, 0, 16, 5);
    });
  });
}
function makeRunnerTextures(scene) {
  tex(scene, 'rn_ground', 88, 240, ctx => {
    ctx.fillStyle = grad(ctx, 0, 0, 0, 240, '#4a628c', '#1f2f4d'); ctx.fillRect(0, 0, 88, 240);
    ctx.fillStyle = '#8c98ab'; ctx.fillRect(0, 0, 88, 10);
    ctx.fillStyle = '#ffc82e'; ctx.fillRect(0, 10, 44, 6); ctx.fillStyle = '#151515'; ctx.fillRect(44, 10, 44, 6);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
    [[10, 40, 30, 20], [50, 90, 30, 20], [20, 150, 40, 16]].forEach(r => { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(...r); ctx.strokeRect(...r); });
  });
  tex(scene, 'rn_city', 540, 420, ctx => {
    [[0, 90, 300], [110, 70, 360], [200, 120, 260], [340, 80, 330], [440, 100, 280]].forEach((b, i) => {
      ctx.fillStyle = i % 2 ? '#1a3159' : '#1f3a66'; ctx.fillRect(b[0], 420 - b[2], b[1], b[2]);
      ctx.fillStyle = 'rgba(255,220,120,0.35)';
      for (let x = b[0] + 8; x < b[0] + b[1] - 8; x += 18) for (let y = 420 - b[2] + 14; y < 400; y += 26) if ((x * 7 + y * 3) % 11 < 5) ctx.fillRect(x, y, 8, 12);
    });
  });
  tex(scene, 'rn_cone', 48, 56, ctx => {
    ctx.fillStyle = grad(ctx, 0, 0, 48, 0, '#ff8a3d', '#c8450c'); ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(24, 2); ctx.lineTo(4, 50); ctx.lineTo(44, 50); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f4f6f8'; ctx.fillRect(13, 26, 22, 8);
    ctx.fillStyle = '#1d2330'; rr(ctx, 1, 48, 46, 7, 2); ctx.fill(); ctx.stroke();
  });
  tex(scene, 'rn_beam', 94, 130, ctx => {
    ctx.fillStyle = '#6c7a93'; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; [28, 58].forEach(x => { ctx.fillRect(x, 0, 8, 100); ctx.strokeRect(x, 0, 8, 100); });
    ctx.fillStyle = grad(ctx, 0, 100, 0, 130, '#ff8a3d', '#c8450c'); rr(ctx, 1, 100, 92, 29, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#151515'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i * 24 + 6, 101); ctx.lineTo(i * 24 + 18, 101); ctx.lineTo(i * 24 + 10, 128); ctx.lineTo(i * 24 - 2, 128); ctx.closePath(); ctx.fill(); }
  });
}
