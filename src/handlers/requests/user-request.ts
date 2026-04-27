import { UserRole } from "../../database/entities/user.js"

export interface UpdateUserRequest {
    firstName?: string
    lastName?: string
    email?: string
}

export interface UpdateRoleRequest {
    role: UserRole
}
