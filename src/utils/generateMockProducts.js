import { faker } from '@faker-js/faker'

function generateMockProducts(count = 100) {
    const products = []
    for (let i = 0; i < count; i++) {
        products.push({
            _id: faker.string.uuid(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.commerce.price(),
            category: faker.commerce.department(),
            stock: faker.number.int({ min: 10, max: 100 }),
            thumbnail: faker.image.url(),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        })
    }
    return products
}

export { generateMockProducts }