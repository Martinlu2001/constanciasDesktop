import Swal from 'sweetalert2';

const inputUser = document.getElementById('user');
const btnBuscar = document.querySelector('.btn-buscar');


// SOLO NÚMEROS
inputUser.addEventListener('input', () => {

    inputUser.value =
        inputUser.value.replace(/\D/g, '');

});


// BUSCAR
async function buscarUsuario(){

    const codigo = inputUser.value.trim();

    // VACÍO
    if(codigo === ''){

        Swal.fire({
            icon: 'warning',
            title: 'Campo vacío',
            text: 'Ingresa un código de trabajador'
        });

        return;
    }

    try {

        // VALIDAR EXISTENCIA
        const user =
            await window.api.getCodeUser(codigo);

        // NO EXISTE
        if(!user){

            Swal.fire({
                icon: 'error',
                title: 'Código no encontrado',
                text: 'El código ingresado no existe'
            });

            return;
        }

        // IR A MAIN CON EL ID
        window.location.href =
            `./pages/main.html?id=${codigo}`;

    } catch (error) {

        console.error(error);

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un problema'
        });

    }

}


// BOTÓN
btnBuscar.addEventListener(
    'click',
    buscarUsuario
);


// ENTER
inputUser.addEventListener('keydown', (e) => {

    if(e.key === 'Enter'){

        buscarUsuario();

    }

});