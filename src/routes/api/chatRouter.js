import express from 'express'
import {
    sendMessageUser,
    editMessage,
    deleteMessage,
    addComment
} from '../../controllers/chatController.js'

const router = express.Router()

router.post('/', sendMessageUser)
router.post('/edit/:messageId', editMessage)
router.get('/delete/:messageId', deleteMessage)
router.post('/comment/:messageId', addComment)

export default router