import passport from 'passport'
import dotenv from 'dotenv'
import {
    updateProfile as updateProfileService,
    deleteUser as deleteUserService,
    logoutUser as logoutUserService,
    sendMessageUser as sendMessageUserService,
    registerUser,
    initializeAdmins
} from '../services/userService.js'

dotenv.config()

export const logoutUser = async (req, res) => {
    try {
        await logoutUserService(req)
        res.redirect('/?success=Cierre de sesión exitoso.')
    } catch (error) {
        console.error('Error al cerrar sesión:', error)
        res.redirect('/?error=Error al cerrar sesión.')
    }
}

export const updateProfile = async (req, res) => {
    const userId = req.params.uid
    const profileData = req.body
    const file = req.file

    try {
        await updateProfileService(userId, profileData, file)
        res.redirect('/profile?success=Perfil actualizado correctamente.')
    } catch (error) {
        console.error('Error al actualizar el perfil:', error)
        res.redirect('/profile?error=' + encodeURIComponent(error.message))
    }
}

export const deleteUser = async (req, res) => {
    const userId = req.params.uid

    try {
        await deleteUserService(userId)
        await logoutUserService(req)
        res.status(200).json({ message: 'Perfil eliminado correctamente.' })
    } catch (error) {
        console.error('Error al eliminar el perfil:', error)
        res.status(500).json({ error: 'Error al eliminar el perfil.' })
    }
}

export const sendMessageUser = async (req, res) => {
    const { message, userId } = req.body

    try {
        await sendMessageUserService(userId, message)
        res.status(200).json({ message: 'Mensaje enviado correctamente.' })
    } catch (error) {
        console.error('Error al enviar mensaje:', error)
        res.status(500).json({ error: 'Error al enviar mensaje.' })
    }
}

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
            if (user.role === 'admin') {
                return res.redirect('/adminDashboard')
            } else {
                return res.redirect('/products?success=' + encodeURIComponent('Bienvenido, ' + user.first_name))
            }
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