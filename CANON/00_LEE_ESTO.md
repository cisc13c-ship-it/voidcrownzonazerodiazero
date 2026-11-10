# VOIDCROWN 73.2.1 FIX-CONFLICT

**Un solo APK:** INSTALAR_VOIDCROWN.apk  
**package:** com.cisc.voidcrown.diazero · versionCode **7321**

## Si hay conflicto al instalar

```
adb uninstall com.cisc.voidcrown.diazero
adb uninstall com.voidcrown.edai181
adb uninstall com.voidcrown.continuum
adb uninstall com.cisc.legion.sistemas.caoticos
adb install -r INSTALAR_VOIDCROWN.apk
```

En el teléfono: Ajustes → Apps → busca VOIDCROWN / Legion / Día Zero → Desinstalar → luego instala este APK.

Causa típica: firmas distintas entre 71 / 72 / 73.1-tmp / 73.2.
Este build usa **keystore estable** (SHA256 cert 4045f43e…).
