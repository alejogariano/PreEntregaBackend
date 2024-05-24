document.getElementById('logoutButton').addEventListener('click', function() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Quieres cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma, hacer una solicitud AJAX para cerrar la sesión
            fetch('/logout', {
                method: 'POST', // O el método que estés utilizando en tu servidor para cerrar la sesión
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Si la solicitud fue exitosa, redireccionar al usuario
                    window.location.href = '/';
                } else {
                    // Manejar cualquier error que ocurra durante la solicitud
                    console.error('Error al cerrar sesión:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error al cerrar sesión:', error);
            });
        }
    });
});