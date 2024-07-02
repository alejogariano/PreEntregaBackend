import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
})

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification