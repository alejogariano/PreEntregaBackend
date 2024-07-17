import twilio from 'twilio'
import dotenv from 'dotenv'

dotenv.config()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = twilio(accountSid, authToken)

export const sendSMS = async (to, body) => {
    try {
        const message = await client.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        })
        console.log(`Message sent to ${to}: ${message.sid}`)
        return message
    } catch (error) {
        console.error('Error sending message:', error)
        throw error
    }
}