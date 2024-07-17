import * as chatService from '../services/chatService.js'

export const sendMessageUser = async (req, res) => {
    try {
        const { content } = req.body
        const user = req.user._id
        await chatService.sendMessage(user, content)
        res.redirect('/chat')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al enviar el mensaje')
    }
}

export const editMessage = async (req, res) => {
    try {
        const { content } = req.body
        const messageId = req.params.messageId
        await chatService.editMessage(messageId, content)
        res.redirect('/chat')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al editar el mensaje')
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId
        await chatService.deleteMessage(messageId)
        res.redirect('/chat')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al eliminar el mensaje')
    }
}

export const addComment = async (req, res) => {
    try {
        const { content } = req.body
        const messageId = req.params.messageId
        const user = req.user._id
        await chatService.addComment(messageId, user, content)
        res.redirect('/chat')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al agregar el comentario')
    }
}