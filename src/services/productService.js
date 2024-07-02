import { findProducts, findCategories } from '../dao/productData.js'

export const getProducts = async (query) => {
    const { limit = 10, page = 1, sort, query: searchQuery, categories } = query
    const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort ? { price: sort } : {},
    }

    let filter = {}
    if (searchQuery) {
        filter.name = { $regex: searchQuery, $options: 'i' }
    }
    if (categories) {
        filter.category = { $in: categories.split(',') }
    }

    if (isNaN(options.page) || options.page < 1 || isNaN(options.limit) || options.limit < 1) {
        throw new Error('Número de página o límite inválido')
    }

    const products = await findProducts(filter, options)

    if (options.page > products.totalPages) {
        throw new Error('Página no encontrada')
    }

    return products
}

export const getCategories = async () => {
    return await findCategories()
}