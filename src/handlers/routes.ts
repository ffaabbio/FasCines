import { Express } from "express"
import { Register, Login, Refresh, Logout, LogoutAll } from "./auth-handler.js"
import { GetMe, UpdateMe, ListUsers, GetUserById, UpdateRole, DeleteUser } from "./user-handler.js"
import { authMiddleware, requireRole } from "./middlewares/auth-middleware.js"
import { UserRole } from "../database/entities/user.js"
import { ListRooms,GetRoom, CreateRoom, UpdateRoom, DeleteRoom } from "./room-handler.js"
import { CreateMovie, DeleteMovie, GetMovie, ListMovies, UpdateMovie } from "./movie-handler.js"
import { CreateScreening, DeleteScreening, GetScreening, ListScreening, UpdateScreening } from "./screening-handler.js"

export const initHandlers = (app: Express) => {
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

    //Rooms - routes publiques
    app.get("/api/rooms",authMiddleware, ListRooms)
    app.get("/api/rooms/:id",authMiddleware,GetRoom)
    

    //Rooms - routes admin
    app.post("/api/rooms",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),CreateRoom)
    app.patch("/api/rooms/:id",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),UpdateRoom)
    app.delete("/api/rooms/:id",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),DeleteRoom)

    //Movie - routes publiques
    app.get("/api/movies",authMiddleware,ListMovies)
    app.get("/api/movies/:id",authMiddleware,GetMovie)

    //Movie - routes admin
    app.post("/api/movies",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),CreateMovie)
    app.patch("/api/movies/:id",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),UpdateMovie)
    app.delete("/api/movies/:id",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),DeleteMovie)

    //Screening - routes publiques
    app.get("/api/screenings",authMiddleware,ListScreening)
    app.get("/api/screenings/:id",authMiddleware,GetScreening)

    //Screening - routes admin
    app.post("/api/screenings",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),CreateScreening)
    app.patch("/api/screenings/:id",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),UpdateScreening)
    app.delete("/api/screenings/:id",authMiddleware,requireRole(UserRole.ADMIN,UserRole.SUPER_ADMIN),DeleteScreening)

    
}
