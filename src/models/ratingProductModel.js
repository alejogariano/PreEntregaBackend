import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    timestamp: { type: Date, default: Date.now }
})

const Rating = mongoose.model('Rating', ratingSchema)

export default Rating