import Cart from '../models/cartModel.js'

export const updateCart = async (cartId, update) => {
    return await Cart.findByIdAndUpdate(cartId, update, { new: true })
}

export const deleteProductFromCart = async (cartId, productId) => {
    return await Cart.updateOne({ _id: cartId }, { $pull: { products: { product: productId } } })
}

export const clearCart = async (cartId) => {
    return await Cart.updateOne({ _id: cartId }, { $set: { products: [] } })
}