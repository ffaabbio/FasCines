import { Request, Response } from "express"
import { AppDataSource } from "../database/database.js"
import { User } from "../database/entities/user.js"
import { Token } from "../database/entities/token.js"
import { AuthUsecase } from "../usecases/auth-usecase.js"
import { RegisterValidator, LoginValidator, RefreshTokenValidator } from "./validators/auth-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { InvalidCredentialsError, ResourceConflictError } from "../usecases/error.js"

const getAuthUsecase = () => new AuthUsecase(
    AppDataSource.getRepository(User),
    AppDataSource.getRepository(Token)
)

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */

export const Register = async (req: Request, res: Response) => {
    const validation = RegisterValidator.validate(req.body, { abortEarly: false })
    if (validation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(validation.error.details) })
        return
    }

    const { email, password, firstName, lastName } = validation.value

    try {
        const user = await getAuthUsecase().register(email, password, firstName, lastName)
        res.status(201).json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role })
    } catch (error) {
        if (error instanceof ResourceConflictError) {
            res.status(409).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and return tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */

export const Login = async (req: Request, res: Response) => {
    const validation = LoginValidator.validate(req.body, { abortEarly: false })
    if (validation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(validation.error.details) })
        return
    }

    const { email, password } = validation.value

    try {
        const { accessToken, refreshToken } = await getAuthUsecase().login(email, password)
        res.status(200).json({ accessToken, refreshToken })
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            res.status(401).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh the access token using a valid refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */

export const Refresh = async (req: Request, res: Response) => {
    const validation = RefreshTokenValidator.validate(req.body, { abortEarly: false })
    if (validation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(validation.error.details) })
        return
    }

    try {
        const { accessToken } = await getAuthUsecase().refresh(validation.value.token)
        res.status(200).json({ accessToken })
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            res.status(401).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from the current device
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */

export const Logout = async (req: Request, res: Response) => {
    const validation = RefreshTokenValidator.validate(req.body, { abortEarly: false })
    if (validation.error) {
        res.status(400).json({ errors: generateValidationErrorMessage(validation.error.details) })
        return
    }

    try {
        await getAuthUsecase().logout(validation.value.token)
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            res.status(401).json({ error: error.message })
            return
        }
        res.status(500).json({ error: "Internal server error" })
    }
}

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *       500:
 *         description: Internal server error
 */

export const LogoutAll = async (req: Request, res: Response) => {
    const userId = req.user!.userId

    try {
        await getAuthUsecase().logoutAll(userId)
        res.status(200).json({ message: "Logged out from all devices" })
    } catch {
        res.status(500).json({ error: "Internal server error" })
    }
}
