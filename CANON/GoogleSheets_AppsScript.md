# Google Sheets · histórico automático VOIDCROWN

## 1. Crea una hoja
Columnas: `day | kind | msg | title | xp | ts | assaultWins | distanceU | worldsVoided | wins | losses`

## 2. Extensiones → Apps Script
```javascript
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('logs') || ss.insertSheet('logs');
  if (sh.getLastRow() === 0) {
    sh.appendRow(['day','kind','msg','title','xp','ts','assaultWins','distanceU','worldsVoided','wins','losses']);
  }
  var data = JSON.parse(e.postData.contents);
  var day = data.day || '';
  var stats = data.stats || {};
  // append summary row
  sh.appendRow([day,'SUMMARY', 'export', data.title, data.xp, new Date(), stats.assaultWins, stats.distanceU, stats.worldsVoided, stats.wins, stats.losses]);
  // parse csv lines if present
  if (data.csv) {
    var lines = data.csv.split('\n').slice(1);
    lines.forEach(function(line){
      if (!line || line.indexOf('metric') === 0) return;
      var p = line.split(',');
      if (p.length >= 5 && p[0].match(/^\d{4}-/)) sh.appendRow([p[0],p[1],p[2],p[3],p[4],p[5]||'']);
    });
  }
  return ContentService.createTextOutput('ok');
}
```

## 3. Implementar → Nueva implementación → Web App
- Ejecutar como: yo
- Acceso: cualquiera con el enlace
- Copia la URL en **Consejo → Enviar a Web App**

Sin script: usa **Exportar diario CSV** e impórtalo a Sheets.
