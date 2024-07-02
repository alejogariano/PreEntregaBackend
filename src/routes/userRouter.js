import express from 'express'
import { logoutUser, updateProfile, deleteUser } from '../controllers/userController.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.post('/logout', logoutUser)
router.post('/profile/:uid', upload.single('profileImage'), updateProfile)
router.delete('/profile/:uid', deleteUser)

export default router