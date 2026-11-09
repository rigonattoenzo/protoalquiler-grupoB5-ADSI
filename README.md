# ProtoAlquiler 3D

Simulación interna del local para grabar la entrega de Administración de Sistemas de Información, UTN FRC. Three.js, HTML, CSS y JavaScript; sin framework, compilación ni servicios externos.

## Abrir

En Visual Studio Code, abrí esta carpeta y ejecutá **Open with Live Server** sobre `index.html`, o **Go Live**. No abras el archivo con doble clic: los módulos necesitan HTTP.

Three.js **0.187.0** y los controles están incluidos en `vendor/`; no hace falta `npm install` ni Internet para ejecutar. Navegador actualizado con WebGL 2.

También existe un servidor opcional para Node.js 20 o posterior:

```sh
npm start
```

La consola imprime su dirección (habitualmente `http://127.0.0.1:5500`). Live Server sigue siendo la opción principal, con recarga automática.

## Recorrido asistido completo

1. Pulsá **Entrar al local**, caminá un poco hacia el mostrador y presioná **E**. Las opciones se ofrecen al conversar con recepción, no al cargar la aplicación.
2. Recepción presenta las tarifas y las tres modalidades. Elegí **1: Con asistencia**. Con Esc también podés usar los botones del globo. Sobre el mostrador hay una única hoja de precios; no se seleccionan papeles físicos.
3. Seguí la marca verde hasta E1. Con E abrís el proyecto y llamás al técnico en una sola acción. La idea se conversa con el técnico en el puesto, no se entrega a recepción.
4. Dejá libre el paso mientras se acerca. Después permanece junto al puesto durante el trabajo.
5. Creá la base. El diseño aparece en la pantalla de la computadora. El técnico revisa la preparación y presenta el presupuesto.
6. Confirmá el presupuesto. El técnico va al armario, abre su puerta, retira una bobina, la lleva a la impresora y la coloca. La impresión empieza cuando termina la carga.
7. Llevá la base terminada a la mesa con E. Diseñá el respaldo en pantalla, validá la segunda pieza e imprimila.
8. Trasladá el respaldo y observá el ensamblado sobre la mesa.
9. Mirá el resultado y retirá la bolsa: el soporte deja la mesa y se ve en tu mano. Volvé al mostrador para abonar. El desglose no se acumula al repetir acciones.
10. Salí por el acceso principal con la bolsa. Cruzar el umbral cierra la historia y muestra una pantalla final. No se vuelve al saludo inicial; solo **Volver a recorrer** inicia otra toma.

Los personajes hablan mediante globos anclados a su posición. Si el hablante queda fuera del encuadre, el globo se ubica en el borde para mantenerlo legible. La guía persistente ocupa una sola línea; las instrucciones principales están en los diálogos y en la escena.

El recorrido tiene **9 confirmaciones con E después de elegir modalidad**; la búsqueda del filamento es automática. La guía muestra el sector o la acción actual, sin numerar cada fase de animación. La zona de interacción de E1 abarca ambos lados de la silla y el frente de la impresora; también funciona estando sentado.

Recepción mira al cliente solo mientras ofrece opciones o atiende el cobro. El técnico sigue al cliente con la mirada solo después del llamado y durante su asistencia; al buscar/cargar el material se concentra en esa acción. Las demás personas no siguen al jugador.

## Recorrido autónomo completo

1. Entrá, conversá con recepción usando E y elegí **2: Por mi cuenta**.
2. Andá a E1 y abrí el proyecto con E. Podés trabajar de pie o acercarte a la silla y usar **F** para sentarte.
3. Creá la base y después el respaldo desde la computadora. La pantalla muestra la evolución de los dos componentes; el técnico sigue recorriendo el local y no orienta el modelado.
4. Prepará ambos archivos en el laminador. Se ven las capas y la estimación de 25 g de PLA; esa acción solicita la revisión técnica.
5. Esperá al técnico y confirmá el presupuesto. Revisa las dos piezas, busca la bobina y la carga. El control del material se conserva en ambas modalidades.
6. El técnico retoma su recorrido al empezar la impresión. Retirá la base e iniciá el respaldo, que ya estaba preparado y revisado.
7. Ensamblá el soporte, retiralo en la bolsa, aboná en recepción y salí por el acceso para cerrar la historia.

