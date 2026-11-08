import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Alternativa opcional a Live Server, sin instalar paquetes. Solo escucha localmente.
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const parts = pathname.split('/').filter(Boolean);
    if (parts.some(part => part.startsWith('.') || part.includes('\\'))) throw new Error('Forbidden');
    const filename = path.resolve(root, parts.length ? parts.join('/') : 'index.html');
    const relative = path.relative(root, filename);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !types[path.extname(filename)]) throw new Error('Forbidden');
    const content = await readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)], 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Archivo no encontrado');
  }
});
let port = Number(process.env.PORT || 5500);
server.on('error', error => {
  if (error.code === 'EADDRINUSE' && port < 5510) { port += 1; server.listen(port, '127.0.0.1'); }
  else { console.error(error.message); process.exitCode = 1; }
});
server.on('listening', () => console.log(`ProtoAlquiler 3D: http://127.0.0.1:${port}\nCtrl+C para detener.`));
server.listen(port, '127.0.0.1');
