import {
    getCartById,
    addProductToCart as addProductToCartService,
    updateProductQuantity as updateProductQuantityService,
    removeProductFromCart as removeProductFromCartService,
    clearCartProducts as clearCartProductsService,
    purchaseCart as purchaseCartService,
} from '../services/cartService.js'
import { sendSMS } from '../utils/smsService.js'
import logger from '../utils/logger.js'

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
            const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId)
            if (productIndex > -1) {
                cart.products[productIndex].quantity = quantity
            }
        })

        await cart.save()
        res.json({ status: 'success', cart })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
}

export const addProductToCart = async (req, res) => {
    const { cid, pid } = req.params
    const { cantidad } = req.body

    try {
        //http://localhost:8080/api/carts/668f3ac1dce6f2f89393e1db/products/665381fa74dba69ed7dedc79
        //Dato: solo funciona si lo probas por Postman, no por la web (ya q manejo los errores desde sweetalert)
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
        const { ticket } = await purchaseCartService(cid, user)
        if (ticket) {
            if (method === 'sms' && phoneNumber) {
                const message = `Tu compra ha sido confirmada. Código de compra: ${ticket.code}, Monto: $${ticket.amount}`
                try {
                    await sendSMS(phoneNumber, message)
                } catch (error) {
                    console.error('Error enviando el SMS:', error)
                }
            }

            res.json({ status: 'success', message: 'Compra realizada', ticket })
        } else {
            res.status(400).json({ status: 'error', message: 'No se pudo completar la compra.' })
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}