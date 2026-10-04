# Third-party assets

## NASA models
- `models/mars.glb`: NASA/JPL-Caltech. https://science.nasa.gov/resource/planet-mars-3d-model/
  Original: https://assets.science.nasa.gov/content/dam/science/psd/mars/resources/gltf_files/24881_Mars_1_6792.glb
- `models/curiosity.glb`: NASA Visualization Technology Applications and Development (VTAD). https://science.nasa.gov/resource/curiosity-3d-model/
  Original: https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/c/Curiosity_static.glb

Downloaded October 3, 2026. Models retained in their original binary form, with embedded textures. Credits also appear in the app. NASA does not endorse this project. These illustrative 3D assets are separate from the real rover photographs in the live archive.

## 3D viewer
`vendor/model-viewer.min.js`: @google/model-viewer 4.3.1, Apache-2.0, Google LLC. Downloaded from the official npm registry and checked against its SHA-512 integrity value. License: `vendor/MODEL-VIEWER-LICENSE.txt`. https://modelviewer.dev/

The viewer and both models are served locally; no runtime CDN requests are required.

## Rover simulator
- Terrain: HiRISE DTM `DTEEC_023957_1755_024023_1755_U01`, NASA/JPL/University of Arizona/USGS. Source, crop coordinates, byte ranges, and hashes are in `terrain/gale.json`; the PDS label is preserved in `terrain/source-label.txt`. Reproduce with `scripts/prepare-terrain.py` (Python + NumPy). Elevations are measured; surface color is illustrative.
- Three.js 0.186.1: MIT, https://threejs.org/. The package's ESM renderer, GLTFLoader, OrbitControls, and BufferGeometryUtils are bundled locally, with imports rewritten to local module paths. License in `vendor/three/LICENSE.txt`.
- Rapier 0.21.0 (@dimforge/rapier3d-compat): Apache-2.0, https://rapier.rs/. Local WebAssembly-compatible ES module; license in `vendor/rapier/LICENSE.txt`.
- Both npm tarballs were verified against the registry SHA-512 integrity metadata before extraction.
