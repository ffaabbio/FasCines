import Joi from "joi"
import { CreateMovieRequest, UpdateMovieRequest } from "../requests/movie-request.js"
import { ListScreeningRequest, ScreeningIdRequest } from "../requests/screening-request.js"

export const CreateScreeningValidator = Joi.object<CreateMovieRequest>({
    movieId: Joi.string().required(),
    roomId: Joi.string().required(),
    startsAt: Joi.string().required(),
    endAt: Joi.string().required()
})

export const UpdateScreeningValidator = Joi.object<UpdateMovieRequest>({
    movieId: Joi.string().optional(),
    roomId: Joi.string().optional(),
    startsAt: Joi.string().optional(),
    endAt: Joi.string().optional()
})

export const ListScreeningValidator = Joi.object<ListScreeningRequest>({
    page: Joi.number().min(1).optional(),
    size: Joi.number().min(1).optional()
})

export const ScreeningIdValidator = Joi.object<ScreeningIdRequest>({
    id: Joi.string().required()
})