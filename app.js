/* =========================================================
   MATERIALES AUXILIARES - BODEGA
   APP.JS
========================================================= */


/* =========================================================
   CONFIGURACIÓN GENERAL
========================================================= */

const CLAVE_STORAGE = "materialesAuxiliaresBodega_v1";

const VERSION_DATOS = 1;


/* =========================================================
   ESTRUCTURA PRINCIPAL DE DATOS
========================================================= */

let datos = {
    version: VERSION_DATOS,

    botellas: [],
    corchos: [],
    cajas: [],
    capsulas: [],
    etiquetas: [],

    historial: {
        botellas: [],
        corchos: [],
        cajas: [],
        capsulas: [],
        etiquetas: []
    }
};


/* =========================================================
   ESTADO DE LA APLICACIÓN
========================================================= */

let categoriaActual = "botellas";

let productoEditando = null;

let movimientoActual = {
    categoria: null,
    productoId: null,
    tipo: "entrada"
};

let accionConfirmacion = null;


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    cargarDatos();

    prepararNavegacion();

    prepararBotellas();

    prepararCorchos();

    prepararCajas();

    prepararCapsulas();

    prepararEtiquetas();

    prepararModalMovimiento();

    prepararModalConfirmacion();

    prepararJSON();

    prepararPDF();

    dibujarTodo();

});


/* =========================================================
   CARGAR DATOS
========================================================= */

function cargarDatos() {

    try {

        const guardado = localStorage.getItem(CLAVE_STORAGE);

        if (!guardado) {

            datos = crearEstructuraInicial();

            guardarDatos();

            return;
        }

        const datosGuardados = JSON.parse(guardado);

        if (!datosGuardados || typeof datosGuardados !== "object") {

            datos = crearEstructuraInicial();

            guardarDatos();

            return;
        }

        datos = normalizarDatos(datosGuardados);

    } catch (error) {

        console.error("Error al cargar datos:", error);

        alert(
            "No se han podido cargar los datos guardados. " +
            "Se utilizará una estructura nueva."
        );

        datos = crearEstructuraInicial();

        guardarDatos();
    }
}


/* =========================================================
   ESTRUCTURA INICIAL
========================================================= */

function crearEstructuraInicial() {

    return {

        version: VERSION_DATOS,

        botellas: [],
        corchos: [],
        cajas: [],
        capsulas: [],
        etiquetas: [],

        historial: {
            botellas: [],
            corchos: [],
            cajas: [],
            capsulas: [],
            etiquetas: []
        }

    };
}


/* =========================================================
   NORMALIZAR DATOS
========================================================= */

function normalizarDatos(obj) {

    const resultado = crearEstructuraInicial();

    resultado.version = obj.version || VERSION_DATOS;

    const categorias = [
        "botellas",
        "corchos",
        "cajas",
        "capsulas",
        "etiquetas"
    ];

    categorias.forEach(function (categoria) {

        if (Array.isArray(obj[categoria])) {

            resultado[categoria] = obj[categoria];

        }

        if (
            obj.historial &&
            Array.isArray(obj.historial[categoria])
        ) {

            resultado.historial[categoria] =
                obj.historial[categoria];

        }

    });

    return resultado;
}


/* =========================================================
   GUARDAR DATOS
========================================================= */

function guardarDatos() {

    try {

        localStorage.setItem(
            CLAVE_STORAGE,
            JSON.stringify(datos)
        );

    } catch (error) {

        console.error("Error guardando datos:", error);

        alert(
            "No se han podido guardar los datos en el dispositivo."
        );
    }
}


/* =========================================================
   GENERAR ID
========================================================= */