También tiene **9 confirmaciones con E** después de elegir modalidad. Usa los mismos minutos, material y presupuesto del caso asistido: no se inventó un descuento por trabajar con autonomía. Los mensajes de diseño están anclados a la PC, los de impresión a la impresora y los de revisión al técnico.

## Recorrido por encargo completo

1. Conversá con recepción y elegí **3: Por encargo**. Seguí el indicador hasta el técnico, donde se encuentre.
2. Con E le entregás las referencias del soporte. Se ve la hoja con el dibujo pasando a sus manos; el técnico se queda para atenderte.
3. Aceptá la estimación de **$15.000** y aboná **$5.000 de anticipo** con E. Estos valores del guion fueron elegidos por el grupo y se configuran en `ORDER`.
4. Salí por el acceso. La primera salida no termina la historia: abre una pantalla negra y un salto de unas horas mientras el equipo prepara el diseño.
5. Aparece un mensaje con el soporte, presupuesto final de $15.000, anticipo de $5.000 y saldo de **$10.000**. Elegí **Sí, autorizar impresión**. **Todavía no** deja el pedido en espera, sin imprimir ni avanzar al retiro; podés autorizar después.
6. El mensaje confirma que podés retirar mañana. Pulsá **Ir a retirar · Al día siguiente** cuando termines de leer o grabar; volvés a aparecer en la entrada del local.
7. Acercate al mostrador: el soporte ensamblado está sobre él. E abona el saldo y te entrega la bolsa.
8. Salí nuevamente para cerrar el recorrido. Reiniciar restaura referencias, anticipo, aprobación, pieza y bolsa.

La notificación pertenece a la simulación, sin enviar mensajes reales. El modelado y la fabricación del encargo se representan con saltos temporales y una vista del diseño; no se espera el tiempo real ni se agrega otro recorrido por E1. Mientras se muestra el mensaje quedan pausados el movimiento y los controles de cámara; el botón **Reiniciar recorrido** sigue disponible. Los botones se pueden usar con teclado; 1 autoriza, 2 deja en espera y Enter permite regresar desde la confirmación de retiro.

**Las tres modalidades están implementadas.** En los casos presenciales se cobra tiempo de estación y material. El encargo conserva un presupuesto por trabajo independiente: el tiempo fuera del local no suma minutos ni importes de estación.

## Controles

| Control | Acción |
| --- | --- |
| WASD o flechas + mouse | Caminar y mirar |
| E | Hablar o ejecutar la acción cerca del objetivo |
| 1 / 2 / 3 | Elegir modalidad al conversar con recepción |
| F | Sentarte en una silla libre de E1/E3 o levantarte |
| Esc | Liberar el mouse y mostrar controles |
| V | Alternar vista general y primera persona |
| R | Restaurar la cámara de entrada; conserva el proceso |
| H | Ocultar controles para grabar; conserva los globos de diálogo |
| F2 | Mostrar diagnóstico de FPS y llamadas de dibujo |
| Reiniciar historia | Restaurar proceso, piezas, impresiones y datos del ejemplo |

Las impresiones y el ensamblado avanzan por su animación; E no permite saltarlos ni duplicarlos. Al alejarse del mostrador se cierra la elección de modalidad. La circulación permanece libre durante el tutorial.

Sentado podés mirar con el mouse y usar E; WASD no desplaza la silla. F te devuelve a una posición libre junto a ella y comprueba muebles y personas antes de levantarte. Podés alternar la vista general conservando la postura; R y Reiniciar historia te dejan de pie en la entrada. La silla ocupada de E2 y la de recepción no son utilizables por el jugador. El parámetro `seated` de `createCharacter` elige la pose visual del muñeco; la interacción del jugador se controla aparte en `navigation.js`.

La sensibilidad del mouse pasó de 0,0015 a **0,0021** (+40 %). Se conservan el descarte del primer evento, el rechazo de picos, el límite de giro por segundo y el suavizado que corrigieron los giros bruscos.

La búsqueda del filamento respeta los muebles y al jugador. Si se bloquea al técnico, basta con apartarse para dejarlo pasar. Al terminar, las acciones y los controles de cámara quedan cerrados hasta reiniciar la historia.

