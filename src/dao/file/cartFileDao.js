import fs from 'fs/promises'
import path from 'path'

const filePath = path.resolve('data/carts.json')

class CartDaoFile {
    async _readFile() {
        const data = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(data)
    }

    async _writeFile(data) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    }

    async findById(id) {
        const carts = await this._readFile()
        return carts.find(cart => cart.id === id)
    }

    async createCart(cart) {
        const carts = await this._readFile()
        carts.push(cart)
        await this._writeFile(carts)
        return cart
    }

    async updateCart(updatedCart) {
        const carts = await this._readFile()
        const index = carts.findIndex(cart => cart.id === updatedCart.id)
        if (index !== -1) {
        carts[index] = updatedCart
        await this._writeFile(carts)
        }
        return updatedCart
    }

    async deleteCartById(id) {
        const carts = await this._readFile()
        const newCarts = carts.filter(cart => cart.id !== id)
        await this._writeFile(newCarts)
    }
}

export default CartDaoFile