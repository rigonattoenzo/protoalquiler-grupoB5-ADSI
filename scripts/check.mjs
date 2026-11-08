import { readdir, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
for (const directory of ['src', 'scripts', 'tests']) {
  for (const filename of await readdir(new URL(`${directory}/`, root))) {
    if (!/\.m?js$/.test(filename)) continue;
    const result = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(`${directory}/${filename}`, root))], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
for (const filename of ['index.html', 'styles.css', 'vendor/three/three.module.js', 'vendor/three/three.core.js', 'vendor/three/addons/controls/PointerLockControls.js', 'vendor/three/LICENSE']) {
  await access(new URL(filename, root));
}
console.log('Sintaxis y archivos locales: OK.');
