import {
    getCartById,
    addProductToCart as addProductToCartService,
    updateProductQuantity as updateProductQuantityService,
    removeProductFromCart as removeProductFromCartService,
    clearCartProducts as clearCartProductsService,
    purchaseCart,
} from '../services/cartService.js'
import { sendSMS } from '../utils/smsService.js'
import logger from '../utils/logger.js'
import Product from '../models/productModel.js'

export const getCart = async (req, res) => {
    try {
        const { cid } = req.params
        const cart = await getCartById(cid)
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' })
        }
        res.json({ status: 'success', message: 'Carrito', data: cart })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const updateCart = async (req, res) => {
    const { cid } = req.params
    const { products } = req.body

    try {
        const cart = await getCartById(cid)
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' })
        }

        products.forEach(({ productId, quantity }) => {
            const productIndex = cart.products.findIndex(p => p.productId === productId)
            if (productIndex > -1) {
                cart.products[productIndex].quantity = quantity
            }
        })

        await cartRepository.updateCart(cart)
        res.json({ status: 'success', cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
}

export const addProductToCart = async (req, res) => {
    const { cid, pid } = req.params
    const { cantidad } = req.body
    const userEmail = req.user.email

    try {
        const product = await Product.findById(pid)
        if (!product) {
            logger.error(`Producto con ID ${pid} no encontrado`)
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' })
        }

        if (userEmail === product.owner) {
            logger.error(`Intento de agregar al carrito un producto propio por ${userEmail}`)
            return res.status(400).json({ status: 'error', message: 'No puedes agregar tu propio producto al carrito' })
        }

        if (isNaN(cantidad) || cantidad <= 0) {
            logger.error(`Intento de agregar al carrito con cantidad inválida: ${cantidad}`)
            return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número mayor que 0' })
        }

        await addProductToCartService(cid, pid, cantidad)
        logger.info(`Producto ${pid} agregado al carrito ${cid} con cantidad ${cantidad}`)
        res.json({ status: 'success', message: 'Producto agregado al carrito' })
    } catch (err) {
        logger.error(`Error al agregar producto ${pid} al carrito ${cid}: ${err.message}`)
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params
    const { cantidad } = req.body

    try {
        await updateProductQuantityService(cid, pid, cantidad)
        res.json({ status: 'success', message: 'Cantidad actualizada' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params

    try {
        await removeProductFromCartService(cid, pid)
        res.json({ status: 'success', message: 'Producto eliminado del carrito' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const deleteAllProductsFromCart = async (req, res) => {
    const { cid } = req.params

    try {
        await clearCartProductsService(cid)
        res.json({ status: 'success', message: 'Todos los productos eliminados del carrito' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}

export const getPurchase = async (req, res) => {
    const { cid } = req.params
    const user = req.user
    const { method } = req.query
    const { phoneNumber } = req.body

    try {
        const { ticket, unavailableProducts } = await purchaseCart(cid, user)
        
        if (!ticket) {
            return res.status(400).json({ status: 'error', message: 'No se pudo completar la compra.', unavailableProducts })
        }

        if (method === 'sms' && phoneNumber) {
            const message = `Tu compra ha sido confirmada. Código de compra: ${ticket.code}, Monto: $${ticket.amount}`
            try {
                await sendSMS(phoneNumber, message)
            } catch (error) {
                console.error('Error enviando el SMS:', error)
            }
        }

        res.json({ status: 'success', message: 'Compra realizada', ticket })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}