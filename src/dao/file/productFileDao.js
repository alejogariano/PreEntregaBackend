import fs from 'fs/promises'
import path from 'path'

const filePath = path.resolve('data/products.json')

class ProductDaoFile {
    async _readFile() {
        const data = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(data)
    }

    async _writeFile(data) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    }

    async findById(id) {
        const products = await this._readFile()
        return products.find(product => product.id === id)
    }

    async findAll() {
        return await this._readFile()
    }

    async createProduct(product) {
        const products = await this._readFile()
        products.push(product)
        await this._writeFile(products)
        return product
    }

    async updateProduct(updatedProduct) {
        const products = await this._readFile()
        const index = products.findIndex(product => product.id === updatedProduct.id)
        if (index !== -1) {
        products[index] = updatedProduct
        await this._writeFile(products)
        }
        return updatedProduct
    }

    async deleteProductById(id) {
        const products = await this._readFile()
        const newProducts = products.filter(product => product.id !== id)
        await this._writeFile(newProducts)
    }
}

export default ProductDaoFile