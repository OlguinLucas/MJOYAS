// ENLACE DIRECTO EN FORMATO CSV
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8jzDLDvmDW4mcGaZSn_vFvv2Zc_o6XvirNyzO45RmVM8gWRjP_-Zrv2mA5hX8bcziDMknW3jvJE21/pub?gid=0&single=true&output=csv';

// LISTA DE RESPALDO (Por seguridad local)
const productosRespaldo = [
    { id: 1, nombre: "Anillo Acero 1", precio: 1800, categoria: "acero", tipo: "anillos", descripcion: "" },
    { id: 2, nombre: "Anillo Acero 2", precio: 1900, categoria: "acero", tipo: "anillos", descripcion: "" },
    { id: 3, nombre: "Anillo Acero 3", precio: 2000, categoria: "acero", tipo: "anillos", descripcion: "" },
    { id: 8, nombre: "Cadena Plata 8", precio: 4500, categoria: "plata", tipo: "cadenas", descripcion: "" },
    { id: 9, nombre: "Cadena Plata 9", precio: 4700, categoria: "plata", tipo: "cadenas", descripcion: "" },
    { id: 15, nombre: "Pulsera Plata 15", precio: 3500, categoria: "plata", tipo: "pulseras", descripcion: "" },
    { id: 19, nombre: "Aros Plata 19", precio: 2000, categoria: "plata", tipo: "aritos", descripcion: "" }
];

let productos = [];

// ESTADOS GLOBALES PARA FILTRADO SIMULTÁNEO
let filtroMaterialActual = 'todos';
let filtroTipoActual = 'todos';

let carrito = JSON.parse(localStorage.getItem('mjoyas_carrito')) || [];

