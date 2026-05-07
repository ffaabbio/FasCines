import { Request, Response } from "express"
import { AppDataSource } from "../database/database.js"
import { User, UserRole } from "../database/entities/user.js"

export const Bootstrap = async (req: Request, res: Response) => {
    const secret = process.env.BOOTSTRAP_SECRET
    if (!secret || req.body.secret !== secret) {
        res.status(403).json({ error: "Forbidden" })
        return
    }

    const { email } = req.body
    if (!email) {
        res.status(400).json({ error: "email is required" })
        return
    }

    const userRepo = AppDataSource.getRepository(User)

    const existingSuperAdmin = await userRepo.findOneBy({ role: UserRole.SUPER_ADMIN })
    if (existingSuperAdmin) {
        res.status(409).json({ error: "A super_admin already exists" })
        return
    }

    const user = await userRepo.findOneBy({ email })
    if (!user) {
        res.status(404).json({ error: "User not found" })
        return
    }

    user.role = UserRole.SUPER_ADMIN
    await userRepo.save(user)

    res.status(200).json({ message: `${email} is now super_admin` })
}
