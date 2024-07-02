function getCartId() {
    const cartDiv = document.getElementById('cart')
    return cartDiv.dataset.cartId
}

async function removeFromCart(productId) {
    const cartId = getCartId()
    try {
        const swalResponse = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Quieres eliminar este producto del carrito?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        })

        if (swalResponse.isConfirmed) {
            const response = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'DELETE' })
            const data = await response.json()
            if (data.status === 'success') {
                await Swal.fire('¡Éxito!', 'Producto eliminado del carrito', 'success')
                window.location.href = `/carts/${cartId}`
            } else {
                await Swal.fire('Error', 'No se pudo eliminar el producto del carrito', 'error')
            }
        }
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error)
        await Swal.fire('Error', 'Ocurrió un error al eliminar el producto del carrito', 'error')
    }
}

async function emptyCart() {
    const cartId = getCartId()
    try {
        const swalResponse = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Quieres vaciar completamente el carrito?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar',
        })

        if (swalResponse.isConfirmed) {
            const response = await fetch(`/api/carts/${cartId}`, { method: 'DELETE' })
            const data = await response.json()
            if (data.status === 'success') {
                await Swal.fire('¡Éxito!', 'Carrito vaciado', 'success')
                window.location.href = `/carts/${cartId}`
            } else {
                await Swal.fire('Error', 'No se pudo vaciar el carrito', 'error')
            }
        }
    } catch (error) {
        console.error('Error al vaciar carrito:', error)
        await Swal.fire('Error', 'Ocurrió un error al vaciar el carrito', 'error')
    }
}
