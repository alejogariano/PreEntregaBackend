import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const ratingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
})

const commentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    availability: { type: Boolean, default: true },
    stock: { type: Number, default: 0, min: [0, 'El stock no puede ser negativo'] },
    sales: { type: Number, default: 0 },
    discount: { type: Number, default: 0, min: [0, 'El descuento no puede ser negativo'], max: [100, 'El descuento no puede ser mayor al 100%'] },
    thumbnail: { type: String },
    owner: { type: mongoose.Schema.Types.String, ref: 'User', default: 'admin' },
    ratings: [ratingSchema],
    comments: [commentSchema],
}, { timestamps: true })

productSchema.plugin(mongoosePaginate)

const Product = mongoose.model('Product', productSchema)

export default Product