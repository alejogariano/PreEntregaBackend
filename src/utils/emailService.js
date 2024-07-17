import dotenv from 'dotenv'
import transporter from '../config/emailConfig.js'

dotenv.config()

export const sendPurchaseEmail = async (user, purchasedProductsEmail, ticketCode, ticketAmount) => {
    const formattedDetails = purchasedProductsEmail.map(item => {
        return `Producto: ${item.product.name}\nDescripción: ${item.product.description}\nPrecio unitario: $${item.product.price}\nCantidad: ${item.quantity}\n\n`
    }).join('')

    const mailOptions = {
        from: process.env.EMAIL_USER_NODEMAILER,
        to: user.email,
        subject: 'Detalle de tu compra',
        text: `Hola ${user.first_name}!\n\nGracias por tu compra. Aquí están los detalles del ticket: ${ticketCode}:\n\n${formattedDetails}\nPrecio total: $${ticketAmount}\n\nSaludos,\nTu equipo de eCommerce`,
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log('Correo de compra enviado')
    } catch (error) {
        console.error('Error enviando el correo de compra:', error)
    }
}

/* export const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    const mailOptions = {
        from: process.env.EMAIL_USER_NODEMAILER,
        to: user.email,
        subject: 'Recuperación de contraseña',
        text: `Hola ${user.first_name},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n${resetUrl}\n\nSi no solicitaste este cambio, por favor ignora este correo.\n\nSaludos,\nTu equipo de eCommerce`,
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log('Correo de recuperación de contraseña enviado')
    } catch (error) {
        console.error('Error enviando el correo de recuperación de contraseña:', error)
    }
} */