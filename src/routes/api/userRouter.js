import express from 'express'
import {
    logoutUser,
    updateProfile,
    updateDocumentsProfile,
    deleteUser,
    sendMessageUser,
    loginUserHandler,
    registerUserHandler,
    sendPasswordResetLink,
    resetPassword,
    changeUserRole,
    githubAuth,
    githubCallback,
    googleAuth,
    googleCallback
} from '../../controllers/userController.js'
import upload from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

router.post('/logout', logoutUser)
router.post('/profile/:uid', upload.single('profile'), updateProfile)
router.post('/profile/:uid/documents', upload.fields([
    { name: 'documents[identification]', maxCount: 1 },
    { name: 'documents[proofOfAddress]', maxCount: 1 },
    { name: 'documents[accountStatement]', maxCount: 1 }
]), updateDocumentsProfile)
router.delete('/profile/:uid', deleteUser)
router.post('/chat', sendMessageUser)

router.post('/login', loginUserHandler)
router.post('/register', registerUserHandler)
router.post('/forgot-password', sendPasswordResetLink)
router.post('/reset-password/:token', resetPassword)
router.put('/api/users/premium/:uid', changeUserRole)

router.get('/auth/github', githubAuth)
router.get('/auth/github/callback', githubCallback)

router.get('/auth/google', googleAuth)
router.get('/auth/google/callback', googleCallback)

export default router