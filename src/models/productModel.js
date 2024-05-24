import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    availability: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.plugin(mongoosePaginate)

const Product = mongoose.model('Product', productSchema);

export default Product;