import express from 'express'
import { authorizeRoles } from '../../middlewares/authMiddleware.js'
import User from '../../models/userModel.js'
import Cart from '../../models/cartModel.js'
import Product from '../../models/productModel.js'
import Message from '../../models/messageModel.js'
import MockingProduct from '../../models/mockingProductsModel.js'

const router = express.Router()

const getPopulatedCart = async (cartId) => {
    try {
        const cart = await Cart.findById(cartId).populate('products.product').lean()
        return cart
    } catch (error) {
        throw new Error('Error al obtener el carrito')
    }
}

router.get('/', async (req, res) => {
    res.render('home', {
        style: 'style.css',
        user: res.locals.user,
        cart: res.locals.cart
    })
})

router.get('/products', authorizeRoles(['user', 'admin', 'premium']), async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId).populate('cart').lean()

        if (!user) {
            return res.status(404).render('products', { error: 'Usuario no encontrado' })
        }

        if (!user.cart) {
            return res.status(404).render('products', { error: 'No se encontró el carrito del usuario' })
        }

        const cartId = user.cart._id
        const cart = await getPopulatedCart(cartId)

        res.render('products', {
            cartId: cartId,
            user: res.locals.user,
            style: 'style.css',
        })
    } catch (error) {
        console.error('Error al obtener el carrito:', error)
        res.status(500).render('products', { error: error.message })
    }
})

router.get('/products/:pid', authorizeRoles(['user', 'admin', 'premium']), async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId).populate('cart').lean()

        const cartId = user.cart._id

        const productId = req.params.pid
        const product = await Product.findById(productId)
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric' 
        }
    
        product.formattedUpdatedAt = new Intl.DateTimeFormat('es-AR', options).format(new Date(product.updatedAt))

        res.render('viewDetailProduct', {
            product,
            cartId: cartId,
            style: 'style.css',
            user: res.locals.user
        })
    } catch (error) {
        console.error('Error al obtener el producto:', error)
        res.status(500).render('viewDetailProduct', { error: error.message })
    }
})

router.get('/products/category/:category', authorizeRoles(['user', 'premium']), async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId).populate('cart').lean()
        
        const cartId = user.cart._id

        const category = req.params.category

        const products = await Product.find({ category }).lean()

        res.render('productsByCategory', {
            category,
            products,
            cartId,
            user: res.locals.user,
            style: 'style.css',
        })
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error)
        res.status(500).send('Error al obtener productos por categoría')
    }
})

router.get('/carts/:cid', authorizeRoles(['user', 'premium']), async (req, res) => {
    const cartId = req.params.cid || res.locals.cartId
    try {
        const cart = await getPopulatedCart(cartId)

        res.render('cart', {
            cart: cart,
            style: 'style.css',
            user: res.locals.user
        })
    } catch (error) {
        console.error('Error al obtener el carrito:', error)
        res.status(500).render('cart', { error: error.message })
    }
})

router.get('/profile', authorizeRoles(['user', 'premium']), async (req, res) => {

    const user = res.locals.user
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric' 
    }

    user.formattedCreatedAt = new Intl.DateTimeFormat('es-AR', options).format(new Date(user.createdAt))
    user.formattedUpdatedAt = new Intl.DateTimeFormat('es-AR', options).format(new Date(user.updatedAt))

    res.render('profile', {
        style: 'style.css',
        user: res.locals.user
    })
})

router.get('/profile/:uid', authorizeRoles(['user', 'premium']), async (req, res) => {
    res.render('uploadProfile', {
        style: 'style.css',
        user: res.locals.user
    })
})

router.get('/:cid/purchase', authorizeRoles(['user', 'premium']), async (req, res) => {
    try {
        const cartId = req.params.cid
        const cart = await getPopulatedCart(cartId)

        res.render('purchase', {
            cart,
            style: 'style.css',
            user: res.locals.user
        })
    } catch (error) {
        console.error('Error al obtener el carrito:', error)
        res.status(500).render('purchase', { error: error.message })
    }
})

router.get('/chat', authorizeRoles(['user', 'premium', 'admin']), async (req, res) => {
    try {
        const messages = await Message.find().populate('user').populate('comments.user')
        res.render('chat', {
            user: res.locals.user,
            messages,
            style: 'style.css'
        })
    } catch (error) {
        res.status(500).send('Error al obtener los mensajes del chat')
    }
})

