import passport from 'passport'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
    updateProfile as updateProfileService,
    deleteUser as deleteUserService,
    logoutUser as logoutUserService,
    sendMessageUser as sendMessageUserService,
    registerUser as registerUserService
} from '../services/userService.js'
import User from '../models/userModel.js'
import Cart from '../models/cartModel.js'
import Product from '../models/productModel.js'
import transporter from '../config/emailConfigs.js'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET

export const logoutUser = async (req, res) => {
    try {
        const user = req.user
        user.last_connection = new Date()
        await user.save()
        
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

export const updateDocumentsProfile = async (req, res) => {
    const userId = req.params.uid
    const files = req.files

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send('Usuario no encontrado.')
        }

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).send('No se han subido documentos.')
        }

        const documentTypes = {
            identification: 'documents[identification]',
            proofOfAddress: 'documents[proofOfAddress]',
            accountStatement: 'documents[accountStatement]'
        }

        for (const [docType, fieldName] of Object.entries(documentTypes)) {
            if (files[fieldName] && files[fieldName][0]) {
                const documentPath = `/uploads/documents/${files[fieldName][0].filename}`
                const existingDocIndex = user.documents.findIndex(doc => doc.name === docType)
                if (existingDocIndex >= 0) {
                    user.documents[existingDocIndex] = { name: docType, reference: documentPath }
                } else {
                    user.documents.push({ name: docType, reference: documentPath })
                }
            }
        }

        const requiredDocuments = ['identification', 'proofOfAddress', 'accountStatement']
        const userDocuments = user.documents.map(doc => doc.name)

        const hasAllDocuments = requiredDocuments.every(doc => userDocuments.includes(doc))
        if (hasAllDocuments) {
            user.role = 'premium'
        }

        await user.save()

        if (hasAllDocuments) {
            res.redirect('/profile?success=Documentos actualizados y usuario promovido a premium correctamente.')
        } else {
            res.redirect('/profile?success=Documentos actualizados. Complete la carga de documentos para ser promovido a premium.')
        }
    } catch (error) {
        console.error('Error al actualizar los documentos:', error)
        res.status(500).send('Error al actualizar los documentos: ' + error.message)
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

export const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER_NODEMAILER,
            to,
            subject,
            text,
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error(`Error al enviar correo a ${to}:`, error)
    }
}

export const adminDeleteUser = async (req, res) => {
    try {
        const userId = req.params.uid
        const deletedUser = await User.findById(userId)

        if (!deletedUser) {
            return res.status(404).send({ message: 'Usuario no encontrado' })
        }

        if (deletedUser.role !== 'admin') {
            await deleteUserService(userId)
            const productsToUpdate = await Product.find({ owner: deletedUser.email })
            if (productsToUpdate.length > 0) {
                const updateResult = await Product.updateMany(
                    { owner: deletedUser.email },
                    { $set: { stock: 0 } }
                )
            } else {
                console.log('No se encontraron productos para actualizar')
            }

            if (deletedUser.email) {
                await sendEmail(
                    deletedUser.email,
                    'Cuenta eliminada',
                    'Tu cuenta ha sido eliminada por un administrador.'
                )
            } else {
                console.error('Usuario eliminado no tiene correo registrado')
            }
        }

        await User.findByIdAndDelete(userId)
        res.status(200).send({ message: 'Usuario y datos asociados eliminados' })
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: 'Error al eliminar el usuario y sus datos asociados' })
    }
}

//const thresholdDate = new Date(now.getTime() - 30 * 60 * 1000) // 30 minutos
//const thresholdDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 días
//const thresholdDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 días
export const deleteInactiveUsers = async (req, res) => {
    try {
        const now = new Date()
        const thresholdDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 días

        const inactiveUsers = await User.find({ last_connection: { $lt: thresholdDate } })

        for (let user of inactiveUsers) {
            if (user.role === 'admin') continue

            if (user.role === 'premium') {
                user.role = 'user'
                await user.save()
                await sendEmail(user.email, 'Cambio de rol por inactividad', 'Tu cuenta ha sido degradada a usuario común. Inicia sesión para evitar perder tu cuenta.')
            } else if (user.role === 'user') {
                await Cart.deleteOne({ userId: user.cart._id })
                await Product.updateMany({ owner: user.email }, { stock: 0 })
                await sendEmail(user.email, 'Cuenta eliminada por inactividad', 'Tu cuenta ha sido eliminada.')
                await User.deleteOne({ _id: user._id })
            }
        }

        res.status(200).json({ message: 'Usuarios inactivos eliminados.' })
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuarios inactivos.' })
    }
}

