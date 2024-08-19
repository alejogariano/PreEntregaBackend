import ProductDaoMongo from '../dao/mongo/DAOproduct.js'
import ProductDTO from '../dto/productDTO.js'
import Product from '../models/productModel.js'

const productDao = new ProductDaoMongo()

export default {
    getAllProducts: async () => {
        const products = await productDao.findAll()
        return products.map(product => new ProductDTO(product))
    },

    getProductById: async (id) => {
        const product = await productDao.findById(id)
        if (product) {
            return new ProductDTO(product)
        }
        throw new Error('Product not found')
    },

    createProduct: async (productData) => {
        const newProduct = await productDao.createProduct(productData)
        return new ProductDTO(newProduct)
    },

    updateProduct: async (productData) => {
        const updatedProduct = await productDao.updateProduct(productData)
        return new ProductDTO(updatedProduct)
    },

    deleteProductById: async (id) => {
        await productDao.deleteProductById(id)
        return { message: 'Product deleted successfully' }
    },

    updateProductStock: async (id, stock) => {
        const product = await productDao.findById(id)
        if (!product) {
            throw new Error('Product not found')
        }
        product.stock = stock
        const updatedProduct = await productDao.updateProduct(product)
        return new ProductDTO(updatedProduct)
    },

    getPaginatedProducts: async (filter, options) => await Product.paginate(filter, options),
    /* getPaginatedProducts: async (filter, options) => {
        const products = await productDao.getPagination(filter, options)
        return products.map(product => new ProductDTO(product))
    }, */

    getDistinctCategories: async () => {
        return await productDao.getDistinctCategories()
    }
}