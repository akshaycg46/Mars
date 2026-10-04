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