// --- CARGAR PRODUCTOS ---
async function cargarProductosDesdeSheets() {
    try {
        const response = await fetch(`${sheetUrl}&t=${new Date().getTime()}`);
        if (!response.ok) throw new Error("Error de red");
        const csvText = await response.text();
        const lineas = csvText.split(/\r?\n/);
        const lista = [];

        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;

            const col = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (col.length < 5) continue;

            const id = parseInt(col[0].replace(/"/g, ''));
            const categoria = col[1].replace(/"/g, '').trim().toLowerCase();
            let tipo = col[2].replace(/"/g, '').trim().toLowerCase();
            const nombre = col[3].replace(/"/g, '').trim();
            const precio = parseFloat(col[4].replace(/"/g, ''));
            const descripcion = col[5] ? col[5].replace(/"/g, '').trim() : "";

            if (tipo === 'anillo') tipo = 'anillos';
            if (tipo === 'dije') tipo = 'dijes';
            if (tipo === 'arito' || tipo === 'aros') tipo = 'aritos';
            if (tipo === 'cadena') tipo = 'cadenas';
            if (tipo === 'pulsera') tipo = 'pulseras';

            if (!isNaN(id) && nombre && !isNaN(precio)) {
                lista.push({ id, categoria, tipo, nombre, precio, descripcion });
            }
        }
        return lista.length > 0 ? lista : productosRespaldo;
    } catch (e) {
        return productosRespaldo;
    }
}

// --- DESCRIPCIONES AUTOMÁTICAS ---
function obtenerDescripcion(prod) {
    if (prod.descripcion && prod.descripcion.length > 5) return prod.descripcion;
    const cat = prod.categoria === 'plata' ? 'Plata 925' : 'Acero Quirúrgico';
    const desc = {
        'anillos': `Anillo de ${cat}. Una pieza delicada y súper resistente, ideal para acompañar tus días con estilo y elegancia.`,
        'cadenas': `Cadena clásica de ${cat}. Excelente brillo y durabilidad, ideal para usar sola o con tu dije favorito.`,
        'pulseras': `Pulsera fina en ${cat}. Un diseño sutil, perfecto y cómodo para lucir en cualquier ocasión.`,
        'aritos': `Aritos de ${cat}. Livianos, cómodos y totalmente hipoalergénicos, ideales para destacar tu rostro.`,
        'dijes': `Dije distintivo de ${cat}. El complemento perfecto diseñado con detalles únicos para tus cadenitas.`
    };
    return desc[prod.tipo] || `Hermosa joya de ${cat} seleccionada con mucho cariño para lucir elegante en el día a día.`;
}

// --- REDIRECCIÓN AL DETALLE ---
function abrirDetalle(id) {
    localStorage.setItem('productoSeleccionado', id);
    window.location.href = 'detalle.html';
}

// --- LOGICA DE FILTRADO ---
function filtrarMaterial(material, boton) {
    filtroMaterialActual = material;
    document.querySelectorAll('.btn-material').forEach(btn => btn.classList.remove('active'));
    boton.classList.add('active');
    renderizarCatalogo();
}

function filtrarTipo(tipo, boton) {
    filtroTipoActual = tipo;
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    boton.classList.add('active');
    renderizarCatalogo();
}

// --- RENDER CATALOGO CON LIMPIEZA VISUAL (OCULTA CATEGORÍAS VACÍAS) ---
function renderizarCatalogo() {
    const contenedorPlata = document.getElementById("productos-plata");
    const contenedorAcero = document.getElementById("productos-acero");
    const seccionPlataBox = document.getElementById("seccion-plata");
    const seccionAceroBox = document.getElementById("seccion-acero");
    
    if (!contenedorPlata || !contenedorAcero) return; 

    contenedorPlata.innerHTML = "";
    contenedorAcero.innerHTML = "";

    let cantPlata = 0;
    let cantAcero = 0;

    productos.forEach(prod => {
        // Valida filtros cruzados
        if (filtroMaterialActual !== 'todos' && prod.categoria !== filtroMaterialActual) return;
        if (filtroTipoActual !== 'todos' && prod.tipo !== filtroTipoActual) return;

        const card = document.createElement("div");
        card.className = "card-producto";
        const rutaImagen = `imagenes/${prod.categoria}/${prod.tipo}/${prod.id}.jpeg`;

        card.innerHTML = `
            <div class="img-container" onclick="abrirDetalle(${prod.id})">
                <img src="${rutaImagen}" alt="${prod.nombre}" onerror="this.style.display='none';">
                <span class="placeholder-text">MJOYAS</span>
            </div>
            <h4 onclick="abrirDetalle(${prod.id})">${prod.nombre}</h4>
            <p class="precio-producto">$${prod.precio}</p>
            <div class="compra-controles">
                <div class="selector-cantidad">
                    <button class="btn-cant" onclick="cambiarCantidadCard(${prod.id}, -1)">-</button>
                    <span id="cant-card-${prod.id}" class="num-cant">1</span>
                    <button class="btn-cant" onclick="cambiarCantidadCard(${prod.id}, 1)">+</button>
                </div>
                <button class="btn-add-cart" onclick="agregarAlCarrito(${prod.id})">Agregar al Carrito</button>
            </div>
        `;

        if (prod.categoria === "plata") {
            contenedorPlata.appendChild(card);
            cantPlata++;
        } else {
            contenedorAcero.appendChild(card);
            cantAcero++;
        }
    });

    // UX: Si una colección queda vacía por los filtros, se oculta estéticamente
    seccionPlataBox.style.display = (cantPlata === 0) ? "none" : "block";
    seccionAceroBox.style.display = (cantAcero === 0) ? "none" : "block";
}

// --- MOSTRAR DETALLE ---
async function cargarDatosYMostrarDetalle() {
    productos = await cargarProductosDesdeSheets();
    actualizarInterfaz();
    const id = localStorage.getItem('productoSeleccionado');
    const prod = productos.find(p => p.id == id);
    if (!prod) return;

    const cont = document.getElementById('detalle-producto');
    const rutaImagen = `imagenes/${prod.categoria}/${prod.tipo}/${prod.id}.jpeg`;

    cont.innerHTML = `
        <div style="display:flex; gap:40px; flex-wrap:wrap; align-items:center; justify-content:center;">
            <div class="img-container" style="max-width:380px; width:100%; border:1px solid #f0edf7;">
                <img src="${rutaImagen}" alt="${prod.nombre}" onerror="this.style.display='none';">
                <span class="placeholder-text">MJOYAS</span>
            </div>
            <div style="flex:1; min-width:280px;">
                <h1 style="font-family:'Playfair Display',serif; margin-bottom:10px;">${prod.nombre}</h1>
                <p style="font-size:24px; color:#cc929c; font-weight:bold; margin-bottom:15px;">$${prod.precio}</p>
                <p style="margin-bottom:25px; line-height:1.6; color:#555;">${obtenerDescripcion(prod)}</p>
                
                <div class="compra-controles" style="max-width:200px;">
                    <div class="selector-cantidad">
                        <button class="btn-cant" onclick="cambiarCantidadCard(${prod.id}, -1)">-</button>
                        <span id="cant-card-${prod.id}" class="num-cant">1</span>
                        <button class="btn-cant" onclick="cambiarCantidadCard(${prod.id}, 1)">+</button>
                    </div>
                    <button class="btn-add-cart" onclick="agregarAlCarrito(${prod.id})">Agregar al Carrito</button>
                </div>
            </div>
        </div>
    `;

    const recs = productos.filter(p => p.categoria === prod.categoria && p.id != prod.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const contRecs = document.getElementById('recomendados');
    contRecs.innerHTML = "";
    
    recs.forEach(r => {
        const imgRec = `imagenes/${r.categoria}/${r.tipo}/${r.id}.jpeg`;
        contRecs.innerHTML += `
            <div class="card-producto" style="cursor:pointer;" onclick="abrirDetalle(${r.id})">
                <div class="img-container">
                    <img src="${imgRec}" alt="${r.nombre}" onerror="this.style.display='none';">
                    <span class="placeholder-text">MJOYAS</span>
                </div>
                <h4>${r.nombre}</h4>
                <p class="precio-producto">$${r.precio}</p>
            </div>
        `;
    });
}

// --- CONTROLES DE INTERFAZ Y CARRITO ---
function cambiarCantidadCard(id, cambio) {
    const el = document.getElementById(`cant-card-${id}`);
    if (!el) return;
    let cant = parseInt(el.innerText) + cambio;
    if (cant < 1) cant = 1;
    el.innerText = cant;
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    const elCant = document.getElementById(`cant-card-${id}`);
    const cantidad = parseInt(elCant.innerText);

    const existe = carrito.find(item => item.id === id);
    if (existe) existe.cantidad += cantidad;
    else carrito.push({ ...prod, cantidad });

    elCant.innerText = "1";
    guardarYActualizar();

    // UX: Abre el sidebar del carrito para feedback inmediato de compra
    const sidebar = document.getElementById("cart-sidebar");
    if (!sidebar.classList.contains("open")) {
        toggleCart();
    }
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarYActualizar();
}

function cambiarCantidadCarrito(id, cambio) {
    const item = carrito.find(prod => prod.id === id);
    if (!item) return;

    item.cantidad += cambio;

    if (item.cantidad < 1) {
        eliminarDelCarrito(id);
        return;
    }

    guardarYActualizar();
}

function guardarYActualizar() {
    localStorage.setItem('mjoyas_carrito', JSON.stringify(carrito));
    actualizarInterfaz();
}

function actualizarInterfaz() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.getElementById("cart-count").innerText = totalItems;

    const contenedorItems = document.getElementById("cart-items");
    contenedorItems.innerHTML = "";

    if (carrito.length === 0) {
        contenedorItems.innerHTML = "<p class='carrito-vacio-txt'>El carrito está vacío.</p>";
    } else {
        carrito.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";
            const catBonita = item.categoria === 'plata' ? 'Plata 925' : 'Acero';
            const rutaImagen = `imagenes/${item.categoria}/${item.tipo}/${item.id}.jpeg`;

            itemElement.innerHTML = `
                <img src="${rutaImagen}" alt="${item.nombre}" class="cart-item-img" onerror="this.style.display='none';">
                <div class="cart-item-info">
                    <h5>${item.nombre}</h5>
                    <p>$${item.precio} c/u (${catBonita})</p>
                    <div class="selector-cantidad-cart">
                        <button class="btn-cant-cart" onclick="cambiarCantidadCarrito(${item.id}, -1)">-</button>
                        <span class="num-cant-cart">${item.cantidad}</span>
                        <button class="btn-cant-cart" onclick="cambiarCantidadCarrito(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="btn-remove" onclick="eliminarDelCarrito(${item.id})">Quitar</button>
            `;
            contenedorItems.appendChild(itemElement);
        });
    }

    const precioTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById("cart-total-price").innerText = `$${precioTotal}`;
}

function toggleCart() {
    document.getElementById("cart-sidebar").classList.toggle("open");
    document.getElementById("cart-overlay").classList.toggle("open");
}

// --- DISPARADOR OPTIMIZADO WHATSAPP (MÓVIL vs COMPUTADORA) ---
function enviarWhatsApp() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    const numeroTelefono = "5493878676356";
    let mensaje = "¡Hola MJOYAS! 🌷 Me gustaría realizar el siguiente pedido a través de la web:\n\n";
    
    carrito.forEach(item => {
        const catTexto = item.categoria === "plata" ? "Plata 925" : "Acero";
        mensaje += `▪️ *${item.cantidad}x* ${item.nombre} (${catTexto}) — $${item.precio} c/u\n`;
    });

    const precioTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    mensaje += `\n💰 *Total del pedido:* $${precioTotal}\n\n¿Cómo coordinamos el pago y envío?`;

    const url = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${encodeURIComponent(mensaje)}`;

    // Detección de agente móvil (UX Evita el bloqueo de ventanas emergentes en teléfonos)
    const esCelular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esCelular) {
        window.location.href = url; // Celulares: Abre la app directamente en el mismo hilo
    } else {
        window.open(url, "_blank"); // PC: Lanza nueva pestaña para conservar el catálogo
    }
}