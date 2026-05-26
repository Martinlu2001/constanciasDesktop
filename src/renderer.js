import Swal from 'sweetalert2';

const inputUser = document.getElementById('user');
const btnBuscar = document.querySelector('.btn-buscar');

// valida numeros
inputUser.addEventListener('input', () => {
    inputUser.value =
        inputUser.value.replace(/\D/g, '');
});

// buscar codigo de usuario
async function buscarUsuario(){
    const codigo = inputUser.value.trim();

    if(codigo === ''){
        Swal.fire({
            icon: 'warning',
            title: 'Campo vacío',
            text: 'Ingresa un código de trabajador'
        });
        return;
    }

    try {
        const user =
            await window.api.getCodeUser(codigo);

        if(!user){

            Swal.fire({
                icon: 'error',
                title: 'Código no encontrado',
                text: 'El código ingresado no existe'
            });
            return;
        }

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

btnBuscar.addEventListener(
    'click',
    buscarUsuario
);

inputUser.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
        buscarUsuario();
    }
});