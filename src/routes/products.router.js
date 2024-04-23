const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const PRODUCTS_FILE = 'data/products.json';
router.use(bodyParser.json());

router.get('/', (req, res) => {
    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        const products = JSON.parse(data);
        const limit = parseInt(req.query.limit) || products.length;
        res.json(products.slice(0, limit));
    });
});

router.get('/:pid', (req, res) => {
    const productId = req.params.pid;    
    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        const products = JSON.parse(data);
        const product = products.find(prod => prod.id == productId);
        
        if (!product) {
            res.status(404).send('Producto no encontrado');
            return;
        }
        res.json(product);
    });
});

router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || !price || !stock || !category || !thumbnails) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

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

    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        let products = JSON.parse(data);
        products.push(newProduct);
        fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error interno del servidor');
            }
            res.status(201).send('Producto agregado correctamente');
        });
    });
});

router.put('/:pid', (req, res) => {
    const productId = req.params.pid;
    const updatedProduct = req.body;

    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        const products = JSON.parse(data);
        const index = products.findIndex(prod => prod.id.toString() === productId);
        if (index === -1) {
            res.status(404).send('Producto no encontrado');
            return;
        }
        products[index] = { ...products[index], ...updatedProduct };
        fs.writeFile(PRODUCTS_FILE, JSON.stringify(products), err => {
            if (err) {
                console.error(err);
                res.status(500).send('Error interno del servidor');
                return;
            }
            res.send('Producto actualizado correctamente');
        });
    });
});

router.delete('/:pid', (req, res) => {
    const productId = req.params.pid;
    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        let products = JSON.parse(data);
        const index = products.findIndex(prod => prod.id === productId);
        if (index === -1) {
            res.status(404).send('Producto no encontrado');
            return;
        }
        products.splice(index, 1);
        fs.writeFile(PRODUCTS_FILE, JSON.stringify(products), err => {
            if (err) {
                console.error(err);
                res.status(500).send('Error interno del servidor');
                return;
            }
            res.send('Producto eliminado correctamente');
        });
    });
});

module.exports = router;
