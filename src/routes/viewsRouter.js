import { Router } from 'express';
import { isAuthenticated } from '../controllers/authController.js';
import User from '../models/userModel.js'
import Cart from '../models/cartModel.js'

const router = Router();

router.get('/', async (req, res) => {
    res.render('home', {
        style: 'style.css',
        user: res.locals.user // Pasar el usuario autenticado a la vista
    });
});

router.get('/products', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user._id; // Obtener el ID del usuario logueado
        const user = await User.findById(userId).populate('userCarts').lean();
        
        // Verificar si el usuario tiene un carrito
        if (!user.userCarts || user.userCarts.length === 0) {
            return res.status(404).render('products', { error: 'No se encontró el carrito del usuario' });
        }

        // Obtener el primer carrito del usuario
        const cartId = user.userCarts[0]._id;
        const cart = await Cart.findById(cartId).populate('products.product').lean();

        res.render('products', {
            cartId: cartId,
            style: 'style.css',
            user: res.locals.user
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).render('products', { error: 'Error al obtener el carrito' });
    }
})

router.get('/carts', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user._id; // Obtener el ID del usuario logueado
        const user = await User.findById(userId).populate('userCarts').lean();
        
        // Verificar si el usuario tiene un carrito
        if (!user.userCarts || user.userCarts.length === 0) {
            return res.status(404).render('cart', { error: 'No se encontró el carrito del usuario' });
        }

        // Obtener el primer carrito del usuario
        const cartId = user.userCarts[0]._id;
        const cart = await Cart.findById(cartId).populate('products.product').lean();

        res.render('cart', {
            cart: cart,
            style: 'style.css',
            user: res.locals.user
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).render('cart', { error: 'Error al obtener el carrito' });
    }
})


router.get ('/login', async (req, res) => {
    res.render('login', {
        style: 'style.css',
        messages: req.flash('error')
    });
});

router.get ('/register', async (req, res) => {
    res.render('register', {
        style: 'style.css',
        messages: req.flash('error')
    });
})

export default router;