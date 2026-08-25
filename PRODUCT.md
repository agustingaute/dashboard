# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Agustín, único usuario. Lo abre en una pestaña del navegador de su computadora, también como página de inicio / new tab — lo ve varias veces al día de pasada, de cerca (no es panel de pared).

## Product Purpose

Dashboard personal de check-in del día: leer con calma a la mañana la agenda del día, los partidos de la semana (River), el mercado (dólar blue, cripto) y el clima. Éxito = en una sola lectura queda armado el mapa del día sin abrir otras apps.

## Operating Context

- Idioma: español rioplatense (es-AR). Fechas y horas en formato argentino, hora de Buenos Aires.
- Sitio estático (HTML/CSS/JS vanilla, sin framework ni build). Deploy: GitHub Actions → gh-pages en push a `main`; `config.js` se genera desde GitHub Secrets y está gitignoreado (localmente la key de Google Calendar es un placeholder, por eso el calendario da 400 en local).
- Datos en vivo del lado del cliente: dólar blue, cripto (BTC/ETH), clima Buenos Aires, fixtures y tabla de River vía `api.promiedos.com.ar` (requiere header `X-VER`), Google Calendar (3 calendarios: Personal, River Content, River Plate).

## Capabilities and Constraints

- Módulos actuales: dólar blue (compra/venta), cripto, clima, River próximos partidos, tabla Liga Profesional (ventana centrada en River + líder), calendario mensual con 3 categorías.
- Todo es de solo lectura; no hay interacción más allá de hover/tooltip del calendario.
- Las APIs son gratuitas/no oficiales: los módulos deben degradar con estado de error y botón de reintento (patrón existente `window._retry`).
- El contenido cabe hoy en una pantalla sin scroll (100vh); el rediseño no está obligado a mantener esa restricción.

## Brand Commitments

Ninguno vinculante. Libertad total confirmada para el rediseño (el rojo River #E8253A, el fondo oscuro y el layout sin scroll del look actual no son intocables). Fanatismo por River Plate como hecho de contenido, no como mandato visual.

## Evidence on Hand

- Implementación incumbente completa: `index.html`, `styles.css`, `app.js`, `modules/*.js` (dollar, crypto, weather, football, calendar).
- No existe DESIGN.md; el look actual ("Signal (Contrast)": dark, cards, Barlow Condensed + Space Grotesk + Syne, acento rojo) es evidencia y anti-referencia para el rediseño, no autoridad.

## Product Principles

- Legibilidad de lectura matinal: jerarquía pensada para leer con calma, no para monitoreo ambiente a distancia.
- El dato manda: números y fechas reales, sin decoración que compita con ellos; nunca inventar datos cuando una API falla.
- Un solo usuario conocido: el tono puede ser personal y directo (habla con Agustín), sin genericidad de producto.
- Robustez silenciosa: cada módulo falla solo, con reintento, sin tirar abajo el resto.
