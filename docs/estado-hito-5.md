# Hito 5 — Diseño autónomo y ambientación

## Cambios

- Modalidad 2 disponible en recepción. El cliente diseña base y respaldo y prepara ambos archivos desde la PC, sin orientación de modelado.
- El técnico se solicita al terminar el laminado: revisa, busca y carga la bobina. Retoma su paseo al comenzar la impresión. Se conserva el suministro controlado del contexto original.
- Ambas modalidades completan dos impresiones, ensamblado, bolsa, cobro y salida. Comparten presupuesto: 90 min × $6000/h + 25 g × $100/g = $11500. Nueve confirmaciones con E por recorrido, después de elegir modalidad.
- Mostrador más corto, pegado a la pared izquierda, silla y recepcionista sentada, PC orientada al personal, teclado/mouse, una hoja de tarifas y portalapiceras.
- Encargo sigue pendiente y se indica presupuesto por trabajo. No tiene una nueva tarifa horaria inventada.
- Juntas oscuras entre las tres habitaciones, sin abrir huecos.
- Sillas libres centradas en E1/E3. F permite sentarse y levantarse; mouse y E siguen funcionando. La posición al levantarse se valida contra muebles y personas. La silla ocupada de E2 y recepción no se ofrecen al jugador.
- `seated` en `character.js` sigue siendo una pose visual; el control de postura del jugador está en `navigation.js`. Vista general representa ambas poses y reiniciar recupera al jugador de pie.
- Plantas, póster del proceso, póster de recepción y detalles de madera. Geometrías/materiales compartidos y agrupación de objetos estáticos.
- Tarifario con título grande, contraste y precio por hora/gramo destacado. Está entre E2/E3, con sus bordes por fuera de la proyección de ambas impresoras.
- Sensibilidad 0,0021 (+40 %); mismos filtros de captura, rechazo de picos y límites de giro.

## Comprobaciones

- `npm test`: 41 pruebas, incluidos ambos recorridos en el coordinador, espera de revisión, bobina física, postura, cobro, final y reinicio.
- `npm run check` y `git diff --check`.
- Reconsulta de los ejemplos 6.2 (rendimiento) y 14 (personajes) del material docente. No se copiaron bibliotecas r132 ni recursos del curso al producto.
- Live Server en `http://127.0.0.1:5500`, usando la instalación existente de la extensión.
- Revisión visual automática bloqueada: el acceso del navegador no está disponible y la herramienta nativa no pudo determinar la URL actual con suficiente confianza. Las pruebas del grafo/renderizador simulado no reemplazan una comprobación visual del grupo ni miden FPS de la GPU.

## Probar

1. Recargar, entrar y hablar con recepción usando E.
2. Elegir 2 y completar el recorrido autónomo desde E1. Probar F antes y después de imprimir, mirar con el mouse y usar E sentado.
3. Revisar el tamaño del mostrador, la hoja, PC/silla, las divisiones de habitaciones, la ubicación del tarifario y los adornos.
4. Reiniciar y elegir 1 para comprobar que la asistencia de modelado sigue funcionando.
5. Comparar sensibilidad y fluidez; F2 muestra el diagnóstico para la computadora de grabación.

## Git

Guardar en commit local. **No hacer push hasta que el usuario dé el okey final.** El remoto configurado sigue siendo `rigonattoenzo/protoalquiler-grupoB5-ADSI`.
