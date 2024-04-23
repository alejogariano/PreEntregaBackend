const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const CARTS_FILE = 'data/carrito.json';

router.post('/', (req, res) => {
    fs.readFile(CARTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }

        let carts = JSON.parse(data);
        const newCart = {
            id: uuidv4(),
            products: []
        };

        carts.push(newCart);

        fs.writeFile(CARTS_FILE, JSON.stringify(carts), err => {
            if (err) {
                console.error(err);
                res.status(500).send('Error interno del servidor');
                return;
            }
            res.status(201).send('Carrito creado correctamente');
        });
    });
});

router.get('/:cid', (req, res) => {
    const cartId = req.params.cid;
    fs.readFile(CARTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        const cart = JSON.parse(data).find(cart => cart.id === cartId);
        if (!cart) {
            res.status(404).send('Carrito no encontrado');
            return;
        }
        res.json(cart.products);
    });
});

router.post('/:cid/product/:pid', (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = parseInt(req.body.quantity) || 1;

    fs.readFile(CARTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        let carts = JSON.parse(data);
        const cartIndex = carts.findIndex(cart => cart.id === cartId);
        if (cartIndex === -1) {
            res.status(404).send('Carrito no encontrado');
            return;
        }

        const existingProductIndex = carts[cartIndex].products.findIndex(item => item.id === productId);
        if (existingProductIndex !== -1) {
            carts[cartIndex].products[existingProductIndex].quantity += quantity;
        } else {
            carts[cartIndex].products.push({ id: productId, quantity });
        }

        fs.writeFile(CARTS_FILE, JSON.stringify(carts), err => {
            if (err) {
                console.error(err);
                res.status(500).send('Error interno del servidor');
                return;
            }
            res.status(201).send('Producto agregado al carrito correctamente');
        });
    });
});

module.exports = router;
