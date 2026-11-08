# Punto de continuación — Hito 2

## Implementado

- Menú inicial con tres modalidades. Solo diseño asistido está habilitado; las otras dos figuran como pendientes.
- Tutorial: recepción y referencia → estación E1 → base → apoyo del soporte → preparación → preparación lista.
- Interacción con E o botón, habilitada por proximidad; exploración independiente del proceso.
- Modelo progresivo sobre la mesa; marcador de destino; técnico en una posición guionada con su collider sincronizado.
- Reinicio del tutorial y salida a exploración; R solo restaura la cámara.
- Datos de demostración centralizados en DEMO de src/workflow.js: soporte para celular, PLA verde, 25 g incluidos auxiliares y 90 min representados. No hay facturación ni impresión todavía.

## Validación al guardar

- Sintaxis y recursos locales comprobados.
- 46 pruebas automatizadas: física, mirada, distribución, secuencia de estados, destinos/proximidad y representación visual del guion con Three.js sin renderizador.
- Live Server sigue disponible en http://127.0.0.1:5500; página y módulos nuevos responden HTTP 200.
- La herramienta de navegador continúa sin estar disponible. Este nuevo tutorial todavía necesita la prueba visual del usuario: elegir primera opción, E en recepción, caminar a E1, completar los pasos con E y verificar reinicio/exploración. No se presenta esa revisión visual como aprobada.

## Retomar desde aquí

1. Probar y refinar menú, tutorial, tamaño de paneles y visibilidad de la pieza desde E1.
2. Continuar con revisión del técnico, presupuesto ilustrativo, confirmación del material, suministro de bobina, impresión acelerada y resumen.
3. Reutilizar después para modalidad autónoma y encargo.

La sensibilidad de mirada quedó pendiente por pedido del usuario. No modificar las decisiones del negocio ni presentar los otros recorridos como implementados.

Este punto se guarda porque el usuario avisó que le queda poco margen de tokens. No hay remoto GitHub creado todavía; no subir archivos de .reference/ ni el material docente.
