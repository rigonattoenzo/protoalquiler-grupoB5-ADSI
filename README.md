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
2. La recepcionista presenta las tarifas ilustrativas y las tres fichas del mostrador. Elegí **1: Con asistencia**, o mirá esa ficha y tocá E. Con Esc también podés usar los botones del globo.
3. Presentá la referencia del soporte para celular. Seguí la marca verde hasta E1 y usá la computadora.
4. Llamá al técnico con E. Dejá libre el paso mientras se acerca: después permanece junto al puesto durante el trabajo.
5. Creá la base. El diseño aparece en la pantalla de la computadora. El técnico revisa la preparación y presenta el presupuesto del ejemplo.
6. Confirmá el presupuesto y solicitá la carga de material. La impresora mueve el cabezal y construye la base en una animación acelerada.
7. Llevá la base terminada a la mesa con E. Diseñá el respaldo en pantalla, validá la segunda pieza e imprimila.
8. Trasladá el respaldo y observá el ensamblado sobre la mesa.
9. Mirá el resultado y volvé al mostrador para cerrar la sesión de ejemplo. El desglose no se acumula al repetir acciones.

Los personajes hablan mediante globos anclados a su posición. Si el hablante queda fuera del encuadre, el globo se ubica en el borde para mantenerlo legible. La guía persistente ocupa una sola línea; las instrucciones principales están en los diálogos y en la escena.

**Solo está implementado el recorrido con asistencia.** Diseño autónomo y encargo aparecen en las fichas con “Próximamente”. Sus flujos no se presentan como terminados.

## Controles

| Control | Acción |
| --- | --- |
| WASD o flechas + mouse | Caminar y mirar |
| E | Hablar o ejecutar la acción cerca del objetivo |
| 1 / 2 / 3 | Elegir una ficha al conversar con recepción |
| Esc | Liberar el mouse y mostrar controles |
| V | Alternar vista general y primera persona |
| R | Restaurar la cámara de entrada; conserva el proceso |
| H | Ocultar controles para grabar; conserva los globos de diálogo |
| F2 | Mostrar diagnóstico de FPS y llamadas de dibujo |
| Reiniciar historia | Restaurar proceso, piezas, impresiones y datos del ejemplo |

Las impresiones y el ensamblado avanzan por su animación; E no permite saltarlos ni duplicarlos. Al alejarse del mostrador se cierra la elección de fichas. La circulación permanece libre durante el tutorial.

## Local y personajes

- Acceso único, recepción frontal con espacio útil de personal y una recepcionista separada del técnico.
- Tres estaciones contra la pared derecha, la última junto al fondo. Separación mayor entre puestos y menos espacio vacío hacia la vidriera.
- Depósito y dos baños continuos, del piso al techo. Interiores fuera del recorrido.
- Armario de vidrio contra el fondo, entre depósito y E3, con espacio junto a la puerta del depósito.
- Sillas de oficina con brazos, columna, base de cinco radios y ruedas. Son estáticas.
- Una persona trabaja sentada en E2. Es parte del caso ilustrativo, no una medición de ocupación.
- El técnico recorre puntos de paso mientras no está solicitado. Al llamarlo va a E1 por el pasillo, respeta colisiones y se queda hasta terminar el trabajo.
- Seis figuras en la vidriera, logo elevado y tarifario en la pared derecha sobre E2.
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

## Rendimiento

Se consultaron los ejemplos de la materia, incluido 6.2 de rendimiento. La escena reutiliza materiales y geometrías, agrupa mobiliario estático con `InstancedMesh`, calcula sus colisiones una vez y mantiene animaciones por tiempo transcurrido. El mobiliario agrupado conserva objetos lógicos para límites y pruebas.

`CONFIG.graphics` en `src/config.js` limita la resolución a 1,25 píxeles por píxel CSS y deja las sombras dinámicas desactivadas. Los monitores usan texturas locales de 640×400: E1 se actualiza como máximo a 8 Hz y los otros a 2 Hz. Las juntas del piso se dibujan en un único grupo de líneas. Ninguna de estas optimizaciones cambia los datos del caso ni las colisiones.

Con **F2** se pueden comparar FPS y costo de dibujo en la computadora de grabación. Todavía hay que comprobar el rendimiento real con el grabador abierto; las pruebas de Node no miden la GPU ni garantizan FPS.

## Código y comprobaciones

```text
src/config.js             Distribución, colores, navegación y calidad gráfica
src/world.js              Local, muebles, recepción, fichas y personajes
src/character.js          Personas con primitivas; variante sentada
src/navigation.js         WASD y captura del mouse
src/look.js               Filtro de mirada contra giros bruscos
src/physics.js            Colisiones y apoyo sobre el piso
src/workflow.js           Guion, tiempos visuales y presupuesto repetible
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

Las pruebas cubren secuencia completa, confirmación antes de imprimir, dos piezas, ensamblado, repetición sin acumulación, técnico y colisiones, acceso y disposición del mobiliario. La prueba del coordinador usa cámara y grafo reales con un renderizador simulado; no reemplaza una revisión visual en el navegador.

Ver [estado de la iteración actual](docs/estado-hito-3.md), [material consultado](docs/material-de-referencia.md) y [licencia de Three.js](vendor/three/README.md).

## GitHub y próximos pasos

El repositorio local usa `main`. Cuando se cree el remoto en GitHub, debe estar vacío, sin README, .gitignore ni licencia adicionales. Después:

```sh
git remote add origin https://github.com/TU_USUARIO/protoalquiler-grupoB5-ADSI.git
git push -u origin main
```

El material docente en `.reference/` y los ZIP están excluidos de Git. No se publicó la aplicación ni se creó un remoto.

Próximos pasos: revisar las tomas y ajustar detalles de encuadre/sensibilidad, implementar autónomo y encargo reutilizando el escenario, y agregar cámaras preparadas para grabación. No se requiere CAD real, backend, cuentas, reservas, inventario comercial ni pagos.
