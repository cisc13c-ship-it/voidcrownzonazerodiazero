# Reparar conflicto e instalar VOIDCROWN 73.2.1

## El error
"Paquete en conflicto" / "App no instalada" / "firma distinta" =
Android ya tiene VOIDCROWN con **otra firma** (71, 72, 73.1-tmp, edai181, continuum).

## Solución (obligatoria una vez)

### Teléfono
1. Ajustes → Apps → buscar:
   - VOIDCROWN
   - Día Zero
   - Legion
   - Sistemas Caóticos
2. Desinstalar **todas**
3. Instalar **solo** este archivo: INSTALAR_VOIDCROWN.apk

### ADB
```
adb uninstall com.cisc.voidcrown.diazero
adb uninstall com.voidcrown.edai181
adb uninstall com.voidcrown.continuum
adb uninstall com.cisc.legion.sistemas.caoticos
adb install -r INSTALAR_VOIDCROWN.apk
```

## Este build
- version: 73.2.1-FIX-CONFLICT
- versionCode: 7321
- package: com.cisc.voidcrown.diazero
- firma: keystore ESTABLE (misma 72.1.1 / 73.2)
- SHA256: 6ee9cb3c2b9ee7a60b86b0feeee8fa20b81f378c5a157caab360f777987a7a00
- zipalign + v2/v3 OK
- Un solo APK en la carpeta del proyecto
