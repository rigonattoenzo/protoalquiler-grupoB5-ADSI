# ProtoAlquiler 3D

Simulación del local para que el equipo pueda preparar y grabar el video del TP de Administración de Sistemas de Información, UTN FRC. Implementada con **Three.js, HTML, CSS y JavaScript**, sin framework ni compilación.

## Hito 1 — Local navegable

Esta entrega sigue el pedido de avanzar por hitos. Incluye:

- Un local con un único acceso frontal, recepción y paso por la derecha del mostrador.
- Tres estaciones amplias reutilizadas, cada una con computadora, superficie de trabajo, impresora sencilla y silla.
- Armario con frentes transparentes y bobinas, técnico, depósito y dos baños individuales identificados. Las tres habitaciones forman un bloque continuo contra la pared izquierda, sin huecos entre ellas y hasta el techo. Sus interiores están bloqueados.
- Vidriera con dos piezas de ejemplo.
- Cliente en primera persona, WASD, mouse, aceleración/frenado y colisiones con paredes, mobiliario y técnico.
- Mirada con filtro de picos del mouse, límite de velocidad de giro y suavizado por tiempo transcurrido. Al capturar o retomar el mouse se descarta el primer desplazamiento para evitar un salto de recentrado.
- Apoyo sobre el piso mediante gravedad simple. No hay salto, escaleras ni objetos físicos dinámicos.
- Vista general sin techo ni paredes frontal/derecha, con el muñequito del cliente en su posición, además del técnico.
- Reinicio de cámara, ayuda y controles que se pueden ocultar para grabar.

Los muebles son primitivas de colores planos. Los carteles se dibujan localmente en canvas. No se usan modelos ni texturas externas.

**Todavía no están implementados los recorridos comerciales**: recepción interactiva, elección de modalidad, diseño preparado, revisión, presupuesto, impresión acelerada y resumen corresponden a los siguientes hitos. Caminar no inicia procesos ni modifica consumos.

## Abrir con Live Server

1. Abrí esta carpeta completa en Visual Studio Code.
2. Instalá **Live Server**, de Ritwick Dey, si todavía no lo tenés.
3. Clic derecho sobre `index.html` → **Open with Live Server**, o usá **Go Live**.
4. Abrí la dirección que indique la extensión en Chrome, Edge o Firefox actualizado, con WebGL 2 y aceleración gráfica.
5. Pulsá **Recorrer el local**. El navegador captura el mouse; `Esc` lo libera.

No abras `index.html` con doble clic (`file://`): los módulos necesitan un servidor HTTP. **No hace falta `npm install` ni conexión a Internet para ejecutar la demo**: Three.js y los controles están incluidos en `vendor/`.

Alternativa si ya tenés Node.js 20 o posterior:

```sh
npm start
```

Abrí la dirección que imprime la consola (normalmente `http://127.0.0.1:5500`). Si ese puerto está ocupado, prueba hasta el 5510. Este servidor opcional solo escucha en tu computadora; se detiene con `Ctrl+C`. Live Server sigue siendo la forma principal y agrega recarga automática.

## Controles

| Control | Acción |
| --- | --- |
| WASD o flechas | Caminar en la dirección de la cámara |
| Mouse | Mirar, después de pulsar Recorrer |
| Esc | Liberar el mouse y pausar el movimiento |
| V | Alternar vista general y recorrido; conserva la posición |
| R | Volver a la entrada y mirar hacia recepción |
| H | Ocultar o mostrar la interfaz |
| Botones superiores | Recorrer, vista general, entrada y ayuda |

Desde la entrada, rodeá el mostrador **por su derecha** para acceder al pasillo y a E1, E2 y E3. El pequeño umbral del acceso permite salir un paso; el exterior completo queda fuera de este hito.

El cliente está representado por la cámara al caminar y por una figura azul en la vista general. El técnico es la figura verde. Los dos están construidos con primitivas, sin animaciones de trabajo todavía.

Para una toma limpia: entrá al recorrido y pulsá `H`. Pulsá `H` otra vez para recuperar la interfaz. Al volver de la vista general, el navegador puede requerir un nuevo clic en **Recorrer** para capturar el mouse.

## Organización

