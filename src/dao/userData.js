import User from '../models/userModel.js'
import Cart from '../models/cartModel.js'

export const findUserById = async (userId) => {
    return await User.findById(userId)
}

export const updateUser = async (user) => {
    return await user.save()
}

export const deleteUserById = async (userId) => {
    return await User.findByIdAndDelete(userId)
}

export const deleteCartById = async (cartId) => {
    return await Cart.findByIdAndDelete(cartId)
}

export const findUserByEmail = async (email) => {
    return await User.findOne({ email })
}

export const createUser = async (userData) => {
    const newUser = new User(userData)
    return await newUser.save()
}

export const createSuperadmin = async (superadminData) => {
    const newSuperadmin = new User(superadminData)
    return await newSuperadmin.save()
}

export const createAdmin = async (adminData) => {
    const newAdmin = new User(adminData)
    return await newAdmin.save()
}