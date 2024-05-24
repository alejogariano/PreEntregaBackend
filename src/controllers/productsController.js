import Product from '../models/productModel.js';

export const getProducts = async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query, categories } = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort } : {}
        };

        let filter = {};
        if (query) {
            filter.name = { $regex: query, $options: 'i' }; // Case insensitive search
        }
        if (categories) {
            filter.category = { $in: categories.split(',') };
        }

        // Verificar que page y limit sean números válidos
        if (isNaN(options.page) || options.page < 1 || isNaN(options.limit) || options.limit < 1) {
            return res.status(400).json({ status: 'error', message: 'Número de página o límite inválido' });
        }

        const products = await Product.paginate(filter, options);

        // Verificar que la página solicitada no exceda el número total de páginas
        if (options.page > products.totalPages) {
            return res.status(404).json({ status: 'error', message: 'Página no encontrada' });
        }

        res.json({
            status: 'success',
            payload: products.docs,
            totalPages: products.totalPages,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevPage: products.prevPage,
            nextPage: products.nextPage
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json({ status: 'success', categories });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};