# Modern Defense v0.3.0

Mobile-first modern military outpost defense prototype built with TypeScript + Vite.

## v0.3.0 tactical overhaul
- Separate base facilities from deployed combat teams.
- One facility maximum per category.
- Larger centered battlefield with full-map landscape fit.
- Pinch zoom, drag-to-pan when zoomed, and Fit reset control.
- Terrain with cover, concealment, movement effects, and direct-fire LOS blocking.
- Doctrine-driven enemy tactical states: recon, approach, contact, suppress, maneuver, breach, assault.
- 30 faction doctrine profiles with weighted behavior differences.
- U.S. fire-and-movement/bounding emphasis rather than single-file road movement.
- Group formations, multi-axis attacks, suppression, flanking, and cover seeking.
- Ground breaching against physical perimeter segments.
- APC/IFV dismount behavior and surviving vehicle occupants.
- Separate aerial behavior for recon UAVs, FPV one-way drones, armed UAVs, and helicopters.
- Recon detection states: Undetected, Suspected, Detected, Identified, Tracked.
- Automatic free medical treatment, automatic free repair, engineering rebuild support.
- Mortar minimum range, range circles, hold-fire, and target-priority controls.
- Pre-wave threat estimates.
- Main-menu selectable tutorial.
- Compact one-screen landscape UI and contextual upgrade popup.
- Improved silhouettes and labels for facilities, teams, vehicles, aircraft, terrain, and fortifications.
- Save-format key updated to v2 for campaign data.

## Validation
`npx tsc --noEmit` passes in the build environment used to prepare this release.
A full local Vite build could not be completed because installing the local Vite dependency timed out. GitHub Actions is configured to install dependencies and run `npm run build` when deployed.
