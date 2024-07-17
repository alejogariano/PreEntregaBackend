class CartDto {
    constructor(cart) {
        this.id = cart._id;
        this.products = cart.products.map(product => ({
            id: product.product._id,
            name: product.product.name,
            price: product.product.price,
            quantity: product.quantity
        }));
    }
}

export default CartDto;