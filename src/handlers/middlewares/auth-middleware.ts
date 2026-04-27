import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AppDataSource } from "../../database/database.js"
import { Token } from "../../database/entities/token.js"
import { UserRole } from "../../database/entities/user.js"

export interface JwtPayload {
    userId: string
    email: string
    role: UserRole
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"]
    if (!authHeader) {
        res.status(401).json({ error: "Missing authorization header" })
        return 
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
        res.status(401).json({ error: "Invalid authorization format" })
        return
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET ?? "secret") as JwtPayload
        req.user = payload
        next()
    } catch {
        res.status(401).json({ error: "Invalid or expired token" })
    }
}

export const requireRole = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: "Forbidden" })
            return
        }
        next()
    }
}
