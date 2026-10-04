# Gale drive: data and physics

Open `/drive` from the running Jigyasa app. Use WASD / arrow keys or hold the on-screen buttons. Space brakes; release drive controls to engage the parking brake. Drag to orbit; Follow camera returns to the rover. Pause and reset are available. The clock can run at 1×, 10× or 20×; physics always advances in 1/60-second steps. On slow devices the clock may fall behind the requested multiplier. Reaching the tile boundary pauses the simulation.

## Measured surface

The 513 × 513 elevation samples cover approximately 518 × 518 m in Gale Crater near Curiosity's landing region. HiRISE stereo product `DTEEC_023957_1755_024023_1755_U01` provides 1.011763 m/pixel terrain. Vertical exaggeration is exactly 1. Render and collision triangles share the same elevations. Colors are illustrative, not satellite photography. No rocks or fine-scale elevation detail have been invented.

`next/public/terrain/gale.json` records the product URL, projection, coordinates, source window and SHA-256 hashes. `source-label.txt` preserves the PDS metadata. `scripts/prepare-terrain.py` reproduces the extraction using Python and NumPy. The browser verifies the height file hash before starting.

## Dynamics and limits

Three.js 0.186.1 renders NASA's metric-scale Curiosity model. Rapier 0.21.0 uses a rigid chassis and six raycast wheels, Mars gravity (3.71 m/s²), 899 kg mass, four-corner steering, spring suspension, traction and braking. A force governor targets up to 4 cm/s. Wheel visuals follow suspension length, steering and rolling angle. A friction-limited horizontal parking-brake impulse reduces numerical creeping when at least three wheels contact ground.

This is an educational approximation, not a NASA engineering simulator. Independent springs replace the actual articulated rocker-bogie mechanism; the GLB suspension arms are static. Tire and chassis collision shapes are simplified. Stereo terrain resolution cannot resolve sub-metre rocks, and no soil deformation, slip calibration, weather or live rover telemetry is modeled. Steep slopes can overcome traction. The model is not validated against real rover dynamics.

Sources:

- [HiRISE terrain product](https://www.uahirise.org/dtm/dtm.php?ID=ESP_023957_1755)
- [NASA Curiosity mission](https://science.nasa.gov/mission/msl-curiosity/)
- [NASA MSL landing press kit](https://science.nasa.gov/wp-content/uploads/2024/03/44747_MSL-Landing.pdf)
- [Rapier vehicle API](https://rapier.rs/javascript3d/classes/DynamicRayCastVehicleController.html)

## Verification

`node --test test/*.test.mjs` from `next` checks terrain integrity, mesh sampling, flat-ground contact, driving, steering, braking, reset, measured-ground tilt, resource disposal, module dependency routes, and existing account/archive protections. Synthetic flat terrain is used only in tests. Browser verification covers loading the NASA model, rendering the measured surface, telemetry, pause and reset.
