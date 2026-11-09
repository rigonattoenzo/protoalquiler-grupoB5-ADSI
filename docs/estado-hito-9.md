# Hito 9 — Ritmo de atención y apariciones

- La charla del encargo pasa a un punto fijo a la derecha del mostrador, lejos del acceso. El cliente se acerca allí. El técnico camina a 2,4 unidades/s al acudir a ese punto, manteniendo sus colisiones; su paseo habitual y la asistencia en E1 conservan sus velocidades.
- Corregida la atribución del diálogo: recepción anuncia en tercera persona que viene el técnico. Una vez que llega, el técnico saluda desde su propia posición. E durante la espera no introduce otro mensaje repetido.
- Globos dentro del local: aparición de 130 ms con 8 px y 6 % de escala de diferencia, desde el extremo cercano a la cabeza. Se ejecuta al aparecer/cambiar la intervención, nunca en cada actualización de la proyección. Respeta reducir movimiento.
- El teléfono aparece con el chat vacío. Saludo al segundo y presupuesto a los dos segundos, con indicador de escritura y entradas de burbujas. Las respuestas del técnico tienen una pausa breve. Botones y atajos se habilitan después de que llega la información correspondiente.
- Los tiempos del chat usan el bucle existente, no temporizadores pendientes: reiniciar limpia toda la secuencia. Las mutaciones del DOM ocurren al cambiar de fase visible, y se respeta la preferencia de reducir movimiento.
- Hoja de precios del mostrador rediseñada con jerarquía, filas de modalidades y filamento destacado; valores centralizados sin nueva tarifa de encargo.
- E1 inicia sin proyecto, pasa a CAD vacío al abrirlo y muestra la base al crearla. E2 conserva su carcasa electrónica independiente y E3 sigue disponible sin proyecto.

## Validación

- 46 pruebas: secuencia de los tres recorridos, identidad de hablantes, técnico al costado fuera de la puerta, entrega de referencias solo cerca, chat inicialmente vacío, mensajes por tiempo, bloqueo de autorización/retorno prematuros, reinicio y pantallas independientes.
- `npm run check` y `git diff --check`.
- Falta la prueba visual del usuario de estas transiciones; los tests no renderizan la GPU.
- Guardar commit local; el push sigue pendiente del okey final del usuario.
