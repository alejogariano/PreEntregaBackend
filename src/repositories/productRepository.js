import Product from '../models/productModel.js'

export default {
    getAllProducts: async () => await Product.find().lean(),
    getProductById: async (id) => await Product.findById(id),
    updateProductStock: async (product) => {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                product._id,
                { $set: { stock: product.stock } },
                { new: true }
            )
            return updatedProduct
        } catch (error) {
            console.error('Error al actualizar el stock del producto:', error)
            throw new Error('No se pudo actualizar el stock del producto')
        }
    },
    getPaginatedProducts: async (filter, options) => await Product.paginate(filter, options),
    getDistinctCategories: async () => await Product.distinct('category')
}