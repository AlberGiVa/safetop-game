// ============================================================
//  DATOS DEL JUEGO — Productos Safetop, tareas y economía
//  Edita este archivo para cambiar productos, precios o textos.
// ============================================================

// ---------- Colores de marca (ajustables) ----------
const BRAND = {
  navy:   0x0f1a2b,   // fondo
  navy2:  0x18294a,   // paneles
  navy3:  0x233a63,   // paneles claros
  orange: 0xeb5d1a,   // naranja del logo Safetop
  yellow: 0xffc82e,   // alta visibilidad
  green:  0x3ddc84,   // acierto
  red:    0xff4d4d,   // fallo
  blue:   0x2bb0e6,
  white:  0xffffff,
  grey:   0x9aa7bd,
  dim:    0x5c6a85
};
const CSS = {
  orange: '#eb5d1a', yellow: '#ffc82e', green: '#3ddc84', red: '#ff4d4d',
  white: '#ffffff', grey: '#9aa7bd', dim: '#5c6a85', navy: '#0f1a2b', navy2: '#18294a'
};

// ---------- Economía ----------
const ECONOMY = {
  coinsPerPoints: 25,       // 1 Safecoin por cada 25 puntos
  recordBonus: 50,          // Safecoins extra por batir el récord
  firstPlayBonus: 100       // Safecoins de bienvenida
};

// ============================================================
//  CATÁLOGO DE PRODUCTOS
//  family: guantes | anticaidas | respiratoria | cabeza | ocular | auditiva | calzado
//  price: coste en Safecoins en el Almacén (0 = de serie)
//  perk:  ventaja en el juego cuando se posee (texto) — la lógica está en cada modo
// ============================================================

