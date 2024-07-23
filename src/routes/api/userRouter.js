import express from 'express'
import {
    logoutUser,
    updateProfile,
    deleteUser,
    sendMessageUser,
    registerUserHandler,
    loginUserHandler,
    githubAuth,
    githubCallback,
    googleAuth,
    googleCallback
} from '../../controllers/userController.js'
import upload from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

router.post('/logout', logoutUser)
router.post('/profile/:uid', upload.single('profileImage'), updateProfile)
router.delete('/profile/:uid', deleteUser)
router.post('/chat', sendMessageUser)

router.post('/login', loginUserHandler)
router.post('/register', registerUserHandler)

router.get('/auth/github', githubAuth)
router.get('/auth/github/callback', githubCallback)

router.get('/auth/google', googleAuth)
router.get('/auth/google/callback', googleCallback)

export default router