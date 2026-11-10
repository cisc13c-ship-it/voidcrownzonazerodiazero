# ÓRBITA · Flotas tácticas

## Qué hace
- Mapa del sistema (Sol → Saturno) con órbitas vivas
- Rutas de flotas **en tiempo real** (línea trazo + progreso)
- Movimiento entre cuerpos con **tiempo de viaje** y **combustible** según distancia AU
- Selección flota/destino, despacho, abortar, pan/zoom
- **Histórico de campañas** (localStorage) + **export CSV** de logs/rendimiento

## Fórmulas
- distancia AU = distancia euclídea en mapa / escala
- horas ≈ dist × 4.5 × factor tamaño flota
- fuel ≈ dist × 12 × (1 + 1% por nave)

## Controles
- Toca planeta · **Anclar destino** · elige flota · **Desplegar ruta**
- Pausa / ×1×2×4×8 · Histórico · Export CSV