## Local y personajes

- Acceso único, recepción frontal contra la pared izquierda: mostrador de 4,16 unidades, apenas más largo que el ancho de un baño. Conserva 1,2 unidades detrás para el personal.
- Recepción sentada en una silla de oficina, computadora orientada al personal, teclado, mouse, una hoja con las tres modalidades y portalapiceras.
- Tres estaciones contra la pared derecha, la última junto al fondo. Separación mayor entre puestos y menos espacio vacío hacia la vidriera.
- Habitaciones continuas del piso al techo: desde el fondo hacia recepción, baño de mujeres, baño de hombres y depósito. Juntas y cornisas en tono madera separan los ambientes y marcan la unión con el techo. Interiores fuera del recorrido.
- Puertas con pictogramas de mujer, hombre y caja; se retiró la leyenda “Individual”.
- Armario de vidrio contra el fondo, entre el baño de mujeres y E3, con espacio libre junto a la puerta.
- Sillas de oficina con brazos, columna, base de cinco radios y ruedas. Las libres de E1/E3 están centradas entre PC e impresora y permiten sentarse; no se empujan ni arrastran.
- Una persona trabaja sentada en E2. Es parte del caso ilustrativo, no una medición de ocupación.
- El técnico recorre puntos de paso mientras no está solicitado. Al llamarlo va a E1 por el pasillo, respeta colisiones y se queda hasta terminar el trabajo.
- Seis figuras en la vidriera, logo elevado y tarifario de alto contraste en la pared derecha **entre E2 y E3**, fuera del ancho de sus impresoras.
- Restaurado el panel “Hecho acá” detrás de recepción, conservando el cuadro lateral con la marca e impresora. Los cinco cuadros del pasillo/puestos tienen motivos diferentes: hoja, lámpara, cohete, engranajes y soporte para teléfono; las palabras del pasillo son “Inspirá”, “Imaginá” y “Probá”.
- Póster “De la idea a la pieza” con dibujos de computadora, impresora y soporte terminado. Estantes con libros/modelos, plantas de mesa y una planta alta junto a la vidriera. Detalles de madera, apuntes y lápices en las mesas.
- Piso mate en damero arena/arcilla, alfombra de entrada y alfombra larga centrada con el armario de filamentos. Las alfombras quedan por debajo de los indicadores del recorrido.
- Paleta de marfil, madera clara, arcilla suave y salvia. Geometrías simples y carteles/pantallas generados localmente.

Las proporciones son unidades visuales para la demo, no medidas arquitectónicas reales. El plano original es conceptual; esta revisión incorpora los cambios de distribución solicitados por el grupo.

## Datos de demostración

`DEMO` en `src/workflow.js` centraliza pieza, material, gramos, tiempos y tarifas:

| Dato ilustrativo | Valor |
| --- | --- |
| Pieza | Soporte para celular, base y respaldo encastrados |
| Material | PLA verde salvia |
| Consumo total, incluidos auxiliares | 25 g: base 12 g + respaldo 13 g |
| Tiempo representado de estación | 90 minutos |
| Tarifa ficticia de estación | $6000/hora |
| Material ficticio | $100/g |
| Uso / material / total | $9000 / $2500 / **$11500** |
| Cada impresión visual / ensamblado | 7 s / 2,5 s |

Fórmula: `tarifa_horaria × minutos / 60 + precio_por_gramo × gramos`. La segunda impresión ya está contemplada en ese total. El tiempo de caminar y grabar no se factura ni altera las cifras. Computadora, impresora y asistencia **básica** se representan incluidas; no se establece una política comercial de modelado intensivo ilimitado.

Los importes son ficticios y las estimaciones están precargadas. La pantalla simula CAD/laminado y las impresoras simulan fabricación; no se conectan a equipos reales. El cierre es una demostración, sin pagos ni facturación real.

Para el encargo, `ORDER` define por separado estimación, total, anticipo y duración visual del salto de diseño: **$15.000 − $5.000 = $10.000** pendientes al retirar. No se aplica `getQuote()` ni la tarifa por hora del presencial a este servicio. Aceptar/repetir una acción no cobra de nuevo el anticipo; la primera salida exige haberlo confirmado y el retiro exige la autorización posterior del presupuesto final.

