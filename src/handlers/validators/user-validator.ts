import Joi from "joi"
import { UserRole } from "../../database/entities/user.js"

export const UpdateUserValidator = Joi.object({
    firstName: Joi.string().min(2).max(100).optional(),
    lastName: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional()
}).min(1)

export const UpdateRoleValidator = Joi.object({
    role: Joi.string().valid(...Object.values(UserRole)).required()
})

export const UserIdValidator = Joi.object({
    id: Joi.string().uuid().required()
})
