const { leerArchivo, escribirArchivo } = require('../utils/fileUtils');
const fs = require('fs');

class CartManager {
    constructor(filename) {
        this.filename = filename;
        this.carts = [];
        this.currentId = 1;
    }

    async init() {
        try {
            await fs.promises.access(this.filename);
            await this.loadCarts();
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.saveCarts();
            } else {
                throw error;
            }
        }
    }

    async loadCarts() {
        try {
            const data = await leerArchivo(this.filename);
            this.carts = data;
            const lastCart = this.carts[this.carts.length - 1];
            if (lastCart) {
                this.currentId = lastCart.id + 1;
            }
        } catch (error) {
            throw new Error(`Error al cargar los carritos: ${error.message}`);
        }
    }

    async saveCarts() {
        try {
            await escribirArchivo(this.filename, this.carts);
        } catch (error) {
            throw new Error(`Error al guardar los carritos: ${error.message}`);
        }
    }

    async createCart() {
        const newCart = {
            id: this.currentId++,
            products: []
        };
        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    async addProductToCart(cartId, productId, quantity) {
        const cartIndex = this.carts.findIndex(cart => cart.id === cartId);
        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado');
        }

        const existingProductIndex = this.carts[cartIndex].products.findIndex(item => item.id === productId);
        if (existingProductIndex !== -1) {
            this.carts[cartIndex].products[existingProductIndex].quantity += quantity;
        } else {
            this.carts[cartIndex].products.push({ id: productId, quantity });
        }

        await this.saveCarts();
        return this.carts[cartIndex];
    }

}

module.exports = CartManager;
