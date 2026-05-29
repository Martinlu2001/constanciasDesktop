import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
// LEER ID DESDE LA URL
const params = new URLSearchParams(window.location.search);
const idUsers = params.get('id');

// SI NO HAY ID
if(!idUsers){
    window.location.href = '../index.html';
}

// Variable para controlar la inicialización
let dataTableInstance = null;

// FUNCIÓN PARA INICIALIZAR DATATABLES (solo una vez)
function inicializarDataTable() {
    // Verificar si ya existe una instancia
    if (dataTableInstance !== null) {
        console.log('DataTable ya está inicializado');
        return;
    }
    
    // Verificar que el elemento existe y DataTables está disponible
    if ($.fn.DataTable && $('#dataTable').length) {
        dataTableInstance = $('#dataTable').DataTable({
            language: {
                url: 'spanish.json'
            },
            responsive: true,
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
                columnDefs: [
                {
                    targets: "_all",
                    className: "dt-center"
                }
            ],
            destroy: false, // No destruir si existe
            retrieve: false  // No recuperar instancia anterior
        });
        console.log('DataTable inicializado correctamente');
    }
}

// FUNCIÓN PARA ACTUALIZAR LOS DATOS EN DATATABLE
function actualizarDataTable(planillas) {
    const tbody = $('#body-table');
    tbody.empty();
    
    if (!planillas || planillas.length === 0) {
    
    } else {
        planillas.forEach(planilla => {
            tbody.append(`
                <tr>
                    <td>${planilla.anio || planilla.anioPlanillas_idanioPlanillas || '-'}</td>
                    <td>${planilla.mes || planilla.mesPlanillas_idmesPlanillas || '-'}</td>
                    <td>${planilla.tipo || planilla.tipoPlanillas_idtipoPlanilla || '-'}</td>
                    <td>${planilla.condicion || planilla.condicionPlanillas_idcondicionPlanillas || '-'}</td>
                    <td>
                        <button class="btn btn-success btn-sm ver-planilla view-plani" data-id="${planilla.idPlanillas}"><i class="fa fa-eye"></i>
                            Ver
                        </button>
                    </td>
                </tr>
            `);
        });
    }
    
    // Si DataTables ya está inicializado, actualizar los datos
    if (dataTableInstance !== null) {
        dataTableInstance.clear();
        dataTableInstance.rows.add(tbody.find('tr'));
        dataTableInstance.draw();
    }
}

// ABRIR MODAL Y VER DETALLE PLANILLA
document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".view-plani");

    if (!btn) return;

    const idPlanillas = parseInt(btn.dataset.id);
    const idPlanilla = parseInt(btn.dataset.id);

    try {

        // CONSULTAR DETALLE DE SOLO ESA PLANILLA
        const detalle = await window.api.getDetallePlanilla(idPlanillas);

        let haberesText = "";
        let descuentosText = "";

        const datePlanillas = await window.api.getDatePlanilla(idPlanilla);
        // HABERES
        detalle.haberes.forEach(haber => {
            const maxNameLength = 40; // Define el ancho máximo para el nombre
            const paddedName = haber.nameHaber.padEnd(maxNameLength, ' ');
            haberesText +=
                `${paddedName}: S/ ${parseFloat(haber.montoHaber).toFixed(2)}\n`;
        });

        // DESCUENTOS
        detalle.descuentos.forEach(descuento => {
            const maxNameLength = 40; // Define el ancho máximo para el nombre
            const paddedName = descuento.nameDescuento.padEnd(maxNameLength, ' ');
            descuentosText +=
                `${paddedName}: S/ ${parseFloat(descuento.montoDescuento).toFixed(2)}\n`;
        });

        // MOSTRAR MODAL
        const modal = document.getElementById("dataHaberDescView");

        modal.style.display = "block";
        
        document.getElementById("detallesPlanilla").innerHTML = `Detalles de planilla ${datePlanillas.anio} - ${datePlanillas.mes}`;

        document.getElementById("haberesView").value =
            haberesText || "No hay haberes registrados";

        document.getElementById("descuentosView").value =
            descuentosText || "No hay descuentos registrados";

    } catch (error) {
        console.error(error);
        alert("Error al obtener detalle de planilla");
    }
});

// Cerrar modal al hacer clic en la X
document.addEventListener("click", (e) => {
    if (e.target.classList.contains('cerrar-modal')) {
        const modal = document.getElementById('dataHaberDescView');
        modal.style.display = 'none';
    }
});

