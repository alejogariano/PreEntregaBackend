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

document.addEventListener('DOMContentLoaded', () => {
    let quantitiesAdjusted = false

    document.getElementById('finalize-purchase').addEventListener('click', () => {
        const cartId = document.getElementById('cart').dataset.cartId
        const products = document.querySelectorAll('#cart tbody tr')

        const updatedProducts = []
        let adjustmentsMade = false

        products.forEach(product => {
            const productId = product.dataset.productId
            const quantityElement = product.querySelector('.quantity strong')
            const stockElement = product.querySelector('.stock strong')

            const quantity = parseInt(quantityElement.textContent)
            const stock = parseInt(stockElement.textContent)

            if (quantity > stock) {
                quantityElement.textContent = stock
                product.style.backgroundColor = '#ffcccc'
                updatedProducts.push({ productId, quantity: stock })
                adjustmentsMade = true
            } else {
                updatedProducts.push({ productId, quantity })
            }
        })

        if (adjustmentsMade) {
            fetch(`/api/carts/${cartId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ products: updatedProducts })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Compra actualizada',
                        text: 'Se modificó una o varias cantidades. Por favor revisa tu carrito antes de volver a finalizar la compra.',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        quantitiesAdjusted = true
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un error al actualizar el carrito.'
                    })
                }
            })
            .catch(error => {
                console.error('Error al actualizar el carrito:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al actualizar el carrito.'
                })
            })
        } else {
            window.location.href = `/${cartId}/purchase`
        }
    })
})