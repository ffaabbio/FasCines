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


/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */

export const ListUsers = async (_req: Request, res: Response) => {
    try {
        const users = await getUserUsecase().listUsers()
        res.status(200).json(users.map(sanitizeUser))
    } catch {
        res.status(500).json({ error: "Internal server error" })
    }
}

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

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
