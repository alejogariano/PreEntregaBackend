import { Router } from 'express';
import { getProducts, getCategories } from '../controllers/productsController.js';

const router = Router();

router.get('/', getProducts)
router.get('/categories', getCategories)

export default router;