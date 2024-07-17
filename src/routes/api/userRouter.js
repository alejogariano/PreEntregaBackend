import express from 'express'
import {
    logoutUser,
    updateProfile,
    deleteUser,
    sendMessageUser
} from '../../controllers/userController.js'
import upload from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

router.post('/logout', logoutUser)
router.post('/profile/:uid', upload.single('profileImage'), updateProfile)
router.delete('/profile/:uid', deleteUser)
router.post('/chat', sendMessageUser)

export default router