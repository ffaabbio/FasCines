import Joi from "joi"
import { CreateMovieRequest, MovieIdRequest, UpdateMovieRequest, ListMovieRequest } from "../requests/movie-request.js"

export const CreateMovieValidator = Joi.object<CreateMovieRequest>({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(1000).optional(),
    durationMin: Joi.number().min(1).required(),
    director: Joi.string().max(255).optional(),
    genre: Joi.string().max(255).optional(),
    releaseYear:Joi.number().optional(),
})


export const UpdateMovieValidator = Joi.object<UpdateMovieRequest>({
    title: Joi.string().min(2).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    durationMin: Joi.number().min(1).optional(),
    director: Joi.string().max(255).optional(),
    genre: Joi.string().max(255).optional(),
    releaseYear:Joi.number().optional(),
})

export const ListMovieValidator = Joi.object<ListMovieRequest>({
    page: Joi.number().min(1).optional(),
    size: Joi.number().min(1).optional()
})

export const MovieIdValidator = Joi.object<MovieIdRequest>({
    id: Joi.string().min(1).required()
})