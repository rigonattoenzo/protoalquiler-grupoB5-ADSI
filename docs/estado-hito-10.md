# Hito 10 — Aparición perceptible y aprobación final

- Ampliada la aparición de los globos del local de 130 a 220 ms, con 18 px de desplazamiento y escala inicial de 0,84. Se usa relleno de animación en ambos extremos para aplicar el estado inicial desde el primer cuadro.
- La preferencia de reducir movimiento mantiene un fundido por opacidad, sin escala ni desplazamiento.
- La prueba del coordinador comprueba que recepción y técnico disparan la animación, que no se repite en cada proyección y que el modo de movimiento reducido conserva el fundido.
- El usuario confirmó “Se percibe bien” y autorizó explícitamente el push de todo lo pendiente.
- La comprobación visual automática sigue bloqueada por la verificación de URL de Chrome; la validación visual de este ajuste es la del usuario.
- `npm test`: 46 pruebas. `npm run check` y `git diff --check`.
- Subir el encargo, sus refinamientos y este último ajuste a `origin/main`.
