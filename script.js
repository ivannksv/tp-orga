/* =====================================================================
   1. DATOS
   ===================================================================== */

/* ---------- Actividad 1 ---------- */

const A1 = {
  cols: ["r1", "r2", "r3", "z", "resultado"],

  init: {
    r1: "✕",
    r2: "✕",
    r3: "✕",
    z: "✕",
    resultado: "00000000"
  },

  // [dirección, código de máquina, instrucción]
  code: [
    ["830", "c2002800", "ld [800],%r1"],
    ["834", "86080000", "and %r0,%r0,%r3"],
    ["838", "82007ffc", "add %r1,-4,%r1"],
    ["83c", "c4006804", "ld [%r1+804],%r2"],
    ["840", "86008003", "add %r2,%r3,%r3"],
    ["844", "80884001", "andcc %r1,%r1,%r0"],
    ["848", "02800002", "be 850"],
    ["84c", "10bffffb", "ba 838"],
    ["850", "c620282c", "st %r3,[82c]"],
    ["854", "10800000", "ba 854"]
  ],

  steps: [],

  endText: `
    <h3>Respuesta c): ¿qué hace el código?</h3>
    <p>
      Suma los 5 elementos de <code>array</code> y deja el total
      en <code>resultado</code> (0x82c).
    </p>
    <ul>
      <li>
        <code>%r1</code> arranca en <code>length</code> = 20
        (5 elementos × 4 bytes) y baja de a 4, así que funciona como
        índice en bytes.
      </li>
      <li>
        En cada vuelta se lee un elemento en <code>%r2</code>
        y se acumula en <code>%r3</code>.
      </li>
      <li>
        <code>andcc</code> solo modifica los flags, no guarda nada,
        cuando <code>%r1</code> llega a 0, el <code>be</code> salta a
        <code>guardar</code>.
      </li>
      <li>
        Los elementos son 25, -32 (<code>0xffffffe0</code>), 3, -5
        (<code>0xfffffffb</code>) y 21, y se suman de atrás para adelante.
        Los negativos están en complemento a 2.
        El resultado final es 21 - 5 + 3 - 32 + 25 = 12
        (<code>0x0000000c</code>).
      </li>
    </ul>
  `
};

/*
  Valores que van tomando [r1, r2, r3] al final de cada vuelta del bucle.
  La última vuelta es la quinta (r1 llega a 0).
*/
const A1_VUELTAS = [
  ["00000010", "00000015", "00000015"],
  ["0000000c", "fffffffb", "00000010"],
  ["00000008", "00000003", "00000013"],
  ["00000004", "ffffffe0", "fffffff3"],
  ["00000000", "00000019", "0000000c"]
];

function crearPasosA1() {
  const pasos = A1.steps;

  pasos.push({
    l: 0,
    set: { r1: "00000014" },
    t: "Se carga length (20) en r1. Son 5 elementos de 4 bytes, por eso arranca en 20."
  });

  pasos.push({
    l: 1,
    set: { r3: "00000000" },
    t: "Se pone r3 en 0 porque va a funcionar como acumulador."
  });

  A1_VUELTAS.forEach(function (vuelta, i) {
    const r1 = vuelta[0];
    const r2 = vuelta[1];
    const r3 = vuelta[2];
    const esUltima = (i === A1_VUELTAS.length - 1);

    pasos.push({
      l: 2,
      set: { r1: r1 },
      t: "Se resta 4 a r1 para pasar al elemento " + (5 - i) +
         " (el arreglo se recorre de atrás para adelante)."
    });

    pasos.push({
      l: 3,
      set: { r2: r2 },
      t: "Se lee en r2 el elemento que está en la dirección r1 + 0x804."
    });

    pasos.push({
      l: 4,
      set: { r3: r3 },
      t: "Se suma r2 al acumulador: r3 = r3 + r2."
    });

    pasos.push({
      l: 5,
      set: { z: esUltima ? "1" : "0" },
      t: esUltima
        ? "r1 llegó a 0, así que el flag Z pasa a 1."
        : "r1 todavía no es 0, entonces Z queda en 0."
    });

    pasos.push({
      l: 6,
      set: {},
      t: esUltima
        ? "Como Z = 1, el be salta a guardar (0x850)."
        : "Z = 0, así que el be no salta y la ejecución sigue de largo."
    });

    if (!esUltima) {
      pasos.push({
        l: 7,
        set: {},
        t: "El ba vuelve a sumar (0x838) y arranca otra vuelta."
      });
    }
  });

  pasos.push({
    l: 8,
    set: { resultado: "0000000c" },
    t: "Se guarda r3 en resultado (0x82c). La suma da 12 (0x0000000c)."
  });

  pasos.push({
    l: 9,
    set: {},
    fin: true,
    t: "El ba fin salta a sí mismo, queda en bucle infinito y ahí termina el programa. " +
       "Después de guardar el resultado no se sabe qué valores quedan, por eso todo pasa a ✕."
  });
}