Por pedido del grupo, esos avisos se conservan en la documentación técnica y no se dicen dentro de los diálogos ni del tarifario: la escena representa una atención real con sus valores, sin comentarios sobre la producción del video.

## Rendimiento

Se consultaron los ejemplos de la materia, incluido 6.2 de rendimiento. La escena reutiliza materiales y geometrías, agrupa mobiliario estático con `InstancedMesh`, calcula sus colisiones una vez y mantiene animaciones por tiempo transcurrido. El mobiliario agrupado conserva objetos lógicos para límites y pruebas.

`CONFIG.graphics` en `src/config.js` limita la resolución a 1,25 píxeles por píxel CSS y deja las sombras dinámicas desactivadas. Los monitores usan texturas locales de 640×400: E1 se actualiza como máximo a 8 Hz y los otros a 2 Hz. El damero del piso usa una textura repetida de 512×512 y las alfombras, texturas de 256×128, generadas una sola vez en canvas. Durante la pantalla negra del encargo no se redibuja WebGL; el guion sigue actualizando su estado. Ninguna de estas optimizaciones cambia los datos del caso ni las colisiones.

Con **F2** se pueden comparar FPS y costo de dibujo en la computadora de grabación. Todavía hay que comprobar el rendimiento real con el grabador abierto; las pruebas de Node no miden la GPU ni garantizan FPS.

## Código y comprobaciones

```text
src/config.js             Distribución, colores, navegación y calidad gráfica
src/world.js              Local, muebles, recepción, tarifas y personajes
src/decorations.js        Cuadros, estantes, plantas y pictogramas de puertas
src/character.js          Personas con primitivas; variante sentada
src/navigation.js         WASD, captura del mouse y sentarse/levantarse
src/look.js               Filtro de mirada contra giros bruscos
src/physics.js            Colisiones y apoyo sobre el piso
src/workflow.js           Tres guiones, tiempos y presupuestos separados
src/workflow-targets.js   Proximidad y condiciones de interacción
src/workflow-scene.js     Técnico, impresión, traslado y ensamblado
src/monitor.js            Pantalla de CAD/slicer simulada
src/workflow-ui.js        Globos de diálogo, opciones y objetivo discreto
src/order-ui.js           Mensaje del encargo, autorización y salto al retiro
src/main.js               Coordinación, render, controles y diagnóstico
tests/                    Pruebas de física, flujo e integración sin GPU
vendor/three/             Dependencia oficial local con licencia MIT
docs/                     Contexto de validación y puntos de continuación
```

```sh
npm run check
npm test
```

Las pruebas cubren los tres recorridos completos, confirmación antes de imprimir, dos piezas, ensamblado, repetición sin acumulación, referencias, anticipo, espera sin autorización, regreso/retirada, técnico y colisiones, sentarse/levantarse, acceso y disposición del mobiliario. La prueba del coordinador usa cámara y grafo reales con un renderizador simulado; no reemplaza una revisión visual en el navegador.

Ver [estado de la iteración actual](docs/estado-hito-7.md), [material consultado](docs/material-de-referencia.md) y [licencia de Three.js](vendor/three/README.md).

## GitHub y próximos pasos

Repositorio: [rigonattoenzo/protoalquiler-grupoB5-ADSI](https://github.com/rigonattoenzo/protoalquiler-grupoB5-ADSI). La rama de trabajo es `main`. Para guardar cambios locales:

```sh
git add .
git commit -m "Describe el cambio"
```

La revisión anterior (autónomo y ambientación) está publicada. Esta iteración de encargo se guarda en un commit local para revisión; el push espera el okey final del usuario. Para publicar commits locales aprobados, ejecutar `git push`.

El material docente en `.reference/` y los ZIP están excluidos de Git. Subir el código al repositorio no publica automáticamente una web; la aplicación se ejecuta con Live Server.

Próximos pasos: validar las tomas de las tres modalidades con el grupo, refinar encuadres y agregar cámaras preparadas para grabación si hacen falta. No se requiere CAD real, backend, cuentas, reservas, inventario comercial ni pagos.
