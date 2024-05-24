import { Router } from 'express';
import {
    getCart,
    deleteProductFromCart,
    updateProductQuantity,
    deleteAllProductsFromCart,
    addProductToCart,
} from '../controllers/cartsController.js';
import { isAuthenticated } from '../controllers/authController.js';

const router = Router();

router.get('/:cid', isAuthenticated, getCart);
router.delete('/:cid/products/:pid', deleteProductFromCart);
router.put('/:cid/products/:pid', updateProductQuantity);
router.post('/:cid/products/:pid', addProductToCart);
router.delete('/:cid', deleteAllProductsFromCart);

export default router;