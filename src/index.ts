import "reflect-metadata"
import express from "express"
import { AppDataSource } from "./database/database.js"
import { initHandlers } from "./handlers/routes.js"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const app = express()
const PORT = process.env.PORT ?? 3000
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cinema API",
      version: "1.0.0",
      description: "Documentation de l'API du cinéma"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },

  apis: [
    "./src/handlers/**/*.ts",
    "./src/database/entities/**/*.ts"
  ]
}
const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use(express.json())
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

initHandlers(app)

app.get("/health", (_req, res) => {
    res.json({ status: "ok" })
})

try {
    await AppDataSource.initialize()
    console.log("✅ Database connected")
} catch (error) {
    console.error("❌ Database connection failed", error)
    process.exit(1)
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})
