function confirmAddProduct(event) {
    event.preventDefault()
    
    Swal.fire({
        title: '¿Estás seguro?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('addProductForm').submit()
        }
    })
}