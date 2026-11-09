# Hito 7 — Encargo y variedad visual

## Encargo

- Modalidad 3 habilitada en recepción. El indicador sigue al técnico mientras recorre el local; se lo aborda directamente, sin ocupar E1.
- Entrega visible de hoja con referencias: pasa del cliente al técnico, que se detiene y mira al cliente durante la atención.
- Estimación de $15.000 y anticipo de $5.000 elegidos explícitamente por el usuario. `ORDER` y `getOrderQuote()` son independientes del presupuesto presencial. Saldo: $10.000.
- La primera salida física abre la pantalla negra. Tras un salto de unas horas aparece la notificación con vista del soporte, presupuesto final y anticipo acreditado.
- La impresión exige autorización explícita. “Todavía no” mantiene el pedido en espera; esperar o pulsar E no habilita el retiro. Puede autorizarse después.
- La confirmación invita a volver al día siguiente. Un botón controla el salto para que se pueda leer/grabar el mensaje al propio ritmo. El jugador reaparece de pie en la entrada.
- Retiro en recepción: el soporte ensamblado aparece sobre el mostrador. E abona el saldo y entrega la bolsa. La segunda salida cierra la historia.
- No se muestran mensajes técnicos sobre valores ilustrativos en la escena. Los importes son del guion; no hay cobros ni mensajes reales ni servicios externos. El trabajo del local mientras el cliente está ausente se representa por el salto temporal.
- Durante la notificación se libera el mouse, se deshabilita el fondo y no se dibuja WebGL. Los botones tienen foco y admiten teclado; se puede reiniciar desde esa pantalla.

## Escenario

- Alfombra del pasillo centrada con el armario de filamentos.
- Piso cambiado a damero mate de arena y arcilla, con textura local de 512×512 repetida.
- Restaurado el panel “Hecho acá” detrás del mostrador; el cuadro lateral conserva su versión de marca e impresora.
- Cuadros del pasillo: hoja/“Inspirá”, lámpara/“Imaginá”, cohete/“Probá”. Cuadros de los equipos: engranajes/“Explorá” y soporte para teléfono/“Creá”.
- Póster del proceso con ilustraciones de computadora, impresora y pieza terminada. Se mantienen sus límites separados de los cuadros vecinos.
- Dibujos realizados en canvas local y SVG para la vista del mensaje. No hay dependencias, recursos del curso copiados ni redibujado continuo de los carteles.

## Validación y continuación

- `npm test`: 44 pruebas. Incluyen los tres recorridos completos en el coordinador, entrega de referencias, anticipo único, salida previa, espera sin aprobación, regreso, saldo, bolsa, cierre y reinicio. También se conserva la comprobación de movimiento y mirada.
- `npm run check` y `git diff --check`.
- `src/order-ui.js` servido con HTTP 200 y MIME JavaScript desde Live Server.
- Falta la revisión visual del grupo: las pruebas usan un renderizador simulado y no miden la GPU ni reemplazan la prueba en el navegador.
- Guardar commit local; no hacer push de esta iteración hasta el okey final del usuario.
