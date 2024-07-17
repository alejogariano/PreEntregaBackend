import express from 'express'
import {
    addProduct,
} from '../../controllers/adminController.js'

const router = express.Router()

router.get('/addProduct', addProduct)