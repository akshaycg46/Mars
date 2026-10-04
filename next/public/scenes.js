// NASA models are served locally. No third-party scripts or analytics are loaded.
const stages = [...document.querySelectorAll('.model-stage')];
const models = stages.map(stage => stage.querySelector('model-viewer'));
let motionPaused = document.body.classList.contains('paused');
let loadedLibrary = false;

function updateRotation() {
  for (const model of models) {
    // Offscreen models stop rendering. Drag and keyboard controls still work when paused.
    model.toggleAttribute('auto-rotate', !motionPaused && !document.hidden && model.dataset.visible === 'true');
  }
}
document.addEventListener('jigyasa:motion', event => {
  motionPaused = event.detail.paused;
  updateRotation();
});
document.addEventListener('visibilitychange', updateRotation);

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const model = entry.target.querySelector('model-viewer');
    model.dataset.visible = String(entry.isIntersecting);
    if (entry.isIntersecting && model.dataset.src) {
      model.src = model.dataset.src;
      delete model.dataset.src;
    }
  }
  updateRotation();
}, { rootMargin: '150px' });

for (const stage of stages) {
  const model = stage.querySelector('model-viewer');
  const status = stage.querySelector('.model-status');
  model.addEventListener('load', () => {
    stage.classList.add('model-loaded');
    stage.classList.remove('model-failed');
    status.textContent = '';
    updateRotation();
  });
  model.addEventListener('error', () => {
    stage.classList.add('model-failed');
    status.textContent = '3D view unavailable. Use the NASA link below to view this model.';
  });
  observer.observe(stage);
}

const rover = document.querySelector('#rover-model');
document.querySelector('#rover-reset').addEventListener('click', () => {
  if (!loadedLibrary) return;
  rover.cameraOrbit = '-35deg 68deg 110%';
  rover.fieldOfView = '30deg';
  rover.resetTurntableRotation();
  rover.jumpCameraToGoal();
});

try {
  await import('/vendor/model-viewer.min.js');
  await customElements.whenDefined('model-viewer');
  loadedLibrary = true;
  updateRotation();
} catch {
  for (const stage of stages) {
    stage.classList.add('model-failed');
    stage.querySelector('.model-status').textContent = '3D view unavailable. You can still browse photos and view the model at NASA.';
  }
}
