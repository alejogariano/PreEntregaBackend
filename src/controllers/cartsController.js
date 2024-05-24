import Cart from '../models/cartModel.js'
import Product from '../models/productModel.js'

export const getCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findById(cid).populate('products.product').lean()
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        res.render('cart', {
            cart: cart,
            style: 'style.css',
            user: res.locals.user
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const addProductToCart = async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        if (productIndex > -1) {
            // Si el producto ya está en el carrito, actualiza la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Si el producto no está en el carrito, agrégalo
            cart.products.push({ product: pid, quantity: 1 });
        }

        await cart.save();
        res.json({ status: 'success', message: 'Producto agregado al carrito' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const deleteProductFromCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        await Cart.updateOne({ _id: cid }, { $pull: { products: { product: pid } } });
        res.json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const updateProductQuantity = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        await Cart.updateOne({ _id: cid, 'products.product': pid }, { $set: { 'products.$.quantity': quantity } });
        res.json({ status: 'success', message: 'Cantidad actualizada' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

export const deleteAllProductsFromCart = async (req, res) => {
    try {
        const { cid } = req.params;
        await Cart.updateOne({ _id: cid }, { $set: { products: [] } });
        res.json({ status: 'success', message: 'Todos los productos eliminados del carrito' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};