// Cerrar modal al hacer clic fuera del contenido
document.addEventListener("click", (e) => {
    const modal = document.getElementById('dataHaberDescView');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Abrir acordeon modo especifico o rango
document.addEventListener('DOMContentLoaded', () => {
    const selectConstancia = document.getElementById('tipoConstancia');
    const panelEspecifico = document.getElementById('panel-especifico');
    const panelRango = document.getElementById('panel-rango');
    
    function mostrarPanelConAnimacion(panel) {
        if (!panel) return;
        
        panel.style.display = 'block';
        panel.style.maxHeight = '0';
        panel.style.overflow = 'hidden';
        panel.style.transition = 'max-height 0.3s ease';
        
        // Forzar reflow
        panel.offsetHeight;
        
        panel.style.maxHeight = panel.scrollHeight + 'px';
        
        // Después de la animación, remover el max-height para que sea responsive
        setTimeout(() => {
            panel.style.maxHeight = 'none';
            panel.style.overflow = 'visible';
        }, 300);
    }
    
    function ocultarPanelConAnimacion(panel) {
        if (!panel || panel.style.display === 'none') return;
        
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.overflow = 'hidden';
        
        // Forzar reflow
        panel.offsetHeight;
        
        panel.style.maxHeight = '0';
        
        setTimeout(() => {
            panel.style.display = 'none';
            panel.style.maxHeight = 'none';
            panel.style.overflow = 'visible';
        }, 300);
    }
    
    if (selectConstancia) {
        selectConstancia.addEventListener('change', (event) => {
            const valor = event.target.value;
            
            if (valor === 'Especifico') {
                ocultarPanelConAnimacion(panelRango);
                mostrarPanelConAnimacion(panelEspecifico);
            } else if (valor === 'Rango') {
                ocultarPanelConAnimacion(panelEspecifico);
                mostrarPanelConAnimacion(panelRango);
            } else {
                ocultarPanelConAnimacion(panelEspecifico);
                ocultarPanelConAnimacion(panelRango);
            }
        });
    }
});

//cargar años fecha especifico
const contenedor = document.getElementById('acordeon-anios');

async function cargarAnios(){

    const anios = await window.api.getConstanciaFechaEspecifica(idUsers);

    contenedor.innerHTML = '';

    anios.forEach(anio => {

        contenedor.innerHTML += `
            <div class="acordeon-item">

                <div class="acordeon-header">

                    <div class="anio-checkbox">
                        <input 
                            type="checkbox" 
                            class="checkbox-anio"
                            id="anio-${anio.idanioPlanillas}"
                            data-anio="${anio.idanioPlanillas}"
                        >

                        <label 
                            for="anio-${anio.idanioPlanillas}"
                            class="anio-label"
                        >
                            ${anio.nameAnioPlanilla}
                        </label>
                    </div>

                    <div class="header-controls">
                        <span class="acordeon-icono">+</span>
                    </div>

                </div>

                <div class="acordeon-contenido">
                    <div class="meses-grid" id="meses-${anio.idanioPlanillas}">
                    
                    </div>
                </div>

            </div>
        `;
    });

}

//cargar meses fecha especifica
document.addEventListener('click', async (e) => {

    const header = e.target.closest('.acordeon-header');

    if(!header) return;

    // evitar abrir si clickean checkbox
    if(
        e.target.type === 'checkbox' ||
        e.target.classList.contains('anio-label')
    ){
        return;
    }

    const item = header.parentElement;

    const contenido = item.querySelector('.acordeon-contenido');

    const icono = item.querySelector('.acordeon-icono');

    // cerrar otros acordeones
    document.querySelectorAll('.acordeon-contenido').forEach(c => {

        if(c !== contenido){

            c.classList.remove('abierto');

            c.previousElementSibling.classList.remove('abierto');

            const otroIcono = c.previousElementSibling.querySelector('.acordeon-icono');

            otroIcono.textContent = '+';
        }
    });

    // abrir/cerrar actual
    contenido.classList.toggle('abierto');

    header.classList.toggle('abierto');

    // icono
    if(contenido.classList.contains('abierto')){
        icono.textContent = '−';
    }else{
        icono.textContent = '+';
    }

    // OBTENER AÑO
    const checkbox = header.querySelector('.checkbox-anio');

    const idanio = checkbox.dataset.anio;

    // CONTENEDOR MESES
    const mesesContainer = document.getElementById(`meses-${idanio}`);

    // evitar volver a consultar
    if(mesesContainer.innerHTML.trim() !== ''){
        return;
    }

    // CONSULTAR MESES
    const meses = await window.api.getMesesPorAnio(idUsers, idanio);

    // INSERTAR MESES
    meses.forEach(mes => {

        mesesContainer.innerHTML += `
            <label class="mes-item">

                <input
                    type="checkbox"
                    class="checkbox-mes"
                    data-anio="${idanio}"
                    data-mes="${mes.idmesPlanillas}"
                    data-nombre="${mes.nameMesPlanilla}"
                >

                <span>${mes.nameMesPlanilla}</span>

            </label>
        `;
    });

});

// Función para manejar selección de año
function inicializarCheckboxesAnio() {
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('checkbox-anio')) {
            const anio = e.target.dataset.anio;
            const mesesContainer = document.getElementById(`meses-${anio}`);
            
            if (mesesContainer) {
                const checkboxesMes = mesesContainer.querySelectorAll('.checkbox-mes');
                checkboxesMes.forEach(mes => {
                    mes.checked = e.target.checked;
                });
            }
        }
    });
}

