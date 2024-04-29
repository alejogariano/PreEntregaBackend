const express = require('express');
const CartManager = require('../models/CartManager');

const router = express.Router();
const cartManager = new CartManager('data/carrito.json');

router.post('/', async (req, res) => {
    try {
        await cartManager.init();
        const newCart = await cartManager.createCart();
        res.status(201).send('Carrito creado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/:cid', async (req, res) => {
    try {
        await cartManager.init();
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);
        res.json(cart.products);
    } catch (error) {
        console.error(error);
        if (error.message === 'Carrito no encontrado.') {
            res.status(404).send('Carrito no encontrado');
        } else {
            res.status(500).send('Error interno del servidor');
        }
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        await cartManager.init();
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = parseInt(req.body.quantity) || 1;
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        res.status(201).send('Producto agregado al carrito correctamente');
    } catch (error) {
        console.error(error);
        if (error.message === 'Carrito no encontrado.') {
            res.status(404).send('Carrito no encontrado');
        } else {
            res.status(500).send('Error interno del servidor');
        }
    }
});

module.exports = router;