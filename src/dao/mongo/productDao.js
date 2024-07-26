import Product from '../../models/productModel.js'

class ProductDaoMongo {
    async findById(id) {
        return await Product.findById(id)
    }

    async findAll() {
        return await Product.find()
    }

    async createProduct(product) {
        return await Product.create(product)
    }

    async updateProduct(product) {
        return await product.save()
    }

    async deleteProductById(id) {
        return await Product.findByIdAndDelete(id)
    }

    /* async getPagination(filter, options) {
        return await Product.paginate(filter, options)
    } */

    async getDistinctCategories() {
        return await Product.distinct('category')
    }
}

export default ProductDaoMongo