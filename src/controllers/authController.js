import User from '../models/userModel.js';
import Cart from '../models/cartModel.js';
import passport from 'passport';

// Función para iniciar sesión
export const loginUser = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/login');
        }
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }

            try {
                // Verificar si el usuario tiene un carrito asociado
                if (!user.userCarts.length) {
                    // Si no tiene un carrito asociado, crear uno nuevo
                    const newCart = new Cart();
                    await newCart.save();
                    // Asociar el nuevo carrito al usuario
                    user.userCarts.push(newCart._id);
                    await user.save();
                }
                
                req.flash('success', 'Inicio de sesión exitoso.');
                res.redirect('/products');
            } catch (error) {
                console.error('Error al asociar un carrito al usuario:', error);
                req.flash('error', 'Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.');
                res.redirect('/login');
            }
        });
    })(req, res, next);
};

export const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
};

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'El email ya está en uso.');
            return res.redirect('/register');
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        req.flash('success', 'Usuario registrado correctamente. Por favor, inicie sesión.');
        res.redirect('/login');
    } catch (error) {
        req.flash('error', 'Ocurrió un error al registrar el usuario. Por favor, intenta nuevamente.');
        res.redirect('/register');
    }
};

export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).json({ status: 'error', message: 'No estás autenticado' });
    }
};