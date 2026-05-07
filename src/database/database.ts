import { DataSource } from "typeorm"
import { User } from "./entities/user.js"
import { Token } from "./entities/token.js"
import { Room } from "./entities/room.js"
import { Movie } from "./entities/movie.js"
import { Screening } from "./entities/screening.js"
import { Ticket } from "./entities/ticket.js"
import { Transaction } from "./entities/transaction.js"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER ?? "fascine_user",
    password: process.env.DB_PASSWORD ?? "fascine_password",
    database: process.env.DB_NAME ?? "fascine_db",
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
    entities: [User, Token, Room, Movie, Screening, Ticket, Transaction],
})
