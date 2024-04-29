const express = require('express');
const ProductManager = require('../models/ProductManager');

const router = express.Router();
const productsManager = new ProductManager('data/products.json');


router.get('/', async (req, res) => {
    try {
        await productsManager.loadProducts();
        res.json(productsManager.products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productsManager.getProductById(productId);
        res.json(product);
    } catch (error) {
        res.status(404).send(error.message);
    }
});


router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category || !thumbnails) {
            throw new Error("Todos los campos son obligatorios");
        }
        const newProduct = await productsManager.addProduct({
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails
        });
        res.status(201).json("Producto agregado correctamente");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const updatedFields = req.body;
        const updatedProduct = await productsManager.updateProduct(productId, updatedFields);
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        await productsManager.deleteProduct(productId);
        res.send('Producto eliminado correctamente');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
