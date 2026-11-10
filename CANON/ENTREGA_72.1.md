# VOIDCROWN 72.1 · GLOBAL COMMAND

## Arquitectura
Un spine (`voidcrown_global.js`) gobierna XP, créditos, flotas, castigo y eventos.
RISK, ÓRBITA y CASTIGO ya no son contadores independientes.

```
VOIDCROWN → CONSEJO → {RISK | ÓRBITA | CASTIGO} → DIRECTOR/SPINE → ARCHIVO
```

## Eventos globales
- RISK_CONQUEST / RISK_ATTACK / RISK_VICTORY
- FLEET_LAUNCH / FLEET_ARRIVE_* / DEFENSE_HELD / WORLD_LOST / TURN_END
- CASTIGO_IMPACT / CASTIGO_VOID
- SYNC_RISK_BANK

## Sync RISK↔ÓRBITA
Victorias/refuerzos orbitales → `riskTroopBank` → al reforzar en RISK se suman a `placeLeft`.

## Ceremonias de rango
Modal + insignia + perk al subir de XP. Chip HUD unificado.

## CASTIGO
Daño acumulativo persistente (corteza/manto/núcleo) en el spine.

## APK
`VOIDCROWN_72.1.0_GLOBAL_COMMAND.apk` (~17 MB, jarsigner OK)
Self-signed: CN=VOIDCROWN (store voidcrown72)

## Rollback
`localStorage.removeItem('vc-global-command-v1')`

## EDAI
`EDAI_MANIFEST_72.1.json` — change, deps, tests, rollback.
