const $ = id => document.getElementById(id);
let renderer, navigation, fatal = false, statusTimer;
function showStatus(text) {
  clearTimeout(statusTimer); $('status-message').textContent = text; $('status-message').hidden = false;
  statusTimer = setTimeout(() => { $('status-message').hidden = true; }, 3500);
}
function showError(error) {
  fatal = true; console.error(error); navigation?.exit(); renderer?.setAnimationLoop(null);
  $('loading').hidden = true; $('welcome').hidden = true; $('dialogue').hidden = true;
  $('error-panel').hidden = false; document.body.classList.remove('ui-hidden');
  $('error-detail').textContent = location.protocol === 'file:'
    ? 'Abrí index.html con Live Server; los módulos necesitan un servidor HTTP.'
    : 'No se pudo iniciar WebGL. Verificá la consola y los archivos locales. Detalle: ' + error.message;
}
async function start() {
  const [THREE, { CONFIG }, { createWorld }, { createNavigation }, flowModule, { createWorkflowScene }, { createWorkflowUI }, targets, { createOrderUI }] = await Promise.all([
    import('three'), import('./config.js'), import('./world.js'), import('./navigation.js'), import('./workflow.js'), import('./workflow-scene.js'), import('./workflow-ui.js'), import('./workflow-targets.js'), import('./order-ui.js'),
  ]);
  const { createWorkflow, MODES, getStep } = flowModule;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.08, 90);
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, CONFIG.graphics.pixelRatio)); renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = CONFIG.graphics.shadows; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Local 3D'); $('scene').append(renderer.domElement);
  scene.add(camera);
  const world = createWorld(scene), workflow = createWorkflow(), story = createWorkflowScene({ scene, world, camera });
  const freeSeats = [...world.seats.values()];
  let mode = 'walk', receptionOpen = false, savedPosition, savedQuaternion;
  const updateControls = () => {
    if (fatal) return;
    const locked = navigation.isLocked;
    document.body.classList.toggle('is-walking', locked);
    $('welcome').hidden = locked || workflow.getState().mode !== null || receptionOpen || mode === 'overview';
    $('crosshair').hidden = !locked || mode !== 'walk';
    $('view-label').textContent = mode === 'overview' ? 'Vista general' : navigation.isSeated ? 'En la estación · F para levantarte' : locked ? 'Recorrido libre' : 'En pausa';
    if (locked) { $('help-panel').hidden = true; $('help-button').setAttribute('aria-expanded', 'false'); }
  };
  navigation = createNavigation({ camera, domElement: renderer.domElement, colliders: world.colliders, config: CONFIG.navigation, onLockChange: () => queueMicrotask(updateControls) });
  const ui = createWorkflowUI({ world, camera, onSelectMode: selectMode, onAction: interact });
  const orderUI = createOrderUI({ onApprove: () => workflow.approveOrder(), onDefer: () => workflow.deferOrder(), onReturn: () => workflow.returnForOrder(), onRestart: restart });
  const inputBlocked = () => workflow.getState().complete || workflow.getState().orderAway;
  const target = () => targets.getWorkflowTarget(workflow.getState(), camera.position, { mode, menuOpen: receptionOpen, assistantReady: story.assistantReady, technicianPosition: world.technician.position, orderMeetingPoint: story.orderMeetingPoint });
  function closeReception() { receptionOpen = false; ui.setMenuOpen(false); updateControls(); }
  function openReception() {
    if (workflow.getState().mode) return;
    if (mode !== 'walk' || !targets.nearReception(camera.position)) { showStatus('Acercate al mostrador para hablar con recepción.'); return; }
    receptionOpen = true; ui.setMenuOpen(true); updateControls();
  }
  function selectMode(id) {
    if (!receptionOpen || !targets.nearReception(camera.position)) return;
    if (!MODES.find(item => item.id === id)?.available) { ui.say('receptionist', 'Por ahora podés usar E1 con asistencia o trabajar por tu cuenta. ¿Cuál preferís?'); return; }
    ui.reset();
    workflow.start(id); closeReception();
    if (!navigation.isLocked) navigation.enter();
  }
  function interact() {
    if (mode !== 'walk' || inputBlocked()) return;
    if (receptionOpen) {
      ui.say('receptionist', 'En la hoja tenés las tarifas. Decime cómo querés trabajar: 1 con asistencia, 2 por tu cuenta o 3 por encargo.');
      return;
    }
    const state = workflow.getState();
    if (state.complete || state.stepId === 'exit') return;
    if (!state.mode) { openReception(); return; }
    const destination = target();
    if (!destination.nearTarget) {
      if (destination.waiting && state.mode !== 'order') ui.say('technician', 'Voy hacia E1. Si estoy en el paso, dejame un lugar para acercarme.');
      return;
    }
    if (state.stepId === 'station') ui.say('client', state.mode === 'autonomous' ? 'Voy a diseñar un soporte para celular y preparar las dos piezas desde esta computadora.' : 'Quiero un soporte para celular. ¿Me ayudás a diseñarlo?');
    workflow.advance();
  }
  function nearbySeat() { return freeSeats.find(seat => Math.hypot(camera.position.x - seat.position.x, camera.position.z - seat.position.z) <= 1.15); }
  function toggleSeat() {
    if (mode !== 'walk' || receptionOpen || inputBlocked()) return;
    if (navigation.isSeated) {
      if (!navigation.stand()) showStatus('No hay espacio libre para levantarte. Esperá a que se despeje el paso.');
    } else if (!navigation.sit(nearbySeat())) showStatus('Acercate a una silla libre de E1 o E3 para sentarte.');
    updateControls();
  }
  function walk(capture = true) {
    if (inputBlocked()) return;
    if (mode === 'overview') {
      mode = 'walk'; world.setOverview(false); camera.position.copy(savedPosition); camera.quaternion.copy(savedQuaternion); camera.fov = 68; camera.updateProjectionMatrix();
    }
    navigation.setEnabled(true); updateControls(); if (capture) navigation.enter();
  }
  function overview() {
    if (inputBlocked()) return;
    if (mode === 'overview') { walk(); return; }
    closeReception(); savedPosition = camera.position.clone(); savedQuaternion = camera.quaternion.clone();
    world.player.position.set(camera.position.x, 0, camera.position.z); world.player.rotation.y = navigation.isSeated ? 0 : camera.rotation.y; world.setPlayerSeated(navigation.isSeated);
    mode = 'overview'; navigation.setEnabled(false); world.setOverview(true);
    camera.position.set(...CONFIG.overview.position); camera.lookAt(...CONFIG.overview.target); camera.fov = 46; camera.updateProjectionMatrix(); updateControls();
  }
  function resetCamera() { if (inputBlocked()) return; walk(false); closeReception(); navigation.reset(); updateControls(); }
  function restart() { workflow.reset(); story.reset(); ui.reset(); resetCamera(); showStatus('Toma reiniciada. Acercate a recepción y presioná E.'); }
  let previousStep = 'idle';
  workflow.subscribe(state => {
    story.applyState(state); $('end-screen').hidden = !state.complete;
    for (const id of ['hud', 'toolbar', 'welcome', 'help-panel', 'dialogue', 'flow-guide']) $(id).inert = Boolean(state.complete || state.orderAway);
    if (state.orderAway) { closeReception(); navigation.setEnabled(false); }
    if (state.stepId === 'order-pickup' && previousStep !== state.stepId) {
      mode = 'walk'; world.setOverview(false); navigation.reset(); navigation.setEnabled(true); ui.reset(); navigation.enter();
      showStatus('Al día siguiente · Retirá tu encargo en recepción.');
    }
    orderUI.render(state); previousStep = state.stepId;
    if (state.complete) { closeReception(); navigation.setEnabled(false); $('end-restart').focus({ preventScroll: true }); }
    updateControls();
  });
  story.applyState(workflow.getState());
  $('enter-button').addEventListener('click', () => walk()); $('walk-button').addEventListener('click', () => walk());
  $('overview-button').addEventListener('click', overview); $('reset-button').addEventListener('click', resetCamera); $('restart-button').addEventListener('click', restart);
  $('end-restart').addEventListener('click', restart);
  $('help-button').addEventListener('click', () => { $('help-panel').hidden = !$('help-panel').hidden; $('help-button').setAttribute('aria-expanded', String(!$('help-panel').hidden)); });
  renderer.domElement.addEventListener('click', () => { if (mode === 'walk' && !navigation.isLocked) walk(); });
  renderer.domElement.addEventListener('navigationerror', event => showStatus(event.detail.message));
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); showError(new Error('Se perdió el contexto gráfico; recargá la página.')); });
  window.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
    if (workflow.getState().complete) return;
    if (workflow.getState().orderAway) {
      if (event.code === 'Digit1' && orderUI.canReply()) { event.preventDefault(); workflow.approveOrder(); }
      if (event.code === 'Digit2' && orderUI.canReply()) { event.preventDefault(); workflow.deferOrder(); }
      if (event.code === 'Enter' && orderUI.canReturn()) { event.preventDefault(); workflow.returnForOrder(); }
      return;
    }
    const number = ['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].indexOf(event.code);
    if (number >= 0 && receptionOpen) { event.preventDefault(); selectMode(MODES[number % 3].id); }
    if (event.code === 'KeyE') { event.preventDefault(); interact(); }
    if (event.code === 'KeyF') { event.preventDefault(); toggleSeat(); }
    if (event.code === 'KeyV') { event.preventDefault(); overview(); }
    if (event.code === 'KeyR') { event.preventDefault(); resetCamera(); }
    if (event.code === 'KeyH') { event.preventDefault(); document.body.classList.toggle('ui-hidden'); }
    if (event.code === 'F2') { event.preventDefault(); $('performance-panel').hidden = !$('performance-panel').hidden; }
  });
  window.addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setPixelRatio(Math.min(devicePixelRatio, CONFIG.graphics.pixelRatio)); renderer.setSize(innerWidth, innerHeight); });
  let previousTime, sampleTime, sampleFrames = 0, lastZone;
  renderer.setAnimationLoop(time => {
    const dt = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.05); previousTime = time;
    if (!workflow.getState().complete) navigation.update(dt);
    if (!document.hidden) workflow.tick(dt);
    let state = workflow.getState();
    const playerPosition = mode === 'walk' ? camera.position : savedPosition;
    story.update(dt, state, playerPosition, { firstPerson: mode === 'walk', receptionAttending: targets.nearReception(playerPosition) && (receptionOpen || ['checkout', 'order-pickup'].includes(state.stepId)) });
    if (state.stepId === 'material' && story.materialReady) workflow.completeMaterial();
    if (mode === 'walk' && state.stepId === 'exit' && targets.atExit(camera.position)) workflow.finish();
    if (mode === 'walk' && state.stepId === 'order-leave' && targets.atExit(camera.position)) workflow.leaveForOrder();
    state = workflow.getState();
    orderUI.render(state, document.hidden ? 0 : dt);
    if (receptionOpen && !targets.nearReception(camera.position)) closeReception();
    const destination = target(), step = getStep(state);
    ui.render(state, destination, { dt, mode, locked: navigation.isLocked, materialStatus: story.materialStatus });
    let hint = mode !== 'walk' || state.complete || state.orderAway || state.stepId === 'exit' ? null : receptionOpen ? 'Elegí una opción · 1 / 2 / 3 · Esc para usar los botones'
      : !state.mode && targets.nearReception(camera.position) ? 'E · Hablar con recepción'
        : destination.waiting ? state.mode === 'order' ? 'El técnico va al costado derecho del mostrador' : 'El técnico viene hacia E1'
          : destination.nearTarget && step?.action ? 'E · ' + step.action
            : step?.automatic ? step.title + (step.sceneDriven ? '' : ' · ' + Math.round(state.progress * 100) + '%') : null;
    if (mode === 'walk' && !inputBlocked() && !receptionOpen) {
      const seatHint = navigation.isSeated ? 'F · Levantarte' : nearbySeat() ? 'F · Sentarte' : '';
      if (seatHint) hint = hint ? hint + ' · ' + seatHint : seatHint;
    }
    ui.setHint(hint);
    const zone = mode === 'overview' ? 'Distribución del taller' : world.getZone(camera.position);
    if (zone !== lastZone) { $('zone-label').textContent = zone; lastZone = zone; }
    if (!state.orderAway) renderer.render(scene, camera);
    sampleTime ??= time; sampleFrames += 1;
    if (time - sampleTime >= 1000) {
      if (!$('performance-panel').hidden) $('performance-panel').textContent = Math.round(sampleFrames * 1000 / (time - sampleTime)) + ' FPS · ' + (renderer.info?.render.calls ?? 0) + ' dibujos · ' + (renderer.info?.render.triangles ?? 0).toLocaleString('es-AR') + ' triángulos';
      sampleFrames = 0; sampleTime = time;
    }
  });
  updateControls(); $('loading').hidden = true;
}
start().catch(showError);