const PRODUCTS = {
  // ---- GUANTES (modo Zona Segura) — gama Digitx Gloves + clásicos Safetop ----
  'oxylux':    { family: 'guantes', brand: 'Digitx', name: 'OXYLUX Dots', ref: '60-90', norm: 'EN 388 · OEKO-TEX',
                 desc: 'Lycra-nitrilo con puntos de nitrilo en la palma. Tejido termorregulador, transpirable y satinizado. Precisión y agarre.',
                 color: 0x4a7fd8, task: 'montaje', price: 0, perk: 'De serie en Zona Segura' },
  'nitqrolux': { family: 'guantes', brand: 'Digitx', isNew: true, name: 'NITQROLUX-F', ref: '64-80', norm: 'EN 388 nivel F · EN 407',
                 desc: 'NOVEDAD. 18g con palma de nitrilo reforzada. Anticorte nivel F (el máximo) y protección térmica. Ultraligero y transpirable.',
                 color: 0x2b2b2b, task: 'corte', price: 0, perk: 'De serie en Zona Segura' },
  'nitrisafe': { family: 'guantes', name: 'NITRISAFE Blue', ref: '', norm: 'EN 374',
                 desc: 'Guante de nitrilo azul para riesgo químico, 3.5 g. Pack de 100 unidades.',
                 color: 0x2bb0e6, task: 'quimico', price: 0, perk: 'De serie en Zona Segura' },
  'terrytop':  { family: 'guantes', name: 'TERRYTOP',       ref: '', norm: 'EN 407 · 250 °C',
                 desc: 'Guante anticalórico de algodón de rizo, hasta 250 °C.',
                 color: 0xf2e6c9, task: 'calor', price: 150, perk: 'Zona Segura: +15 % de paciencia de los operarios' },
  'g131ky':    { family: 'guantes', name: 'G131KY',         ref: '', norm: 'EN 12477 · Kevlar',
                 desc: 'Guante de soldador cosido con hilo de Kevlar.',
                 color: 0xb5651d, task: 'soldadura', price: 200, perk: 'Zona Segura: +1 vida' },
  'xalo':      { family: 'guantes', name: 'XALO',           ref: '114LB', norm: 'EN 388',
                 desc: 'Guante reforzado de piel de vacuno para manipulación pesada.',
                 color: 0xc9a15a, task: 'carga', price: 250, perk: 'Zona Segura: el combo aguanta un fallo' },
  // Guantes solo de colección/perk (no salen como botón en Zona Segura)
  'naturlux':  { family: 'guantes', brand: 'Digitx', isNew: true, name: 'NATURLUX', ref: '63-10', norm: 'EN 388 · GRS · OEKO-TEX',
                 desc: 'Gama ecológica: RPET reciclado y nitrilo, más del 50 % certificado GRS. Ultraligero y transpirable.',
                 color: 0x3ddc84, price: 150, perk: 'Zona Segura: +10 % de Safecoins' },
  'gripcut':   { family: 'guantes', brand: 'Digitx', name: 'GRIPCUT', ref: '64-40', norm: 'EN 388 nivel D · EN 407',
                 desc: 'Anticorte nivel D con puntos de nitrilo en la palma y propiedades térmicas. Antideslizante y transpirable.',
                 color: 0x6b6b6b, price: 200, perk: 'Zona Segura: x2 puntos en tareas de corte' },
  'tornolux':  { family: 'guantes', brand: 'Digitx', name: 'TORNOLUX-N', ref: '64-71', norm: 'EN 388 nivel F · EN 407 100 °C',
                 desc: 'Nitrilo sobre soporte verde, anticorte nivel F y resistencia térmica a 100 °C. Lavable 10 veces.',
                 color: 0x2e8b57, price: 250, perk: 'Zona Segura: x2 puntos en tareas de calor' },
  'tactylux':  { family: 'guantes', brand: 'Digitx', name: 'TACTYLUX', ref: '61-15', norm: 'EN 388 · 14 g',
                 desc: 'Un 35 % más fino que un nitrilo estándar: solo 14 g. Transpirabilidad 360°.',
                 color: 0xd8dde6, price: 300, perk: 'Zona Segura: empiezas con 4 guantes desbloqueados' },
  '4d':        { family: 'guantes', name: '4-D',            ref: '', norm: 'EN 388 · Anticorte A1',
                 desc: 'Guante 21G de 4 direcciones, ultrafino, máximo confort. Nitrilo arenoso, antipunzonamiento nivel 3.',
                 color: 0x3a6fd8, price: 100, perk: 'Zona Segura: la cola de operarios va un 10 % más lenta' },
  'polysafed': { family: 'guantes', name: 'POLYSAFED',      ref: 'G152', norm: 'EN 388 3X43D · ANSI A4',
                 desc: 'Guante anticorte nivel D en negro, base de fibras técnicas. Compatible con pantallas táctiles.',
                 color: 0x1f1f1f, price: 200, perk: 'Zona Segura: +1 vida' },

  // ---- ANTICAÍDAS (modo Altura) ----
  'ancares':   { family: 'anticaidas', name: 'ANCARES',        ref: '', norm: 'EN 361',
                 desc: 'Arnés de 1 punto de anclaje dorsal regulable. El básico imprescindible.',
                 color: 0xf58220, price: 0, perk: 'De serie en Altura' },
  'kutang':    { family: 'anticaidas', name: 'KUTANG',         ref: '80087', norm: 'EN 361 · EN 358 · 150 kg',
                 desc: 'Arnés extra confort con hebillas de aluminio y cinturón-faja. Sujeción y posicionamiento.',
                 color: 0x3a6fd8, price: 200, perk: 'Altura: el anclaje dura 3 tramos más' },
  'aracar':    { family: 'anticaidas', name: 'SERIE AS ARACAR', ref: '80086-AS', norm: 'EN 361 · EN 1497 · EN 358 · EN 813',
                 desc: 'Arnés extra confort para trabajos verticales con hebillas rápidas. Diseño Urban Art.',
                 color: 0x3ddc84, price: 300, perk: 'Altura: anclaje instantáneo' },
  'kailas':    { family: 'anticaidas', name: 'KAILAS PLUS',    ref: '80086J', norm: 'EN 361 · EN 358 · EN 813',
                 desc: 'Arnés para trabajos verticales con hebillas rápidas y máximo confort.',
                 color: 0xffc82e, price: 350, perk: 'Altura: empiezas anclado' },
  'retractil': { family: 'anticaidas', name: 'RETRÁCTIL SERIE AS', ref: '80230-AS', norm: 'EN 360 · 140 kg',
                 desc: 'Retráctil de cinta de 2 m con absorbedor de energía. Factor 2.',
                 color: 0x9aa7bd, price: 400, perk: 'Altura: una caída sin anclaje no te elimina (1 vez)' },

  // ---- RESPIRATORIA (modo Inspector) ----
  'ffp2':      { family: 'respiratoria', name: 'FFP2 NR SERIE EMÉ',  ref: '31830M', norm: 'EN 149 FFP2 NR D',
                 desc: 'Mascarilla plegable de 3 paneles con válvula. Polvo, partículas y aerosoles.',
                 color: 0xffffff, price: 0, perk: 'De serie en Inspector' },
  'ffp3':      { family: 'respiratoria', name: 'FFP3 NR SERIE EMÉ',  ref: '31850M', norm: 'EN 149 FFP3 NR D',
                 desc: 'Mascarilla plegable con válvula y máxima filtración. Polvo peligroso y amianto.',
                 color: 0xeeeeee, price: 150, perk: 'Inspector: +5 s por ronda' },
  'semi4600':  { family: 'respiratoria', name: 'SEMIMÁSCARA 4600',   ref: '34601-KIT', norm: 'EN 140 · ABEK1P3',
                 desc: 'Semimáscara hipoalergénica de TPR con filtros ABEK1P3. Gases, vapores y partículas.',
                 color: 0x555a66, price: 200, perk: 'Inspector: el primer error de cada ronda no resta tiempo' },
  'semiA2P3':  { family: 'respiratoria', name: 'SEMIMÁSCARA Clase 1', ref: '34600-KIT', norm: 'EN 140 · A2P3',
                 desc: 'Semimáscara con filtros A2P3 para vapores orgánicos y partículas.',
                 color: 0x444a5a, price: 250, perk: 'Inspector: los riesgos parpadean 1 s al empezar' },
  'airflow':   { family: 'respiratoria', name: 'AIRFLOW WELD-NEW',   ref: '70600-N', norm: 'TH3 P R SL · 98 %',
                 desc: 'Equipo motorizado con capucha de soldadura abatible. Filtración del 98 %.',
                 color: 0x8a5a2b, price: 400, perk: 'Inspector: +1 pista por ronda' },

  // ---- OTROS EPI (modo Turno de trabajo) ----
  'climbex':   { family: 'cabeza', name: 'CLIMBEX VENT',   ref: '', norm: 'EN 397',
                 desc: 'Casco con ventilación, visera corta y barboquejo.',
                 color: 0xffc82e, price: 0, perk: 'De serie en Turno de trabajo' },
  'phibes':    { family: 'ocular', name: 'PHIBES-N',       ref: '', norm: 'EN 166 1F K N',
                 desc: 'Gafa universal ahumada, antivaho y antirayaduras.',
                 color: 0x2bb0e6, price: 0, perk: 'De serie en Turno de trabajo' },
  'snekkar':   { family: 'auditiva', name: 'SNEKKAR-350',  ref: '', norm: 'SNR 34 dB',
                 desc: 'Protector de oídos de altas prestaciones y alta visibilidad.',
                 color: 0x3ddc84, price: 300, perk: '+25 % de Safecoins en todos los modos' },
  'arsenio':   { family: 'calzado', name: 'ARSENIO',       ref: '', norm: 'S3 · composite',
                 desc: 'Bota de media caña tipo Rigger en piel flor marrón.',
                 color: 0x8a5a2b, price: 250, perk: 'Turno de trabajo: +1 vida' },
  'perfekta':  { family: 'ocular', name: 'PERFEKTA REVO BLUE', ref: '', norm: 'EN 166',
                 desc: 'Gafa de lente tórica sin metal con tratamiento REVO.',
                 color: 0x3a6fd8, price: 200, perk: 'Turno de trabajo: empiezas con gafas' },
  'sync':      { family: 'auditiva', name: 'SYNC WIRELESS', ref: '', norm: 'SNR 31 dB · Bluetooth',
                 desc: 'Protector auditivo con Bluetooth y micrófono.',
                 color: 0x2b2b2b, price: 350, perk: 'Turno de trabajo: empiezas con casco' }
};