crearPasosA1();


/* ---------- Actividad 2 ---------- */

const A2 = {
  cols: ["r1", "r2", "r3", "r4", "[0x824]", "result"],

  init: {
    r1: "✕",
    r2: "✕",
    r3: "✕",
    r4: "✕",
    "[0x824]": "01000000",
    result: "00000000"
  },

  code: [
    ["80c", "c2002800", "ld [valor1],%r1"],
    ["810", "c4002804", "ld [valor2],%r2"],
    ["814", "88090000", "and %r4,%r0,%r4"],
    ["818", "09218010", "sethi %hi(0x86004002),%r4"],
    ["81c", "88112002", "or %r4,%lo(0x86004002),%r4"],
    ["820", "c8202824", "st %r4,[sumar]"],
    ["824", "01000000", "nop"],
    ["828", "c6202808", "st %r3,[result]"],
    ["82c", "10800000", "ba fin"]
  ],

  steps: [
    {
      l: 0,
      set: { r1: "00000bb8" },
      t: "Se carga valor1 = 3000 (0xbb8) en r1."
    },
    {
      l: 1,
      set: { r2: "fffff060" },
      t: "Se carga valor2 = -4000 en r2. Queda como 0xfffff060 por el complemento a 2."
    },
    {
      l: 2,
      set: { r4: "00000000" },
      t: "Se pone r4 en 0 con un and contra r0, que siempre vale 0."
    },
    {
      l: 3,
      set: { r4: "86004000" },
      t: "sethi carga los 22 bits altos de 0x86004002 en r4 (queda 0x86004000)."
    },
    {
      l: 4,
      set: { r4: "86004002" },
      t: "El or completa los 10 bits bajos (0x002) y r4 queda en 0x86004002."
    },
    {
      l: 5,
      set: { "[0x824]": "86004002" },
      mod: { l: 6, w: "86004002", x: "add %r1,%r2,%r3" },
      t: "El st escribe r4 en la dirección de sumar, así que el nop se pisa. " +
         "Ese 0x86004002 es en realidad un add %r1,%r2,%r3."
    },
    {
      l: 6,
      set: { r3: "fffffc18" },
      t: "En 0x824 ya no está el nop: se ejecuta el add %r1,%r2,%r3 que se escribió ahí. " +
         "r3 = 3000 + (-4000) = -1000 (0xfffffc18)."
    },
    {
      l: 7,
      set: { result: "fffffc18" },
      t: "Se guarda r3 en result (0x808)."
    },
    {
      l: 8,
      set: {},
      fin: true,
      t: "El ba fin salta a sí mismo, bucle infinito, fin del programa. " +
         "Después de guardar el resultado no se sabe qué valores quedan, por eso todo pasa a ✕."
    }
  ],

  endText: ""
};


/* ---------- Textos del simulador (incisos a, b y d de la Actividad 1) ---------- */

