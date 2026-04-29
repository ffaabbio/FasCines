import { Express } from "express"
import { Register, Login, Refresh, Logout, LogoutAll } from "./auth-handler.js"
import { GetMe, UpdateMe, ListUsers, GetUserById, UpdateRole, DeleteUser } from "./user-handler.js"
import { authMiddleware, requireRole } from "./middlewares/auth-middleware.js"
import { UserRole } from "../database/entities/user.js"
import { BuyTicket, GetTicketHistory, ListTickets, UseTicket } from "./ticket-handler.js";

export const initHandlers = (app: Express) => {

    app.get("/health", (req, res) => {
        res.status(200).json({ status: "ok" })
    })
    // Auth — routes publiques
    app.post("/api/auth/register", Register)
    app.post("/api/auth/login", Login)
    app.post("/api/auth/refresh", Refresh)

    // Auth — routes protégées
    app.post("/api/auth/logout", authMiddleware, Logout)
    app.post("/api/auth/logout-all", authMiddleware, LogoutAll)

    // Users — profil personnel
    app.get("/api/users/me", authMiddleware, GetMe)
    app.patch("/api/users/me", authMiddleware, UpdateMe)

    // Users — admin
    app.get("/api/users", authMiddleware, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ListUsers)
    app.get("/api/users/:id", authMiddleware, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), GetUserById)
    app.patch("/api/users/:id/role", authMiddleware, requireRole(UserRole.SUPER_ADMIN), UpdateRole)
    app.delete("/api/users/:id", authMiddleware, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), DeleteUser)

    // Tickets
    app.post("/tickets/buy", authMiddleware, BuyTicket)             // achete un ticket
    app.post("/tickets/:id/use", authMiddleware, UseTicket)         // utilise un ticket
    app.get("/tickets", authMiddleware, ListTickets)                // Ca liste all tickets
    app.get("/tickets/history", authMiddleware, GetTicketHistory)   // ticker utilise ca les affiche 
}
