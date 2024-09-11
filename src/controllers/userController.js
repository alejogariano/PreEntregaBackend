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
import transporter from '../config/emailConfig.js'

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