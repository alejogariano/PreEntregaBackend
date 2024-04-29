const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const ProductManager = require('../models/ProductManager');

const router = express.Router();

const productsManager = new ProductManager('data/products.json');

router.use(bodyParser.json());

router.get('/', async (req, res) => {
    try {
        await productsManager.init();
        const products = await productsManager.getProducts();
        const limit = parseInt(req.query.limit) || products.length;
        res.json(products.slice(0, limit));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/:pid', async (req, res) => {
    try {
        await productsManager.init();
        const productId = req.params.pid;
        const product = await productsManager.getProductById(productId);
        res.json(product);
    } catch (error) {
        console.error(error);
        if (error.message === 'Producto no encontrado.') {
            res.status(404).send('Producto no encontrado');
        } else {
            res.status(500).send('Error interno del servidor');
        }
    }
});

router.post('/', async (req, res) => {
    try {
        await productsManager.init();
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        const newProduct = await productsManager.addProduct({ title, description, code, price, stock, category, thumbnails });
        res.status(201).send('Producto agregado correctamente');
    } catch (error) {
        console.error(error);
        if (error.message === 'Todos los campos son obligatorios.' || error.message === 'El código de producto ya está en uso.') {
            res.status(400).send(error.message);
        } else {
            res.status(500).send('Error interno del servidor');
        }
    }
});

router.put('/:pid', async (req, res) => { 
    try {
        await productsManager.init(); 
        const productId = req.params.pid;
        const updatedFields = req.body;
        const updatedProduct = await productsManager.updateProduct(productId, updatedFields); 
        res.send('Producto actualizado correctamente');
    } catch (error) {
        console.error(error);
        if (error.message === 'Producto no encontrado.' || error.message === 'El código de producto ya está en uso.') {
            res.status(404).send(error.message);
        } else {
            res.status(500).send('Error interno del servidor');
        }
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        await productsManager.init();
        const productId = req.params.pid;
        await productsManager.deleteProduct(productId);
        res.send('Producto eliminado correctamente');
    } catch (error) {
        console.error(error);
        if (error.message === 'Producto no encontrado.') {
            res.status(404).send(error.message);
        } else {
            res.status(500).send('Error interno del servidor');
        }
    }
});

module.exports = router;
