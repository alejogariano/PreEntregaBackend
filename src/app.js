import express from 'express'
import swaggerDocs from './config/swaggerConfig.js'
import dotenv from 'dotenv'
import session from 'express-session'
import mongoose from './config/dbConfig.js'
import passport from 'passport'
import methodOverride from 'method-override'
import MongoStore from 'connect-mongo'
import path from 'path'
import bodyParser from 'body-parser'
import { engine } from 'express-handlebars'
import { createServer } from 'http'
import { fileURLToPath } from 'url'

import productsRouter from './routes/api/productsRouter.js'
import userRouter from './routes/api/userRouter.js'
import cartRouter from './routes/api/cartRouter.js'
import chatRouter from './routes/api/chatRouter.js'
import viewsRouter from './routes/views/viewsRouter.js'
import './config/passportConfig.js'
import handleErrors from './middlewares/errorHandler.js'
import logger from './utils/logger.js'
import loggerRouter from './routes/api/loggerRouter.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)
swaggerDocs(app)

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        ttl: 30 * 60 * 1000 //=30min -------> 7 * 24 * 60 * 60 * 1000 = 7 dias
    }),
    cookie: { 
        secure: false,
        maxAge: 30 * 60 * 1000 //=30min -------> 7 * 24 * 60 * 60 * 1000 = 7 dias
    }
}))

/* app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`)
    next()
}) */

app.use(passport.initialize())
app.use(passport.session())
app.use(handleErrors)
app.use(bodyParser.json())

app.use(methodOverride('_method'))

app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user.toJSON()
        res.locals.cart = req.user.cart
    }
    next()
})

app.engine('handlebars', engine({
    helpers: {
        equals: (a, b) => String(a) === String(b),
        different: (a, b) => String(a) !== String(b),
        or: function() {
            return Array.prototype.slice.call(arguments, 0, -1).some(Boolean)
        },
        calculateSubtotal: (price, quantity) => price * quantity,
        calculateTotal: (products) => {
            return products.reduce((total, product) => {
                return total + (product.product.price * product.quantity)
            }, 0)
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/products', productsRouter)
app.use('/api/carts', cartRouter)
app.use('/api/chat', chatRouter)
app.use('/', userRouter)
app.use('/', viewsRouter)
app.use('/', loggerRouter)

const PORT = process.env.PORT
const LOGGER = process.env.LOGGER_ENV

server.listen(PORT, () => {
    if (LOGGER === 'production') {
        console.log(`Server is in production mode`)
        console.log(`Server is running on http://localhost:${PORT}/login`)
        console.log('Logger is in production mode, running on http://localhost:8080/loggertestview')
        console.log('Swagger is running on http://localhost:8080/api-docs')
    } else {
        console.log(`Server is in development mode`)
        console.log(`Server is running on https://2dapreentregabackend-production.up.railway.app`)
        console.log('Logger is in development mode, running on https://2dapreentregabackend-production.up.railway.app/loggertestview')
        console.log('Swagger is running on https://2dapreentregabackend-production.up.railway.app/api-docs')
    }
})

app.use((err, req, res, next) => {
    logger.error(`${err.message}`)
    res.status(500).send('Algo salió mal!')
})