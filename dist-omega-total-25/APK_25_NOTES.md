# VOIDCROWN 25.0.0 · OMEGA TOTAL VOID SMASH

## Continuación del versionado Drive (02_BETA_JUGABLE)

| Versión | Archivo | Fecha |
|---------|---------|-------|
| 23.1.1 | LEGION_CISC_GAME_FIRST | 2026-11-04 |
| 23.1.2 | PLANET_ICON | |
| 23.1.3 | VOID_SMASH_EDAI | |
| 23.1.4 | KHAOS_LAB | |
| 23.1.5 | GENOMA100 | |
| 23.1.6 | EDAI_B01 | |
| 24.0.0 | OMEGA_PROTOTYPE | |
| **24.1.1** | **ABSORB_WS105** (tip previo) | 01:56Z |
| **25.0.0** | **OMEGA_TOTAL_VOID_SMASH** (esta) | 09:03Z |

## Qué es
- Shell Android WebView nativo (`com.sistemascaoticos.voidcrown`)
- versionCode **2500** / versionName **25.0.0**
- Carga `file:///android_asset/www/index.html` = pack TOTAL 25 Void Smash (capas, armas, población, sistema N-cuerpos, EDAI)
- Firmado APK Signature Scheme v2/v3 (keystore CISC Meta Horizon de sesión)

## Honestidad
- **No** reutiliza el keystore binario exacto del 24.1.1 (no estaba en Drive): hay que desinstalar 24.x antes de instalar 25 si el package difiere o la firma no coincide.
- El tip 24.1.1 (~17MB) traía risk_void + cine + assets earth; 25.0.0 es **slice jugable ligero** (~21KB) con Void Smash procedural. No es el monstruo 17MB completo absorbido.
- Montaje artifacts falló al reempaquetar el 24.1.1 in-place; se construyó pipeline limpio con SDK 34.

## Instalar
```
adb install -r VOIDCROWN_25.0.0_OMEGA_TOTAL_VOID_SMASH_SIGNED.apk
```
O copiar al teléfono e instalar (fuentes desconocidas).

