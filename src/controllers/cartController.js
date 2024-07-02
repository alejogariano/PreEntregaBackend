import {
    getCartById,
    addProductToCart as addProductToCartService,
    updateProductQuantity as updateProductQuantityService,
    removeProductFromCart as removeProductFromCartService,
    clearCartProducts as clearCartProductsService
} from '../services/cartService.js'

//http://localhost:8080/api/carts/:cid
export const getCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await getCartById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        res.json({ status: 'success', message: 'Carrito', data: cart });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}

//http://localhost:8080/api/carts/:cid/products/:pid
export const addProductToCart = async (req, res) => {
    const { cid, pid } = req.params;
    const { cantidad } = req.body;

    try {
        await addProductToCartService(cid, pid, cantidad);
        res.json({ status: 'success', message: 'Producto agregado al carrito' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}

//http://localhost:8080/api/carts/:cid/products/:pid
export const updateProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        await updateProductQuantityService(cid, pid, quantity);
        res.json({ status: 'success', message: 'Cantidad actualizada' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}

//http://localhost:8080/api/carts/:cid/products/:pid
export const deleteProductFromCart = async (req, res) => {
    const { cid, pid } = req.params;

    try {
        await removeProductFromCartService(cid, pid);
        res.json({ status: 'success', message: 'Producto eliminado del carrito' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}

//http://localhost:8080/api/carts/:cid
export const deleteAllProductsFromCart = async (req, res) => {
    const { cid } = req.params;

    try {
        await clearCartProductsService(cid);
        res.json({ status: 'success', message: 'Todos los productos eliminados del carrito' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
}