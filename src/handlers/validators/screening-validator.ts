import Joi from "joi"
import { CreateMovieRequest, UpdateMovieRequest } from "../requests/movie-request.js"
import { CreateScreeningRequest, ListScreeningRequest, ScreeningIdRequest, UpdateScreeningRequest } from "../requests/screening-request.js"

export const CreateScreeningValidator = Joi.object<CreateScreeningRequest>({
    movieId: Joi.string().uuid().required(),
    roomId: Joi.string().uuid().required(),
    startsAt: Joi.date().iso().required(),
    endsAt: Joi.date().iso().required()
})


export const UpdateScreeningValidator = Joi.object<UpdateScreeningRequest>({
    movieId: Joi.string().uuid().optional(),
    roomId: Joi.string().uuid().optional(),
    startsAt: Joi.date().iso().optional(),
    endsAt: Joi.date().iso().optional()
})

export const ListScreeningValidator = Joi.object<ListScreeningRequest>({
    page: Joi.number().min(1).optional(),
    size: Joi.number().min(1).optional()
})

export const ScreeningIdValidator = Joi.object<ScreeningIdRequest>({
    id: Joi.string().required()
})