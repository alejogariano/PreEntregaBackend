const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class CartManager {
    constructor(filename) {
        this.filename = filename;
    }

    async init() {
        try {
            await fs.promises.access(this.filename);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.saveCarts([]);
            } else {
                throw error;
            }
        }
    }

    async saveCarts(carts) {
        try {
            await fs.promises.writeFile(this.filename, JSON.stringify(carts, null, 2));
        } catch (error) {
            throw new Error(`Error al guardar los carritos: ${error.message}`);
        }
    }

    async getCarts() {
        const data = await fs.promises.readFile(this.filename, 'utf8');
        return JSON.parse(data);
    }

    async getCartById(cartId) {
        const carts = await this.getCarts();
        const cart = carts.find(cart => cart.id === cartId);
        if (!cart) {
            throw new Error("Carrito no encontrado.");
        }
        return cart;
    }

    async createCart() {
        const carts = await this.getCarts();
        const newCart = {
            id: uuidv4(),
            products: []
        };
        carts.push(newCart);
        await this.saveCarts(carts);
        return newCart;
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(cart => cart.id === cartId);
        if (cartIndex === -1) {
            throw new Error("Carrito no encontrado.");
        }

        const existingProductIndex = carts[cartIndex].products.findIndex(item => item.id === productId);
        if (existingProductIndex !== -1) {
            carts[cartIndex].products[existingProductIndex].quantity += quantity;
        } else {
            carts[cartIndex].products.push({ id: productId, quantity });
        }

        await this.saveCarts(carts);
        return carts[cartIndex];
    }
}

module.exports = CartManager;
