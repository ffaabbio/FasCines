import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host:  "localhost",
    port:  5432,
    username: "fascines",
    password:  "motdepasse_dev_local",
    database:  "fascine_db",
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV === "development",
    entities: ["src/database/entities/*.ts"],
})
