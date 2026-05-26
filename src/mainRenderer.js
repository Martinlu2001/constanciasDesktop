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
            destroy: false, // No destruir si existe
            retrieve: false  // No recuperar instancia anterior
        });
        console.log('DataTable inicializado correctamente');
    }
}

// FUNCIÓN PARA ACTUALIZAR LOS DATOS
function actualizarDataTable(planillas) {
    const tbody = $('#body-table');
    tbody.empty();
    
    if (!planillas || planillas.length === 0) {
        /*tbody.html(`
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No hay planillas registradas para este usuario
                </td>
            </tr>
        `);*/
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

// carga info y planillas
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
        console.log('Planillas cargadas:', planillas);
        
        // Actualizar la tabla con los datos
        actualizarDataTable(planillas);
        
        // Inicializar DataTables (solo la primera vez)
        inicializarDataTable();
        
        // Evento para los botones "Ver" (delegación de eventos)
        $('#dataTable').off('click', '.ver-planilla').on('click', '.ver-planilla', function() {
            const idPlanilla = $(this).data('id');
            console.log('Ver planilla ID:', idPlanilla);
            // Aquí puedes abrir un modal o redirigir
            // alert('Ver planilla ' + idPlanilla);
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
$(document).ready(function() {
    cargarDatos();
});