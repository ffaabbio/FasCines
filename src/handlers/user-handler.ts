import { Request, Response } from "express"
import { AppDataSource } from "../database/database.js"
import { User } from "../database/entities/user.js"
import { UserUsecase } from "../usecases/user-usecase.js"
import { UpdateUserValidator, UpdateRoleValidator, UserIdValidator } from "./validators/user-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { NotFoundError, ResourceConflictError } from "../usecases/error.js"

const getUserUsecase = () => new UserUsecase(AppDataSource.getRepository(User))

const sanitizeUser = (user: User) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt
})

export const GetMe = async (req: Request, res: Response) => {
    try {
        const user = await getUserUsecase().getMe(req.user!.userId)
        res.status(200).json(sanitizeUser(user))
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}

export const UpdateMe = async (req: Request, res: Response) => {
    const validation = UpdateUserValidator.validate(req.body, { abortEarly: false })
    if (validation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(validation.error.details) })
        return
    }

    const { firstName, lastName, email } = validation.value

    try {
        const user = await getUserUsecase().updateMe(req.user!.userId, firstName, lastName, email)
        res.status(200).json(sanitizeUser(user))
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message })
            return
        }
        if (error instanceof ResourceConflictError) {
            res.status(409).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}

export const ListUsers = async (_req: Request, res: Response) => {
    try {
        const users = await getUserUsecase().listUsers()
        res.status(200).json(users.map(sanitizeUser))
    } catch {
        res.status(500).json({ error: "Internal server error" })
    }
}

export const GetUserById = async (req: Request, res: Response) => {
    const validation = UserIdValidator.validate(req.params)
    if (validation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(validation.error.details) })
        return
    }

    try {
        const user = await getUserUsecase().getUserById(validation.value.id)
        res.status(200).json(sanitizeUser(user))
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}

export const UpdateRole = async (req: Request, res: Response) => {
    const paramValidation = UserIdValidator.validate(req.params)
    if (paramValidation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(paramValidation.error.details) })
        return
    }

    const bodyValidation = UpdateRoleValidator.validate(req.body)
    if (bodyValidation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(bodyValidation.error.details) })
        return
    }

    try {
        const user = await getUserUsecase().updateRole(paramValidation.value.id, bodyValidation.value.role)
        res.status(200).json(sanitizeUser(user))
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}

export const DeleteUser = async (req: Request, res: Response) => {
    const validation = UserIdValidator.validate(req.params)
    if (validation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(validation.error.details) })
        return
    }

    try {
        await getUserUsecase().deleteUser(validation.value.id)
        res.status(204).send()
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}
