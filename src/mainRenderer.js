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
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
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
        tbody.html(`
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No hay planillas registradas para este usuario
                </td>
            </tr>
        `);
    } else {
        planillas.forEach(planilla => {
            tbody.append(`
                <tr>
                    <td>${planilla.anio || planilla.anioPlanillas_idanioPlanillas || '-'}</td>
                    <td>${planilla.mes || planilla.mesPlanillas_idmesPlanillas || '-'}</td>
                    <td>${planilla.tipo || planilla.tipoPlanillas_idtipoPlanilla || '-'}</td>
                    <td>${planilla.condicion || planilla.condicionPlanillas_idcondicionPlanillas || '-'}</td>
                    <td>
                        <button class="btn btn-success btn-sm ver-planilla" data-id="${planilla.idPlanillas}"><i class="fa fa-eye"></i>
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

// CARGAR TODO
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

// INICIAR CUANDO EL DOM ESTÉ LISTO
$(document).ready(function() {
    cargarDatos();
});