//cargar años rango
const anioInicio = document.getElementById('anio-inicio');
const anioFin = document.getElementById('anio-fin');
const mesInicio = document.getElementById('mes-inicio');
const mesFin = document.getElementById('mes-fin');

async function cargarAniosRango(){

    const anios = await window.api.getConstanciaFechaEspecifica(idUsers);

    // limpiar
    anioInicio.innerHTML ='<option selected hidden>Año</option>';

    anioFin.innerHTML ='<option selected hidden>Año</option>';

    anios.forEach(anio => {

        const option = `
            <option value="${anio.idanioPlanillas}">
                ${anio.nameAnioPlanilla}
            </option>
        `;

        anioInicio.innerHTML += option;
        anioFin.innerHTML += option;
    });

}

anioInicio.addEventListener('change', async () => {

    const idanio = anioInicio.value;

    const meses = await window.api.getMesesPorAnio(idUsers, idanio);

    mesInicio.innerHTML ='<option selected hidden>Mes</option>';

    meses.forEach(mes => {

        mesInicio.innerHTML += `
            <option value="${mes.idmesPlanillas}">
                ${mes.nameMesPlanilla}
            </option>
        `;
    });

});

anioFin.addEventListener('change', async () => {

    const idanio = anioFin.value;

    const meses = await window.api.getMesesPorAnio(idUsers, idanio);

    mesFin.innerHTML = '<option selected hidden>Mes</option>';

    meses.forEach(mes => {

        mesFin.innerHTML += `
            <option value="${mes.idmesPlanillas}">
                ${mes.nameMesPlanilla}
            </option>
        `;
    });

});

//imprimir
const btnDescargar = document.querySelector('.btn-primary');

