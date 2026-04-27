import { Repository } from "typeorm"
import { User, UserRole } from "../database/entities/user.js"
import { NotFoundError, ResourceConflictError } from "./error.js"

export class UserUsecase {
    constructor(private userRepository: Repository<User>) {}

    async getMe(userId: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) throw new NotFoundError("User not found")
        return user
    }

    async updateMe(userId: string, firstName?: string, lastName?: string, email?: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) throw new NotFoundError("User not found")

        if (email && email !== user.email) {
            const existing = await this.userRepository.findOneBy({ email })
            if (existing) throw new ResourceConflictError("Email already in use")
            user.email = email
        }

        if (firstName) user.firstName = firstName
        if (lastName) user.lastName = lastName

        return await this.userRepository.save(user)
    }

    async listUsers(): Promise<User[]> {
        return await this.userRepository.find()
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id })
        if (!user) throw new NotFoundError("User not found")
        return user
    }

    async updateRole(id: string, role: UserRole): Promise<User> {
        const user = await this.userRepository.findOneBy({ id })
        if (!user) throw new NotFoundError("User not found")
        user.role = role
        return await this.userRepository.save(user)
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.userRepository.findOneBy({ id })
        if (!user) throw new NotFoundError("User not found")
        await this.userRepository.softDelete(id)
    }
}
