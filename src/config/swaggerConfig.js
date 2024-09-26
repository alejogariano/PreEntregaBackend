import { url } from 'inspector'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

const options = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'API de Ecommerce',
            description: 'Documentación de la API para el proyecto de ecommerce',
        },
        servers: [
            {
                url: isProduction 
                    ? "https://localhost:8080"
                    : "https://2dapreentregabackend-production.up.railway.app",
            },
        ],
    },
    apis: ['src/docs/**/*.yaml'],
}

const swaggerSpec = swaggerJsdoc(options)

const swaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

export default swaggerDocs