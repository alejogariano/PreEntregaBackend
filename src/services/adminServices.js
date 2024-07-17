import productRepository from "../repositories/productRepository"

export const addProductService = async (name, description, price, stock, status, category, thumbnail) => {
    return await productRepository.addProduct(name, description, price, stock, status, category, thumbnail)
}