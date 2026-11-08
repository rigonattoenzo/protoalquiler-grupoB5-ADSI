# Validación del hito 1

## Resultado comprobado automáticamente

- `node scripts/check.mjs`: sintaxis válida en código propio y presencia de los recursos locales requeridos.
- `node --test`: **28 pruebas aprobadas** (8 de física, 8 del escenario real y 12 de mirada/navegación).
- La escena real se construye en Node con Three.js local. Se sustituye únicamente el contexto 2D usado por los carteles; no se simula un renderizador WebGL.
- Colisiones: pared fina con desplazamientos grandes, radio y tangencia, deslizamiento diagonal, pasillos, acceso demasiado angosto, recuperación de un solapamiento y gravedad hasta el piso.
- Distribución: posición inicial libre; tres mesas equipadas; depósito y dos baños bloqueados; un único acceso con umbral limitado; ruta continua por la derecha de recepción hasta E1, E2 y E3; paredes y colisiones conservadas al cambiar de vista.
- Mirada y navegación: descarte de picos y primer evento, giro limitado, suavizado equivalente a 30/120 FPS, límites de pitch/yaw, ausencia de roll, movimiento de teclado sin rotación, reinicio, cambio de vista, recaptura y pérdida/recuperación de foco. La integración usa la cámara y el addon reales con un DOM mínimo en Node; no es una prueba automatizada del navegador.
- HTTP: `index.html`, CSS, arranque y módulos locales de Three.js responden **200**, con tipos de contenido correctos.
- Se inició el motor incluido en la extensión instalada **Live Server 5.7.10** de Ritwick Dey, con host `127.0.0.1` y puerto `5500`. Se comprobó que la respuesta HTML incluye el script de recarga de Live Server y que los módulos responden 200. No se instaló una segunda copia de la extensión.
- El servidor Node propio también se comprobó como alternativa opcional, y se detuvo antes de iniciar Live Server.

## Revisión visual y observaciones del usuario

La herramienta de control del navegador no pudo determinar con suficiente confianza la URL de la ventana de Chrome en Windows y detuvo la automatización. Además, el acceso directo a pestañas informó que su host no estaba disponible. **Esto no es un rechazo de la URL localhost ni un error HTTP de la aplicación.** No se cambió ninguna configuración de seguridad ni se intentó sortear el bloqueo.

El usuario abrió la demo con Live Server y confirmó que carga y permite ver el local. Informó dos problemas: separaciones entre baños/depósito y paredes que no llegaban al techo; y giros bruscos de la cámara durante el movimiento.

Las habitaciones se corrigieron para compartir límites laterales, unirse a la pared izquierda y alcanzar la cara inferior del techo. Una prueba del escenario real comprueba también la continuidad de sus colisiones en los antiguos huecos.

La cámara ahora conserva PointerLockControls para la captura y aplica la mirada desde un controlador propio: descarta deltas inválidos o extremos y el primer desplazamiento de una captura, limita el giro por segundo y suaviza por tiempo transcurrido. Al perder foco, reiniciar o cambiar de vista se descarta el giro pendiente. Se conserva intacto el código de Three.js. Es una mitigación del camino de entrada que antes aceptaba cualquier delta sin límite; el disparador exacto del salto en el equipo del usuario no se pudo reproducir mediante automatización.

El usuario volvió a probar los cambios con Live Server y **confirmó que ambos problemas quedaron corregidos**: habitaciones unidas y cámara sin los giros bruscos anteriores. Observó que la sensibilidad resulta algo baja y pidió expresamente dejar su ajuste para una iteración posterior.

La comprobación visual automatizada sigue sin estar disponible. La prueba del usuario confirma esas dos correcciones; todavía no se verificaron de forma exhaustiva:

- Carteles, encuadre y comportamiento en distintas resoluciones.
- Todos los casos de captura y liberación del mouse y recuperación de foco.
- Controles V/R/H y adaptación visual a la resolución del equipo.
- Fluidez con OBS u otro grabador de pantalla.

La confirmación del usuario valida la carga inicial y las dos correcciones en su equipo. No permite prometer un rendimiento concreto con captura de video ni reemplaza las pruebas de los controles restantes.

## Prueba manual sugerida

Abrir con Live Server y probar: entrar, mirar, chocar con recepción, rodear su derecha, acercarse a los tres puestos, comprobar armario y habitaciones bloqueadas, salir un paso al umbral, usar Esc y volver a entrar, alternar V, reiniciar con R y ocultar/restaurar la interfaz con H. Comparar la vista general con el plano conceptual.

El siguiente hito se empieza cuando el equipo revise esta base. Los recorridos de diseño, revisión e impresión siguen pendientes.
