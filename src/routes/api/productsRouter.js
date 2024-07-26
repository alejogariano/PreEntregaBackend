import express from 'express'
import {
    getProducts,
    getCategories,
    getMockingProducts,
    regenerateMockingProducts,
    createProduct
} from '../../controllers/productsController.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/categories', getCategories)

router.get('/mockingProducts', getMockingProducts)
router.post('/mockingProducts/regenerate', regenerateMockingProducts)
router.post('/mockingProducts/create', createProduct)

export default router