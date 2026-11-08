# Material de referencia del hito 1

## Fuentes consultadas

- Documento completo `Contexto_Codex_ProtoAlquiler_3D.md`, suministrado por el grupo. Define la distribución vigente y el alcance general del simulador.
- Plano adjunto de ProtoAlquiler 3D: tres estaciones a la derecha; depósito y dos baños a la izquierda; recepción frente al acceso; armario de filamentos y paso hacia los puestos.
- `Material.zip` de la materia, especialmente su archivo anidado `Profe-Franco/CodigosEjemplo.zip`.

El pedido actual limita esta entrega al **escenario navegable, personaje, luz y colisiones**. El proceso asistido completo del documento queda para el siguiente hito. Las consignas y desafíos de los ejemplos son material de estudio, no tareas adicionales del proyecto.

## Ejemplos revisados y aplicación

| Ejemplo del ZIP | Qué se revisó | Aplicación al proyecto |
| --- | --- | --- |
| 1.2 — Básico dividido en clases | `index.html`, `inicializaciones.js`, `main.js` | Separar la creación de escena, cámara y renderizador de la coordinación principal y del bucle de actualización. |
| 6 — Luces | `main.js` | Usar materiales que respondan a la iluminación; combinar luz general y direccional para reconocer volúmenes. La demostración de luces de colores y su joystick no forman parte de este hito. |
| 9 — Colisiones | `main.js` | Representar obstáculos con límites sencillos. En el local los muebles son estáticos, por lo que sus límites pueden prepararse una vez; el movimiento debe comprobar todo el trayecto y permitir deslizar junto a paredes. |
| 14 — Personajes | `main.js`, `Personaje.js` | Mantener el personaje como componente independiente y actualizar animaciones con tiempo transcurrido. El muñeco de esta entrega se construye con geometrías simples, sin importar el modelo GLB del ejemplo. |
| 15 — Física; Física movimiento | Ambos `main.js` e `index.html` de movimiento | Separar representación visual y estado físico; conservar la componente vertical para la gravedad; leer teclas como estado. Para este piso plano alcanza un controlador cinemático con colisiones, sin agregar un motor de cuerpos rígidos. |

El ejercicio 15 muestra un mundo con Cannon.js, cuerpos dinámicos y sincronización de posiciones y rotaciones. Es útil para estudiar objetos que caen o rebotan. Esta entrega necesita caminar sin atravesar obstáculos: no incluye empujar muebles, saltar, escaleras ni rebotes.

## Compatibilidad y recursos

El `three.min.js` inspeccionado en el ejemplo 1.2 identifica la revisión **r132** y expone el objeto global `THREE`. El `GLTFLoader.js` de personajes también utiliza ese objeto global. El proyecto usa módulos ES y una única versión de Three.js para la biblioteca y sus controles; no mezcla los archivos antiguos del ZIP con esas importaciones.

Algunas demostraciones incrementan posiciones por fotograma. Para que la velocidad de navegación no dependa de los FPS, el proyecto actualiza el movimiento con el tiempo transcurrido y limita los pasos largos. Las cajas de colisión se calculan a partir de la distribución del local, sin reconstruirlas en cada fotograma.

Los ejemplos se consultaron como referencia: no se copiaron sus modelos, texturas, sonidos ni bibliotecas al producto. El archivo de consulta local dentro de `.reference/` debe quedar fuera de Git. La licencia de la biblioteca distribuida con el proyecto se conserva junto a sus archivos.

## Criterios del plano a conservar

- La entrada única queda a la izquierda del frente. El visitante rodea el extremo derecho del mostrador para llegar a las estaciones; no necesita atravesar el espacio del personal.
- Cada estación reutiliza una misma estructura y mantiene computadora, superficie de trabajo, impresora y silla reconocibles.
- Los tres volúmenes del lateral izquierdo representan habitaciones cerradas. Sus interiores no pertenecen al recorrido digital y sus puertas permanecen bloqueadas.
- El armario se diferencia de esas habitaciones y deja libre el paso hacia los puestos. Las bobinas se reconocen visualmente, pero todavía no se pueden tomar ni cargar.
- Las proporciones del escenario son decisiones visuales para navegar. No representan medidas arquitectónicas reales ni una validación de los 78 m² del antecedente.

Para verificar la circulación conviene caminar desde la entrada hasta E3, pasar junto al armario, volver al frente y acercarse a cada puesto. Las sillas y los extremos de los muebles también deben respetar el volumen del visitante. La vista general ayuda a comparar esta distribución con el plano, mientras la primera persona sigue siendo el modo principal.