const TXT = {
  a1: `00000830
00000800	00000014
00000804	00000019
00000808	ffffffe0
0000080c	00000003
00000810	fffffffb
00000814	00000015
0000082c	00000000
00000830	c2002800
00000834	86080000
00000838	82007ffc
0000083c	c4006804
00000840	86008003
00000844	80884001
00000848	02800002
0000084c	10bffffb
00000850	c620282c
00000854	10800000`,

  b1: `--- Symbol Table ---
main: 2096
sumar: 2104
length: 2048
resultado: 2092
guardar: 2128
fin: 2132
array: 2052`,

  d1: `(ARCTools Version 2.1.2)
 HexLoc     DecLoc    MachWord   Label        Instruction
                                              .org 2048

00000800  0000002048  00000014  length:
00000804  0000002052  00000019  array:
00000808  0000002056  ffffffe0
0000080c  0000002060  00000003
00000810  0000002064  fffffffb
00000814  0000002068  00000015

                                              .dwb 5

0000082c  0000002092  00000000  resultado:

00000830  0000002096  c2002800  main:
00000834  0000002100  86080000

00000838  0000002104  82007ffc  sumar:
0000083c  0000002108  c4006804
00000840  0000002112  86008003
00000844  0000002116  80884001
00000848  0000002120  02800002
0000084c  0000002124  10bffffb

00000850  0000002128  c620282c  guardar:

00000854  0000002132  10800000  fin:`
};


/* ---------- Inciso e) de la Actividad 1: [línea, ¿genera código?, dirección] ---------- */

const E1 = [
  [".begin",               "No (directiva)",                       "-"],
  [".org 2048",            "No (directiva)",                       "-"],
  ["length: 0x00000014",   "Sí (dato)",                            "2048"],
  ["array: 0x00000019",    "Sí (dato)",                            "2052"],
  ["0xffffffe0",           "Sí (dato)",                            "2056"],
  ["0x00000003",           "Sí (dato)",                            "2060"],
  ["0xfffffffb",           "Sí (dato)",                            "2064"],
  ["0x00000015",           "Sí (dato)",                            "2068"],
  [".dwb 5",               "No (directiva, reserva 5 palabras)",   "2072-2091"],
  ["resultado: 0x00000000","Sí (dato)",                            "2092"],
  ["main: 0xc2002800",     "Sí (instrucción)",                     "2096"],
  ["0x86080000",           "Sí (instrucción)",                     "2100"],
  ["sumar: 0x82007ffc",    "Sí (instrucción)",                     "2104"],
  ["0xc4006804",           "Sí (instrucción)",                     "2108"],
  ["0x86008003",           "Sí (instrucción)",                     "2112"],
  ["0x80884001",           "Sí (instrucción)",                     "2116"],
  ["0x02800002",           "Sí (instrucción)",                     "2120"],
  ["0x10bffffb",           "Sí (instrucción)",                     "2124"],
  ["guardar: 0xc620282c",  "Sí (instrucción)",                     "2128"],
  ["fin: 0x10800000",      "Sí (instrucción)",                     "2132"],
  [".end",                 "No (directiva)",                       "-"]
];


/* =====================================================================
   2. UTILIDADES
   ===================================================================== */

// Atajo para document.querySelector
function $(selector) {
  return document.querySelector(selector);
}

// Convierte un string HTML en un elemento <div> con ese contenido
function crearElemento(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
}

// Convierte un valor en hexa (string) a decimal con signo de 32 bits
function aDecimal(valor) {
  if (valor === "✕") {
    return valor;
  }
  return String(parseInt(valor, 16) | 0);
}

/* =====================================================================
   3. SIMULACIÓN PASO A PASO
   ===================================================================== */

