import { Request, Response } from "express"
import { AppDataSource } from "../database/database.js"
import { Ticket, TicketType } from "../database/entities/ticket.js"
import { Transaction } from "../database/entities/transaction.js"
import { User } from "../database/entities/user.js"
import { TicketUsecase } from "../usecases/ticket-usecase.js"
import { AddBalanceValidator, BuyTicketValidator, TicketIdValidator, UseTicketValidator } from "./validators/ticket-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { NotFoundError } from "../usecases/error.js"

const buildUsecase = () => new TicketUsecase(
    AppDataSource.getRepository(Ticket),
    AppDataSource.getRepository(Transaction),
    AppDataSource.getRepository(User)
)

/**
 * @swagger
 * /tickets/balance:
 *   post:
 *     summary: Add balance to the authenticated user's account
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Balance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export const AddBalance = async (req: Request, res: Response) => {
    const validation = AddBalanceValidator.validate(req.body)
    if (validation.error) {
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }
    const userId = (req as any).user.userId

    try {
        const user = await buildUsecase().addBalance(userId, validation.value.amount)
        return res.status(200).send({ balance: user.balance })
    } catch (error: any) {
        if (error instanceof NotFoundError) return res.status(404).send({ error: error.message })
        return res.status(500).send({ error: "Erreur serveur" })
    }
}


/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Buy a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [STANDARD, PREMIUM, ILLIMITE]
 *     responses:
 *       201:
 *         description: Ticket purchased successfully
 *       400:
 *         description: Validation error or insufficient balance
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export const BuyTicket = async (req: Request, res: Response) => {
    const validation = BuyTicketValidator.validate(req.body)
    if (validation.error) {
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }
    const userId = (req as any).user.userId

    try {
        const ticket = await buildUsecase().buyTicket(userId, validation.value.type as TicketType)
        return res.status(201).send(ticket)
    } catch (error: any) {
        if (error instanceof NotFoundError) return res.status(404).send({ error: error.message })
        if (error.message === "Solde insuffisant") return res.status(400).send({ error: "Solde insuffisant" })
        return res.status(500).send({ error: "Erreur serveur" })
    }
}


/**
 * @swagger
 * /tickets/{id}/use:
 *   post:
 *     summary: Use a ticket for a screening
 *     tags: [Tickets]
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
 *               - seanceId
 *             properties:
 *               seanceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Ticket used successfully
 *       400:
 *         description: Validation error or no remaining uses
 *       403:
 *         description: Ticket does not belong to the user
 *       404:
 *         description: Ticket or screening not found
 *       500:
 *         description: Internal server error
 */

export const UseTicket = async (req: Request, res: Response) => {
    const idValidation = TicketIdValidator.validate(req.params)
    if (idValidation.error) {
        return res.status(400).send(generateValidationErrorMessage(idValidation.error.details))
    }
    const bodyValidation = UseTicketValidator.validate(req.body)
    if (bodyValidation.error) {
        return res.status(400).send(generateValidationErrorMessage(bodyValidation.error.details))
    }
    const userId = (req as any).user.userId

    try {
        const transaction = await buildUsecase().useTicket(idValidation.value.id, userId, bodyValidation.value.seanceId)
        return res.status(200).send(transaction)
    } catch (error: any) {
        if (error instanceof NotFoundError) return res.status(404).send({ error: error.message })
        if (error.message === "Ce ticket ne vous appartient pas") return res.status(403).send({ error: error.message })
        if (error.message === "Ce ticket n'a plus d'utilisations restantes") return res.status(400).send({ error: error.message })
        return res.status(500).send({ error: "Erreur serveur" })
    }
}

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: List all tickets of the authenticated user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       500:
 *         description: Internal server error
 */

export const ListTickets = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId
    const tickets = await buildUsecase().listTickets(userId)
    return res.send(tickets)
}

/**
 * @swagger
 * /tickets/transactions:
 *   get:
 *     summary: Get all transactions of the authenticated user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Internal server error
 */

export const GetTransactions = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId
    const transactions = await buildUsecase().getTransactions(userId)
    return res.send(transactions)
}
