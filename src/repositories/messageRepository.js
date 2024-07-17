import Message from '../models/messageModel.js'

export const getAllMessages = async () => {
    return await Message.find().populate('user').populate('comments.user')
}

export const getMessageById = async (id) => {
    return await Message.findById(id).populate('user').populate('comments.user')
}

export const saveMessage = async (message) => {
    const newMessage = new Message(message)
    return await newMessage.save()
}

export const updateMessage = async (messageId, content) => {
    return await Message.findByIdAndUpdate(messageId, { content }, { new: true })
}

export const deleteMessage = async (messageId) => {
    return await Message.findByIdAndDelete(messageId)
}

export const addCommentToMessage = async (messageId, comment) => {
    const message = await Message.findById(messageId)
    if (!message) {
        throw new Error('Mensaje no encontrado')
    }
    message.comments.push(comment)
    await message.save()
    return message
}