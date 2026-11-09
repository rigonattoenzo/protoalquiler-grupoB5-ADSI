# Hito 8 — Chat telefónico, atención en recepción y pantallas

- La notificación del encargo ahora tiene forma de teléfono con chat: contacto, avatar, mensajes recibidos, diseño adjunto, presupuesto, respuestas a la derecha, horas y marcas de leído. La autorización y la confirmación de retiro se conservan en la conversación, sin reemplazarla por otro anuncio. También se mantiene una negativa previa si el cliente autoriza después.
- El técnico viene al cliente tras elegir el encargo. Se fija un punto cercano al cliente frente al mostrador y lo alcanza rodeando su extremo libre. E no entrega las referencias antes de que llegue. Al terminar vuelve a rodear el mostrador para retomar su recorrido.
- Corregidas las caras coincidentes de la base del mostrador. El cuerpo empieza encima del zócalo negro, que además queda retraído; ya no comparten el frente en esa zona.
- E1 mantiene el proyecto del recorrido. E2 muestra una carcasa para sensor, con caja, placa, soportes y tapa ventilada; no copia estados ni porcentajes de impresión del cliente. E3 queda sin proyecto abierto. La aclaración final del usuario fue E3, no E1.
- La pantalla de E3 se dibuja una vez; E2 conserva su actualización lenta. No se agregan recursos externos y el chat no usa WebGL ni envía mensajes reales.

## Comprobaciones

- Prueba completa del coordinador: el cliente permanece en recepción, llega el técnico, se entregan las referencias y se completa el encargo a través del chat, incluido posponer/autorizar y conservar mensajes anteriores.
- Prueba de pantallas con contexto de canvas: E3 vacío, E2 con electrónica independiente y E1 con su impresión.
- Comprobación espacial de la base del mostrador y conservación del recorrido libre.
- `npm test`: 45 pruebas. `npm run check` y `git diff --check`.
- El usuario aprobó el encargo anterior y pidió estos refinamientos; falta su prueba visual de esta revisión. Los tests no miden la GPU ni reemplazan la comprobación en el navegador.
- Guardar commit local; el push sigue pendiente del okey final.
