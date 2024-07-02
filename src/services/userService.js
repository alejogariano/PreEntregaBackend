import {  findUserById, updateUser, deleteUserById, deleteCartById, findUserByEmail, createUser, createSuperadmin, createAdmin } from '../dao/userData.js'
import Cart from '../models/cartModel.js'

export const updateProfile = async (userId, profileData, file) => {
    const { first_name, last_name, age } = profileData

    try {
        const user = await findUserById(userId)

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        user.first_name = first_name || user.first_name
        user.last_name = last_name || user.last_name
        user.age = age || user.age

        if (file) {
            user.profile_image = `/uploads/${file.filename}`
        }

        await updateUser(user)

        return user
    } catch (error) {
        throw new Error('Error al actualizar el perfil')
    }
}

export const deleteUser = async (userId) => {
    try {
        const user = await findUserById(userId)

        if (!user) {
            throw new Error('Usuario no encontrado')
        }

        await deleteCartById(user.cart)
        await deleteUserById(userId)

        return user
    } catch (error) {
        throw new Error('Error al eliminar el perfil')
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

export const registerUser = async (userData) => {
    const { first_name, last_name, email, age, password, password2 } = userData

    if (password !== password2) {
        throw new Error('Las contraseñas no coinciden.')
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
        throw new Error('El email ya está en uso.')
    }

    const newUser = await createUser({ first_name, last_name, email, age, password })
    const newCart = new Cart()
    await newCart.save()
    newUser.cart = newCart._id
    await newUser.save()

    return newUser
}

export const initializeAdmins = async () => {
    /* const superadminEmail = process.env.SUPERADMIN_EMAIL
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD */
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    /* const superadmin = await findUserByEmail(superadminEmail) */
    const admin = await findUserByEmail(adminEmail)

    /* if (!superadmin) {
        await createSuperadmin({
            first_name: 'SuperAdmin',
            email: superadminEmail,
            password: superAdminPassword,
            role: 'superadmin'
        })
        console.log('Superadmin user created.')
    } */

    if (!admin) {
        await createAdmin({
            first_name: 'Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        })
        console.log('Admin user created.')
    }
}