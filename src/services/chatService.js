import * as messageRepository from '../repositories/messageRepository.js'

export const getAllMessages = async () => {
    return await messageRepository.getAllMessages()
}

export const getMessageById = async (id) => {
    return await messageRepository.getMessageById(id)
}

export const sendMessage = async (user, content) => {
    const message = {
        user,
        content
    }
    return await messageRepository.saveMessage(message)
}

export const editMessage = async (messageId, content) => {
    return await messageRepository.updateMessage(messageId, content)
}

export const deleteMessage = async (messageId) => {
    return await messageRepository.deleteMessage(messageId)
}

export const addComment = async (messageId, user, content) => {
    const comment = {
        user,
        content
    }
    return await messageRepository.addCommentToMessage(messageId, comment)
}