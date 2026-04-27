import { Repository } from "typeorm"
import { User } from "../database/entities/user.js"
import { Token } from "../database/entities/token.js"
import { InvalidCredentialsError, ResourceConflictError } from "./error.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export class AuthUsecase {
    constructor(
        private userRepository: Repository<User>,
        private tokenRepository: Repository<Token>
    ) {}

    async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
        const existingUser = await this.userRepository.findOneBy({ email })
        if (existingUser) {
            throw new ResourceConflictError("Email already in use")
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        })

        return await this.userRepository.save(user)
    }

     async login(email: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
        const user = await this.userRepository.findOneBy({ email })
        if (!user) {
            throw new InvalidCredentialsError("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new InvalidCredentialsError("Invalid email or password")
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET ?? "secret",
            { expiresIn: "5m" }
        )

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET ?? "refresh_secret",
            { expiresIn: "7d" }
        )

        const tokenEntity = this.tokenRepository.create({
            token: refreshToken,
            user
        })
        await this.tokenRepository.save(tokenEntity)

        return { accessToken, refreshToken }
    }


    async refresh(refreshToken: string): Promise<{ accessToken: string }> {
        const tokenEntity = await this.tokenRepository.findOne({
            where: { token: refreshToken },
            relations: ["user"]
        })
        if (!tokenEntity) {
            throw new InvalidCredentialsError("Invalid refresh token")
        }

        try {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET ?? "refresh_secret")
        } catch {
            await this.tokenRepository.remove(tokenEntity)
            throw new InvalidCredentialsError("Refresh token expired")
        }

        const accessToken = jwt.sign(
            { userId: tokenEntity.user.id, email: tokenEntity.user.email, role: tokenEntity.user.role },
            process.env.JWT_SECRET ?? "secret",
            { expiresIn: "5m" }
        )

        return { accessToken }
    }

    async logout(refreshToken: string): Promise<void> {
        const tokenEntity = await this.tokenRepository.findOneBy({ token: refreshToken })
        if (!tokenEntity) {
            throw new InvalidCredentialsError("Invalid refresh token")
        }
        await this.tokenRepository.remove(tokenEntity)
    }

    async logoutAll(userId: string): Promise<void> {
        await this.tokenRepository.delete({ user: { id: userId } })
    }
}
