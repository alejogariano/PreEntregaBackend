const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class ProductManager {
    constructor(filename) {
        this.filename = filename;
        this.products = [];
        this.currentId = 1;
    }

    async init() {
        try {
            await fs.promises.access(this.filename);
            await this.loadProducts();
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.saveProducts([]);
            } else {
                throw error;
            }
        }
    }

    async loadProducts() {
        const data = await fs.promises.readFile(this.filename, 'utf8');
        this.products = JSON.parse(data);
        const lastProduct = this.products[this.products.length - 1];
        if (lastProduct) {
            this.currentId = lastProduct.id + 1;
        }
    }

    async saveProducts(products) {
        try {
            await fs.promises.writeFile(this.filename, JSON.stringify(products, null, 2));
        } catch (error) {
            throw new Error(`Error al guardar los productos: ${error.message}`);
        }
    }


    async getProducts() {
        return this.products;
    }

    addProduct({ title, description, code, price, stock, category, thumbnails }) {
        if (!title || !description || !code || !price || !stock || !category || !thumbnails) {
            throw new Error("Todos los campos son obligatorios.");
        }

        const existingProduct = this.products.find(product => product.code === code);
        if (existingProduct) {
            throw new Error("El código de producto ya está en uso.");
        }

        const id = this.currentId++;

        const newProduct = {
            id: uuidv4(),
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails,
            status: true
        };

        this.products.push(newProduct);
        this.saveProducts(this.products);

        return newProduct;
    }

    async getProductById(id) {
        const productId = parseInt(id);
        const product = this.products.find(product => product.id === productId);
        if (!product) {
            throw new Error("Producto no encontrado.");
        }
        return product;
    }


    async updateProduct(id, updatedFields) {
        const productId = parseInt(id);
        const productIndex = this.products.findIndex(product => product.id === productId);
        if (productIndex === -1) {
            throw Error("Producto no encontrado.");
        }
        if (updatedFields.code) {
            const existingProduct = this.products.find(product => product.code === updatedFields.code && product.id !== productId);
            if (existingProduct) {
                throw new Error("El código de producto ya está en uso.");
            }
        }

        this.products[productIndex] = {
            ...this.products[productIndex],
            ...updatedFields
        };

        await this.saveProducts(this.products);

        return this.products[productIndex];
    }

    async deleteProduct(id) {
        const initialLength = this.products.length;
        this.products = this.products.filter(product => product.id !== id);
        if (this.products.length === initialLength) {
            throw Error("Producto no encontrado.");
        }

        await this.saveProducts(this.products);
    }
}

module.exports = ProductManager;
