class ProductDTO {
    constructor({ _id, name, price, category, stock }) {
        this.id = _id
        this.name = name
        this.price = price
        this.category = category
        this.stock = stock
    }
}

export default ProductDTO