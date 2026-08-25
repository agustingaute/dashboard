---
name: Almanaque Gaute
description: Hoja diaria de almanaque de almacén argentino — papel y tres tintas para el check-in del día.
colors:
  paper: "#F2ECDD"
  paper-shade: "#E3DAC4"
  paper-deep: "#D5C9AC"
  ink: "#221E1A"
  ink-soft: "#5C5344"
  ink-faint: "rgba(34, 30, 26, 0.28)"
  ink-hair: "rgba(34, 30, 26, 0.18)"
  red: "#C7231D"
  red-soft: "rgba(199, 35, 29, 0.10)"
  blue: "#20418A"
  wall: "#1A2438"
typography:
  display:
    fontFamily: "Abril Fatface, Georgia, serif"
    fontSize: "clamp(7.5rem, 19vw, 13.5rem)"
    fontWeight: 400
    lineHeight: 0.94
  headline:
    fontFamily: "Abril Fatface, Georgia, serif"
    fontSize: "clamp(2.3rem, 4.5vw, 3.4rem)"
    fontWeight: 400
    lineHeight: 1.02
  title:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 700
    letterSpacing: "0.26em"
  body:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo Narrow, Arial Narrow, sans-serif"
    fontSize: "0.66rem"
    fontWeight: 600
    letterSpacing: "0.2em"
  cifra:
    fontFamily: "Chivo Mono, Courier New, monospace"
    fontSize: "0.95rem"
    fontWeight: 500
    fontVariation: "tabular-nums"
rounded:
  none: "0"
components:
  button-retry:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.32rem 0.9rem"
  button-retry-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

# Design System: Almanaque Gaute

## Overview

**Creative North Star: "El Almanaque de Almacén"**

Todo el producto es un solo objeto impreso: una hoja de almanaque de pared argentino colgada sobre una pared azul oscura. No hay interfaz alrededor del contenido — la hoja ES la interfaz. Papel crema, tres tintas (negra, roja, azul), filetes dobles de imprenta, líneas de puntillé, un riel de taco con ojales dibujados en tinta y un borde rasgado en capas que recuerda las hojas ya arrancadas. El número del día, en tinta roja gigante, es el protagonista absoluto; todo lo demás (cotizaciones, clima, River, agenda) se ordena a su alrededor como columnas regladas de la misma hoja.

La regla material del mundo, fijada en la finish review: **nada imita materiales que no están rendidos**. No hay texturas fotográficas, ni papel escaneado, ni metal simulado — el riel, los ojales, el rasgado y el misregistro de tinta son todos dibujo vectorial e ilusión tipográfica, tinta sobre papel plano. La densidad es alta pero reglada: cada dato vive en una línea, una fila o una celda con su filete, nunca flotando en una card. El rechazo explícito del mundo anterior (dashboard oscuro de cards con acento rojo, aún vivo en `index.html`/`styles.css` hasta que se migre) es constitutivo: esta hoja no tiene cards, no tiene fondo oscuro interior, no tiene glow.

