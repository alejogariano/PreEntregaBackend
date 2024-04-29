const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class ProductManager {
    constructor(filename) {
        this.filename = filename;
        this.products = [];
        this.currentId = 1;
    }

    init() {
        try {
            const data = fs.readFileSync(this.filename, 'utf8');
            this.products = JSON.parse(data);
            const lastProduct = this.products[this.products.length - 1];
            if (lastProduct) {
                this.currentId = lastProduct.id + 1;
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                this.saveProducts([]);
            } else {
                throw error;
            }
        }
    }

    saveProducts(products) {
        try {
            const existingData = fs.readFileSync(this.filename, 'utf8');
            const existingProducts = JSON.parse(existingData);
            const newData = JSON.stringify([...existingProducts, ...products], null, 2);
            fs.writeFileSync(this.filename, newData);
        } catch (error) {
            throw new Error(`Error al guardar los productos: ${error.message}`);
        }
    }
    
    loadProducts() {
        try {
            const data = fs.readFileSync(this.filename, 'utf8');
            this.products = JSON.parse(data);
        } catch (error) {
            throw new Error(`Error al cargar los productos: ${error.message}`);
        }
    }

    getProducts() {
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

    getProductById(id) {
        const productId = parseInt(id);
        const product = this.products.find(product => product.id === productId);
        if (!product) {
            throw new Error("Producto no encontrado.");
        }
        return product;
    }

    updateProduct(id, updatedFields) {
        
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            throw new Error("Producto no encontrado.");
        }
        if (updatedFields && updatedFields.code) {
            const existingProduct = this.products.find(product => product.code === updatedFields.code && product.id !== id);
            if (existingProduct) {
                throw new Error("El código de producto ya está en uso.");
            }
        }

        this.products[productIndex] = {
            ...this.products[productIndex],
            ...updatedFields
        };

        this.saveProducts(this.products);

        return this.products[productIndex];
    }

    deleteProduct(id) {
        const initialLength = this.products.length;
        this.products = this.products.filter(product => product.id !== id);
        if (this.products.length === initialLength) {
            throw new Error("Producto no encontrado.");
        }

        this.saveProducts(this.products);
    }
}

module.exports = ProductManager;
