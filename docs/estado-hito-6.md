# Hito 6 — Decoración y redistribución de habitaciones

- Intercambiados depósito y baño de mujeres: depósito junto a recepción, baño de hombres en el medio y baño de mujeres al fondo. Se trasladan los nombres, puertas, colores y pictogramas junto con cada función; los volúmenes siguen cerrados y continuos.
- Juntas cambiadas del color oscuro a madera tostada. Cornisas del mismo tono marcan la unión de cada habitación con el techo, visibles desde primera persona; zócalos completan las fachadas.
- Reemplazadas las leyendas “Individual” por pictogramas vectoriales: hombre, mujer y caja. Son pequeños (panel de 0,30 × 0,39 unidades) y tienen fondo transparente, para dejar solo el símbolo sobre la puerta. No dependen de emojis ni de fuentes externas.
- Más decoración visible: panel de marca detrás de recepción, tres cuadros de plantas en el pasillo, dos cuadros geométricos sobre los puestos, estantes con libros y modelos, plantas con hojas, una maceta alta junto a la vidriera y detalles de apuntes/lápices en cada mesa.
- Rediseño de los carteles de recepción: fondo cálido, marco, marca con jerarquía e ilustración de impresora/capas; el panel principal lleva listones de madera detrás. El cartel del proceso sobre E1 se achicó y se desplazó para separar sus bordes de los cuadros vecinos.
- Reemplazada la cuadrícula del piso por madera mate con vetas y juntas escalonadas. Alfombra de entrada y alfombra larga de pasillo, por debajo de los indicadores verdes. Texturas de madera de 512×512 y textiles de 256×128, generadas una vez con canvas y sin recursos externos.
- Construcción separada en `src/decorations.js`, con geometrías y materiales compartidos. Los carteles decorativos usan texturas locales de 512 px de ancho, se dibujan una vez y los elementos estáticos participan de la agrupación existente. Los cuadros de la pared derecha acompañan el corte de la vista general.
- La planta de piso tiene un límite de colisión. La decoración adosada deja el corredor y las puertas libres. No cambia el recorrido asistido ni el autónomo.

## Validación

`npm test` comprueba los dos recorridos y la circulación; se actualizó la comprobación de habitaciones para el nuevo orden. `npm run check` incluye el módulo nuevo. `git diff --check` verifica el parche.

El grupo aprobó la iteración anterior en el navegador y pidió estos ajustes antes de subirla. La inspección visual automática había quedado bloqueada por la verificación de URL de Chrome; no se afirma una nueva revisión visual ni una medición de GPU.

## Publicación en Git

El usuario autorizó explícitamente el push al completar estos cambios. Subir tanto el commit del recorrido autónomo como esta revisión a `origin/main`. El encargo sigue pendiente.