const FAMILIES = {
  guantes:      { label: 'Guantes',      emoji: '🧤' },
  anticaidas:   { label: 'Anticaídas',   emoji: '🪢' },
  respiratoria: { label: 'Respiratoria', emoji: '😷' },
  cabeza:       { label: 'Cabeza',       emoji: '⛑️' },
  ocular:       { label: 'Ocular',       emoji: '🥽' },
  auditiva:     { label: 'Auditiva',     emoji: '🎧' },
  calzado:      { label: 'Calzado',      emoji: '🥾' }
};

// Lista ordenada de guantes (orden de desbloqueo en Zona Segura)
const GLOVES = ['oxylux', 'nitqrolux', 'nitrisafe', 'terrytop', 'g131ky', 'xalo'].map(id => Object.assign({ id }, PRODUCTS[id]));

// Tareas del modo Zona Segura
const TASKS = {
  montaje:   { label: 'Montaje fino',       emoji: '🔧' },
  corte:     { label: 'Cortar chapa',       emoji: '🔪' },
  quimico:   { label: 'Productos químicos', emoji: '🧪' },
  calor:     { label: 'Piezas calientes',   emoji: '🔥' },
  soldadura: { label: 'Soldadura',          emoji: '⚡' },
  carga:     { label: 'Cargar palés',       emoji: '📦' }
};

