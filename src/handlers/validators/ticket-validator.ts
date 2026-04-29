import Joi from "joi";
import { BuyTicketRequest, TicketIdRequest, UseTicketRequest } from "../requests/ticket-request.js";

export const BuyTicketValidator = Joi.object<BuyTicketRequest>({
    type: Joi.string().valid("regular", "super").required()
})

export const UseTicketValidator = Joi.object<UseTicketRequest>({
    seanceId: Joi.number().min(1).required()
})

export const TicketIdValidator = Joi.object<TicketIdRequest>({
    id: Joi.number().min(1).required()
})
