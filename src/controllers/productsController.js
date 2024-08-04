import { v4 as uuidv4 } from 'uuid'
import {
    getProducts as getProductsService,
    getCategories as getCategoriesService
} from '../services/productsService.js'

import { createCustomError, errorTypes } from '../utils/errors.js'
import MockingProduct from '../models/mockingProductsModel.js'
import { generateMockProducts } from '../utils/generateMockProducts.js'
import logger from '../utils/logger.js'

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

export const getMockingProducts = async (req, res, next) => {
    try {
        const { query = '', sort = '', limit = 10, page = 1 } = req.query

        const filter = query ? { name: { $regex: query, $options: 'i' } } : {}

        const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: sortOptions
        }

        const products = await MockingProduct.paginate(filter, options)

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
        next(error)
    }
}

export const regenerateMockingProducts = async (req, res, next) => {
    try {
        await MockingProduct.deleteMany({})
        const products = generateMockProducts()
        await MockingProduct.insertMany(products)
        res.json({ status: 'success', message: 'Productos generados correctamente!' })
    } catch (error) {
        next(error)
    }
}

export const createProduct = async (req, res, next) => {
    try {
        const { name, price, description, category, stock, thumbnail } = req.body

        const missingFields = []
        if (!name) missingFields.push('name')
        if (!price) missingFields.push('price')

        if (missingFields.length > 0) {
            return next(createCustomError(errorTypes.MISSING_FIELDS, { fields: missingFields }))
        }

        const newProduct = new MockingProduct({
            _id: uuidv4(),
            name,
            price,
            description,
            category,
            stock: stock || 0,
            thumbnail
        })

        const savedProduct = await newProduct.save()

        logger.info('Product created successfully', { product: savedProduct })
        res.status(201).json({
            status: 'success',
            message: 'Producto creado correctamente',
            product: savedProduct
        })
    } catch (error) {
        next(error)
    }
}