/*
  Devuelve un elemento con los controles, el código, la tabla y la
  respuesta final de una actividad. El elemento tiene un método
  .avanzar(n) para moverse n pasos (positivo o negativo).
*/
function crearSimulacion(actividad) {
  const totalPasos = actividad.steps.length;
  let pasoActual = 0;

  const el = crearElemento(`
    <div class="sticky">
      <div class="ctrl">
        <button class="btn-prev">← Anterior</button>
        <button class="btn-next">Siguiente →</button>
        <button class="btn-reset">Reiniciar</button>
        <span class="cnt"></span>
      </div>

      <div class="note"></div>
    </div>

    <div class="simgrid">
      <div class="card">
        <h3>Código</h3>
        <div class="code"></div>
      </div>
      <div class="card tw">
        <table></table>
      </div>
    </div>

    <div class="card ans"></div>
  `);

  const q = function (selector) {
    return el.querySelector(selector);
  };

  /* ----- Código: resalta la línea actual y aplica modificaciones ----- */
  function dibujarCodigo(paso, modificacion) {
    const html = actividad.code.map(function (linea, i) {
      let palabra = linea[1];
      let texto = linea[2];
      let claseMod = "";

      if (modificacion && modificacion.l === i) {
        palabra = modificacion.w;
        texto = modificacion.x;
        claseMod = " mod";
      }

      const claseAhora = (paso && paso.l === i) ? " now" : "";

      return `
        <div class="line${claseAhora}${claseMod}">
          <span class="a">${parseInt(linea[0], 16)}</span>
          <span class="a">${palabra}</span>
          <span class="t">${texto}</span>
        </div>`;
    });

    q(".code").innerHTML = html.join("");
  }

  /* ----- Tabla: una fila por cada paso ejecutado ----- */
  function dibujarTabla() {
    let html = "<tr><th>Paso</th><th>PC</th>";
    html += actividad.cols.map(function (c) {
      return "<th>" + c + "</th>";
    }).join("");
    html += "</tr>";

    // Fila de estado inicial
    html += "<tr>";
    html += "<td>Carga en memoria</td>";
    html += "<td>✕</td>";
    html += actividad.cols.map(function (c) {
      return "<td>" + aDecimal(actividad.init[c]) + "</td>";
    }).join("");
    html += "</tr>";

    // Una fila por paso ejecutado
    for (let k = 1; k <= pasoActual; k++) {
      const paso = actividad.steps[k - 1];
      const linea = actividad.code[paso.l];
      const claseFila = (k === pasoActual) ? ' class="cur"' : "";

      html += "<tr" + claseFila + ">";
      html += "<td>" + k + "</td>";
      html += "<td>" + parseInt(linea[0], 16) + "</td>";

      html += actividad.cols.map(function (c) {
        if (paso.fin) {
          return "<td>✕</td>";
        }
        const cambio = (c in paso.set);
        if (cambio) {
          return '<td class="chg">' + aDecimal(paso.set[c]) + "</td>";
        }
        return "<td>-</td>";
      }).join("");

      html += "</tr>";
    }

    q("table").innerHTML = html;
  }

  /* ----- Dibujo completo de la pantalla ----- */
  function dibujar() {
    const paso = (pasoActual > 0) ? actividad.steps[pasoActual - 1] : null;

    // Última modificación de código aplicada hasta este paso
    let modificacion = null;
    for (let k = 0; k < pasoActual; k++) {
      if (actividad.steps[k].mod) {
        modificacion = actividad.steps[k].mod;
      }
    }

    dibujarCodigo(paso, modificacion);
    dibujarTabla();

    q(".note").textContent = paso
      ? paso.t
      : "Programa cargado en memoria. Los registros todavía no tienen valor. Tocá “Siguiente” para ejecutar la primera instrucción.";

    q(".cnt").textContent = "Paso " + pasoActual + " de " + totalPasos;
    q(".btn-prev").disabled = (pasoActual === 0);
    q(".btn-next").disabled = (pasoActual === totalPasos);

    q(".ans").innerHTML = (pasoActual === totalPasos) ? actividad.endText : "";

    // Mantiene a la vista la última fila agregada
    const filaActual = q("tr.cur");
    if (filaActual) {
      filaActual.scrollIntoView({ block: "nearest" });
    }
  }

  /* ----- Movimiento entre pasos ----- */
  el.avanzar = function (delta) {
    pasoActual = Math.max(0, Math.min(totalPasos, pasoActual + delta));
    dibujar();
  };

  q(".btn-prev").onclick = function () { el.avanzar(-1); };
  q(".btn-next").onclick = function () { el.avanzar(1); };
  q(".btn-reset").onclick = function () {
    pasoActual = 0;
    dibujar();
  };

  dibujar();
  return el;
}


/* =====================================================================
   4. CONTENIDO DE CADA CONSIGNA
   ===================================================================== */

