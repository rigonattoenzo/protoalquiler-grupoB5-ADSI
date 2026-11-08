// El arranque dinámico permite informar errores de carga en el propio panel.
const $ = (id) => document.getElementById(id);
let navigation;
let renderer;
let statusTimeout;

function showStatus(message) {
  clearTimeout(statusTimeout);
  $('status-message').textContent = message;
  $('status-message').hidden = false;
  statusTimeout = setTimeout(() => { $('status-message').hidden = true; }, 4500);
}

function showError(error) {
  console.error(error);
  navigation?.exit();
  renderer?.setAnimationLoop(null);
  document.body.classList.remove('ui-hidden');
  $('loading').hidden = true;
  $('welcome').hidden = true;
  $('error-panel').hidden = false;
  $('error-detail').textContent = location.protocol === 'file:'
    ? 'Abrí index.html con Live Server desde Visual Studio Code. Los módulos no funcionan al abrir el archivo con doble clic.'
    : 'No se pudo iniciar la escena. Usá Chrome, Edge o Firefox actualizado con WebGL 2 y aceleración gráfica. Verificá que la carpeta vendor esté completa. Detalle: ' + error.message;
}

async function start() {
  const [THREE, { CONFIG }, { createWorld }, { createNavigation }] = await Promise.all([
    import('three'), import('./config.js'), import('./world.js'), import('./navigation.js'),
  ]);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.08, 85);
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Vista 3D del local');
  $('scene').append(renderer.domElement);
  const world = createWorld(scene);
  let mode = 'walk';
  let savedPosition;
  let savedQuaternion;
  const activeButton = (id, active) => {
    $(id).classList.toggle('active', active);
    $(id).setAttribute('aria-pressed', String(active));
  };
  const updateControls = () => {
    if (navigation.isLocked) {
      $('help-panel').hidden = true;
      $('help-button').setAttribute('aria-expanded', 'false');
    }
    $('welcome').hidden = mode === 'overview' || navigation.isLocked;
    $('crosshair').hidden = mode !== 'walk' || !navigation.isLocked;
    $('view-label').textContent = mode === 'overview' ? 'Vista general' : navigation.isLocked ? 'Recorrido libre' : 'Recorrido en pausa';
    activeButton('walk-button', mode === 'walk');
    activeButton('overview-button', mode === 'overview');
  };
  navigation = createNavigation({
    camera, domElement: renderer.domElement,
    colliders: world.colliders, config: CONFIG.navigation,
    // PointerLockControls emite el evento antes de actualizar isLocked.
    onLockChange: () => queueMicrotask(updateControls),
  });
  const copyPlayer = () => {
    world.player.position.set(camera.position.x, 0, camera.position.z);
    world.player.rotation.y = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ').y;
  };
  function overview() {
    if (mode === 'overview') return;
    savedPosition = camera.position.clone();
    savedQuaternion = camera.quaternion.clone();
    copyPlayer();
    mode = 'overview';
    navigation.setEnabled(false);
    world.setOverview(true);
    camera.fov = 46;
    camera.position.set(...CONFIG.overview.position);
    camera.lookAt(...CONFIG.overview.target);
    camera.updateProjectionMatrix();
    $('help-panel').hidden = true;
    $('help-button').setAttribute('aria-expanded', 'false');
    updateControls();
    showStatus('Vista general · V vuelve al lugar donde estabas.');
  }
  function walk(capture = true) {
    if (mode === 'overview') {
      mode = 'walk';
      world.setOverview(false);
      camera.fov = 68;
      camera.position.copy(savedPosition);
      camera.quaternion.copy(savedQuaternion);
      camera.updateProjectionMatrix();
    }
    navigation.setEnabled(true);
    updateControls();
    if (capture) navigation.enter();
  }
  function reset() {
    walk(false);
    navigation.reset();
    updateControls();
    showStatus('Volviste a la entrada. Rodeá el mostrador por la derecha.');
  }
  $('enter-button').addEventListener('click', () => walk());
  $('walk-button').addEventListener('click', () => walk());
  $('overview-button').addEventListener('click', overview);
  $('reset-button').addEventListener('click', reset);
  $('help-button').addEventListener('click', () => {
    $('help-panel').hidden = !$('help-panel').hidden;
    $('help-button').setAttribute('aria-expanded', String(!$('help-panel').hidden));
  });
  renderer.domElement.addEventListener('click', () => { if (mode === 'walk') navigation.enter(); });
  renderer.domElement.addEventListener('navigationerror', event => showStatus(event.detail.message));
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    showError(new Error('Se perdió el contexto gráfico; volvé a intentar.'));
  });
  window.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
    if (event.code === 'KeyV') {
      event.preventDefault();
      if (mode === 'overview') walk(); else overview();
    }
    if (event.code === 'KeyR') { event.preventDefault(); reset(); }
    if (event.code === 'KeyH') { event.preventDefault(); document.body.classList.toggle('ui-hidden'); }
  });
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(innerWidth, innerHeight);
  });
  let previousTime;
  let previousZone;
  renderer.setAnimationLoop(time => {
    const dt = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    navigation.update(dt);
    const zone = mode === 'overview' ? '3 estaciones · 1 acceso' : world.getZone(camera.position);
    if (zone !== previousZone) { $('zone-label').textContent = zone; previousZone = zone; }
    renderer.render(scene, camera);
  });
  updateControls();
  $('loading').hidden = true;
}

start().catch(showError);
