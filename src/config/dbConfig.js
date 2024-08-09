import mongoose from 'mongoose'
import dotenv from 'dotenv'
/* import { initializeAdmins } from '../services/userService.js' */

dotenv.config()

const mongoURL = process.env.MONGODB_URL

mongoose.connect(mongoURL)

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    /* initializeAdmins() */
    console.log('Connected to MongoDB')
})

export default db