```text
index.html                 Interfaz e import map local
styles.css                 Paneles y controles sobre la escena
src/
  main.js                  Arranque, render, interfaz y vistas
  config.js                Colores, proporciones, estaciones y navegación
  world.js                 Local, muebles, luces y colisionadores estáticos
  character.js             Personajes construidos con primitivas
  navigation.js            WASD, Pointer Lock y movimiento de cámara
  look.js                  Filtro y actualización suave de la mirada
  physics.js               Colisión círculo/AABB y apoyo sobre el piso
scripts/
  serve.mjs                Servidor local opcional sin dependencias
  check.mjs                Comprobación de sintaxis y archivos
tests/                     Pruebas de física y distribución
vendor/three/              Three.js r187 y controles, con licencia MIT
docs/                      Referencias y registro de validación
```

Las proporciones de `src/config.js` y `src/world.js` son unidades de escena elegidas para el recorrido. **No son medidas arquitectónicas reales ni una declaración de superficie**. Se siguió el plano conceptual de tres estaciones, acceso único y recepción frontal. Se consultó completo el documento recibido `Contexto_Codex_ProtoAlquiler_3D.md`; el nombre `Contexto_Codex_Prototipo.md` mencionado en el pedido no estaba presente.

Para simplificar este hito, las cajas de colisión se calculan una sola vez a partir de los volúmenes sólidos. El jugador es un círculo en XZ con altura de cámara fija; usa subpasos para evitar atravesar paredes y se desliza al tocar un obstáculo. La vista general cambia la cámara y la visibilidad de paredes; no cambia las colisiones del recorrido.

El material de la materia se consultó como referencia, sin copiar sus ejercicios ni modelos. Ver [material de referencia](docs/material-de-referencia.md). Three.js está fijado en **0.187.0**, con núcleo y controles de la misma versión; ver [origen y licencia](vendor/three/README.md).

## Comprobaciones

Con Node.js 20 o posterior, sin instalar paquetes:

```sh
npm run check
npm test
```

Las pruebas verifican física, distribución y controles de cámara; no reemplazan una prueba visual. El detalle de lo comprobado y la limitación del acceso al navegador están en [validación del hito](docs/validacion-hito-1.md).

Para cerrar la revisión visual en tu computadora:

1. Comprobá que desaparece la carga y ves recepción al abrir.
2. Pulsá Recorrer, mirá con el mouse y caminá contra el mostrador: debe detenerte.
3. Rodealo por la derecha y acercate a las tres estaciones; mesas y sillas deben bloquear el paso.
4. Probá paredes, armario, puertas de baños y depósito: no deben atravesarse.
5. Probá `Esc`, volver a Recorrer, `V`, `R` y `H`.
6. Comprobá luz, carteles y fluidez con tu grabador abierto antes de producir el video.

## Hitos siguientes

Antes de ampliar el recorrido: ajustar la sensibilidad de la mirada según la preferencia del equipo. El usuario confirmó las correcciones de habitaciones y giros bruscos, y pidió posponer ese ajuste fino para otra iteración.

1. **Recepción y recorrido asistido:** estado centralizado, modalidad, E1, referencia precargada, diseño y preparación guionados.
2. **Revisión e impresión:** intervención del técnico, confirmación del material, presupuesto ilustrativo, impresión acelerada y resumen repetible.
3. **Reutilización y grabación:** modalidad autónoma y encargo, salto de escenas y cámaras preparadas.

Los futuros datos de tiempo, gramos y tarifas serán ilustrativos y configurables. Este hito no introduce precios comerciales ni modifica las decisiones del emprendimiento.

## Subir a GitHub por primera vez

El repositorio Git local ya existía. `git init` crea la carpeta oculta `.git`; no crea un repositorio en GitHub ni un archivo `.init`.

Cuando esté listo el primer commit local:

1. En GitHub, creá un repositorio vacío, por ejemplo `protoalquiler-grupoB5-ADSI`, con la visibilidad que el equipo prefiera.
2. **No agregues README, .gitignore ni licencia desde GitHub**, porque esta carpeta ya contiene los archivos del proyecto.
3. Copiá su URL HTTPS y ejecutá desde esta carpeta, reemplazando `TU_USUARIO` y el nombre si corresponde:

```sh
git remote add origin https://github.com/TU_USUARIO/protoalquiler-grupoB5-ADSI.git
git push -u origin main
```

Git puede pedirte iniciar sesión en GitHub. También podés pasarme la URL cuando lo crees para conectar el remoto y hacer el primer push. El ZIP de la materia y `.reference/` están excluidos por `.gitignore`.

Para cambios posteriores:

```sh
git add .
git commit -m "Describe el cambio realizado"
git push
```

Subir el código a GitHub no publica automáticamente una web. El hosting queda para otro momento.
