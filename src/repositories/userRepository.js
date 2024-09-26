import User from '../models/userModel.js'

const userRepository = {
    getUsers: async () => await User.find(),
    getUserById: async (id) => await User.findById(id),
    updateUser: async (userData) => await User.findByIdAndUpdate(userData._id, userData, { new: true }),
    deleteUser: async (id) => await User.findByIdAndDelete(id),
    getUserByEmail: async (email) => await User.findOne({ email }),
    createUser: async (userData) => await User.create(userData),
    createMessage: async (messageData) => {
        const Message = mongoose.model('Message', new mongoose.Schema({
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            message: String
        }))
        return await Message.create(messageData)
    }
}

export default userRepository