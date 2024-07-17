import {
    addProduct as addProductService
} from '../services/adminServices.js'

export const addProduct = async (req, res) => {
    try {
        const { name, description, price, stock, status, category, thumbnail } = req.body
        const product = await addProductService(name, description, price, stock, status, category, thumbnail)
        res.json({ status: 'success', message: 'Producto agregado', data: product })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
}