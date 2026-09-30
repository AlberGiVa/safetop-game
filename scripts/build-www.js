// Copia los archivos del juego a la carpeta www/ (la que empaqueta Capacitor)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const item of ['index.html', 'manifest.json', 'sw.js', 'lib', 'src', 'icons', 'assets']) {
  fs.cpSync(path.join(root, item), path.join(out, item), { recursive: true });
}
console.log('www/ listo para Capacitor');
