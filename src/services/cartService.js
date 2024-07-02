import { updateCart, deleteProductFromCart, clearCart } from '../dao/cartData.js'
import Product from '../models/productModel.js'
import Cart from '../models/cartModel.js'

export const getCartById = async (cartId) => {
    return await Cart.findById(cartId)
}

export const addProductToCart = async (cartId, productId, quantity) => {
    const cart = await Cart.findById(cartId)
    if (!cart) {
        throw new Error('Carrito no encontrado')
    }

    const product = await Product.findById(productId)
    if (!product) {
        throw new Error('Producto no encontrado')
    }

    const productIndex = cart.products.findIndex(item => item.product.toString() === productId)
    if (productIndex > -1) {
        cart.products[productIndex].quantity += parseInt(quantity) || 1
    } else {
        cart.products.push({ product: productId, quantity: parseInt(quantity) || 1 })
    }

    return await updateCart(cartId, cart)
}

export const updateProductQuantity = async (cartId, productId, quantity) => {
    const quantityNumber = parseInt(quantity, 10)
    if (isNaN(quantityNumber) || quantityNumber <= 0) {
        throw new Error('Cantidad inválida')
    }

    const cart = await Cart.findById(cartId)
    if (!cart) {
        throw new Error('Carrito no encontrado')
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId)
    if (productIndex > -1) {
        cart.products[productIndex].quantity += quantityNumber
    } else {
        cart.products.push({ product: productId, quantity: quantityNumber })
    }

    return await updateCart(cartId, cart)
}

export const removeProductFromCart = async (cartId, productId) => {
    return await deleteProductFromCart(cartId, productId)
}

export const clearCartProducts = async (cartId) => {
    return await clearCart(cartId)
}