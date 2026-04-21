import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER ?? "fascine_user",
    password: process.env.DB_PASSWORD ?? "fascine_password",
    database: process.env.DB_NAME ?? "fascine_db",
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV === "development",
    entities: ["src/database/entities/*.ts"],
})
