import Cart from '../../models/cartModel.js'

class CartDaoMongo {
    async findById(id) {
        return await Cart.findById(id).populate('products.product')
    }

    async createCart(cart) {
        return await Cart.create(cart)
    }

    async updateCart(cart) {
        return await cart.save()
    }

    async deleteCartById(id) {
        return await Cart.findByIdAndDelete(id)
    }
}

export default CartDaoMongo