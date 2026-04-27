import Joi from "joi"
import { CreateMovieRequest, MovieIdRequest } from "../requests/movie-request.js"

export const CreateMovieValidator = Joi.object<CreateMovieRequest>({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().nullable().max(1000).optional(),
    durationMin: Joi.number().min(1).required(),
    director: Joi.string().nullable().max(255).optional(),
    genre: Joi.string().nullable().max(255).optional(),
    releaseYear:Joi.number().nullable().optional(),
})


export const UpdateMovieValidator = Joi.object<CreateMovieRequest>({
    id:Joi.number().min(1).required(),
    title: Joi.string().min(2).max(255).optional(),
    description: Joi.string().nullable().max(1000).optional(),
    durationMin: Joi.number().min(1).optional(),
    director: Joi.string().nullable().max(255).optional(),
    genre: Joi.string().nullable().max(255).optional(),
    releaseYear:Joi.number().nullable().optional(),
})

export const MovieIdValidator = Joi.object<MovieIdRequest>({
    id: Joi.number().min(1).required()
})