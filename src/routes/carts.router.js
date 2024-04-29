const express = require('express');
const CartManager = require('../models/CartManager');

const router = express.Router();
const cartManager = new CartManager('data/cart.json');

router.post('/', async (req, res) => {
    try {
        await cartManager.init();
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        await cartManager.loadCarts();
        const cart = cartManager.carts.find(cart => cart.id === cartId);
        if (!cart) {
            res.status(404).send('Carrito no encontrado');
            return;
        }
        res.json(cart);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = parseInt(req.body.quantity) || 1;
        await cartManager.loadCarts();
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        res.status(201).json(updatedCart);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;

