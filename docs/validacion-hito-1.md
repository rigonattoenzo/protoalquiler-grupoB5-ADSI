# Validación del hito 1

## Resultado comprobado automáticamente

- `node scripts/check.mjs`: sintaxis válida en código propio y presencia de los recursos locales requeridos.
- `node --test`: **15 pruebas aprobadas** (8 de física y 7 del escenario real).
- La escena real se construye en Node con Three.js local. Se sustituye únicamente el contexto 2D usado por los carteles; no se simula un renderizador WebGL.
- Colisiones: pared fina con desplazamientos grandes, radio y tangencia, deslizamiento diagonal, pasillos, acceso demasiado angosto, recuperación de un solapamiento y gravedad hasta el piso.
- Distribución: posición inicial libre; tres mesas equipadas; depósito y dos baños bloqueados; un único acceso con umbral limitado; ruta continua por la derecha de recepción hasta E1, E2 y E3; paredes y colisiones conservadas al cambiar de vista.
- HTTP: `index.html`, CSS, arranque y módulos locales de Three.js responden **200**, con tipos de contenido correctos.
- Se inició el motor incluido en la extensión instalada **Live Server 5.7.10** de Ritwick Dey, con host `127.0.0.1` y puerto `5500`. Se comprobó que la respuesta HTML incluye el script de recarga de Live Server y que los módulos responden 200. No se instaló una segunda copia de la extensión.
- El servidor Node propio también se comprobó como alternativa opcional, y se detuvo antes de iniciar Live Server.

## Revisión visual pendiente

La herramienta de control del navegador no pudo determinar con suficiente confianza la URL de la ventana de Chrome en Windows y detuvo la automatización. Además, el acceso directo a pestañas informó que su host no estaba disponible. **Esto no es un rechazo de la URL localhost ni un error HTTP de la aplicación.** No se cambió ninguna configuración de seguridad ni se intentó sortear el bloqueo.

Por eso todavía no se confirmó mediante una sesión real del navegador:

- Render WebGL, iluminación, sombras, carteles y encuadre.
- Captura y liberación real del mouse, y respuesta de WASD junto con el render.
- Controles V/R/H y adaptación visual a la resolución del equipo.
- Fluidez con OBS u otro grabador de pantalla.

Se solicitó al usuario probar el local servido por Live Server. Hasta recibir esa observación no se debe presentar la revisión visual como aprobada ni prometer un rendimiento concreto.

## Prueba manual sugerida

Abrir con Live Server y probar: entrar, mirar, chocar con recepción, rodear su derecha, acercarse a los tres puestos, comprobar armario y habitaciones bloqueadas, salir un paso al umbral, usar Esc y volver a entrar, alternar V, reiniciar con R y ocultar/restaurar la interfaz con H. Comparar la vista general con el plano conceptual.

El siguiente hito se empieza cuando el equipo revise esta base. Los recorridos de diseño, revisión e impresión siguen pendientes.