// Actividades del modo Inspector: qué protección respiratoria necesitan
// need: 'none' | 'ffp' | 'semi' | 'hood'
const ACTIVITIES = [
  { id: 'lijar',    label: 'Lijando',            emoji: '🪚', need: 'ffp',  fix: 'FFP2 NR SERIE EMÉ' },
  { id: 'amianto',  label: 'Retirando amianto',  emoji: '☣️', need: 'ffp',  fix: 'FFP3 NR SERIE EMÉ' },
  { id: 'demoler',  label: 'Demoliendo',         emoji: '🧱', need: 'ffp',  fix: 'FFP2 NR SERIE EMÉ' },
  { id: 'pintar',   label: 'Pintando a pistola', emoji: '🎨', need: 'semi', fix: 'SEMIMÁSCARA Clase 1 A2P3' },
  { id: 'quimico',  label: 'Manipulando químicos', emoji: '🧪', need: 'semi', fix: 'SEMIMÁSCARA 4600 ABEK1P3' },
  { id: 'soldar',   label: 'Soldando',           emoji: '⚡', need: 'hood', fix: 'AIRFLOW WELD-NEW' },
  { id: 'papeles',  label: 'Revisando planos',   emoji: '📋', need: 'none', fix: '' },
  { id: 'medir',    label: 'Midiendo',           emoji: '📏', need: 'none', fix: '' },
  { id: 'cafe',     label: 'Tomando café',       emoji: '☕', need: 'none', fix: '' }
];

// Qué protección tiene puesta un operario en Inspector
// 'none' | 'ffp' | 'semi' | 'hood'
const WEAR_LABEL = { none: 'sin protección', ffp: 'mascarilla FFP', semi: 'semimáscara', hood: 'capucha AIRFLOW' };

// Peligros del modo Turno de trabajo y el EPI que los neutraliza
const RUNNER_HAZARDS = {
  polvo:  { label: 'POLVO',            emoji: '🌫️', epi: 'mask',    epiName: 'FFP2 SERIE EMÉ' },
  chispas:{ label: 'CHISPAS',          emoji: '✨', epi: 'glasses', epiName: 'PHIBES-N' },
  carga:  { label: 'CARGA SUSPENDIDA', emoji: '🏗️', epi: 'helmet',  epiName: 'CLIMBEX VENT' },
  ruido:  { label: 'RUIDO',            emoji: '🔊', epi: 'ears',    epiName: 'SNEKKAR-350' }
};
const RUNNER_EPIS = {
  mask:    { label: 'Mascarilla', emoji: '😷', color: 0xffffff },
  glasses: { label: 'Gafas',      emoji: '🥽', color: 0x2bb0e6 },
  helmet:  { label: 'Casco',      emoji: '⛑️', color: 0xffc82e },
  ears:    { label: 'Orejeras',   emoji: '🎧', color: 0x3ddc84 },
  harness: { label: 'Arnés',      emoji: '🪢', color: 0xf58220 }
};

