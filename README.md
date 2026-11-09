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

**Diseño con asistencia y diseño autónomo están implementados.** Encargo sigue marcado “Próximamente”. La hoja y el cartel indican presupuesto por trabajo para esa modalidad, cuya tarifa específica todavía no fue definida.

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
- Depósito y dos baños continuos, del piso al techo, con juntas oscuras que marcan sus divisiones. Interiores fuera del recorrido.
- Armario de vidrio contra el fondo, entre depósito y E3, con espacio junto a la puerta del depósito.
- Sillas de oficina con brazos, columna, base de cinco radios y ruedas. Las libres de E1/E3 están centradas entre PC e impresora y permiten sentarse; no se empujan ni arrastran.
- Una persona trabaja sentada en E2. Es parte del caso ilustrativo, no una medición de ocupación.
- El técnico recorre puntos de paso mientras no está solicitado. Al llamarlo va a E1 por el pasillo, respeta colisiones y se queda hasta terminar el trabajo.
- Seis figuras en la vidriera, logo elevado y tarifario de alto contraste en la pared derecha **entre E2 y E3**, fuera del ancho de sus impresoras.
- Póster del proceso, póster de recepción, plantas y detalles de madera en mostrador y estaciones.
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

Por pedido del grupo, esos avisos se conservan en la documentación técnica y no se dicen dentro de los diálogos ni del tarifario: la escena representa una atención real con sus valores, sin comentarios sobre la producción del video.

## Rendimiento

Se consultaron los ejemplos de la materia, incluido 6.2 de rendimiento. La escena reutiliza materiales y geometrías, agrupa mobiliario estático con `InstancedMesh`, calcula sus colisiones una vez y mantiene animaciones por tiempo transcurrido. El mobiliario agrupado conserva objetos lógicos para límites y pruebas.

`CONFIG.graphics` en `src/config.js` limita la resolución a 1,25 píxeles por píxel CSS y deja las sombras dinámicas desactivadas. Los monitores usan texturas locales de 640×400: E1 se actualiza como máximo a 8 Hz y los otros a 2 Hz. Las juntas del piso se dibujan en un único grupo de líneas. Ninguna de estas optimizaciones cambia los datos del caso ni las colisiones.

Con **F2** se pueden comparar FPS y costo de dibujo en la computadora de grabación. Todavía hay que comprobar el rendimiento real con el grabador abierto; las pruebas de Node no miden la GPU ni garantizan FPS.

## Código y comprobaciones

```text
src/config.js             Distribución, colores, navegación y calidad gráfica
src/world.js              Local, muebles, recepción, tarifas y personajes
src/character.js          Personas con primitivas; variante sentada
src/navigation.js         WASD, captura del mouse y sentarse/levantarse
src/look.js               Filtro de mirada contra giros bruscos
src/physics.js            Colisiones y apoyo sobre el piso
src/workflow.js           Guiones asistido/autónomo, tiempos y presupuesto
src/workflow-targets.js   Proximidad y condiciones de interacción
src/workflow-scene.js     Técnico, impresión, traslado y ensamblado
src/monitor.js            Pantalla de CAD/slicer simulada
src/workflow-ui.js        Globos de diálogo, opciones y objetivo discreto
src/main.js               Coordinación, render, controles y diagnóstico
tests/                    Pruebas de física, flujo e integración sin GPU
vendor/three/             Dependencia oficial local con licencia MIT
docs/                     Contexto de validación y puntos de continuación
```

```sh
npm run check
npm test
```

Las pruebas cubren ambos recorridos completos, confirmación antes de imprimir, dos piezas, ensamblado, repetición sin acumulación, técnico y colisiones, sentarse/levantarse, acceso y disposición del mobiliario. La prueba del coordinador usa cámara y grafo reales con un renderizador simulado; no reemplaza una revisión visual en el navegador.

Ver [estado de la iteración actual](docs/estado-hito-5.md), [material consultado](docs/material-de-referencia.md) y [licencia de Three.js](vendor/three/README.md).

## GitHub y próximos pasos

Repositorio: [rigonattoenzo/protoalquiler-grupoB5-ADSI](https://github.com/rigonattoenzo/protoalquiler-grupoB5-ADSI). La rama de trabajo es `main`. Para guardar cambios locales:

```sh
git add .
git commit -m "Describe el cambio"
```

Esta iteración se guarda con commit local. **El push queda pendiente del okey final del grupo.** Cuando esté aprobado, `git push` publica los commits en el repositorio.

El material docente en `.reference/` y los ZIP están excluidos de Git. Subir el código al repositorio no publica automáticamente una web; la aplicación se ejecuta con Live Server.

Próximos pasos: validar visualmente esta distribución y la sensibilidad con el grupo, implementar el encargo reutilizando el escenario y agregar cámaras preparadas para grabación. No se requiere CAD real, backend, cuentas, reservas, inventario comercial ni pagos.