router.get('/purchases', authorizeRoles(['user', 'premium']), async (req, res) => {
    const user = req.user
    try {
        const populatedUser = await User.findById(user._id).populate({
            path: 'purchases',
            populate: {
                path: 'products.product',
                model: 'Product'
            }
        })
        res.render('userPurchases', {
            style: 'style.css',
            user: res.locals.user,
            purchases: populatedUser.purchases
        })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }    
})

router.get('/adminDashboard', authorizeRoles(['admin']), async (req, res) => {
    res.render('adminDashboard', {
        style: 'style.css',
        user: res.locals.user
    })
})

router.get('/adminViewAllProducts', authorizeRoles(['admin', 'premium']), async (req, res) => {
    try {
        const user = req.user
        let products

        if (user.role === 'admin') {
            products = await Product.find().lean()
        } else if (user.role === 'premium') {
            products = await Product.find({ owner: user.email })
        }

        res.render('adminViewAllProducts', {
            user,
            products,
            style: 'style.css'
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al obtener los productos')
    }
})

router.get('/adminAddProduct', authorizeRoles(['premium', 'admin']), (req, res) => {
    res.render('adminAddProduct',{
        user: res.locals.user,
        style:'style.css'
    })
})

router.post('/adminAddProduct', authorizeRoles(['premium', 'admin']), async (req, res) => {
    try {
        let { name, description, price, category, availability, stock, thumbnail } = req.body

        if (!name || !description || !price || !category || !availability || !stock || !thumbnail) {
            return res.status(400).json({ error: 'Faltan parámetros' })
        }

        console.log(req.user.role)
        let owner = req.user.role === 'admin' ? 'admin' : req.user.email
        console.log(owner)

        let newProduct = await Product.create({
            name,
            description,
            price,
            category,
            availability,
            stock,
            thumbnail,
            owner
        })

        res.redirect('/adminViewAllProducts')
    } catch (error) {
        console.error('Error al agregar un nuevo producto:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.get('/adminUpdateProduct/:pid', authorizeRoles(['premium', 'admin']), async (req, res) => {
    try {
        const productById = await Product.findByIdAndUpdate(req.params.pid).lean()
        res.render('adminUpdateProduct', {
            productById,
            user: res.locals.user,
            style:'style.css'
        })
    } catch (error) {
        console.log(error.message)
    }
})

router.post('/adminUpdateProduct/:pid', authorizeRoles(['premium', 'admin']), async (req, res) => {
    try {
        let { pid } = req.params
        await Product.findByIdAndUpdate(pid, req.body)
        res.redirect('/adminViewAllProducts')
    } catch (error) {
        console.error('Error al actualizar el producto:', error)
        res.status(500).render('error', { message: 'Error al actualizar el producto.' })
    }
})

router.delete('/adminDeleteProduct/:pid', authorizeRoles(['premium', 'admin']), async (req, res) => {
    let { pid } = req.params
    let result = await Product.deleteOne({ _id: pid })
    res.send({ result: "success", payload: result })
})

router.get('/adminDeleteProduct/:pid', authorizeRoles(['premium', 'admin']), async (req, res) => {
    try {
        const { pid } = req.params
        await Product.findByIdAndDelete(pid)
        
        res.redirect('/adminViewAllProducts')
    } catch (error) {
        console.error('Error al eliminar el producto:', error)
        res.status(500).render('error', { message: 'Error al eliminar el producto.' })
    }
})

router.get('/login', async (req, res) => {
    res.render('login', {
        style: 'style.css'
    })
})

router.get('/register', async (req, res) => {
    res.render('register', {
        style: 'style.css'
    })
})

router.get('/mockingProducts', async (req, res) => {
    const products = await MockingProduct.find()
    res.render('mockingProducts', {
        style: 'style.css',
        products
    })
})

router.get('/mockingProducts/create', async (req, res) => {
    res.render('createMockingProduct', {
        style: 'style.css'
    })
})

router.get('/loggerTestView', (req, res) => {
    res.render('loggerTestView', {
        style: 'style.css'
    })
})

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {
        style: 'style.css'
    })
})

router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params
    let expired = false

    try {
        jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        expired = true
    }

    res.render('reset-password', {
        token,
        expired,
        style: 'style.css'
    })
})

export default router