export const adminChangeUserRole = async (req, res) => {
    try {
        const userId = req.params.uid
        const newRole = req.body.role

        User.findByIdAndUpdate(userId, { role: newRole }, { new: true })
            .then((updatedUser) => res.redirect('/adminViewAllUsers'))
            .catch((error) => res.status(500).send({ message: 'Error al cambiar el rol del usuario' }))
    } catch (error) {
        console.error(error)
        res.status(500).send('Algo salió mal')
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
        await registerUserService(userData)
        return res.redirect('/login?success=Usuario registrado correctamente. Por favor, inicie sesión.')
    } catch (error) {
        console.error('Error al registrar el usuario:', error)
        return res.redirect('/register?error=' + encodeURIComponent(error.message))
    }
}

export const changeUserRole = async (req, res) => {
    try {
        const userId = req.params.uid
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        user.role = user.role === 'user' ? 'premium' : 'user'
        await user.save()

        res.status(200).json({ message: 'Rol actualizado', role: user.role })
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const githubAuth = passport.authenticate('github', { scope: ['user:email'] })
export const githubCallback = (req, res, next) => {
    passport.authenticate('github', async (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.redirect('/login?error=Autenticación con GitHub fallida.')

        req.logIn(user, async (err) => {
            if (err) return next(err)

            user.last_connection = new Date()
            await user.save()

            return res.redirect('/products')
        })
    })(req, res, next)
}

export const googleAuth = passport.authenticate('google', { scope: ['email'] })
export const googleCallback = (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.redirect('/login?error=Autenticación con Google fallida.')

        req.logIn(user, async (err) => {
            if (err) return next(err)

            user.last_connection = new Date()
            await user.save()

            return res.redirect('/products')
        })
    })(req, res, next)
}

export const loginUserHandler = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.redirect('/login?error=' + encodeURIComponent(info.message))

        req.logIn(user, async (err) => {
            if (err) return next(err)

            user.last_connection = new Date()
            await user.save()

            if (user.role === 'admin') {
                return res.redirect('/adminDashboard')
            } else {
                return res.redirect('/products?success=' + encodeURIComponent('Bienvenido, ' + user.first_name))
            }
        })
    })(req, res, next)
}

export const sendPasswordResetLink = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).send('Usuario no encontrado')
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' })

        const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`
        await transporter.sendMail({
            from: process.env.EMAIL_USER_NODEMAILER,
            to: email,
            subject: 'Restablecer contraseña',
            html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetLink}">Restablecer contraseña</a></p>`,
        })

        res.send('Correo de recuperación enviado')
    } catch (error) {
        console.error('Error al enviar el correo de recuperación:', error)
        res.status(500).send('Error al enviar el correo de recuperación')
    }
}

export const resetPassword = async (req, res) => {
    const { token } = req.params
    const { password, confirmPassword } = req.body

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await User.findById(decoded.userId)
        if (!user) {
            return res.status(404).send('Usuario no encontrado')
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Las contraseñas no coinciden')
        }

        const isSamePassword = await bcrypt.compare(password, user.password)
        if (isSamePassword) {
            return res.status(400).send('No puedes usar la misma contraseña')
        }

        user.password = password
        await user.save()

        res.send('Contraseña restablecida correctamente')
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.redirect('/forgot-password?error=El enlace ha expirado. Solicita uno nuevo.')
        }

        console.error('Error al restablecer la contraseña:', error)
        res.status(500).send('Error al restablecer la contraseña')
    }
}