import userRepository from '../repositories/userRepository.js'
import UserDTO from '../dto/userDTO.js'
import Cart from '../models/cartModel.js'

export const updateProfile = async (userId, profileData, file) => {
    try {
        const user = await userRepository.getUserById(userId)

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        user.first_name = profileData.first_name || user.first_name
        user.last_name = profileData.last_name || user.last_name
        user.age = profileData.age || user.age

        if (file) {
            user.profile_image = `/uploads/${file.filename}`
        }

        await userRepository.updateUser(user)
        return new UserDTO(user)
    } catch (error) {
        throw new Error('Error al actualizar el perfil: ' + error.message)
    }
}

export const deleteUser = async (userId) => {
    try {
        const user = await userRepository.getUserById(userId)

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        await Cart.findByIdAndDelete(user.cart)
        await userRepository.deleteUser(userId)
        return new UserDTO(user)
    } catch (error) {
        throw new Error('Error al eliminar el perfil: ' + error.message)
    }
}

export const logoutUser = (req) => {
    return new Promise((resolve, reject) => {
        req.logout((err) => {
            if (err) {
                reject(new Error('Error al cerrar sesión'))
            } else {
                resolve()
            }
        })
    })
}

export const sendMessageUser = async (userId, message) => {
    try {
        const user = await userRepository.getUserById(userId)

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        const newMessage = await userRepository.createMessage({ user: userId, message })
        user.messages.push(newMessage._id)
        await user.save()

        return newMessage
    } catch (error) {
        throw new Error('Error al enviar mensaje: ' + error.message)
    }
}

export const registerUser = async (userData) => {
    try {
        if (userData.password !== userData.password2) {
            throw new Error('Las contraseñas no coinciden.')
        }

        const existingUser = await userRepository.getUserByEmail(userData.email)

        if (existingUser) {
            throw new Error('El email ya está en uso.')
        }

        const newUser = await userRepository.createUser(userData)
        const newCart = new Cart()
        await newCart.save()
        newUser.cart = newCart._id
        await newUser.save()

        return new UserDTO(newUser)
    } catch (error) {
        throw new Error('Error al registrar el usuario: ' + error.message)
    }
}

/* export const initializeAdmins = async () => {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    const admin = await userRepository.getUserByEmail(adminEmail)

    if (!admin) {
        await userRepository.createAdmin({
            first_name: 'Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        })
        console.log('Admin user created.')
    }
} */