function generarId(prefijo) {

    return (
        prefijo +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================================
   FECHA Y HORA
========================================================= */

function obtenerFechaHora() {

    const ahora = new Date();

    const fecha = ahora.toLocaleDateString("es-ES");

    const hora = ahora.toLocaleTimeString(
        "es-ES",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    return {
        fecha: fecha,
        hora: hora,
        timestamp: ahora.getTime()
    };
}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function prepararNavegacion() {

    const botones = document.querySelectorAll(
        ".boton-menu, .tarjeta-resumen"
    );

    botones.forEach(function (boton) {

        boton.addEventListener("click", function () {

            const seccion =
                boton.dataset.seccion;

            if (!seccion) {
                return;
            }

            mostrarSeccion(seccion);

        });

    });
}


/* =========================================================
   MOSTRAR SECCIÓN
========================================================= */

function mostrarSeccion(seccion) {

    document.querySelectorAll(".seccion")
        .forEach(function (elemento) {

            elemento.classList.remove("activa");

        });


    const destino =
        document.getElementById(
            "seccion-" + seccion
        );

    if (destino) {

        destino.classList.add("activa");

    }


    document.querySelectorAll(".boton-menu")
        .forEach(function (boton) {

            boton.classList.remove("activo");

            if (
                boton.dataset.seccion === seccion
            ) {

                boton.classList.add("activo");

            }

        });


    categoriaActual = seccion;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   DIBUJAR TODO
========================================================= */

function dibujarTodo() {

    dibujarBotellas();

    dibujarCorchos();

    dibujarCajas();

    dibujarCapsulas();

    dibujarEtiquetas();

    dibujarHistorial("botellas");

    dibujarHistorial("corchos");

    dibujarHistorial("cajas");

    dibujarHistorial("capsulas");

    dibujarHistorial("etiquetas");

    actualizarResumen();

}


/* =========================================================
   UTILIDADES DE TEXTO
========================================================= */

function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   FORMATEAR NÚMEROS
========================================================= */

function formatearNumero(numero) {

    const valor = Number(numero) || 0;

    return valor.toLocaleString("es-ES");
}


/* =========================================================
   ==================== BOTELLAS ===========================
========================================================= */

function prepararBotellas() {

    document
        .getElementById("btn-nueva-botella")
        .addEventListener(
            "click",
            function () {

                abrirFormularioBotella();

            }
        );


    document
        .getElementById("guardar-botella")
        .addEventListener(
            "click",
            guardarBotella
        );


    document
        .getElementById("cancelar-botella")
        .addEventListener(
            "click",
            cerrarFormularioBotella
        );


    document
        .getElementById("buscar-botellas")
        .addEventListener(
            "input",
            dibujarBotellas
        );


    document
        .getElementById("filtro-marca-botellas")
        .addEventListener(
            "change",
            dibujarBotellas
        );


   document
    .getElementById("filtro-modelo-botellas")
    .addEventListener(
        "change",
        dibujarBotellas
    );


    document
        .getElementById("limpiar-historial-botellas")
        .addEventListener(
            "click",
            function () {

                solicitarLimpiarHistorial(
                    "botellas"
                );

            }
        );
}


/* =========================================================
   FORMULARIO BOTELLAS
========================================================= */

function abrirFormularioBotella(producto = null) {

    productoEditando = producto
        ? producto.id
        : null;


    const formulario =
        document.getElementById(
            "formulario-botellas"
        );


    formulario.classList.remove("oculto");


    document.getElementById(
        "titulo-formulario-botellas"
    ).textContent =
        producto
            ? "Editar botella"
            : "Nueva botella";


    document.getElementById(
        "botella-marca"
    ).value =
        producto
            ? producto.marca
            : "";


    document.getElementById(
        "botella-modelo"
    ).value =
        producto
            ? producto.modelo
            : "";


    document.getElementById(
        "botella-capacidad"
    ).value =
        producto
            ? producto.capacidad
            : "";


    document.getElementById(
        "botella-stock"
    ).value =
        producto
            ? producto.stock
            : 0;

             document.getElementById("botella-lote").value =
        producto ? (producto.lote || "") : "";

            document.getElementById(
    "botella-caracteristicas"
).value =
    producto
        ? (producto.caracteristicas || "")
        : "";


    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   GUARDAR BOTELLA
========================================================= */

function guardarBotella() {

    const marca =
        document.getElementById(
            "botella-marca"
        ).value.trim();


    const modelo =
        document.getElementById(
            "botella-modelo"
        ).value.trim();


    const capacidad =
        document.getElementById(
            "botella-capacidad"
        ).value;

          const lote =
        document.getElementById("botella-lote").value.trim();


    const stock =
        Number(
            document.getElementById(
                "botella-stock"
            ).value
        );

        const caracteristicas =
    document.getElementById(
        "botella-caracteristicas"
    ).value.trim();


    if (!marca || !modelo || !capacidad) {

        alert(
            "Completa marca, modelo y capacidad."
        );

        return;
    }


    if (stock < 0 || !Number.isFinite(stock)) {

        alert(
            "El stock no puede ser negativo."
        );

        return;
    }


    if (productoEditando) {

        const producto =
            datos.botellas.find(
                p => p.id === productoEditando
            );


        if (!producto) {

            alert(
                "No se ha encontrado el producto."
            );

            return;
        }


        producto.marca = marca;
        producto.modelo = modelo;
        producto.capacidad = capacidad;
        producto.lote = lote;
        producto.caracteristicas = caracteristicas;
        if (!actualizarStockInicialDesdeProducto("botellas", producto, stock)) {
    return;
}

        /*
         * Al editar no se modifica el stock
         * desde este formulario.
         *
         * El stock se modifica mediante
         * entradas y consumos.
         */

        cerrarFormularioBotella();

        guardarDatos();

        dibujarTodo();

        return;
    }


    const producto = {

        id: generarId("BOT"),

        marca: marca,

        modelo: modelo,

        capacidad: capacidad,

        stock: stock,

         lote: lote,

        caracteristicas: caracteristicas,

        fechaCreacion:
            obtenerFechaHora().timestamp

    };


    datos.botellas.push(producto);


    if (stock > 0) {

        registrarMovimiento(
            "botellas",
            producto,
            "entrada",
            stock,
            "Stock inicial"
        );

    }


    cerrarFormularioBotella();

    guardarDatos();

    dibujarTodo();
}


/* =========================================================
   CERRAR FORMULARIO BOTELLAS
========================================================= */

function cerrarFormularioBotella() {

    productoEditando = null;

    document
        .getElementById(
            "formulario-botellas"
        )
        .classList.add("oculto");

    document.getElementById(
        "botella-marca"
    ).value = "";

    document.getElementById(
        "botella-modelo"
    ).value = "";

    document.getElementById(
        "botella-capacidad"
    ).value = "";

    document.getElementById(
        "botella-stock"
    ).value = 0;

    document.getElementById("botella-lote").value = "";

    document.getElementById(
    "botella-caracteristicas"
).value = "";
}



/* =========================================================
   DIBUJAR BOTELLAS
========================================================= */

function dibujarBotellas() {

    const tbody =
        document.getElementById(
            "tabla-botellas"
        );


    const texto =
        document.getElementById(
            "buscar-botellas"
        ).value
            .trim()
            .toLowerCase();


    const marca =
        document.getElementById(
            "filtro-marca-botellas"
        ).value;


    const modelo =
        document.getElementById(
            "filtro-modelo-botellas"
        ).value;


    const productos =
        datos.botellas.filter(
            function (producto) {

                const textoProducto = (

                    producto.marca +
                    " " +
                    producto.modelo +
                    " " +
                    producto.capacidad +
                    " " +
                    (producto.lote || "") +
                    " " +
                    (producto.caracteristicas || "")

                ).toLowerCase();


                const coincideTexto =
                    !texto ||
                    textoProducto.includes(texto);


                const coincideMarca =
                    !marca ||
                    producto.marca === marca;


                const coincideModelo =
                    !modelo ||
                    producto.modelo === modelo;


                return (
                    coincideTexto &&
                    coincideMarca &&
                    coincideModelo
                );

            }
        );


    if (!productos.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;padding:30px;">
                    No hay botellas para mostrar.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        productos.map(
            function (producto) {

                const stock =
                    Number(producto.stock) || 0;

                const capacidad =
                    Number(
                        String(producto.capacidad || "")
                            .replace(",", ".")
                    ) || 0;

                const litros =
                    stock * capacidad;


                return `
                    <tr>

                        <td>
                            ${escaparHTML(producto.marca)}
                        </td>

                        <td>
                            ${escaparHTML(producto.modelo)}
                        </td>

                        <td>
                            ${escaparHTML(producto.capacidad)} L
                        </td>

                        <td class="stock">
                            ${formatearNumero(stock)}
                        </td>

                        <td>
                            ${escaparHTML(producto.lote || "")}
                        </td>

                        <td>
                            ${escaparHTML(producto.caracteristicas || "")}
                        </td>

                        <td class="stock">
                            <strong>${formatearNumero(litros)} L</strong>
                        </td>

                        <td>

                            <div class="acciones-tabla">

                                <button
                                    class="boton-tabla boton-entrada"
                                    onclick="abrirMovimiento('botellas','${producto.id}','entrada')"
                                    title="Entrada">
                                    ➕
                                </button>

                                <button
                                    class="boton-tabla boton-consumo"
                                    onclick="abrirMovimiento('botellas','${producto.id}','consumo')"
                                    title="Consumo">
                                    ➖
                                </button>

                                <button
                                    class="boton-tabla boton-editar"
                                    onclick="editarProducto('botellas','${producto.id}')"
                                    title="Editar">
                                    ✏️
                                </button>

                                <button
                                    class="boton-tabla boton-eliminar"
                                    onclick="eliminarProducto('botellas','${producto.id}')"
                                    title="Eliminar">
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        ).join("");
}



/* =========================================================
   ===================== CORCHOS ===========================
========================================================= */

function prepararCorchos() {

    document
        .getElementById("btn-nuevo-corcho")
        .addEventListener(
            "click",
            function () {

                abrirFormularioCorcho();

            }
        );


    document
        .getElementById("guardar-corcho")
        .addEventListener(
            "click",
            guardarCorcho
        );


    document
        .getElementById("cancelar-corcho")
        .addEventListener(
            "click",
            cerrarFormularioCorcho
        );


    document
        .getElementById("buscar-corchos")
        .addEventListener(
            "input",
            dibujarCorchos
        );


    document
        .getElementById("filtro-marca-corchos")
        .addEventListener(
            "change",
            dibujarCorchos
        );


    document
    .getElementById("filtro-modelo-corchos")
    .addEventListener(
        "change",
        dibujarCorchos
    );


    document
        .getElementById("limpiar-historial-corchos")
        .addEventListener(
            "click",
            function () {

                solicitarLimpiarHistorial(
                    "corchos"
                );

            }
        );
}


/* =========================================================
   FORMULARIO CORCHOS
========================================================= */

function abrirFormularioCorcho(producto = null) {

    productoEditando =
        producto
            ? producto.id
            : null;


    document
        .getElementById("formulario-corchos")
        .classList.remove("oculto");


    document.getElementById(
        "titulo-formulario-corchos"
    ).textContent =
        producto
            ? "Editar corcho"
            : "Nuevo corcho";


    document.getElementById(
        "corcho-marca"
    ).value =
        producto
            ? producto.marca
            : "";


    document.getElementById(
        "corcho-modelo"
    ).value =
        producto
            ? producto.modelo
            : "";


    document.getElementById(
        "corcho-tipo"
    ).value =
        producto
            ? producto.tipo
            : "";


    document.getElementById(
        "corcho-stock"
    ).value =
        producto
            ? producto.stock
            : 0;

            document.getElementById("corcho-lote").value =
        producto ? (producto.lote || "") : "";

            document.getElementById(
    "corcho-caracteristicas"
).value =
    producto
        ? (producto.caracteristicas || "")
        : "";


    document
        .getElementById("formulario-corchos")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


/* =========================================================
   GUARDAR CORCHO
========================================================= */

function guardarCorcho() {

    const marca =
        document.getElementById(
            "corcho-marca"
        ).value.trim();


    const modelo =
        document.getElementById(
            "corcho-modelo"
        ).value.trim();


    const tipo =
        document.getElementById(
            "corcho-tipo"
        ).value.trim();


    const stock =
        Number(
            document.getElementById(
                "corcho-stock"
            ).value
        );

        const lote =
        document.getElementById("corcho-lote").value.trim();

        const caracteristicas =
    document.getElementById(
        "corcho-caracteristicas"
    ).value.trim();


    if (!marca || !modelo || !tipo) {

        alert(
            "Completa marca, modelo y tipo."
        );

        return;
    }


    if (stock < 0 || !Number.isFinite(stock)) {

        alert(
            "El stock no puede ser negativo."
        );

        return;
    }


    if (productoEditando) {

        const producto =
            datos.corchos.find(
                p => p.id === productoEditando
            );


        if (!producto) {
            return;
        }


        producto.marca = marca;
        producto.modelo = modelo;
        producto.tipo = tipo;
        producto.lote = lote;
        producto.caracteristicas = caracteristicas;
        if (!actualizarStockInicialDesdeProducto("corchos", producto, stock)) {
    return;
}


        cerrarFormularioCorcho();

        guardarDatos();

        dibujarTodo();

        return;
    }


    const producto = {

        id: generarId("COR"),

        marca: marca,

        modelo: modelo,

        tipo: tipo,

        stock: stock,

        lote: lote,

        caracteristicas: caracteristicas,

        fechaCreacion:
            obtenerFechaHora().timestamp

    };


    datos.corchos.push(producto);


    if (stock > 0) {

        registrarMovimiento(
            "corchos",
            producto,
            "entrada",
            stock,
            "Stock inicial"
        );

    }


    cerrarFormularioCorcho();

    guardarDatos();

    dibujarTodo();
}


/* =========================================================
   CERRAR FORMULARIO CORCHOS
========================================================= */

function cerrarFormularioCorcho() {

    productoEditando = null;

    document
        .getElementById("formulario-corchos")
        .classList.add("oculto");

    document.getElementById(
        "corcho-marca"
    ).value = "";

    document.getElementById(
        "corcho-modelo"
    ).value = "";

    document.getElementById(
        "corcho-tipo"
    ).value = "";

    document.getElementById(
        "corcho-stock"
    ).value = 0;

    document.getElementById("corcho-lote").value = "";

    document.getElementById(
    "corcho-caracteristicas"
).value = "";
}


/* =========================================================
   DIBUJAR CORCHOS
========================================================= */

function dibujarCorchos() {

    const tbody =
        document.getElementById(
            "tabla-corchos"
        );


    const texto =
        document.getElementById(
            "buscar-corchos"
        ).value
            .trim()
            .toLowerCase();


    const marca =
        document.getElementById(
            "filtro-marca-corchos"
        ).value;


    const modelo =
    document.getElementById(
        "filtro-modelo-corchos"
    ).value;


    const productos =
        datos.corchos.filter(
            function (producto) {

                const textoProducto = (

                    producto.marca +
                    " " +
                    producto.modelo +
                    " " +
                    producto.tipo +
                     " " +
                   (producto.lote || "") +
                    " " +
                   (producto.caracteristicas || "")

                ).toLowerCase();


                return (

                    (!texto ||
                        textoProducto.includes(texto)) &&

                    (!marca ||
                        producto.marca === marca) &&

                    (!modelo ||
    producto.modelo === modelo)

                );

            }
        );


    if (!productos.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:30px;">
                    No hay corchos para mostrar.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        productos.map(
            function (producto) {

                return `
                    <tr>

                        <td>
                            ${escaparHTML(producto.marca)}
                        </td>

                        <td>
                            ${escaparHTML(producto.modelo)}
                        </td>

                        <td>
                            ${escaparHTML(producto.tipo)}
                        </td>

                        <td class="stock">
                            ${formatearNumero(producto.stock)}
                        </td>

                        <td>
                            ${escaparHTML(producto.lote || "")}
                        </td>

                        <td>
    ${escaparHTML(producto.caracteristicas || "")}
</td>

                        <td>

                            <div class="acciones-tabla">

                                <button
                                    class="boton-tabla boton-entrada"
                                    onclick="abrirMovimiento('corchos','${producto.id}','entrada')">
                                    ➕
                                </button>

                                <button
                                    class="boton-tabla boton-consumo"
                                    onclick="abrirMovimiento('corchos','${producto.id}','consumo')">
                                    ➖
                                </button>

                                <button
                                    class="boton-tabla boton-editar"
                                    onclick="editarProducto('corchos','${producto.id}')">
                                    ✏️
                                </button>

                                <button
                                    class="boton-tabla boton-eliminar"
                                    onclick="eliminarProducto('corchos','${producto.id}')">
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* =========================================================
   ======================= CAJAS ===========================
========================================================= */

function prepararCajas() {

    document
        .getElementById("btn-nueva-caja")
        .addEventListener(
            "click",
            function () {

                abrirFormularioCaja();

            }
        );


    document
        .getElementById("guardar-caja")
        .addEventListener(
            "click",
            guardarCaja
        );


    document
        .getElementById("cancelar-caja")
        .addEventListener(
            "click",
            cerrarFormularioCaja
        );


    document
        .getElementById("buscar-cajas")
        .addEventListener(
            "input",
            dibujarCajas
        );

    document
        .getElementById("filtro-tipo-cajas")
        .addEventListener(
            "change",
            dibujarCajas
        );

        document
    .getElementById("filtro-modelo-cajas")
    .addEventListener(
        "change",
        dibujarCajas
    );


    document
        .getElementById("limpiar-historial-cajas")
        .addEventListener(
            "click",
            function () {

                solicitarLimpiarHistorial(
                    "cajas"
                );

            }
        );
}


/* =========================================================
   FORMULARIO CAJAS
========================================================= */

function abrirFormularioCaja(producto = null) {

    productoEditando =
        producto
            ? producto.id
            : null;


    document
        .getElementById("formulario-cajas")
        .classList.remove("oculto");


    document.getElementById(
        "titulo-formulario-cajas"
    ).textContent =
        producto
            ? "Editar caja"
            : "Nueva caja";


    document.getElementById(
        "caja-marca"
    ).value =
        producto
            ? producto.marca
            : "";


    document.getElementById(
        "caja-tipo"
    ).value =
        producto
            ? producto.tipo
            : "";


    document.getElementById(
        "caja-modelo"
    ).value =
        producto
            ? producto.modelo
            : "";


    document.getElementById(
        "caja-unidades"
    ).value =
        producto
            ? producto.unidades
            : "";


    document.getElementById(
        "caja-stock"
    ).value =
        producto
            ? producto.stock
            : 0;

            document.getElementById(
    "caja-caracteristicas"
).value =
    producto
        ? (producto.caracteristicas || "")
        : "";


    document
        .getElementById("formulario-cajas")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


/* =========================================================
   GUARDAR CAJA
========================================================= */

function guardarCaja() {

    const marca =
        document.getElementById(
            "caja-marca"
        ).value.trim();


    const tipo =
        document.getElementById(
            "caja-tipo"
        ).value.trim();


    const modelo =
        document.getElementById(
            "caja-modelo"
        ).value.trim();


    const unidades =
        document.getElementById(
            "caja-unidades"
        ).value;


    const stock =
        Number(
            document.getElementById(
                "caja-stock"
            ).value
        );

        const caracteristicas =
    document.getElementById(
        "caja-caracteristicas"
    ).value.trim();


    if (!marca || !tipo || !modelo || !unidades) {

        alert(
            "Completa marca, tipo, modelo y unidades."
        );

        return;
    }


    if (stock < 0 || !Number.isFinite(stock)) {

        alert(
            "El stock no puede ser negativo."
        );

        return;
    }


    if (productoEditando) {

        const producto =
            datos.cajas.find(
                p => p.id === productoEditando
            );


        if (!producto) {
            return;
        }


        producto.marca = marca;
        producto.tipo = tipo;
        producto.modelo = modelo;
        producto.unidades = unidades;
        producto.caracteristicas = caracteristicas;
        if (!actualizarStockInicialDesdeProducto("cajas", producto, stock)) {
    return;
}


        cerrarFormularioCaja();

        guardarDatos();

        dibujarTodo();

        return;
    }


    const producto = {

        id: generarId("CAJ"),

        marca: marca,

        tipo: tipo,

        modelo: modelo,

        unidades: unidades,

        stock: stock,

        caracteristicas: caracteristicas,

        fechaCreacion:
            obtenerFechaHora().timestamp

    };


    datos.cajas.push(producto);


    if (stock > 0) {

        registrarMovimiento(
            "cajas",
            producto,
            "entrada",
            stock,
            "Stock inicial"
        );

    }


    cerrarFormularioCaja();

    guardarDatos();

    dibujarTodo();
}


/* =========================================================
   CERRAR FORMULARIO CAJAS
========================================================= */

function cerrarFormularioCaja() {

    productoEditando = null;

    document
        .getElementById("formulario-cajas")
        .classList.add("oculto");

    document.getElementById(
        "caja-marca"
    ).value = "";

    document.getElementById(
        "caja-tipo"
    ).value = "";

    document.getElementById(
        "caja-modelo"
    ).value = "";

    document.getElementById(
        "caja-unidades"
    ).value = "";

    document.getElementById(
        "caja-stock"
    ).value = 0;

    document.getElementById(
    "caja-caracteristicas"
).value = "";
}



/* =========================================================
   DIBUJAR CAJAS
========================================================= */

function dibujarCajas() {

    const tbody =
        document.getElementById(
            "tabla-cajas"
        );


    const texto =
        document.getElementById(
            "buscar-cajas"
        ).value
            .trim()
            .toLowerCase();


    const tipo =
        document.getElementById(
            "filtro-tipo-cajas"
        ).value;


    const modelo =
        document.getElementById(
            "filtro-modelo-cajas"
        ).value;


    const productos =
        datos.cajas.filter(
            function (producto) {

                const textoProducto = (

                    producto.marca +
                    " " +
                    producto.tipo +
                    " " +
                    producto.modelo +
                    " " +
                    producto.unidades +
                    " " +
                    (producto.caracteristicas || "")

                ).toLowerCase();


                return (

                    (!texto ||
                        textoProducto.includes(texto)) &&

                    (!tipo ||
                        producto.tipo === tipo) &&

                    (!modelo ||
                        producto.modelo === modelo)

                );

            }
        );


    if (!productos.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;padding:30px;">
                    No hay cajas para mostrar.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        productos.map(
            function (producto) {

                const stock =
                    Number(producto.stock) || 0;

                const unidades =
                    Number(
                        String(producto.unidades || "")
                            .replace(",", ".")
                    ) || 0;

                const botellas =
                    stock * unidades;


                return `
                    <tr>

                        <td>
                            ${escaparHTML(producto.marca)}
                        </td>

                        <td>
                            ${escaparHTML(producto.tipo)}
                        </td>

                        <td>
                            ${escaparHTML(producto.modelo)}
                        </td>

                        <td>
                            ${escaparHTML(producto.unidades)}
                            botellas
                        </td>

                        <td class="stock">
                            ${formatearNumero(stock)}
                        </td>

                        <td>
                            ${escaparHTML(producto.caracteristicas || "")}
                        </td>

                        <td class="stock">
                            <strong>${formatearNumero(botellas)}</strong>
                        </td>

                        <td>

                            <div class="acciones-tabla">

                                <button
                                    class="boton-tabla boton-entrada"
                                    onclick="abrirMovimiento('cajas','${producto.id}','entrada')">
                                    ➕
                                </button>

                                <button
                                    class="boton-tabla boton-consumo"
                                    onclick="abrirMovimiento('cajas','${producto.id}','consumo')">
                                    ➖
                                </button>

                                <button
                                    class="boton-tabla boton-editar"
                                    onclick="editarProducto('cajas','${producto.id}')">
                                    ✏️
                                </button>

                                <button
                                    class="boton-tabla boton-eliminar"
                                    onclick="eliminarProducto('cajas','${producto.id}')">
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* =========================================================
   ===================== CAPSULAS ==========================
========================================================= */

function prepararCapsulas() {

    document
        .getElementById("btn-nueva-capsula")
        .addEventListener(
            "click",
            function () {

                abrirFormularioCapsula();

            }
        );


    document
        .getElementById("guardar-capsula")
        .addEventListener(
            "click",
            guardarCapsula
        );


    document
        .getElementById("cancelar-capsula")
        .addEventListener(
            "click",
            cerrarFormularioCapsula
        );


    document
        .getElementById("buscar-capsulas")
        .addEventListener(
            "input",
            dibujarCapsulas
        );


    document
        .getElementById("filtro-marca-capsulas")
        .addEventListener(
            "change",
            dibujarCapsulas
        );


    document
    .getElementById("filtro-modelo-capsulas")
    .addEventListener(
        "change",
        dibujarCapsulas
    );


    document
        .getElementById("limpiar-historial-capsulas")
        .addEventListener(
            "click",
            function () {

                solicitarLimpiarHistorial(
                    "capsulas"
                );

            }
        );
}


/* =========================================================
   FORMULARIO CAPSULAS
========================================================= */

function abrirFormularioCapsula(producto = null) {

    productoEditando =
        producto
            ? producto.id
            : null;


    document
        .getElementById("formulario-capsulas")
        .classList.remove("oculto");


    document.getElementById(
        "titulo-formulario-capsulas"
    ).textContent =
        producto
            ? "Editar cápsula"
            : "Nueva cápsula";


    document.getElementById(
        "capsula-marca"
    ).value =
        producto
            ? producto.marca
            : "";


    document.getElementById(
        "capsula-tipo"
    ).value =
        producto
            ? producto.tipo
            : "";


    document.getElementById(
        "capsula-modelo"
    ).value =
        producto
            ? producto.modelo
            : "";


    document.getElementById(
        "capsula-stock"
    ).value =
        producto
            ? producto.stock
            : 0;

            document.getElementById(
    "capsula-caracteristicas"
).value =
    producto
        ? (producto.caracteristicas || "")
        : "";


    document
        .getElementById("formulario-capsulas")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


/* =========================================================
   GUARDAR CAPSULA
========================================================= */

function guardarCapsula() {

    const marca =
        document.getElementById(
            "capsula-marca"
        ).value.trim();


    const tipo =
        document.getElementById(
            "capsula-tipo"
        ).value.trim();


    const modelo =
        document.getElementById(
            "capsula-modelo"
        ).value.trim();


    const stock =
        Number(
            document.getElementById(
                "capsula-stock"
            ).value
        );

        const caracteristicas =
    document.getElementById(
        "capsula-caracteristicas"
    ).value.trim();


    if (!marca || !tipo || !modelo) {

        alert(
            "Completa marca, tipo y modelo."
        );

        return;
    }


    if (stock < 0 || !Number.isFinite(stock)) {

        alert(
            "El stock no puede ser negativo."
        );

        return;
    }


    if (productoEditando) {

        const producto =
            datos.capsulas.find(
                p => p.id === productoEditando
            );


        if (!producto) {
            return;
        }


        producto.marca = marca;
        producto.tipo = tipo;
        producto.modelo = modelo;
        producto.caracteristicas = caracteristicas;
        if (!actualizarStockInicialDesdeProducto("capsulas", producto, stock)) {
    return;
}


        cerrarFormularioCapsula();

        guardarDatos();

        dibujarTodo();

        return;
    }


    const producto = {

        id: generarId("CAP"),

        marca: marca,

        tipo: tipo,

        modelo: modelo,

        stock: stock,

        caracteristicas: caracteristicas,

        fechaCreacion:
            obtenerFechaHora().timestamp

    };


    datos.capsulas.push(producto);


    if (stock > 0) {

        registrarMovimiento(
            "capsulas",
            producto,
            "entrada",
            stock,
            "Stock inicial"
        );

    }


    cerrarFormularioCapsula();

    guardarDatos();

    dibujarTodo();
}


/* =========================================================
   CERRAR FORMULARIO CAPSULAS
========================================================= */

function cerrarFormularioCapsula() {

    productoEditando = null;

    document
        .getElementById("formulario-capsulas")
        .classList.add("oculto");

    document.getElementById(
        "capsula-marca"
    ).value = "";

    document.getElementById(
        "capsula-tipo"
    ).value = "";

    document.getElementById(
        "capsula-modelo"
    ).value = "";

    document.getElementById(
        "capsula-stock"
    ).value = 0;

    document.getElementById(
    "capsula-caracteristicas"
).value = "";
}


/* =========================================================
   DIBUJAR CAPSULAS
========================================================= */

function dibujarCapsulas() {

    const tbody =
        document.getElementById(
            "tabla-capsulas"
        );


    const texto =
        document.getElementById(
            "buscar-capsulas"
        ).value
            .trim()
            .toLowerCase();


    const marca =
        document.getElementById(
            "filtro-marca-capsulas"
        ).value;


   const modelo =
    document.getElementById(
        "filtro-modelo-capsulas"
    ).value;


    const productos =
        datos.capsulas.filter(
            function (producto) {

                const textoProducto = (

                    producto.marca +
                    " " +
                    producto.tipo +
                    " " +
                    producto.modelo +
                    " " +
                    (producto.caracteristicas || "")

                ).toLowerCase();


                return (

                    (!texto ||
                        textoProducto.includes(texto)) &&

                    (!marca ||
                        producto.marca === marca) &&

                    (!modelo ||
    producto.modelo === modelo)

                );

            }
        );


    if (!productos.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:30px;">
                    No hay cápsulas para mostrar.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        productos.map(
            function (producto) {

                return `
                    <tr>

                        <td>
                            ${escaparHTML(producto.marca)}
                        </td>

                        <td>
                            ${escaparHTML(producto.tipo)}
                        </td>

                        <td>
                            ${escaparHTML(producto.modelo)}
                        </td>

                        <td class="stock">
                            ${formatearNumero(producto.stock)}
                        </td>

                        <td>
    ${escaparHTML(producto.caracteristicas || "")}
</td>

                        <td>

                            <div class="acciones-tabla">

                                <button
                                    class="boton-tabla boton-entrada"
                                    onclick="abrirMovimiento('capsulas','${producto.id}','entrada')">
                                    ➕
                                </button>

                                <button
                                    class="boton-tabla boton-consumo"
                                    onclick="abrirMovimiento('capsulas','${producto.id}','consumo')">
                                    ➖
                                </button>

                                <button
                                    class="boton-tabla boton-editar"
                                    onclick="editarProducto('capsulas','${producto.id}')">
                                    ✏️
                                </button>

                                <button
                                    class="boton-tabla boton-eliminar"
                                    onclick="eliminarProducto('capsulas','${producto.id}')">
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* =========================================================
   ===================== ETIQUETAS =========================
========================================================= */

function prepararEtiquetas() {

    document
        .getElementById("btn-nueva-etiqueta")
        .addEventListener(
            "click",
            function () {

                abrirFormularioEtiqueta();

            }
        );


    document
        .getElementById("guardar-etiqueta")
        .addEventListener(
            "click",
            guardarEtiqueta
        );


    document
        .getElementById("cancelar-etiqueta")
        .addEventListener(
            "click",
            cerrarFormularioEtiqueta
        );


    document
        .getElementById("buscar-etiquetas")
        .addEventListener(
            "input",
            dibujarEtiquetas
        );


   document
    .getElementById("filtro-modelo-etiquetas")
    .addEventListener(
        "change",
        dibujarEtiquetas
    );


    document
        .getElementById("filtro-tipo-etiquetas")
        .addEventListener(
            "change",
            dibujarEtiquetas
        );


    document
        .getElementById("filtro-anada-etiquetas")
        .addEventListener(
            "input",
            dibujarEtiquetas
        );


    document
        .getElementById("limpiar-historial-etiquetas")
        .addEventListener(
            "click",
            function () {

                solicitarLimpiarHistorial(
                    "etiquetas"
                );

            }
        );
}


/* =========================================================
   FORMULARIO ETIQUETAS
========================================================= */

function abrirFormularioEtiqueta(producto = null) {

    productoEditando =
        producto
            ? producto.id
            : null;


    document
        .getElementById("formulario-etiquetas")
        .classList.remove("oculto");


    document.getElementById(
        "titulo-formulario-etiquetas"
    ).textContent =
        producto
            ? "Editar etiqueta"
            : "Nueva etiqueta";


    document.getElementById(
        "etiqueta-marca"
    ).value =
        producto
            ? producto.marca
            : "";


    document.getElementById(
        "etiqueta-tipo"
    ).value =
        producto
            ? producto.tipo
            : "";


    document.getElementById(
        "etiqueta-modelo"
    ).value =
        producto
            ? producto.modelo
            : "";


    document.getElementById(
        "etiqueta-anada"
    ).value =
        producto
            ? producto.anada
            : "";


    document.getElementById(
        "etiqueta-lote"
    ).value =
        producto
            ? producto.lote
            : "";


    document.getElementById(
        "etiqueta-stock"
    ).value =
        producto
            ? producto.stock
            : 0;

            document.getElementById(
    "etiqueta-caracteristicas"
).value =
    producto
        ? (producto.caracteristicas || "")
        : "";


    document
        .getElementById("formulario-etiquetas")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


/* =========================================================
   GUARDAR ETIQUETA
========================================================= */

function guardarEtiqueta() {

    const marca =
        document.getElementById(
            "etiqueta-marca"
        ).value.trim();


    const tipo =
        document.getElementById(
            "etiqueta-tipo"
        ).value.trim();


    const modelo =
        document.getElementById(
            "etiqueta-modelo"
        ).value.trim();


    const anada =
        document.getElementById(
            "etiqueta-anada"
        ).value.trim();


    const lote =
        document.getElementById(
            "etiqueta-lote"
        ).value.trim();


    const stock =
        Number(
            document.getElementById(
                "etiqueta-stock"
            ).value
        );

        const caracteristicas =
    document.getElementById(
        "etiqueta-caracteristicas"
    ).value.trim();


   const esTrasera =
    tipo.toLowerCase() === "trasera";

if (
    !marca ||
    !tipo ||
    !modelo ||
    (esTrasera && (!anada || !lote))
) {

    alert(
        esTrasera
            ? "Completa marca, tipo, modelo, añada y lote."
            : "Completa marca, tipo y modelo."
    );

    return;
}


    if (stock < 0 || !Number.isFinite(stock)) {

        alert(
            "El stock no puede ser negativo."
        );

        return;
    }

    const anadaGuardar =
    esTrasera ? anada : "";

const loteGuardar =
    esTrasera ? lote : "";


    if (productoEditando) {

        const producto =
            datos.etiquetas.find(
                p => p.id === productoEditando
            );


        if (!producto) {
            return;
        }


        producto.marca = marca;
        producto.tipo = tipo;
        producto.modelo = modelo;
        producto.anada = anadaGuardar;
producto.lote = loteGuardar;
producto.caracteristicas = caracteristicas;
if (!actualizarStockInicialDesdeProducto("etiquetas", producto, stock)) {
    return;
}


        cerrarFormularioEtiqueta();

        guardarDatos();

        dibujarTodo();

        return;
    }


    const producto = {

        id: generarId("ETQ"),

        marca: marca,

        tipo: tipo,

        modelo: modelo,

        anada: anadaGuardar,
lote: loteGuardar,

        stock: stock,

        caracteristicas: caracteristicas,

        fechaCreacion:
            obtenerFechaHora().timestamp

    };


    datos.etiquetas.push(producto);


    if (stock > 0) {

        registrarMovimiento(
            "etiquetas",
            producto,
            "entrada",
            stock,
            "Stock inicial"
        );

    }


    cerrarFormularioEtiqueta();

    guardarDatos();

    dibujarTodo();
}


/* =========================================================
   CERRAR FORMULARIO ETIQUETAS
========================================================= */

function cerrarFormularioEtiqueta() {

    productoEditando = null;

    document
        .getElementById("formulario-etiquetas")
        .classList.add("oculto");

    document.getElementById(
        "etiqueta-marca"
    ).value = "";

    document.getElementById(
        "etiqueta-tipo"
    ).value = "";

    document.getElementById(
        "etiqueta-modelo"
    ).value = "";

    document.getElementById(
        "etiqueta-anada"
    ).value = "";

    document.getElementById(
        "etiqueta-lote"
    ).value = "";

    document.getElementById(
        "etiqueta-stock"
    ).value = 0;

    document.getElementById(
    "etiqueta-caracteristicas"
).value = "";
}


/* =========================================================
   DIBUJAR ETIQUETAS
========================================================= */

function dibujarEtiquetas() {

    const tbody =
        document.getElementById(
            "tabla-etiquetas"
        );


    const texto =
        document.getElementById(
            "buscar-etiquetas"
        ).value
            .trim()
            .toLowerCase();


    const modelo =
    document.getElementById(
        "filtro-modelo-etiquetas"
    ).value;


    const tipo =
        document.getElementById(
            "filtro-tipo-etiquetas"
        ).value;


    const anada =
        document.getElementById(
            "filtro-anada-etiquetas"
        ).value.trim();


    const productos =
        datos.etiquetas.filter(
            function (producto) {

                const textoProducto = (

                    producto.marca +
                    " " +
                    producto.tipo +
                    " " +
                    producto.modelo +
                    " " +
                    producto.anada +
                    " " +
                    producto.lote +
                    " " +
                    (producto.caracteristicas || "")

                ).toLowerCase();


                return (

                    (!texto ||
                        textoProducto.includes(texto)) &&

                    (!modelo ||
    producto.modelo === modelo) &&

                    (!tipo ||
                        producto.tipo === tipo) &&

                    (!anada ||
                        String(producto.anada) ===
                        String(anada))

                );

            }
        );


    if (!productos.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;padding:30px;">
                    No hay etiquetas para mostrar.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        productos.map(
            function (producto) {

                return `
                    <tr>

                        <td>
                            ${escaparHTML(producto.marca)}
                        </td>

                        <td>
                            ${escaparHTML(producto.tipo)}
                        </td>

                        <td>
                            ${escaparHTML(producto.modelo)}
                        </td>

                        <td>
                            ${escaparHTML(producto.anada)}
                        </td>

                        <td>
                            ${escaparHTML(producto.lote)}
                        </td>

                        <td class="stock">
                            ${formatearNumero(producto.stock)}
                        </td>

                        <td>
    ${escaparHTML(producto.caracteristicas || "")}
</td>

                        <td>

                            <div class="acciones-tabla">

                                <button
                                    class="boton-tabla boton-entrada"
                                    onclick="abrirMovimiento('etiquetas','${producto.id}','entrada')">
                                    ➕
                                </button>

                                <button
                                    class="boton-tabla boton-consumo"
                                    onclick="abrirMovimiento('etiquetas','${producto.id}','consumo')">
                                    ➖
                                </button>

                                <button
                                    class="boton-tabla boton-editar"
                                    onclick="editarProducto('etiquetas','${producto.id}')">
                                    ✏️
                                </button>

                                <button
                                    class="boton-tabla boton-eliminar"
                                    onclick="eliminarProducto('etiquetas','${producto.id}')">
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* =========================================================
   EDITAR PRODUCTO
========================================================= */

function editarProducto(categoria, id) {

    const producto =
        datos[categoria].find(
            p => p.id === id
        );


    if (!producto) {

        alert(
            "No se ha encontrado el producto."
        );

        return;
    }


    switch (categoria) {

        case "botellas":

            mostrarSeccion("botellas");

            abrirFormularioBotella(producto);

            break;


        case "corchos":

            mostrarSeccion("corchos");

            abrirFormularioCorcho(producto);

            break;


        case "cajas":

            mostrarSeccion("cajas");

            abrirFormularioCaja(producto);

            break;


        case "capsulas":

            mostrarSeccion("capsulas");

            abrirFormularioCapsula(producto);

            break;


        case "etiquetas":

            mostrarSeccion("etiquetas");

            abrirFormularioEtiqueta(producto);

            break;

    }
}


/* =========================================================
   ELIMINAR PRODUCTO
========================================================= */

function eliminarProducto(categoria, id) {

    const producto =
        datos[categoria].find(
            p => p.id === id
        );


    if (!producto) {
        return;
    }


    const nombre =
        obtenerNombreProducto(
            categoria,
            producto
        );


    solicitarConfirmacion(
        `¿Quieres eliminar "${nombre}"?`,

        function () {

            datos[categoria] =
                datos[categoria].filter(
                    p => p.id !== id
                );


            /*
             * También eliminamos su historial
             * porque el producto ya no existe.
             *
             * El usuario recibirá confirmación
             * antes de llegar aquí.
             */

            datos.historial[categoria] =
                datos.historial[categoria].filter(
                    movimiento =>
                        movimiento.productoId !== id
                );


            guardarDatos();

            dibujarTodo();

        }
    );
}


/* =========================================================
   NOMBRE DEL PRODUCTO
========================================================= */

function obtenerNombreProducto(
    categoria,
    producto
) {

    switch (categoria) {

        case "botellas":

            return (
                producto.marca +
                " - " +
                producto.modelo +
                " - " +
                producto.capacidad +
                " L"
            );


        case "corchos":

            return (
                producto.marca +
                " - " +
                producto.modelo +
                " - " +
                producto.tipo
            );


        case "cajas":

            return (
                producto.marca +
                " - " +
                producto.tipo +
                " - " +
                producto.modelo +
                " - " +
                producto.unidades +
                " botellas"
            );


        case "capsulas":

            return (
                producto.marca +
                " - " +
                producto.tipo +
                " - " +
                producto.modelo
            );


        case "etiquetas":

            return (
                producto.marca +
                " - " +
                producto.tipo +
                " - " +
                producto.modelo +
                " - " +
                producto.anada +
                " - " +
                producto.lote
            );


        default:

            return "Producto";

    }
}


/* =========================================================
   ===================== MOVIMIENTOS =======================
========================================================= */

function prepararModalMovimiento() {

    document
        .getElementById(
            "cerrar-modal-movimiento"
        )
        .addEventListener(
            "click",
            cerrarModalMovimiento
        );


    document
        .getElementById(
            "cancelar-movimiento"
        )
        .addEventListener(
            "click",
            cerrarModalMovimiento
        );


    document
        .getElementById(
            "guardar-movimiento"
        )
        .addEventListener(
            "click",
            guardarMovimiento
        );


    document
        .getElementById(
            "tipo-entrada"
        )
        .addEventListener(
            "click",
            function () {

                establecerTipoMovimiento(
                    "entrada"
                );

            }
        );


    document
        .getElementById(
            "tipo-consumo"
        )
        .addEventListener(
            "click",
            function () {

                establecerTipoMovimiento(
                    "consumo"
                );

            }
        );


    document
        .getElementById(
            "modal-movimiento"
        )
        .addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    document.getElementById(
                        "modal-movimiento"
                    )
                ) {

                    cerrarModalMovimiento();

                }

            }
        );
}


/* =========================================================
   ABRIR MOVIMIENTO
========================================================= */

function abrirMovimiento(
    categoria,
    productoId,
    tipo = "entrada"
) {

    const producto =
        datos[categoria].find(
            p => p.id === productoId
        );


    if (!producto) {

        alert(
            "No se ha encontrado el producto."
        );

        return;
    }


    movimientoActual = {

        categoria: categoria,

        productoId: productoId,

        tipo: tipo

    };


    document.getElementById(
        "modal-producto-nombre"
    ).textContent =
        obtenerNombreProducto(
            categoria,
            producto
        );


    document.getElementById(
        "modal-stock-actual"
    ).textContent =
        formatearNumero(
            producto.stock
        );


    document.getElementById(
        "cantidad-movimiento"
    ).value = "";

    document.getElementById(
    "fecha-movimiento"
).value = "";


    document.getElementById(
        "observacion-movimiento"
    ).value = "";


    establecerTipoMovimiento(tipo);


    document
        .getElementById("modal-movimiento")
        .classList.remove("oculto");


    setTimeout(function () {

        document
            .getElementById("cantidad-movimiento")
            .focus();

    }, 100);
}


/* =========================================================
   ESTABLECER TIPO MOVIMIENTO
========================================================= */

function establecerTipoMovimiento(tipo) {

    movimientoActual.tipo = tipo;


    document
        .getElementById("tipo-entrada")
        .classList.toggle(
            "activo",
            tipo === "entrada"
        );


    document
        .getElementById("tipo-consumo")
        .classList.toggle(
            "activo",
            tipo === "consumo"
        );
}


/* =========================================================
   GUARDAR MOVIMIENTO
========================================================= */

function guardarMovimiento() {

    const categoria =
        movimientoActual.categoria;


    const productoId =
        movimientoActual.productoId;


    const tipo =
        movimientoActual.tipo;


    if (!categoria || !productoId) {

        return;
    }


    const producto =
        datos[categoria].find(
            p => p.id === productoId
        );


    if (!producto) {

        alert(
            "No se ha encontrado el producto."
        );

        return;
    }


    const cantidad =
        Number(
            document.getElementById(
                "cantidad-movimiento"
            ).value
        );


    const observacion =
        document.getElementById(
            "observacion-movimiento"
        ).value.trim();

        const fecha =
    document.getElementById(
        "fecha-movimiento"
    ).value;


if (!fecha) {

    alert("Selecciona la fecha del movimiento.");

    return;
}


    if (
        !Number.isFinite(cantidad) ||
        cantidad <= 0
    ) {

        alert(
            "Introduce una cantidad válida."
        );

        return;
    }


    const stockAnterior =
        Number(producto.stock) || 0;


    let stockNuevo;


    if (tipo === "entrada") {

        stockNuevo =
            stockAnterior + cantidad;

    } else {

        if (cantidad > stockAnterior) {

            alert(
                "No puedes consumir más unidades " +
                "de las que hay actualmente en stock."
            );

            return;
        }


        stockNuevo =
            stockAnterior - cantidad;

    }


    producto.stock = stockNuevo;


    registrarMovimiento(
        categoria,
        producto,
        tipo,
        cantidad,
        observacion,
        stockAnterior,
        stockNuevo,
        fecha
    );


    guardarDatos();

    cerrarModalMovimiento();

    dibujarTodo();
}


/* =========================================================
   REGISTRAR MOVIMIENTO
========================================================= */

function registrarMovimiento(
    categoria,
    producto,
    tipo,
    cantidad,
    observacion = "",
    stockAnterior = null,
    stockPosterior = null,
    fechaManual = null
) {

    if (
        stockAnterior === null ||
        stockPosterior === null
    ) {

        const stockActual =
            Number(producto.stock) || 0;

        if (tipo === "entrada") {

            stockAnterior =
                stockActual - cantidad;

        } else {

            stockAnterior =
                stockActual + cantidad;

        }

        stockPosterior =
            stockActual;
    }

    let fechaHora;

    if (fechaManual) {

        const partes = fechaManual.split("-");

        const anio = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);

        fechaHora = {

            fecha:
                `${dia}/${mes}/${anio}`,

            hora: "",

            timestamp:
                new Date(anio, mes - 1, dia).getTime()

        };

    } else {

        fechaHora = obtenerFechaHora();

    }

    const movimiento = {

        id: generarId("MOV"),

        productoId:
            producto.id,

        productoNombre:
            obtenerNombreProducto(
                categoria,
                producto
            ),

        // Guardar el lote en el momento del movimiento
        productoLote:
            (categoria === "botellas" || categoria === "corchos")
                ? (producto.lote || "")
                : "",

        tipo:
            tipo,

        cantidad:
            cantidad,

        stockAnterior:
            stockAnterior,

        stockPosterior:
            stockPosterior,

        observacion:
            observacion,

        fecha:
            fechaHora.fecha,

        hora:
            "",

        timestamp:
            fechaHora.timestamp

    };

    if (
        !datos.historial[categoria]
    ) {

        datos.historial[categoria] = [];

    }

    datos.historial[categoria].push(
        movimiento
    );
}
/* =========================================================
   ACTUALIZAR STOCK INICIAL DESDE LA FICHA DEL PRODUCTO
========================================================= */

function actualizarStockInicialDesdeProducto(
    categoria,
    producto,
    nuevoStock
) {

    const historial = datos.historial[categoria] || [];

    // Obtener todos los movimientos de este producto
    const movimientos = historial.filter(
        m => m.productoId === producto.id
    );

   if (!movimientos.length) {

    const stockAnterior =
        Number(producto.stock) || 0;

    const stockNuevo =
        Number(nuevoStock) || 0;

    // Permitir editar productos sin historial
    producto.stock = stockNuevo;

    // Si se introduce stock por primera vez,
    // crear su entrada inicial en el historial
    if (stockNuevo > 0) {

        registrarMovimiento(
            categoria,
            producto,
            "entrada",
            stockNuevo,
            "Stock inicial añadido desde la ficha del producto",
            0,
            stockNuevo
        );

    }

    return true;
}

    // El primer movimiento registrado corresponde al stock inicial
    const movimientoInicial = movimientos[0];

    let stockCalculado = Number(nuevoStock);

    // Comprobar que los movimientos posteriores siguen siendo válidos
    for (let i = 1; i < movimientos.length; i++) {

        const movimiento = movimientos[i];

        const cantidad = Number(movimiento.cantidad) || 0;

        if (movimiento.tipo === "entrada") {

            stockCalculado += cantidad;

        } else {

            if (cantidad > stockCalculado) {

                alert(
                    "No se puede reducir tanto el stock inicial. " +
                    "Los consumos posteriores superarían las " +
                    "unidades disponibles."
                );

                return false;
            }

            stockCalculado -= cantidad;
        }
    }

    // Modificar la entrada inicial existente
    movimientoInicial.tipo = "entrada";
    movimientoInicial.cantidad = Number(nuevoStock);
    movimientoInicial.stockAnterior = 0;
    movimientoInicial.stockPosterior = Number(nuevoStock);

    // Recalcular los movimientos posteriores
    let stock = Number(nuevoStock);

    for (let i = 1; i < movimientos.length; i++) {

        const movimiento = movimientos[i];

        const cantidad = Number(movimiento.cantidad) || 0;

        movimiento.stockAnterior = stock;

        if (movimiento.tipo === "entrada") {

            stock += cantidad;

        } else {

            stock -= cantidad;

        }

        movimiento.stockPosterior = stock;
    }

    // Actualizar el stock definitivo del producto
    producto.stock = stock;

    return true;
}


/* =========================================================
   CERRAR MODAL MOVIMIENTO
========================================================= */

function cerrarModalMovimiento() {

    document
        .getElementById(
            "modal-movimiento"
        )
        .classList.add("oculto");


    movimientoActual = {

        categoria: null,

        productoId: null,

        tipo: "entrada"

    };
}


/* =========================================================
   DIBUJAR HISTORIAL
========================================================= */

function dibujarHistorial(categoria) {

    const contenedor =
        document.getElementById(
            "historial-" + categoria
        );

    if (!contenedor) {
        return;
    }

    const historial =
        datos.historial[categoria] || [];

    if (!historial.length) {

        contenedor.innerHTML = `
            <div class="historial-vacio">
                No hay movimientos registrados.
            </div>
        `;

        return;
    }

    const ordenado =
        [...historial]
            .sort(
                (a, b) =>
                    b.timestamp - a.timestamp
            );

    contenedor.innerHTML =
        ordenado.map(
            function (movimiento) {

                const clase =
                    movimiento.tipo === "entrada"
                        ? "movimiento-entrada"
                        : "movimiento-consumo";

                const simbolo =
                    movimiento.tipo === "entrada"
                        ? "+"
                        : "-";

                // Mostrar lote solamente en botellas y corchos
                const mostrarLote =
                    categoria === "botellas" ||
                    categoria === "corchos";

                const htmlLote =
                    mostrarLote
                        ? `
                            <div class="movimiento-lote">
                                <strong>Lote:</strong>
                                ${escaparHTML(movimiento.productoLote || "")}
                            </div>
                        `
                        : "";

                return `
                    <div class="movimiento-historial">

                        <div class="movimiento-fecha">

                            ${escaparHTML(movimiento.fecha)}

                        </div>

                        <div class="movimiento-producto">

                            ${escaparHTML(
                                movimiento.productoNombre
                            )}

                        </div>

                        ${htmlLote}

                        <div class="${clase}">

                            ${simbolo}${formatearNumero(
                                movimiento.cantidad
                            )}

                        </div>

                        <div class="movimiento-stock">

                            Stock:
                            ${formatearNumero(
                                movimiento.stockPosterior
                            )}

                        </div>

                        <div class="movimiento-observacion">

                            ${escaparHTML(
                                movimiento.observacion || ""
                            )}

                        </div>

                        <button
                            type="button"
                            class="boton-tabla boton-editar"
                            data-editar-movimiento="${escaparHTML(movimiento.id)}">

                            ✏️ Editar

                        </button>

                    </div>
                `;

            }
        ).join("");

    // Conectar los botones de edición

    contenedor
        .querySelectorAll("[data-editar-movimiento]")
        .forEach(function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    abrirEdicionMovimiento(
                        categoria,
                        boton.dataset.editarMovimiento
                    );

                }
            );

        });

}

/* =========================================================
   EDITAR MOVIMIENTO DEL HISTORIAL
========================================================= */

function crearModalEdicionMovimiento() {

    let modal =
        document.getElementById(
            "modal-edicion-movimiento"
        );


    if (modal) {
        return modal;
    }


    modal = document.createElement("div");

    modal.id = "modal-edicion-movimiento";


    modal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0,0,0,0.65);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 15px;
        box-sizing: border-box;
    `;


    modal.innerHTML = `

        <div style="
            background: white;
            width: 100%;
            max-width: 430px;
            padding: 22px;
            border-radius: 14px;
            box-sizing: border-box;
            box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        ">

            <h2 style="
                margin-top: 0;
                margin-bottom: 18px;
                color: #315744;
            ">
                Editar movimiento
            </h2>


            <form id="form-edicion-movimiento">

                <div style="margin-bottom: 15px;">

                    <label style="display:block;margin-bottom:6px;">
                        Fecha
                    </label>

                    <input
                        type="date"
                        id="edicion-fecha"
                        required
                        style="
                            width:100%;
                            padding:12px;
                            box-sizing:border-box;
                            border:1px solid #ccc;
                            border-radius:8px;
                            font-size:16px;
                        "
                    >

                </div>


                <div style="margin-bottom: 15px;">

                    <label style="display:block;margin-bottom:6px;">
                        Cantidad
                    </label>

                    <input
                        type="number"
                        id="edicion-cantidad"
                        min="1"
                        step="1"
                        required
                        style="
                            width:100%;
                            padding:12px;
                            box-sizing:border-box;
                            border:1px solid #ccc;
                            border-radius:8px;
                            font-size:16px;
                        "
                    >

                </div>


                <div style="margin-bottom: 20px;">

                    <label style="display:block;margin-bottom:6px;">
                        Observaciones
                    </label>

                    <textarea
                        id="edicion-observacion"
                        rows="3"
                        style="
                            width:100%;
                            padding:12px;
                            box-sizing:border-box;
                            border:1px solid #ccc;
                            border-radius:8px;
                            font-size:16px;
                            resize:vertical;
                        "
                    ></textarea>

                </div>


                <div style="
                    display:flex;
                    gap:10px;
                ">

                    <button
                        type="submit"
                        style="
                            flex:1;
                            padding:13px;
                            border:0;
                            border-radius:8px;
                            background:#315744;
                            color:white;
                            font-weight:bold;
                            font-size:15px;
                        "
                    >
                        Guardar
                    </button>


                    <button
                        type="button"
                        id="cancelar-edicion-movimiento"
                        style="
                            flex:1;
                            padding:13px;
                            border:0;
                            border-radius:8px;
                            background:#777;
                            color:white;
                            font-weight:bold;
                            font-size:15px;
                        "
                    >
                        Cancelar
                    </button>

                </div>

            </form>

        </div>

    `;


    document.body.appendChild(modal);


    document
        .getElementById("form-edicion-movimiento")
        .addEventListener(
            "submit",
            guardarEdicionMovimiento
        );


    document
        .getElementById("cancelar-edicion-movimiento")
        .addEventListener(
            "click",
            cerrarEdicionMovimiento
        );


    modal.addEventListener(
        "click",
        function (evento) {

            if (evento.target === modal) {
                cerrarEdicionMovimiento();
            }

        }
    );


    return modal;
}


/* =========================================================
   ABRIR EDICIÓN
========================================================= */

function abrirEdicionMovimiento(
    categoria,
    movimientoId
) {

    const historial =
        datos.historial[categoria] || [];


    const movimiento =
        historial.find(
            m => m.id === movimientoId
        );


    if (!movimiento) {

        alert(
            "No se ha encontrado el movimiento."
        );

        return;
    }


    const modal =
        crearModalEdicionMovimiento();


    // Convertir DD/MM/AAAA a AAAA-MM-DD

    const partes =
        movimiento.fecha.split("/");


    if (partes.length !== 3) {

        alert(
            "No se reconoce el formato de la fecha."
        );

        return;
    }


    const fechaInput =
        `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;


    document.getElementById(
        "edicion-fecha"
    ).value = fechaInput;


    document.getElementById(
        "edicion-cantidad"
    ).value = movimiento.cantidad;


    document.getElementById(
        "edicion-observacion"
    ).value = movimiento.observacion || "";


    // Guardamos qué movimiento estamos editando

    modal.dataset.categoria = categoria;

    modal.dataset.movimientoId = movimientoId;


    modal.style.display = "flex";

}


/* =========================================================
   CERRAR EDICIÓN
========================================================= */

function cerrarEdicionMovimiento() {

    const modal =
        document.getElementById(
            "modal-edicion-movimiento"
        );


    if (modal) {

        modal.style.display = "none";

    }

}


/* =========================================================
   GUARDAR EDICIÓN
========================================================= */

function guardarEdicionMovimiento(evento) {

    evento.preventDefault();


    const modal =
        document.getElementById(
            "modal-edicion-movimiento"
        );


    const categoria =
        modal.dataset.categoria;


    const movimientoId =
        modal.dataset.movimientoId;


    const historial =
        datos.historial[categoria];


    const indice =
        historial.findIndex(
            m => m.id === movimientoId
        );


    if (indice === -1) {

        alert(
            "No se ha encontrado el movimiento."
        );

        return;
    }


    const movimiento =
        historial[indice];


    const fecha =
        document.getElementById(
            "edicion-fecha"
        ).value;


    const cantidadNueva =
        Number(
            document.getElementById(
                "edicion-cantidad"
            ).value
        );


    const observacionNueva =
        document.getElementById(
            "edicion-observacion"
        ).value.trim();


    if (!fecha) {

        alert("Selecciona una fecha.");

        return;
    }


    if (
        !Number.isInteger(cantidadNueva) ||
        cantidadNueva <= 0
    ) {

        alert(
            "Introduce una cantidad válida."
        );

        return;
    }


    // Buscar el producto correspondiente

    const producto =
        datos[categoria].find(
            p => p.id === movimiento.productoId
        );


    if (!producto) {

        alert(
            "No se ha encontrado el producto asociado."
        );

        return;
    }


    const cantidadAnterior =
        Number(movimiento.cantidad);


    // Calcular cuánto cambia el stock

    const diferencia =
        cantidadNueva - cantidadAnterior;


    const ajusteStock =
        movimiento.tipo === "entrada"
            ? diferencia
            : -diferencia;


    /*
     * Comprobar el stock resultante del movimiento
     * que estamos corrigiendo.
     */

    const stockAnterior =
        Number(movimiento.stockAnterior);


    const stockNuevoMovimiento =
        stockAnterior +
        (
            movimiento.tipo === "entrada"
                ? cantidadNueva
                : -cantidadNueva
        );


    if (
        !Number.isFinite(stockNuevoMovimiento) ||
        stockNuevoMovimiento < 0
    ) {

        alert(
            "No se puede realizar la corrección porque el stock quedaría negativo."
        );

        return;
    }


    /*
     * Los movimientos se guardan con push().
     * Por tanto, los que tienen un índice posterior
     * se registraron después de este movimiento.
     *
     * Comprobamos que ninguno quede con stock negativo.
     */

    for (
        let i = indice + 1;
        i < historial.length;
        i++
    ) {

        const posterior = historial[i];


        if (
            posterior.productoId !== movimiento.productoId
        ) {

            continue;
        }


        const nuevoAnterior =
            Number(posterior.stockAnterior) + ajusteStock;


        const nuevoPosterior =
            Number(posterior.stockPosterior) + ajusteStock;


        if (
            nuevoAnterior < 0 ||
            nuevoPosterior < 0
        ) {

            alert(
                "No se puede guardar esta corrección porque dejaría el stock negativo en un movimiento posterior."
            );

            return;
        }

    }


    // Comprobar también el stock actual del producto

    const stockActual =
        Number(producto.stock) || 0;


    if (
        stockActual + ajusteStock < 0
    ) {

        alert(
            "No se puede guardar esta corrección porque el stock actual quedaría negativo."
        );

        return;
    }


    /*
     * A PARTIR DE AQUÍ SE GUARDAN LOS CAMBIOS.
     */


    // Corregir el movimiento original

    movimiento.cantidad =
        cantidadNueva;


    movimiento.observacion =
        observacionNueva;


    // Actualizar fecha y timestamp

    const partesFecha =
        fecha.split("-");


    const anio =
        Number(partesFecha[0]);


    const mes =
        Number(partesFecha[1]);


    const dia =
        Number(partesFecha[2]);


    movimiento.fecha =
        `${dia}/${mes}/${anio}`;


    movimiento.timestamp =
        new Date(
            anio,
            mes - 1,
            dia
        ).getTime();


    movimiento.hora = "";


    // Actualizar el stock resultante del movimiento editado

    movimiento.stockPosterior =
        stockNuevoMovimiento;


    /*
     * Ajustar los stocks de todos los movimientos
     * posteriores del mismo producto.
     */

    for (
        let i = indice + 1;
        i < historial.length;
        i++
    ) {

        const posterior = historial[i];


        if (
            posterior.productoId !== movimiento.productoId
        ) {

            continue;
        }


        posterior.stockAnterior =
            Number(posterior.stockAnterior) + ajusteStock;


        posterior.stockPosterior =
            Number(posterior.stockPosterior) + ajusteStock;

    }


    // Actualizar el stock actual del producto

    producto.stock =
        stockActual + ajusteStock;


    // Guardar y actualizar la aplicación

    guardarDatos();

    cerrarEdicionMovimiento();

    dibujarTodo();


    alert(
        "El movimiento se ha corregido correctamente."
    );

}


/* =========================================================
   LIMPIAR HISTORIAL
========================================================= */

function solicitarLimpiarHistorial(categoria) {

    const cantidad =
        datos.historial[categoria]
            ? datos.historial[categoria].length
            : 0;


    if (!cantidad) {

        alert(
            "No hay movimientos en el historial."
        );

        return;
    }


    solicitarConfirmacion(

        `Se van a eliminar ${formatearNumero(cantidad)} ` +
        `movimientos del historial. ` +
        `El stock actual NO se modificará. ¿Continuar?`,

        function () {

            datos.historial[categoria] = [];

            guardarDatos();

            dibujarTodo();

        }

    );
}


/* =========================================================
   MODAL CONFIRMACIÓN
========================================================= */

function prepararModalConfirmacion() {

    document
        .getElementById(
            "cerrar-modal-confirmacion"
        )
        .addEventListener(
            "click",
            cerrarModalConfirmacion
        );


    document
        .getElementById(
            "cancelar-confirmacion"
        )
        .addEventListener(
            "click",
            cerrarModalConfirmacion
        );


    document
        .getElementById(
            "confirmar-accion"
        )
        .addEventListener(
            "click",
            function () {

                if (
                    typeof accionConfirmacion ===
                    "function"
                ) {

                    const accion =
                        accionConfirmacion;

                    accionConfirmacion = null;

                    cerrarModalConfirmacion();

                    accion();

                }

            }
        );


    document
        .getElementById(
            "modal-confirmacion"
        )
        .addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    document.getElementById(
                        "modal-confirmacion"
                    )
                ) {

                    cerrarModalConfirmacion();

                }

            }
        );
}


/* =========================================================
   SOLICITAR CONFIRMACIÓN
========================================================= */

function solicitarConfirmacion(
    texto,
    accion
) {

    document.getElementById(
        "texto-confirmacion"
    ).textContent = texto;


    accionConfirmacion = accion;


    document
        .getElementById(
            "modal-confirmacion"
        )
        .classList.remove("oculto");
}


/* =========================================================
   CERRAR CONFIRMACIÓN
========================================================= */

function cerrarModalConfirmacion() {

    accionConfirmacion = null;

    document
        .getElementById(
            "modal-confirmacion"
        )
        .classList.add("oculto");
}


/* =========================================================
   RESUMEN INICIO
========================================================= */

function actualizarResumen() {

    const categorias = [
        "botellas",
        "corchos",
        "cajas",
        "capsulas",
        "etiquetas"
    ];


    categorias.forEach(
        function (categoria) {

            const elemento =
                document.getElementById(
                    "resumen-" + categoria
                );


            if (elemento) {

                elemento.textContent =
                    formatearNumero(
                        datos[categoria].length
                    );

            }

        }
    );
}


/* =========================================================
   ==================== JSON ===============================
========================================================= */

function prepararJSON() {

    document
        .getElementById(
            "btn-exportar-json"
        )
        .addEventListener(
            "click",
            exportarJSON
        );


    document
        .getElementById(
            "btn-importar-json"
        )
        .addEventListener(
            "click",
            function () {

                document
                    .getElementById(
                        "input-importar-json"
                    )
                    .click();

            }
        );


    document
        .getElementById(
            "input-importar-json"
        )
        .addEventListener(
            "change",
            importarJSON
        );
}


/* =========================================================
   EXPORTAR JSON
========================================================= */

function exportarJSON() {

    const copia =
        JSON.parse(
            JSON.stringify(datos)
        );


    copia.fechaExportacion =
        new Date().toISOString();


    const contenido =
        JSON.stringify(
            copia,
            null,
            2
        );


    const blob =
        new Blob(
            [contenido],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const enlace =
        document.createElement("a");


    const fecha =
        new Date()
            .toISOString()
            .slice(0, 10);


    enlace.href = url;

    enlace.download =
        `materiales_auxiliares_${fecha}.json`;


    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();


    URL.revokeObjectURL(url);
}


/* =========================================================
   IMPORTAR JSON
========================================================= */

function importarJSON(evento) {

    const archivo =
        evento.target.files[0];


    if (!archivo) {
        return;
    }


    const lector =
        new FileReader();


    lector.onload =
        function (eventoLectura) {

            try {

                const importado =
                    JSON.parse(
                        eventoLectura.target.result
                    );


                validarJSON(importado);


                solicitarConfirmacion(

                    "La importación sustituirá los datos " +
                    "actuales por los datos del archivo JSON. " +
                    "¿Quieres continuar?",

                    function () {

                        datos =
                            normalizarDatos(
                                importado
                            );


                        guardarDatos();

                        dibujarTodo();


                        alert(
                            "Datos importados correctamente."
                        );

                    }

                );

            } catch (error) {

                console.error(
                    "Error importando JSON:",
                    error
                );


                alert(
                    "El archivo JSON no es válido " +
                    "o no tiene el formato correcto."
                );

            }


            evento.target.value = "";

        };


    lector.readAsText(
        archivo,
        "UTF-8"
    );
}


/* =========================================================
   VALIDAR JSON
========================================================= */

function validarJSON(obj) {

    if (
        !obj ||
        typeof obj !== "object"
    ) {

        throw new Error(
            "Formato JSON incorrecto."
        );
    }


    const categorias = [
        "botellas",
        "corchos",
        "cajas",
        "capsulas",
        "etiquetas"
    ];


    let tieneCategoria = false;


    categorias.forEach(
        function (categoria) {

            if (
                Array.isArray(
                    obj[categoria]
                )
            ) {

                tieneCategoria = true;

            }

        }
    );


    if (!tieneCategoria) {

        throw new Error(
            "El archivo no contiene categorías válidas."
        );
    }
}


/* =========================================================
   ======================= PDF =============================
========================================================= */

/*
 * De momento utilizamos la función de impresión
 * del navegador.
 *
 * En Android/Chrome se puede seleccionar
 * "Guardar como PDF".
 *
 * Más adelante podemos sustituir esta función
 * por una exportación PDF directa con diseño
 * específico de bodega.
 */

function prepararPDF() {

    document
        .getElementById("pdf-botellas")
        .addEventListener(
            "click",
            function () {

                imprimirCategoria(
                    "botellas"
                );

            }
        );


    document
        .getElementById("pdf-corchos")
        .addEventListener(
            "click",
            function () {

                imprimirCategoria(
                    "corchos"
                );

            }
        );


    document
        .getElementById("pdf-cajas")
        .addEventListener(
            "click",
            function () {

                imprimirCategoria(
                    "cajas"
                );

            }
        );


    document
        .getElementById("pdf-capsulas")
        .addEventListener(
            "click",
            function () {

                imprimirCategoria(
                    "capsulas"
                );

            }
        );


    document
        .getElementById("pdf-etiquetas")
        .addEventListener(
            "click",
            function () {

                imprimirCategoria(
                    "etiquetas"
                );

            }
        );
}




/* =========================================================
   IMPRIMIR CATEGORÍA - TABLA COMPLETA
========================================================= */

function imprimirCategoria(categoria) {

    const productos = datos[categoria] || [];

    if (!productos.length) {

        alert("No hay productos para exportar.");

        return;
    }

    const nombreCategoria =
        obtenerNombreCategoria(categoria);


    // Definir las columnas según la categoría

    let columnas = [];

    switch (categoria) {

        case "botellas":

            columnas = [
                { titulo: "Marca", campo: "marca" },
                { titulo: "Modelo", campo: "modelo" },
                { titulo: "Capacidad", campo: "capacidad", sufijo: " L" },
                { titulo: "Stock", campo: "stock", stock: true },
                { titulo: "Lote", campo: "lote" },
                { titulo: "Características", campo: "caracteristicas" },
                { titulo: "Litros", calculo: "litros", stock: true }
            ];

            break;


        case "corchos":

            columnas = [
                { titulo: "Marca", campo: "marca" },
                { titulo: "Modelo", campo: "modelo" },
                { titulo: "Tipo", campo: "tipo" },
                { titulo: "Stock", campo: "stock", stock: true },
                { titulo: "Lote", campo: "lote" },
                { titulo: "Características", campo: "caracteristicas" }
            ];

            break;


        case "cajas":

            columnas = [
                { titulo: "Marca", campo: "marca" },
                { titulo: "Tipo", campo: "tipo" },
                { titulo: "Modelo", campo: "modelo" },
                { titulo: "Unidades", campo: "unidades" },
                { titulo: "Stock", campo: "stock", stock: true },
                { titulo: "Características", campo: "caracteristicas" },
                { titulo: "Botellas", calculo: "botellas", stock: true }
            ];

            break;


        case "capsulas":

            columnas = [
                { titulo: "Marca", campo: "marca" },
                { titulo: "Tipo", campo: "tipo" },
                { titulo: "Modelo", campo: "modelo" },
                { titulo: "Características", campo: "caracteristicas" },
                { titulo: "Stock", campo: "stock", stock: true }
            ];

            break;


        case "etiquetas":

            columnas = [
                { titulo: "Marca", campo: "marca" },
                { titulo: "Tipo", campo: "tipo" },
                { titulo: "Modelo", campo: "modelo" },
                { titulo: "Características", campo: "caracteristicas" },
                { titulo: "Añada", campo: "anada" },
                { titulo: "Lote", campo: "lote" },
                { titulo: "Stock", campo: "stock", stock: true }
            ];

            break;
    }


    // Crear encabezados

    const encabezados = columnas.map(columna => {

        return `<th>${columna.titulo}</th>`;

    }).join("");


    // Crear filas de productos

    const filas = productos.map(producto => {

        const celdas = columnas.map(columna => {

            let valor;


            // Calcular litros disponibles en botellas

            if (columna.calculo === "litros") {

                const stock =
                    Number(producto.stock) || 0;

                const capacidad =
                    Number(
                        String(producto.capacidad || "")
                            .replace(",", ".")
                    ) || 0;

                valor =
                    formatearNumero(stock * capacidad) + " L";

            }


            // Calcular botellas disponibles en cajas

            else if (columna.calculo === "botellas") {

                const stock =
                    Number(producto.stock) || 0;

                const unidades =
                    Number(
                        String(producto.unidades || "")
                            .replace(",", ".")
                    ) || 0;

                valor =
                    formatearNumero(stock * unidades);

            }


            // Campos normales

            else {

                valor = producto[columna.campo];

                if (
                    valor === undefined ||
                    valor === null ||
                    valor === ""
                ) {

                    valor = "—";

                } else if (columna.stock) {

                    valor = formatearNumero(valor);

                } else if (columna.campo === "capacidad") {

                    valor =
                        escaparHTML(valor) +
                        columna.sufijo;

                } else {

                    valor = escaparHTML(valor);

                }

            }


            const clase = columna.stock
                ? "stock"
                : "";


            return `<td class="${clase}">${valor}</td>`;

        }).join("");


        return `<tr>${celdas}</tr>`;

    }).join("");


    // Abrir ventana de impresión

    const ventana = window.open(
        "",
        "_blank",
        "width=1100,height=800"
    );


    if (!ventana) {

        alert(
            "El navegador ha bloqueado la ventana de impresión. " +
            "Permite ventanas emergentes para esta página."
        );

        return;
    }


    ventana.document.open();

    ventana.document.write(`

        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <title>
                ${escaparHTML(nombreCategoria)}
            </title>

            <style>

                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #26332b;
                    background: white;
                    font-size: 11px;
                }

                .cabecera {
                    background: #315744;
                    color: white;
                    padding: 16px 20px;
                    border-radius: 6px;
                    margin-bottom: 18px;
                }

                .cabecera h1 {
                    margin: 0 0 5px;
                    font-size: 22px;
                }

                .cabecera p {
                    margin: 0;
                    font-size: 13px;
                }

                .informacion {
                    margin-bottom: 12px;
                    font-size: 11px;
                    color: #68736c;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: auto;
                }

                thead {
                    display: table-header-group;
                }

                tr {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                th {
                    background: #315744;
                    color: white;
                    padding: 9px 7px;
                    text-align: left;
                    border: 1px solid #315744;
                    font-size: 10px;
                }

                td {
                    padding: 8px 7px;
                    border: 1px solid #d8ded9;
                    vertical-align: middle;
                    overflow-wrap: anywhere;
                }

                tbody tr:nth-child(even) {
                    background: #f1f4f2;
                }

                .stock {
                    text-align: center;
                    font-weight: bold;
                    color: #315744;
                    white-space: nowrap;
                }

                .pie {
                    margin-top: 15px;
                    padding-top: 8px;
                    border-top: 1px solid #d8ded9;
                    text-align: center;
                    color: #68736c;
                    font-size: 10px;
                }

            </style>

        </head>

        <body>

            <div class="cabecera">

                <h1>Materiales Auxiliares</h1>

                <p>${escaparHTML(nombreCategoria)}</p>

            </div>

            <div class="informacion">

                Total de productos: ${productos.length}

            </div>

            <table>

                <thead>

                    <tr>
                        ${encabezados}
                    </tr>

                </thead>

                <tbody>

                    ${filas}

                </tbody>

            </table>

            <div class="pie">

                Materiales Auxiliares · Bodega

            </div>

        </body>

        </html>

    `);


    ventana.document.close();

    ventana.focus();


    setTimeout(function () {

        ventana.print();

    }, 500);

}



/* =========================================================
   NOMBRE CATEGORÍA
========================================================= */

function obtenerNombreCategoria(
    categoria
) {

    const nombres = {

        botellas: "Botellas",

        corchos: "Corchos",

        cajas: "Cajas",

        capsulas: "Cápsulas",

        etiquetas: "Etiquetas"

    };


    return (
        nombres[categoria] ||
        categoria
    );
}


/* =========================================================
   ATAJO DE TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    function (evento) {

        /*
         * ESC cierra los modales
         */

        if (
            evento.key === "Escape"
        ) {

            cerrarModalMovimiento();

            cerrarModalConfirmacion();

        }

    }
);


/* =========================================================
   FIN DEL PROGRAMA
========================================================= */