btnDescargar.addEventListener('click', async () => {

    let datosFinales = [];
    // PANELES
    const panelEspecifico = document.getElementById('panel-especifico');

    const panelRango = document.getElementById('panel-rango');

    // =========================
    // RANGO
    // =========================
    if(panelRango.style.display !== 'none'){
        const anioInicioValue = anioInicio.options[anioInicio.selectedIndex].text;
        const anioFinValue = anioFin.options[anioFin.selectedIndex].text;

        const mesInicioValue = mesInicio.value;
        const mesFinValue = mesFin.value;

        const inicio =
            parseInt(
                anioInicioValue +
                mesInicioValue.padStart(2, '0')
            );

        const fin =
            parseInt(
                anioFinValue +
                mesFinValue.padStart(2, '0')
            );

        const datos =
            await window.api.getConstanciaRango(
                idUsers,
                inicio,
                fin
            );
            //console.log(datos);
            datos.forEach(planilla => {

                const haberes =
                    planilla.haberes
                    ? planilla.haberes.split(',')
                    : [];

                const descuentos =
                    planilla.descuentos
                    ? planilla.descuentos.split(',')
                    : [];

                //console.log(haberes);
                //console.log(descuentos);
            });
        datosFinales = datos;
    }

    // =========================
    // ESPECIFICO
    // =========================
    if(panelEspecifico.style.display !== 'none'){
        const mesesSeleccionados =
            document.querySelectorAll(
                '.checkbox-mes:checked'
            );

        const fechas = [];

        mesesSeleccionados.forEach(mes => {

            fechas.push({
                idanio: mes.dataset.anio,
                idmes: mes.dataset.mes
            });

        });

        const datos =
            await window.api.getConstanciaEspecifica(
                idUsers,
                fechas
            );
            //console.log(datos);
        datos.forEach(planilla => {

            const haberes =
                planilla.haberes
                ? String(planilla.haberes)
                    .split(',')
                    .map(h => h.trim())
                : [];

            const descuentos =
                planilla.descuentos
                ? String(planilla.descuentos)
                    .split(',')
                    .map(d => d.trim())
                : [];

            //console.log(haberes);
            //console.log(descuentos);
                datosFinales = datos;
        });
    }

    // =========================
    // CREAR PDF
    // =========================
    const pdfDoc = await PDFDocument.create();

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    let y = height - 50;
    const font =
        await pdfDoc.embedFont(
            StandardFonts.Helvetica
        );

    const logoBytes =
        await fetch('../public/unt.png')
        .then(res => res.arrayBuffer());

    const logo =
        await pdfDoc.embedPng(logoBytes);


    const marcaBytes =
        await fetch('../public/unt.png')
        .then(res => res.arrayBuffer());

    const marcaAgua =
        await pdfDoc.embedPng(marcaBytes);
        page.drawText('CONSTANCIA DE HABERES Y DESCUENTOS', {
            x: 170,
            y:height - 80,
            size: 14,
            font,
            color: rgb(0, 0, 0)
        });

        y -= 50;

    function dibujarHeader(usuario){
        // LOGO
        page.drawImage(logo, {
            x: 40,
            y: height - 70,
            width: 40,
            height: 40
        });

        // TITULOS
        page.drawText('UNIVERSIDAD NACIONAL DE TRUJILLO', {
            x: 90,
            y: height - 45,
            size: 10,
            font
        });

        page.drawText('Unidad de Tesorería', {
            x: 90,
            y: height - 60,
            size: 9,
            font
        });

        // USUARIO
        page.drawText(`CÓDIGO UNT: ${usuario.idUsers}`, {
            x: 50,
            y: height - 95,
            size: 9,
            font
        });

        page.drawText(
            `NOMBRES: ${usuario.apelliPatUser} ${usuario.apelliMatUser} ${usuario.nameUser}`,
            {
                x: 50,
                y: height - 110,
                size: 9,
                font
            }
        );
    }

    function dibujarMarcaAgua(){
        page.drawImage(marcaAgua, {
            x: 120,
            y: 250,
            width: 350,
            height: 350,
            opacity: 0.08
        });
    }

    function crearNuevaPagina(usuario){
        page = pdfDoc.addPage();

        dibujarMarcaAgua();
        dibujarHeader(usuario);

        y = height - 130;
    }

    function verificarNuevaPagina(usuario){
        if(y < 70){
            crearNuevaPagina(usuario);
        }
    }
   
    // =========================
    // DATOS DEL USUARIO
    // =========================

    const usuario = datosFinales[0];
    dibujarMarcaAgua();
    dibujarHeader(usuario);

    y -= 30;
    verificarNuevaPagina(usuario);

    // =========================
    // AGRUPAR POR AÑO
    // =========================

    const agrupado = {};

    datosFinales.forEach(item => {
        if(!agrupado[item.anio]){
            agrupado[item.anio] = [];
        }

        agrupado[item.anio].push(item);
    });

    // =========================
    // IMPRIMIR
    // =========================

    Object.keys(agrupado).forEach(anio => {

        // AÑO SOLO UNA VEZ
        page.drawText(`AÑO: ${anio}`, {
            x: 50,
            y,
            size: 11,
            font
        });

        y -= 20;
        verificarNuevaPagina(usuario);

        agrupado[anio].forEach(planilla => {
            // MES
            page.drawText(`MES: ${planilla.mes}`, {
                x: 70,
                y,
                size: 9,
                font
            });

            y -= 15;
            verificarNuevaPagina(usuario);
            // HABERES
            page.drawText(`HABERES:`, {
                x: 90,
                y,
                size: 8,
                font
            });

            y -= 12;
            verificarNuevaPagina(usuario);
            const haberes =
                planilla.haberes
                ? planilla.haberes.split(',')
                : [];

            haberes.forEach(haber => {
                const [nombre, monto] = haber.split(':');
            
                page.drawText(`- ${nombre}`, {
                    x: 110,
                    y,
                    size: 7,
                    font
                });

                    // MONTO
                    const montHaber = `${monto}`;

                    const textanchomh =
                        font.widthOfTextAtSize(
                            montHaber,
                            7
                        );

                    page.drawText(
                        montHaber.trim(),
                        {
                            x: 500 - textanchomh,
                            y,
                            size: 7,
                            font
                        }
                    );

                y -= 15;
                verificarNuevaPagina(usuario);
            });

            //total haberes
            page.drawText(
                `TOTAL HABERES:`,
                {
                    x: 90,
                    y,
                    size: 8,
                    font
                }
            );

            const totHaber = `${planilla.totalHaberes}`;

            const textanchoth =
                font.widthOfTextAtSize(
                    totHaber,
                    7
                );

            page.drawText(
                totHaber,
                {
                    x: 500 - textanchoth,
                    y,
                    size: 7,
                    font
                }
            );

            y -= 15;
            verificarNuevaPagina(usuario);

            // DESCUENTOS
            page.drawText(`DESCUENTOS:`, {
                x: 90,
                y,
                size: 8,
                font
            });

            y -= 12;
            verificarNuevaPagina(usuario);
            const descuentos =
                planilla.descuentos
                ? planilla.descuentos.split(',')
                : [];

            descuentos.forEach(descuento => {

                const [nombre, monto] = descuento.split(':');
            
                page.drawText(`- ${nombre}`, {
                    x: 110,
                    y,
                    size: 7,
                    font
                });

                // MONTO

                const montDesc = `${monto}`;

                const textanchomd =
                    font.widthOfTextAtSize(
                        montDesc,
                        7
                    );

                page.drawText(
                    montDesc.trim(),
                    {
                        x: 500 - textanchomd,
                        y,
                        size: 7,
                        font
                    }
                );

                y -= 15;
                verificarNuevaPagina(usuario);
            });

            page.drawText(`TOTAL DESCUENTOS:`, {
                x: 90,
                y,
                size: 8,
                font,
            });

            const totDesc = `${planilla.totalDescuentos}`;

            const textanchotd =
                font.widthOfTextAtSize(
                    totDesc,
                    7
                );

            page.drawText(
                totDesc,
                {
                    x: 500 - textanchotd,
                    y,
                    size: 7,
                    font
                }
            );
            y -= 15;
            verificarNuevaPagina(usuario);

            page.drawText(
                `IMPORTE NETO:`,
                {
                    x: 90,
                    y,
                    size: 8,
                    font
                }
            );

            const liquidoTexto = `${planilla.liquido}`;

            const textanchotl =
                font.widthOfTextAtSize(
                    liquidoTexto,
                    7
                );

            page.drawText(
                liquidoTexto,
                {
                    x: 500 - textanchotl,
                    y,
                    size: 7,
                    font
                }
            );
            y -= 15;
            verificarNuevaPagina(usuario);
        });
    });
        // =========================
        // ESPACIO PARA FIRMAS
        // =========================

    y -= 40;

    if(y < 120){
        crearNuevaPagina(usuario);
    }
    y = height-750;

    function textoCentrado(texto, centroX, y, size){
        const width =
            font.widthOfTextAtSize(
                texto,
                size
            );

        page.drawText(texto, {
            x: centroX - (width / 2),
            y,
            size,
            font
        });

    }
    textoCentrado(
        'JEFE DE EGRESOS',
        145,
        y,
        9
    );

    textoCentrado(
        'JEFE DE TESORERIA',
        425,
        y,
        9
    );
    // =========================
    // DESCARGAR PDF
    // =========================
    const pdfBytes =
        await pdfDoc.save();

    const blob =
        new Blob([pdfBytes], {
            type: 'application/pdf'
        });

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement('a');

    a.href = url;
    a.download = 'constancia.pdf';

    a.click();

    URL.revokeObjectURL(url);

});

