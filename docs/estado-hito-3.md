# Estado del hito 3 — 8 de noviembre de 2026

## Cambios implementados

- Recepción contextual: el menú no aparece al cargar; E junto al mostrador inicia la conversación con una recepcionista. Hay tres fichas físicas y selección por mirada/E, números o botones del globo.
- Diálogos sobre los personajes, objetivo breve y controles ocultables con H. Los globos se conservan durante una toma limpia.
- Recorrido asistido completo: referencia → E1 → llamado técnico → diseño/revisión de base → presupuesto/confirmación/material → impresión → traslado a mesa → diseño/revisión de respaldo → segunda impresión → traslado/ensamblado → resultado → cierre en recepción.
- Pantalla de computadora con diseño, componentes y progreso. Cabezal móvil, piezas que crecen en la cama y ensamblado de las dos partes sobre la mesa.
- Recepcionista, técnico que patrulla y acude al llamado, y una persona sentada trabajando en E2.
- Distribución revisada según las dos indicaciones del usuario: paso de personal de aproximadamente 1,2 unidades tras recepción, puestos separados 3,65 unidades, frente más compacto y circulación a la derecha del mostrador. Unidades conceptuales, no arquitectura real.
- Armario contra el fondo, puestos contra la derecha y fondo, sillas de oficina con ruedas, seis muestras y paleta cálida.

## Datos y alcance

Tarifas ficticias: $6000/h + $100/g; caso fijo de 90 min y 25 g, total $11500. Los 25 g incluyen auxiliares y se dividen en base de 12 g y respaldo de 13 g. La segunda impresión no vuelve a sumar material ni uso. Animaciones de 7 s por impresión y 2,5 s de ensamblado.

Autónomo y encargo siguen pendientes, indicados así en sus fichas. El material y la facturación son simulados. No se implementaron pagos ni CAD/laminador reales.

## Rendimiento

- Sombras dinámicas desactivadas y pixel ratio máximo 1,25.
- Pantallas de 640×400, 8 Hz en E1 y 2 Hz en otros puestos.
- Materiales/geometrías reutilizados; 147 primitivas estáticas agrupadas en instancias en la comprobación del grafo. Paredes de corte, mecanismos y pantallas quedan separados para conservar sus animaciones/visibilidad.
- Juntas de piso en un solo LineSegments.
- F2 muestra FPS y llamadas de dibujo durante la prueba real, sin un panel permanente en el video.

Se volvió a consultar el ejemplo 6.2 del ZIP de la materia para el enfoque de medición; no se copió su creación ilimitada de objetos ni su biblioteca de estadísticas.

## Validación y continuación

Las 34 pruebas automatizadas y el chequeo de sintaxis pasan. Incluyen recorrido del coordinador completo con cámara/grafo reales y renderizador simulado, más geometría, tránsito, estado, importes, animaciones, técnico y reinicio. No miden rendimiento de GPU ni validan visualmente los globos.

Live Server en http://127.0.0.1:5500 entrega la aplicación y los módulos. Se notificó al usuario para probar distribución, fluidez y flujo. La herramienta de navegador y su conexión a aplicaciones nativas están indisponibles; no se intentó reemplazarla por otro medio de control del navegador.

La próxima observación del usuario debe priorizar: tamaño/posición de globos, visibilidad de fichas y pantalla, acceso del técnico a E1 y rendimiento con F2. Si una persona bloquea el camino del técnico, este espera; apartarse permite que termine de acercarse.

Los estados de los hitos 1 y 2 se conservan como antecedentes históricos. Para continuar, usar este documento y el README actual.
