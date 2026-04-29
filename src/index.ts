import "reflect-metadata"
import express from "express"
import { AppDataSource } from "./database/database.js"
import { initHandlers } from "./handlers/routes.js"
import "dotenv/config";

const app = express()
const PORT = process.env.PORT ?? 3000
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS defined:", !!process.env.DB_PASSWORD);
app.use(express.json())

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
