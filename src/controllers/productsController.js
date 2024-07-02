import {
    getProducts as getProductsService,
    getCategories as getCategoriesService
} from '../services/productService.js'

export const getProducts = async (req, res) => {
    try {
        const products = await getProductsService(req.query)

        res.json({
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
        })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
}

export const getCategories = async (req, res) => {
    try {
        const categories = await getCategoriesService()
        res.json({ status: 'success', categories })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
}