# Safetop Arcade 🧤🪢😷🏃

Videojuego HTML5 de Safetop: cuatro minijuegos de partidas cortas en los que proteges a tu equipo con EPI reales del catálogo Safetop (gama Digitx Gloves, arneses SERIE AS, mascarillas SERIE EMÉ, AIRFLOW…).

Funciona en **PC, móvil y tablet** desde el navegador, se puede **instalar como app** (PWA) y está preparado para empaquetarse con **Capacitor** para **Play Store** y **App Store**.

## Jugar

- Web: `https://albergiva.github.io/safetop-game/` (GitHub Pages)
- En el móvil: abre la URL y "Añadir a pantalla de inicio" para tenerlo como app a pantalla completa.

## Los 4 modos

| Modo | Familia EPI | Mecánica |
|------|-------------|----------|
| **Zona Segura** | Guantes | Llegan operarios con un trabajo; toca el guante que les protege antes de que se impacienten. Combos, niveles y desbloqueo de guantes. |
| **Altura** | Anticaídas | Sube por el andamio saltando de tabla en tabla. Las agrietadas se rompen: si estás anclado el arnés te salva. El polvo sube desde abajo. |
| **Inspector** | Respiratoria | Encuentra a los operarios sin la protección respiratoria adecuada (FFP, semimáscara, capucha AIRFLOW) antes de que acabe el tiempo. |
| **Turno de trabajo** | Cabeza, ocular, auditiva… | Runner infinito: salta, agáchate y recoge los EPI que neutralizan cada zona de peligro. |

Todos comparten **Safecoins** (moneda del juego), récords, **misiones** (retos acumulativos con recompensa, 3 activas a la vez) y el **Almacén EPI**, donde cada producto comprado da una ventaja real en algún modo.

## Estructura

```
index.html              Página única que carga todo
manifest.json           PWA (instalable en el móvil)
icons/                  Iconos de la app
lib/phaser.min.js       Motor Phaser 3.90 (incluido, sin dependencias externas)
src/main.js             Configuración y arranque
src/utils.js            Sonido sintetizado, guardado, misiones, widgets, alta resolución
src/art.js              Todos los gráficos dibujados por código (Canvas 2D, 2x)
src/data/products.js    ← CATÁLOGO: productos, perks, tareas, misiones, textos, dificultad
src/scenes/             Una escena por pantalla:
  BootScene.js            genera texturas
  MenuScene.js            menú principal
  AlmacenScene.js         tienda / colección
  ZonaSeguraScene.js      modo guantes
  AlturaScene.js          modo arneses
  InspectorScene.js       modo respiratoria
  RunnerScene.js          modo runner
  GameOverScene.js        fin de partida y Safecoins
scripts/build-www.js    Copia el juego a www/ para Capacitor
capacitor.config.json   Configuración de la app nativa
```

Para cambiar productos, precios, textos o dificultad basta con editar `src/data/products.js`.

## Sustituir gráficos por fotos reales

Todos los gráficos se dibujan por código (`src/art.js`), pero el juego está preparado para fotos reales:
1. Sube la imagen a `assets/products/` (PNG con fondo transparente, ~200x220 px).
2. En `src/data/assets.js` añade una línea: `nitqrolux: 'assets/products/nitqrolux.png',`
3. Para el logo de Safetop (icono de Safecoin): `const LOGO_IMAGE = 'assets/logo.png';`

Si una imagen falla al cargar, el juego sigue usando el dibujo.

## Editar desde el móvil

1. App de GitHub → repositorio → archivo → ✏️ *Edit* → *Commit changes*.
2. En un minuto GitHub Pages vuelve a publicar el juego (pestaña *Actions*).
3. Si el móvil muestra la versión antigua, cierra la pestaña y vuelve a abrir la URL (el modo offline guarda una copia).

## Publicar en las tiendas (Capacitor)

Requisitos: Node 18+, Android Studio (Android) y un Mac con Xcode (iOS).

```bash
npm install
npm run cap:init          # solo la primera vez
npm run cap:android       # crea el proyecto Android y lo abre en Android Studio
npm run cap:ios           # crea el proyecto iOS y lo abre en Xcode
npm run cap:sync          # tras cada cambio en el juego
```

Desde Android Studio se genera el `.aab` para Play Store (cuenta de desarrollador: 25 $ una vez). Desde Xcode se sube a App Store Connect (99 $/año).

## Créditos

Motor: [Phaser 3](https://phaser.io) (licencia MIT). Productos y marcas: Safetop / Digitx Gloves.
