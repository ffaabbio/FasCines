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

export const ListTickets = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId
    const tickets = await buildUsecase().listTickets(userId)
    return res.send(tickets)
}

export const GetTransactions = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId
    const transactions = await buildUsecase().getTransactions(userId)
    return res.send(transactions)
}