// Inciso con una simulación adentro
function incisoConSimulacion(htmlIntro, actividad) {
  const contenedor = crearElemento(htmlIntro);
  const sim = crearSimulacion(actividad);

  contenedor.appendChild(sim);
  contenedor.simulacion = sim;   // para controlarla con el teclado

  return contenedor;
}

// Tabla del inciso e)
function tablaDirectivas() {
  const filas = E1.map(function (fila) {
    return `
      <tr>
        <td class="i">${fila[0]}</td>
        <td class="i">${fila[1]}</td>
        <td>${fila[2]}</td>
      </tr>`;
  }).join("");

  return crearElemento(`
    <h3>e) Líneas que generan código de máquina y directivas</h3>
    <p>
      Las directivas (<code>.begin</code>, <code>.org</code>, <code>.dwb</code> y
      <code>.end</code>) solo le dan indicaciones al ensamblador y no generan
      palabras de código, <code>.dwb</code> únicamente reserva espacio. Los datos y
      las instrucciones sí ocupan una palabra de 32 bits en memoria.
    </p>
    <div class="card tw">
      <table>
        <tr>
          <th>Línea</th>
          <th>¿Genera código?</th>
          <th>Dirección (decimal)</th>
        </tr>
        ${filas}
      </table>
    </div>
  `);
}

// Inciso a) de la consigna 2: explicación + código que se va coloreando
function explicacionA2() {
  const TOTAL = 5;
  let actual = 0;   // 0 = todavía no se recorrió nada

  // [texto de la línea, paso al que pertenece (0 = directiva/dato, sin color)]
  const CODIGO = [
    [".begin", 0],
    [".org 2048", 0],
    ["", 0],
    ["valor1:  3000", 0],
    ["valor2:  -4000", 0],
    ["result:  0", 0],
    ["", 0],
    ["inicio:  ld [valor1], %r1", 1],
    ["         ld [valor2], %r2", 1],
    ["", 0],
    ["         and %r4,%r0,%r4", 2],
    ["         sethi %hi(0x86004002), %r4", 2],
    ["         or %r4, %lo(0x86004002), %r4", 2],
    ["         st %r4, [sumar]", 3],
    ["", 0],
    ["sumar:   nop", 4],
    ["         st %r3, [result]", 5],
    ["", 0],
    ["fin:     ba fin", 5],
    [".end", 0]
  ];

  const lineas = CODIGO.map(function (l) {
    return '<div class="cl" data-p="' + l[1] + '">' + (l[0] || " ") + "</div>";
  }).join("");

  const el = crearElemento(`
    <h3>a) ¿Qué hace el código?</h3>

    <div class="ctrl">
      <button class="btn-prev">← Anterior</button>
      <button class="btn-next">Siguiente →</button>
      <button class="btn-reset">Reiniciar</button>
      <span class="cnt"></span>
    </div>

    <div class="explica">
      <div>
        <p>
          Suma los valores con un <code>add</code> que arma el programa y escribe en
          memoria. El resultado (-1000) queda en <code>result</code>.
        </p>
        <ol class="seg">
          <li data-p="1">
            <code>ld</code> carga 3000 en <code>%r1</code> y -4000
            en <code>%r2</code> (queda como <code>0xfffff060</code>,
            complemento a 2).
          </li>
          <li data-p="2">
            <code>and %r4,%r0,%r4</code> pone <code>%r4</code> en 0, ya que
            <code>%r0</code> siempre vale 0. Después <code>sethi</code> y
            <code>or</code> arman <code>0x86004002</code> en <code>%r4</code>:
            primero los 22 bits altos y después los 10 bajos.
          </li>
          <li data-p="3">
            <code>st %r4,[sumar]</code> escribe ese valor en la posición
            de <code>sumar</code> (0x824), pisando el <code>nop</code>.
            Solo cambia la memoria, todavía no se suma nada.
          </li>
          <li data-p="4">
            Al ejecutar <code>sumar</code>, el procesador corre lo que
            ahora hay ahí: <code>add %r1,%r2,%r3</code>, o sea
            <code>%r3 = 3000 + (-4000) = -1000</code>.
          </li>
          <li data-p="5">
            <code>st %r3,[result]</code> guarda -1000 y
            <code>ba fin</code> queda en bucle infinito.
          </li>
        </ol>
      </div>

      <div class="enun">${lineas}</div>
    </div>
  `);

  function dibujar() {
    el.querySelectorAll("[data-p]").forEach(function (nodo) {
      const p = Number(nodo.dataset.p);
      nodo.classList.toggle("hecho", p > 0 && p < actual);
      nodo.classList.toggle("ahora", p > 0 && p === actual);
    });

    el.querySelector(".cnt").textContent = "Paso " + actual + " de " + TOTAL;
    el.querySelector(".btn-prev").disabled = (actual === 0);
    el.querySelector(".btn-next").disabled = (actual === TOTAL);
  }

  el.avanzar = function (delta) {
    actual = Math.max(0, Math.min(TOTAL, actual + delta));
    dibujar();
  };

  el.querySelector(".btn-prev").onclick = function () { el.avanzar(-1); };
  el.querySelector(".btn-next").onclick = function () { el.avanzar(1); };
  el.querySelector(".btn-reset").onclick = function () { actual = 0; dibujar(); };

  el.simulacion = el;   // así responde a las flechas del teclado
  dibujar();
  return el;
}

