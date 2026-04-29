import { Request, Response } from "express";
import { AppDataSource } from "../database/database.js";
import { Ticket, TicketType } from "../database/entities/ticket.js";
import { TicketUse } from "../database/entities/ticket-use.js";
import { User } from "../database/entities/user.js";
import { TicketUsecase } from "../usecases/ticket-usecase.js";
import { BuyTicketValidator, TicketIdValidator, UseTicketValidator } from "./validators/ticket-validator.js";
import { generateValidationErrorMessage } from "./validators/utils.js";

const buildUsecase = () => new TicketUsecase(
    AppDataSource.getRepository(Ticket),
    AppDataSource.getRepository(TicketUse),
    AppDataSource.getRepository(User)
)

export const BuyTicket = async (req: Request, res: Response) => {
    const validation = BuyTicketValidator.validate(req.body);
    if (validation.error) {
        return res.status(400).send(generateValidationErrorMessage(validation.error.details));
    }
    const userId = (req as any).user.userId;

    try {
        const ticket = await buildUsecase().buyTicket(userId, validation.value.type as TicketType);
        return res.status(201).send(ticket);
    } catch (error: any) {
        if (error.message === "Ta pas d'argent vas travailler") return res.status(400).send({ error: "Ta pas d'argent vas travailler" });
        if (error.message === "T qui") return res.status(404).send({ error: "T qui" });
        return res.status(500).send({ error: "Probleme Serveur" });
    }
}

export const UseTicket = async (req: Request, res: Response) => {
    const idValidation = TicketIdValidator.validate(req.params);
    if (idValidation.error) {
        return res.status(400).send(generateValidationErrorMessage(idValidation.error.details));
    }
    const bodyValidation = UseTicketValidator.validate(req.body);
    if (bodyValidation.error) {
        return res.status(400).send(generateValidationErrorMessage(bodyValidation.error.details));
    }
    const userId = (req as any).user.userId;

    try {
        const use = await buildUsecase().useTicket(idValidation.value.id, userId, bodyValidation.value.seanceId);
        return res.status(200).send(use);
    } catch (error: any) {
        if (error.message === "j'ai perdue ton ticket") return res.status(404).send({ error: "j'ai perdue ton ticket" });
        if (error.message === "Vas recharger ton compte") return res.status(400).send({ error: "Vas recharger ton compte" });
        return res.status(500).send({ error: "Probleme Serveur" });
    }
}

export const ListTickets = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const tickets = await buildUsecase().listTickets(userId);
    return res.send(tickets);
}

export const GetTicketHistory = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const history = await buildUsecase().getHistory(userId);
    return res.send(history);
}
