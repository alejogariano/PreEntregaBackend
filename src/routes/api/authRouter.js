import express from 'express'
import {
    registerUserHandler,
    loginUserHandler,
    githubAuth,
    githubCallback,
    googleAuth,
    googleCallback
} from '../../controllers/authController.js'

const router = express.Router()

router.post('/login', loginUserHandler)
router.post('/register', registerUserHandler)

router.get('/auth/github', githubAuth)
router.get('/auth/github/callback', githubCallback)

router.get('/auth/google', googleAuth)
router.get('/auth/google/callback', googleCallback)

export default router