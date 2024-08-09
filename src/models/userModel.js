import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    first_name: String,
    last_name: String,
    profile_image: { type: String, default: '/uploads/default.jpg' },
    age: Number,
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    role: { type: String, default: 'user', enum: ['user', 'admin', 'premium'] },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password') && user.password) {
        user.password = await bcrypt.hash(user.password, 10)
    }
    next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User