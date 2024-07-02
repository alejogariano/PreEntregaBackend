import Product from '../models/productModel.js'

export const findProducts = async (filter, options) => {
    return await Product.paginate(filter, options)
}

export const findCategories = async () => {
    return await Product.distinct('category')
}