**Key Characteristics:**
- Una sola hoja de papel (#F2ECDD) sobre pared oscura (#1A2438); todo lo interior es plano.
- Exactamente tres tintas: negra (texto/estructura), roja (el día, lo urgente), azul (rótulos, lo institucional).
- Estructura por filetes: reglas dobles, puntillé, tablas regladas — nunca contenedores con relleno.
- Tipografía de imprenta de cuatro voces: Abril Fatface, Archivo Narrow, Chivo, Chivo Mono.
- Ornamento solo si es tinta dibujada: SVG de trazo, sin texturas ni materiales simulados.

## Colors

Papel crema y tres tintas de imprenta; ningún otro matiz existe dentro de la hoja.

### Primary
- **Tinta Roja de Almanaque** (#C7231D): la tinta del día y de lo que arde. El número gigante del día, la celda de hoy en el mes (placa roja invertida), la fila de River en la tabla, la hora de cada evento, el marco punteado de "Sin datos", las bajas de cripto. Es señal, no decoración.
- **Roja Diluida** (rgba(199, 35, 29, 0.10)): la misma tinta al 10%, usada solo como misregistro de imprenta — el text-shadow desplazado del número del día, la sombra offset dura (2px 2px 0) del próximo partido, el fondo de la fila de River.

### Secondary
- **Tinta Azul de Sello** (#20418A): la tinta institucional. Todos los rótulos de sección, el título "Almanaque Gaute", el día de la semana, los íconos de clima y la luna (trazo único), las cabeceras de días del mes, el outline de foco, las subas de cripto, la etiqueta "Todo el día".

### Neutral
- **Papel Crema** (#F2ECDD): la hoja entera; también el texto sobre placas de tinta (celda de hoy, hover del botón).
- **Papel Sombreado** (#E3DAC4) y **Papel Profundo** (#D5C9AC): exclusivos de las dos capas del borde rasgado — las hojas ya arrancadas que asoman detrás.
- **Tinta Negra** (#221E1A): texto de datos, filetes estructurales, el riel del taco.
- **Tinta Rebajada** (#5C5344): metadatos, subtítulos, condiciones, leyendas.
- **Tinta al Agua** (rgba(34,30,26,0.28)) y **Filete Capilar** (rgba(34,30,26,0.18)): puntillés, hairlines, días pasados, la segunda pasada de los filetes dobles.
- **Pared Nocturna** (#1A2438): el fondo del body, fuera de la hoja. Nunca aparece dentro de ella.

### Named Rules
**La Regla de las Tres Tintas.** Dentro de la hoja solo existen tinta negra, roja y azul sobre papel. Cualquier categoría nueva (calendarios, estados, series) se mapea a una de las tres tintas — jamás se inventa un cuarto color.
**La Regla del Semáforo Invertido.** Sube = tinta azul, baja = tinta roja. No hay verde en este mundo; no introducirlo para variaciones positivas.
**La Regla del Misregistro.** El único uso de color translúcido rojo es simular tinta corrida o fuera de registro (sombras offset duras, text-shadow del número, fondo de fila destacada). Nunca como "tinte de marca" en fondos genéricos.

## Typography

**Display Font:** Abril Fatface (con Georgia, serif)
**Rótulo Font:** Archivo Narrow (con Arial Narrow, sans-serif)
**Body Font:** Chivo (con system-ui, sans-serif)
**Cifra/Mono Font:** Chivo Mono (con Courier New, monospace)

**Character:** Cuatro voces de una misma imprenta: el fatface didone para lo que grita (el día), la condensada espaciada en mayúsculas para todo rótulo, la grotesca para prosa y nombres, y la mono para toda cifra. El italic de Chivo es la voz manuscrita (saludo, refrán).

### Hierarchy
- **Display** (400, clamp(7.5rem, 19vw, 13.5rem), lh 0.94): exclusivo del número del día, en tinta roja con misregistro. También en escala menor (2.4rem) para la temperatura actual y (clamp 2.3–3.4rem, azul) para el título de cabecera.
- **Title / Rótulo** (700, 0.88rem, tracking 0.26em, MAYÚSCULAS, azul): todo encabezado de sección, siempre centrado sobre su filete doble.
- **Body** (400–700, 0.85–0.95rem): nombres de eventos, rivales, prosa. El refrán y el saludo van en italic.
- **Label** (600–700, 0.6–0.78rem, tracking 0.12–0.24em, MAYÚSCULAS): metadatos — fechas de partido, cabeceras de tabla, leyendas, pie de imprenta. Cuanto más chico el cuerpo, más abierto el tracking.
- **Cifra** (500–700, 0.68–0.95rem, tabular-nums): toda cifra — cotizaciones, horas, reloj, números de tabla y de celda.

### Named Rules
**La Regla de la Cifra Tabular.** Todo número que pueda cambiar se compone en Chivo Mono con `font-variant-numeric: tabular-nums`. Un número en fuente de texto es un error de imprenta.
**La Regla del Rótulo Condensado.** Ningún encabezado ni metadato va en caja baja: siempre Archivo Narrow, mayúsculas, tracking ≥ 0.12em. No existen kickers ni eyebrows fuera de esta gramática.

## Layout

Una pared flex centrada (`padding: clamp(0px, 3vw, 44px) clamp(0px, 4vw, 56px)`) sostiene la hoja de `min(1120px, 100%)`. La hoja se apila verticalmente: cabecera → riel del taco → borde rasgado → hoja del día (`padding: clamp(1.4rem,3vw,2.4rem) clamp(1.2rem,4vw,3.2rem)`).

El cuerpo del día es una grilla de tres columnas `1fr 1.3fr 1fr` con `column-gap: clamp(1.4rem, 3vw, 2.6rem)`: cotizaciones/cripto/clima a la izquierda, el día al centro (separado por hairlines verticales), River/tabla a la derecha. Los bloques de cada columna se apilan con `gap: 1.7rem`; las secciones anchas (Agenda, El mes) cuelgan debajo con `margin-top: 2rem`. No hay tokens de espaciado: el ritmo se compone en rem sueltos, ~0.3–0.9rem intra-bloque y 1.7–2.2rem entre secciones.

**Responsive:** a ≤920px la grilla colapsa a una columna y el día pasa arriba de todo (`order: -1`), perdiendo sus hairlines laterales y ganando uno inferior; la lista de eventos pasa a una columna y el riel se encoge (`padding: 0 12%`). A ≤480px se comprimen trackings, el número baja a `clamp(6.5rem, 34vw, 9rem)` y las celdas del mes se achican (36px min-height).

## Elevation & Depth

Toda la profundidad del sistema vive en el borde de la hoja; el interior es tinta plana. La hoja proyecta una sombra doble sobre la pared (`box-shadow: 0 18px 50px rgba(0,0,0,0.45), 0 4px 14px rgba(0,0,0,0.35)`) y lleva dos gradientes casi imperceptibles (~3.5–5% de tinta) que insinúan la curvatura del papel. El borde rasgado lleva `filter: drop-shadow(0 2px 2px rgba(34,30,26,0.16))`.

Dentro de la hoja no hay sombras difusas: el único "relieve" interior es el misregistro de imprenta — la sombra offset dura `2px 2px 0 0 var(--red-soft)` del próximo partido y el text-shadow desplazado del número. La jerarquía interior se construye con tinta (peso de filete, color, tamaño), nunca con elevación.

### Shadow Vocabulary
- **Sombra de pared** (`box-shadow: 0 18px 50px rgba(0,0,0,0.45), 0 4px 14px rgba(0,0,0,0.35)`): solo la hoja contra la pared.
- **Sombra de rasgado** (`drop-shadow(0 2px 2px rgba(34,30,26,0.16))`): solo el SVG del borde rasgado.
- **Misregistro** (`2px 2px 0 0 var(--red-soft)` / `text-shadow: 0.018em 0.018em 0 var(--red-soft)`): tinta roja diluida, offset duro, sin blur. Reservado a elementos destacados en rojo.

### Named Rules
**La Regla de la Hoja Plana.** Ningún elemento interior recibe sombra difusa, glow ni elevación. Si algo necesita destacarse, se le da más tinta: un filete más grueso, la tinta roja, o una placa de tinta invertida.

## Shapes

Esquinas vivas en todo: radio 0 en la hoja, los bloques, las placas, los botones y las celdas (las únicas curvas son los puntos de evento, círculos de 6px, y los ojales dibujados). El lenguaje de forma es el del filete de imprenta:

- **Filete doble:** un borde sólido + una segunda pasada capilar hecha con `box-shadow: 0 3px 0 -1px var(--ink-hair)` (rótulos) o bordes 3px/1px apareados (cabecera). Es la firma estructural del sistema.
- **Puntillé:** `border-bottom: 2px dotted var(--ink-faint)` como leader entre rótulo y cifra; `1px dotted` como separador de filas.
- **Hairline:** `1px solid var(--ink-hair)` para grillas y divisiones silenciosas; `1px solid var(--ink)` cuando la división es estructural.
- **Marco entintado:** `1.5px solid var(--ink)` para lo enmarcado (próximo partido, botón); `1.5px dashed var(--red)` con `rotate(-0.6deg)` para el sello de error.
- **Rasgado y riel:** siempre SVG de trazo (`stroke` sobre `var(--ink)`/`var(--paper)`), nunca imagen ni textura.

## Components

### Rótulo de sección
- **Carácter:** sello de sección de almanaque — nunca un heading de página web.
- **Estilo:** Archivo Narrow 700, 0.88rem, tracking 0.26em, mayúsculas, tinta azul, centrado.
- **Filete:** `border-bottom: 1px solid var(--ink)` + `box-shadow: 0 3px 0 -1px var(--ink-hair)` (doble regla), `margin-bottom: 0.9rem`.

### Línea de puntillé (dato)
- **Carácter:** la unidad mínima de dato: rótulo a la izquierda, cifra a la derecha, puntillé entre ambos.
- **Estructura:** flex baseline; rótulo (Archivo Narrow 600, 0.78rem, tracking 0.14em, mayúsculas, negra) · leader (`border-bottom: 2px dotted var(--ink-faint)`, `translateY(-3px)`) · valor (Chivo Mono 500, 0.95rem, tabular).
- **Extra:** variación porcentual en 0.72rem — azul si sube, roja si baja.

### Partido (fixture)
- **Filas:** separadas por puntillé capilar; fecha en label rojo con hora rebajada, rival en Chivo 700, condición en label rebajado.
- **Próximo partido:** enmarcado `1.5px solid var(--ink)` + misregistro `2px 2px 0 0 var(--red-soft)`, padding 0.6–0.7rem.

### Tabla reglada
- **Estilo:** `border-collapse: collapse`; cabecera en label rebajado sobre filete negro; celdas en Chivo Mono 0.82rem tabular, alineadas a la derecha (equipo a la izquierda), separadas por puntillé capilar.
- **Fila de River:** tinta roja 700 sobre `var(--red-soft)`. Corte de tabla (salto de posiciones): `border-top: 2px solid var(--ink-hair)`.

### Evento de agenda
- **Fila:** hora en Chivo Mono 700 roja (o etiqueta azul "Todo el día") · título en Chivo 500 · calendario en label rebajado al margen derecho; separador puntillé.
- **Vacío:** "Día despejado — sin compromisos anotados" en label centrado rebajado — el vacío también se imprime.

### Celda del mes
- **Grilla:** 7 columnas con hairlines; cabeceras D–S en label azul sobre filete negro.
- **Hoy:** número en placa de tinta roja invertida (papel sobre rojo, 700).
- **Pasado:** número en tinta al agua, tachado con una línea rotada -8° (hoja ya vivida).
- **Eventos:** puntos de 6px en la tinta del calendario correspondiente (negra/azul/roja), con leyenda al pie.

### Sin datos (error) y Reintentar
- **Sello de error:** marco `1.5px dashed var(--red)` rotado -0.6°, título "SIN DATOS" en label rojo, mensaje en Chivo Mono rebajado. La variante sin reintento posible ("Calendario sin conectar") explica la recuperación real y pliega la sección redundante.
- **Botón Reintentar:** fantasma entintado — label negro, `border: 1.5px solid var(--ink)`, fondo transparente, radio 0; hover invierte a placa de tinta (`background: var(--ink); color: var(--paper)`) en 0.15s ease-out.

### Espera de imprenta (loading)
Barras de puntillé (`repeating-linear-gradient` de 8px de alto) que pulsan opacidad 0.35→0.9 (`entintar`, 1.6s ease-in-out infinite, delays escalonados). Sin spinners ni skeletons grises.

### Estampa (entrada de contenido)
Todo contenido llega estampado: `opacity 0 → 1, scale(1.045) → 1, blur(1.5px) → 0` con `cubic-bezier(0.16, 1, 0.3, 1)`, 0.55s (0.75s para el número del día). `prefers-reduced-motion` anula estampa y entintado.

### Superficies del navegador
El mundo alcanza al browser: `::selection` en tinta roja con texto papel; `:focus-visible` con outline azul de 2px (offset 2px); scrollbar fina con thumb `var(--ink-faint)`.

## Do's and Don'ts

### Do:
- **Do** componer todo dato nuevo como línea de puntillé, fila reglada o celda de grilla — la hoja se extiende por filetes, no por contenedores.
- **Do** mapear toda categoría nueva a una de las tres tintas (negra, roja, azul) y toda cifra a Chivo Mono tabular.
- **Do** dibujar cualquier ornamento nuevo como SVG de trazo único en tinta (`stroke: var(--blue)` o `var(--ink)`, strokes 1.4–2.5), como los íconos de clima y la luna.
- **Do** imprimir los estados vacíos y de error con la misma gramática (sello "Sin datos", "Día despejado") — nunca dejar un hueco mudo ni inventar datos.
- **Do** estampar el contenido que llega (animación `estampar`) y respetar `prefers-reduced-motion`.

### Don't:
- **Don't** usar cards, paneles oscuros, glow ni acento sobre fondo negro dentro de la hoja: ese es el mundo viejo de `index.html`, que convive en el repo pero no es autoridad.
- **Don't** introducir un cuarto color, verde para subas, ni radios de esquina (las únicas curvas son puntos y ojales).
- **Don't** aplicar sombras difusas a elementos interiores; la única elevación es la hoja contra la pared y el misregistro rojo offset.
- **Don't** simular materiales no rendidos (texturas de papel, metal del riel, fotos): riel, ojales y rasgado son tinta vectorial, regla fijada en la finish review.
- **Don't** componer rótulos o metadatos en caja baja o sin tracking: todo lo que no es dato ni prosa va en Archivo Narrow mayúsculas espaciadas.
