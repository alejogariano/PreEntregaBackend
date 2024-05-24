// Función para obtener el cartId del atributo data-cart-id
function getCartId() {
    const cartDiv = document.getElementById('cart');
    return cartDiv.dataset.cartId;
}

// Función para reducir la cantidad de un producto en el carrito
async function reduceQuantity(productId) {
    const cartId = getCartId();
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity: -1 }) });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Cantidad reducida');
            fetchCart();
        } else {
            alert('Error al reducir cantidad');
        }
    } catch (error) {
        console.error('Error al reducir cantidad:', error);
    }
}

// Función para incrementar la cantidad de un producto en el carrito
async function increaseQuantity(productId) {
    const cartId = getCartId();
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity: 1 }) });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Cantidad incrementada');
            fetchCart();
        } else {
            alert('Error al incrementar cantidad');
        }
    } catch (error) {
        console.error('Error al incrementar cantidad:', error);
    }
}

// Función para eliminar todos los productos con el mismo ID del carrito
async function removeAll(productId) {
    const cartId = getCartId();
    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Productos eliminados');
            fetchCart();
        } else {
            alert('Error al eliminar productos');
        }
    } catch (error) {
        console.error('Error al eliminar productos:', error);
    }
}

// Función para vaciar el carrito por completo
async function emptyCart() {
    const cartId = getCartId();
    try {
        const response = await fetch(`/api/carts/${cartId}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.status === 'success') {
            alert('Carrito vaciado');
            fetchCart();
        } else {
            alert('Error al vaciar carrito');
        }
    } catch (error) {
        console.error('Error al vaciar carrito:', error);
    }
}