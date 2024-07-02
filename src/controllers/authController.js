import passport from 'passport'
import dotenv from 'dotenv'
import { registerUser, initializeAdmins } from '../services/userService.js'

dotenv.config()

export const registerUserHandler = async (req, res) => {
    const { first_name, last_name, email, age, password, password2 } = req.body
    const userData = { first_name, last_name, email, age, password, password2 }

    try {
        await registerUser(userData)
        return res.redirect('/login?success=Usuario registrado correctamente. Por favor, inicie sesión.')
    } catch (error) {
        console.error('Error al registrar el usuario:', error)
        return res.redirect('/register?error=' + encodeURIComponent(error.message))
    }
}

export const loginUserHandler = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.redirect('/login?error=' + encodeURIComponent(info.message))
        }
        req.logIn(user, async (err) => {
            if (err) {
                return next(err)
            }
            return res.redirect('/products')
        })
    })(req, res, next)
}

export const githubAuth = passport.authenticate('github', { scope: ['user:email'] })
export const githubCallback = (req, res, next) => {
    passport.authenticate('github', {
        failureRedirect: '/login?error=Autenticación con GitHub fallida.',
        successRedirect: '/products'
    })(req, res, next)
}

export const googleAuth = passport.authenticate('google', { scope: ['email'] })
export const googleCallback = (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: '/login?error=Autenticación con Google fallida.',
        successRedirect: '/products'
    })(req, res, next)
}

export const initializeAdminsHandler = async () => {
    await initializeAdmins()
}