# VOIDCROWN 26.0.0 APK — entrega

## Cadena de versionado (Drive `02_BETA_JUGABLE`)
1. LEGION_CISC 23.1.1 … 23.1.6
2. VOIDCROWN_24.0.0_OMEGA_PROTOTYPE
3. **VOIDCROWN_24.1.1_ABSORB_WS105** ← última base (~17.2 MB)
4. **VOIDCROWN_26.0.0_VOID_SMASH_VOXEL** ← esta build

## Artefacto
- Archivo: `VOIDCROWN_26.0.0_VOID_SMASH_VOXEL_SIGNED.apk`
- package: `com.cisc.voidcrown`
- versionCode: 2600 / versionName: 26.0.0
- Firma: APK Signature Scheme v2 + v3 (keystore VOIDCROWN)
- Contenido: WebView game-first → `assets/www/index.html` (VOID SMASH voxel + System N)

## Nota honesta
Build ligera (WebView + motor canvas). No re-empaqueta los ~17MB de assets del 24.1.1 (Drive download bloqueado por FS artifacts). Jugable offline.

## Instalar
adb install -r VOIDCROWN_26.0.0_VOID_SMASH_VOXEL_SIGNED.apk
