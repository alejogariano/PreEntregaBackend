import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import session from 'express-session';
import flash from 'express-flash';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/productsRouter.js';
import cartsRouter from './routes/cartsRouter.js';
import authRouter from './routes/authRouter.js'
import viewsRouter from './routes/viewsRouter.js'
import passport from './passport-config.js';

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user
    if (res.locals.user) {
        res.locals.user = res.locals.user.toJSON();
    }
    next();
});

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);
app.use('/', authRouter);

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});