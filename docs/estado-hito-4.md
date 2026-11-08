# Atención, material y salida — 8 de noviembre de 2026

El usuario confirmó que la distribución se ve mejor y el rendimiento es fluido. Esta iteración refina las acciones y el cierre de la historia.

## Cambios

- La modalidad asistida asigna E1 directamente. Se eliminó “presentar referencia” ante recepción; el cliente conversa su idea con el técnico en el puesto.
- Apertura del proyecto y llamado técnico juntos; revisión inicial y presupuesto juntos. El recorrido requiere 9 confirmaciones con E, en lugar de 13, más elegir modalidad y caminar. Las fases internas automáticas ya no aparecen como una cuenta de 17 pasos.
- Diálogos, tarifario y pantalla sin “ejemplo”, “ilustrativo”, “ficticio” ni avisos de aceleración. Los datos siguen siendo de simulación y se documentan así en README/DEMO.
- El técnico camina al armario, abre la puerta, retira una bobina visible, la lleva en la mano y la coloca en la impresora. La máquina espera al evento de carga terminada. La bobina vuelve al armario al reiniciar; no es un inventario comercial.
- Acceso a E1 por ambos lados de la silla y frente a la impresora, con una marca más amplia. Las sillas conservan su aspecto y sus colisiones.
- Mirada condicionada: recepción solo al conversar/cobrar; técnico después del llamado, durante la atención. No hay seguimiento global por todos los personajes. Durante la búsqueda del material el técnico mira su tarea.
- Al retirar el resultado, se oculta la pieza sobre la mesa y aparece una bolsa con el soporte y una mano en primera persona; también se lleva en la vista general.
- Después del cobro, el estado es “salida”. No se permite reabrir recepción. Al cruzar el umbral del acceso aparece el cierre, se libera el mouse y se bloquean interacciones hasta reiniciar.

## Comprobado

37 pruebas aprobadas más sintaxis y diff-check. Cubren secuencia, carga de bobina antes de imprimir, recorrido del técnico, bobina visible en tránsito, apertura del armario, mirada solo al atender, accesos de la estación, entrega/bolsa, salida y cierre que no vuelve a saludar, además de la física y mirada anteriores.

La prueba del coordinador ejecuta la historia completa con cámara/grafo reales y renderizador simulado. No valida el aspecto de la bolsa ni los encuadres de la animación en una GPU. La herramienta de navegador no estaba disponible. El usuario probó esta versión en Live Server y confirmó que funciona bien, incluyendo el recorrido con la bobina, la mirada durante la atención y el final con la bolsa.

## Continuación

La prueba visual de esta iteración quedó aceptada por el usuario. Si el jugador bloquea al técnico, este espera sin atravesarlo; apartarse lo deja continuar.

El modo autónomo y el encargo siguen pendientes. El pedido actual se mantiene sobre el flujo asistido. Los estados de los hitos anteriores son antecedentes, no la descripción vigente del recorrido.

El usuario creó el repositorio GitHub `rigonattoenzo/protoalquiler-grupoB5-ADSI` y autorizó subir el historial local a su rama `main`.