/*
  Cada consigna es una lista de [título del botón, función que arma el contenido].
  El contenido se arma recién cuando se abre el inciso.
*/
const CONSIGNAS = {

  1: [
    [
      "a) Código binario",
      function () {
        return crearElemento(`
          <h3>a) Código binario generado por el simulador</h3>
          <p>
            La primera línea (<code>00000830</code>) es la dirección de inicio
            (<code>main</code>). El resto son pares dirección - palabra de 32 bits:
            primero van los datos y desde 0x830 las instrucciones.
          </p>
          <p>
            Todos esos números están en hexadecimal. Los primeros son datos,
            pero desde 0x830 cada número es interpretado como una instrucción
            (por ejemplo, <code>c2002800</code> es un <code>ld</code>).
            El hueco entre 0x818 y 0x82b no aparece porque es el espacio que
            reserva <code>.dwb</code>.
          </p>
          <pre>${TXT.a1}</pre>
        `);
      }
    ],
    [
      "b) Tabla de símbolos",
      function () {
        return crearElemento(`
          <h3>b) Tabla de símbolos generada por el simulador</h3>
          <p>
            Cada etiqueta queda asociada a la dirección que le asignó el
            ensamblador, en decimal (por ejemplo <code>main</code> = 2096 = 0x830).
            Gracias a eso en el código se usan nombres y no direcciones.
          </p>
          <pre>${TXT.b1}</pre>
        `);
      }
    ],
    [
      "c) Tabla de seguimiento",
      function () {
        return incisoConSimulacion(`
          <h3>c) Tabla de seguimiento de registros y variables</h3>
          <p>
            Valores en decimal. ✕ = todavía sin valor. <code>resultado</code>
            ya tiene su contenido inicial en memoria.
          </p>
        `, A1);
      }
    ],
    [
      "d) Posiciones de memoria",
      function () {
        return crearElemento(`
          <h3>d) Posición de memoria de cada instrucción</h3>
          <pre>${TXT.d1}</pre>
        `);
      }
    ],
    [
      "e) Diferencia entre código y directivas",
      tablaDirectivas
    ]
  ],

  2: [
    [
      "a) Explicación código",
      explicacionA2
    ],
    [
      "b) Tabla de seguimiento",
      function () {
        return incisoConSimulacion(`
          <h3>b) Tabla de seguimiento de registros y variables</h3>
          <p>
            Valores en decimal. ✕ = todavía sin valor, <code>[0x824]</code> y
            <code>result</code> ya tienen su contenido inicial en memoria.
          </p>
        `, A2);
      }
    ],
    [
      "c) Nota 0x86004002",
      function () {
        return crearElemento(`
          <h3>Nota: ¿qué representa 0x86004002?</h3>
          <div class="card">
            <p>
              Con el simulador se comprueba que <code>0x86004002</code> no es un
              dato: es el código de máquina de la instrucción
              <code>add %r1,%r2,%r3</code>.
            </p>
            <pre class="wrap">1000 0110 0000 0000 0100 0000 0000 0010
op=10 | rd=00011 (%r3) | op3=000000 (add) | rs1=00001 (%r1) | i=0 | rs2=00010 (%r2)</pre>
            <p>
              Por eso, cuando <code>st %r4,[sumar]</code> lo escribe en
              0x824 (pisando el <code>nop</code>), el procesador lo ejecuta
              como una instrucción más y hace
              <code>%r3 = %r1 + %r2 = 3000 + (-4000) = -1000</code>.
            </p>
          </div>
        `);
      }
    ]
  ]
};