// carga info personal y planillas(datatable)
async function cargarDatos() {
    try {
        // BUSCAR USUARIO
        const user = await window.api.getCodeUser(idUsers);
        
        if(!user){
            alert('Usuario no encontrado');
            window.location.href = '../index.html';
            return;
        }

        // Llenar datos del usuario
        document.getElementById('coduser').value = user.idUsers;
        document.getElementById('apellipat').value = user.apelliPatUser;
        document.getElementById('apellimat').value = user.apelliMatUser;
        document.getElementById('nameuser').value = user.nameUser;

        // BUSCAR PLANILLAS
        const planillas = await window.api.getUserPlanilla(idUsers);
        
        // Actualizar la tabla con los datos
        actualizarDataTable(planillas);
        
        // Inicializar DataTables (solo la primera vez)
        inicializarDataTable();
        
        // Evento para los botones "Ver" (delegación de eventos)
        $('#dataTable').off('click', '.ver-planilla').on('click', '.ver-planilla', function() {
            const idPlanilla = $(this).data('id');
            //console.log('Ver planilla ID:', idPlanilla);
        });
        
    } catch (error) {
        console.error('Error en cargarDatos:', error);
        alert('Error al cargar los datos: ' + error.message);
    }
}

//regresar al index
document.getElementById("regresar").onclick = function () {
    window.location.href = "../index.html";
};

// INICIAR CUANDO EL DOM ESTÉ LISTO
$(document).ready(async function() {
    cargarDatos();
    await cargarAnios();
    cargarAniosRango();
    inicializarCheckboxesAnio();
});