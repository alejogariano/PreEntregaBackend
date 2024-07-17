import Cart from '../models/cartModel.js'

export default {
    getCartById: async (id) => await Cart.findById(id).populate('products.product'),
    updateCart: async (cart) => await cart.save(),
    createTicket: async (ticket) => await ticket.save(),
    deleteProductFromCart: async (cid, pid) => await Cart.updateOne({ _id: cid }, { $pull: { products: { product: pid } } }),
    deleteAllProductsFromCart: async (cid) => await Cart.updateOne({ _id: cid }, { $set: { products: [] } }),
}