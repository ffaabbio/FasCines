import { Request, Response } from "express"
import { CreateMovieRequest } from "./requests/movie-request.js";
import { CreateMovieValidator, MovieIdValidator, UpdateMovieValidator, ListMovieValidator } from "./validators/movie-validator.js";
import { generateValidationErrorMessage } from "./validators/utils.js"
import { MovieUseCase } from "../usecases/movie-usecase.js";
import { AppDataSource } from "../database/database.js";
import { ResourceConflictError } from "../usecases/error.js";
import { Movie } from "../database/entities/movie.js";


export const CreateMovie = async (req: Request, res: Response) => {
    const validation = CreateMovieValidator.validate(req.body)
        
    if(validation.error){
            return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const createMovieRequest = validation.value
    
    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))

    try{
        const movie = await movieUseCase.createMovie(createMovieRequest.title,createMovieRequest.description,createMovieRequest.durationMin,createMovieRequest.director,createMovieRequest.genre,createMovieRequest.releaseYear)
        return res.status(201).send(movie)
    } catch(error: unknown){
        if(error instanceof ResourceConflictError){
            return res.status(409).send({
                name: "name is already taken"
            })
        }

        return res.status(500).send({
               error: "Internal Server Error"
        })
    }
}

export const GetMovie = async (req: Request, res: Response) => {
    const validation = MovieIdValidator.validate(req.params)
        
    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const movieIdRequest = validation.value
    
    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))

    const movie = await movieUseCase.getMovie(movieIdRequest.id)

    if(movie === null){
        return res.status(404).send({
            error: "room not found"
        })
    }

    return res.status(200).json(movie)
}

export const ListMovies = async (req: Request, res: Response) => {
    const validation = ListMovieValidator.validate(req.body)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }
    
    const listMoviesRequest = validation.value
    let size  = 10;
    if (listMoviesRequest.size !== undefined) {
        size = listMoviesRequest.size
    }

    let page = 1;
    if (listMoviesRequest.page !== undefined) {
        page = listMoviesRequest.page
    }

    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))

    const movie = await movieUseCase.listMovie({
        page,
        size
    })

    return res.send(movie)


}

export const UpdateMovie = async (req: Request, res: Response) => {
   const validation = UpdateMovieValidator.validate(req.body)
   const validationId = MovieIdValidator.validate(req.params)
   
    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    if(validationId.error){
        return res.status(400).send(generateValidationErrorMessage(validationId.error.details))
    }
    
    const updateMovieRequest = validation.value
    const movieIdRequest = validationId.value

    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))

    try{
        const movieUpdated = await movieUseCase.updateMovie(
            movieIdRequest.id,
            updateMovieRequest.title,
            updateMovieRequest.description,
            updateMovieRequest.durationMin,
            updateMovieRequest.director,
            updateMovieRequest.genre,
            updateMovieRequest.releaseYear
        )

        if(movieUpdated === null){
            return res.status(404).send({
                error: "Movie not found"
            })
        }
        return res.send(movieUpdated)
    }catch(error){
        if(error instanceof ResourceConflictError){
            return res.status(409).send({
                name: "name is already taken"
            })
        }
        throw error
    }
} 

export const DeleteMovie = async (req: Request, res: Response) => {
    const validation = MovieIdValidator.validate(req.params)
    if (validation.error) {
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }
    const movieIdRequest = validation.value

    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie));

    const movieDeleted = await movieUseCase.deleteMovie(movieIdRequest.id);
    if (movieDeleted === null) {
        return res.status(404).send({
            error: "movie not found"
        })
    }
    return res.send(movieDeleted);
}