// ---------- Ajustes de dificultad ----------
const ZONA_SEGURA_CONFIG = {
  livesStart: 3, glovesAtStart: 3, servedPerLevel: 8,
  patienceStart: 6500, patienceMin: 2600, patienceStep: 500, pointsBase: 60, comboMax: 5
};
const ALTURA_CONFIG = {
  rowHeight: 120, lanes: 3, anchorEvery: 6, anchorRows: 6,
  anchorTime: 700, dangerSpeedStart: 40, dangerSpeedMax: 110, pointsPerRow: 25
};
const INSPECTOR_CONFIG = {
  roundTime: 30, wrongPenalty: 3, workersStart: 6, workersMax: 12, hazardsStart: 3, pointsPerHazard: 150
};
const RUNNER_CONFIG = {
  speedStart: 380, speedMax: 720, speedGain: 6, gravity: 2400, jumpV: 950, livesStart: 1, pointsPerMeter: 1
};

// ---------- Los 4 modos ----------
const GAME_MODES = [
  { key: 'ZonaSegura', title: 'Zona Segura',      emoji: '🧤', family: 'guantes',
    desc: 'Equipa a cada operario con el guante correcto antes de que se impaciente.' },
  { key: 'Altura',     title: 'Altura',           emoji: '🪢', family: 'anticaidas',
    desc: 'Sube por el andamio y ancla el arnés antes de que te alcance el polvo.' },
  { key: 'Inspector',  title: 'Inspector',        emoji: '😷', family: 'respiratoria',
    desc: 'Encuentra a los operarios sin la protección respiratoria adecuada.' },
  { key: 'Runner',     title: 'Turno de trabajo', emoji: '🏃', family: 'cabeza',
    desc: 'Corre por la obra, esquiva peligros y recoge los EPI que te protegen.' }
];

// ---------- Misiones (retos acumulativos con recompensa en Safecoins) ----------
// stat: la estadística que suma cada partida (la envía cada modo al terminar)
const MISSIONS = [
  { id: 'm1',  text: 'Protege a 15 operarios en Zona Segura',   stat: 'served',   target: 15,  reward: 60 },
  { id: 'm2',  text: 'Sube 20 pisos en Altura',                 stat: 'rows',     target: 20,  reward: 60 },
  { id: 'm3',  text: 'Detecta 8 riesgos en Inspector',          stat: 'hazards',  target: 8,   reward: 60 },
  { id: 'm4',  text: 'Recorre 300 m en Turno de trabajo',       stat: 'meters',   target: 300, reward: 60 },
  { id: 'm5',  text: 'Ancla el arnés 5 veces',                  stat: 'anchors',  target: 5,   reward: 80 },
  { id: 'm6',  text: 'Consigue un combo x5 en Zona Segura',     stat: 'combo5',   target: 1,   reward: 80 },
  { id: 'm7',  text: 'Completa 3 rondas de Inspector',          stat: 'rounds',   target: 3,   reward: 80 },
  { id: 'm8',  text: 'Atraviesa 6 zonas de peligro protegido',  stat: 'zones',    target: 6,   reward: 100 },
  { id: 'm9',  text: 'Protege a 50 operarios en Zona Segura',   stat: 'served',   target: 50,  reward: 120 },
  { id: 'm10', text: 'Sube 60 pisos en Altura',                 stat: 'rows',     target: 60,  reward: 120 },
  { id: 'm11', text: 'Detecta 30 riesgos en Inspector',         stat: 'hazards',  target: 30,  reward: 120 },
  { id: 'm12', text: 'Recorre 1500 m en Turno de trabajo',      stat: 'meters',   target: 1500, reward: 150 },
  { id: 'm13', text: 'Recoge 40 Safecoins corriendo',           stat: 'coins',    target: 40,  reward: 150 },
  { id: 'm14', text: 'Llega al nivel 5 en Zona Segura',         stat: 'level5',   target: 1,   reward: 200 },
  { id: 'm15', text: 'Sube 100 pisos en Altura',                stat: 'rows',     target: 100, reward: 250 }
];
