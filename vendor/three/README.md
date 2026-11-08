# Three.js local

Versión fijada: **0.187.0 (r187)**. Origen: paquete oficial `three` publicado en npm, descargado desde `https://cdn.jsdelivr.net/npm/three@0.187.0/`.

- `three.module.js` y `three.core.js`: carpeta `build/` del paquete.
- `addons/controls/PointerLockControls.js`: `examples/jsm/controls/PointerLockControls.js`.
- `LICENSE`: licencia MIT original de Three.js. Se conserva su aviso de copyright.

La aplicación importa estos archivos con un import map local. No hace pedidos a un CDN al ejecutarse ni requiere `npm install`. No mezclar versiones del núcleo y los controles.
