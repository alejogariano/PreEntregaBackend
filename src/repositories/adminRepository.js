import Product from "../models/productModel"

export default {    
    addProduct: async (name, description, price, stock, status, category, thumbnail) => {
        return await Product.create({ name, description, price, stock, status, category, thumbnail })
    }
}