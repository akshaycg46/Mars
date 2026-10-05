# Gale drive: terrain, weather and controls

Open `/drive` from Jigyasa. The **How to drive ?** button opens the in-scene guide; a keyboard reminder remains visible.

- Click the landscape, then hold W / Up to drive forward or S / Down to reverse.
- While driving, hold A / Left or D / Right to steer. Release the directions or hold Space to brake.
- On touch screens, hold the directional buttons in the control panel.
- Drag to orbit; scroll/pinch to zoom. Follow camera returns behind the rover.
- Pause stops simulation time. Reset drive returns to the selected terrain's starting point.
- **Explore** is the default driving pace, targeting up to 0.8 m/s for navigation. **Rover pace** retains the slower 0.04 m/s target. Explore is a faster educational approximation, not Curiosity’s real operating speed.
- The clock defaults to 1× and offers 10× and 20×. Physics uses fixed 1/60-second steps; slower hardware may fall behind the selected multiplier. Tile boundaries pause the drive.

## Measured terrain

Both areas use 513 × 513 measured samples over approximately 518 × 518 m. HiRISE stereo product `DTEEC_023957_1755_024023_1755_U01` has 1.011763 m cells. Rendered and collision triangles share the samples with **1× vertical scale**.

| Area | Tile center | Elevation range | Use |
| --- | --- | --- | --- |
| Southern surveyed slopes (default) | 4.679934° S, 137.531862° E | −4039.68 to −3808.73 m; 231 m relief | Difficult terrain |
| Landing-site region | 4.589502° S, 137.455034° E | −4526.24 to −4513.36 m; 13 m relief | Gentler practice |

The rugged tile was selected from a fixed southern survey window for its high 90th-percentile grid slope (about 36.8°). It contains measured steep ground; it is **not claimed to be a route Curiosity actually traversed**, nor the Gediz Vallis location. The starting point is a more moderate slope so the vehicle can settle before driving.

`gale.json` and `rugged.json` record source URLs, projection, pixel windows and SHA-256 hashes. PDS metadata is preserved in `source-label.txt`. The browser checks the elevation hash before starting.

## Surface appearance

The co-registered `ESP_023957_1755_RED_C_01_ORTHO` red-band image has the same projection, pixel spacing and origin as the elevation grid. Its cropped brightness patterns are mapped to the corresponding terrain nodes, with a half-texel correction. `ortho-label.txt` preserves source metadata; each tile's JSON includes its image hash.

The orbital image is single-band, **not true-color imagery**. Warm sand, rusty and gray rock tints, mottling, grain, apparent cracks and bump shading are procedural illustration. They add visual detail without changing elevation or collision geometry. Sub-metre features cannot be verified from this grid. No synthetic rock obstacles are passed off as measured terrain.

Reproduce from the repository root with Python, NumPy and Pillow (JPEG 2000 support):

```sh
python scripts/prepare-terrain.py
python scripts/prepare-rugged-terrain.py
python scripts/prepare-terrain-imagery.py
```

The scripts cache public source downloads in a sibling `tmp` directory; only the small cropped assets and provenance are committed.

## Gravity, suspension and weather

Rapier 0.21.0 models a rigid chassis and six raycast wheels. **Mars gravity is 3.71 m/s²**, continuously applied, and shown in the interface. Mass is 899 kg; a force governor targets the selected driving pace. Motor effort compensates the component of gravity along the chassis and is shared across grounded wheels, capped at 2200 N total. This corrects the previous uphill stall; steep or poorly supported terrain can still defeat traction. Four-corner steering, spring suspension, traction, brakes and animated wheels respond to ground contact. A friction-limited parking-brake impulse reduces numerical creeping.

Independent springs approximate the actual rocker-bogie mechanism; GLB suspension arms remain static. Collision shapes, traction and aerodynamic coefficients are simplified. There is no soil deformation, calibrated wheel slip, live telemetry or NASA engineering validation. Ground slopes can overcome traction.

Weather presets are **illustrative scenarios, not live weather or reconstructed measurements**:

| Scenario | Base wind ± maximum gust | Appearance |
| --- | --- | --- |
| Clear afternoon | 4 ± 2 m/s | Bright sun, thin haze |
| Windblown dust | 14 ± 6 m/s | Moving dust, reduced visibility |
| Dust storm, 2018 inspired | 24 ± 10 m/s | Dense haze and weaker direct sunlight |

NASA documented strong haze and reduced sunlight at Gale during the 2018 global dust storm. That observation informs the visual scenario; the specific preset numbers and fog values are design parameters. Deterministic gusts drive quadratic drag, `F = 0.5 ρ Cd A |v| v`, with illustrative density 0.02 kg/m³, coefficient 1.1 and area 3.5 m². Thin-air drag is modest; wind does not throw an 899 kg rover around. Dust particles are visual tracers, not a fluid simulation. Weather motion stops when simulation time is paused.

## Verification

Run `node --test test/*.test.mjs` from `next`. Tests cover data/image hashes, shared terrain sampling, rough-ground contact, steering, braking, reset, physics disposal, airborne acceleration under Mars gravity, deterministic weather and quadratic drag, module serving, archive retry/cache expiry, accounts and private-file protection. Browser checks cover clear and storm rendering, terrain selection, gravity/controls help, and live NASA photos.

## Sources

- [HiRISE terrain and orthoimage products](https://www.uahirise.org/dtm/dtm.php?ID=ESP_023957_1755)
- [NASA Curiosity mission](https://science.nasa.gov/mission/msl-curiosity/)
- [NASA MSL landing press kit](https://science.nasa.gov/wp-content/uploads/2024/03/44747_MSL-Landing.pdf)
- [NASA: Curiosity photographs thickening haze in 2018](https://www.nasa.gov/missions/martian-dust-storm-grows-global-curiosity-captures-photos-of-thickening-haze/)
- [Rapier vehicle API](https://rapier.rs/javascript3d/classes/DynamicRayCastVehicleController.html)

### Driving resistance fix

The previous proportional-only motor controller could settle at a near-zero uphill speed because it supplied insufficient force to balance gravity. Grounded-wheel force distribution and slope compensation fix this without imposing chassis position or disabling gravity. A regression test drives over 6 m up a 20° test slope in 10 simulated seconds, then verifies braking and reverse. Existing slower-pace and free-fall tests remain in place.