/* =====================================================================
   5. NAVEGACIÓN
   ===================================================================== */

const cacheIncisos = {};     // guarda cada inciso ya armado
let simulacionActiva = null; // simulación visible (para el teclado)

// Muestra un inciso dentro del panel
function mostrarInciso(consigna, indice) {
  const botones = document.querySelectorAll("#inc button");
  botones.forEach(function (boton, k) {
    boton.setAttribute("aria-selected", k === indice);
  });

  const clave = consigna + "-" + indice;
  if (!cacheIncisos[clave]) {
    cacheIncisos[clave] = CONSIGNAS[consigna][indice][1]();
  }

  const contenido = $("#content");
  contenido.innerHTML = "";
  contenido.appendChild(cacheIncisos[clave]);
  contenido.scrollTop = 0;

  simulacionActiva = cacheIncisos[clave].simulacion || null;
}

// Abre o cierra una consigna
function abrirConsigna(consigna) {
  const app = $("#app");
  const botones = document.querySelectorAll(".mainbtns button");
  const yaAbierta = botones[consigna - 1].getAttribute("aria-pressed") === "true";

  // Marca el botón elegido (o desmarca todos si se cierra)
  botones.forEach(function (boton, k) {
    const activo = !yaAbierta && (k === consigna - 1);
    boton.setAttribute("aria-pressed", activo);
  });

  if (yaAbierta) {
    app.classList.remove("open");
    simulacionActiva = null;
    return;
  }

  // Arma los botones de incisos
  const incisos = $("#inc");
  incisos.innerHTML = CONSIGNAS[consigna].map(function (inciso) {
    const titulo = inciso[0];
    const letra = titulo.slice(0, 2);   // "a)"
    const resto = titulo.slice(2);      // " Código binario"

    return `
      <button aria-label="${titulo}" title="${titulo}">
        <b>${letra}</b><span class="full">${resto}</span>
      </button>`;
  }).join("");

  incisos.querySelectorAll("button").forEach(function (boton, i) {
    boton.onclick = function () {
      mostrarInciso(consigna, i);
    };
  });

  mostrarInciso(consigna, 0);
  app.classList.add("open");
}

document.querySelectorAll(".mainbtns button").forEach(function (boton) {
  boton.onclick = function () {
    abrirConsigna(Number(boton.dataset.c));
  };
});


/* =====================================================================
   6. TECLADO (← → para moverse en la simulación)
   ===================================================================== */

document.addEventListener("keydown", function (evento) {
  if (!simulacionActiva) {
    return;
  }

  if (evento.key === "ArrowRight") {
    simulacionActiva.avanzar(1);
  }

  if (evento.key === "ArrowLeft") {
    simulacionActiva.avanzar(-1);
  }
});


/* =====================================================================
   7. PANTALLA DE CARGA
   ===================================================================== */

(function pantallaDeCarga() {
  const sinAnimaciones = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duracion = sinAnimaciones ? 600 : 3500;   // milisegundos
  const inicio = performance.now();

  const barra = $("#fill");
  const porcentaje = $("#pct");

  function actualizar(ahora) {
    const progreso = Math.min(1, (ahora - inicio) / duracion);
    const suavizado = 1 - Math.pow(1 - progreso, 2);

    barra.style.width = (suavizado * 100) + "%";
    porcentaje.textContent = Math.round(suavizado * 100) + "%";

    if (progreso < 1) {
      requestAnimationFrame(actualizar);
    } else {
      setTimeout(function () {
        $("#loader").classList.add("done");
      }, 250);
    }
  }

  requestAnimationFrame(actualizar);
})();