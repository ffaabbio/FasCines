import { Request, Response } from "express"
import { CreateMovieValidator, MovieIdValidator, UpdateMovieValidator, ListMovieValidator } from "./validators/movie-validator.js";
import { generateValidationErrorMessage } from "./validators/utils.js"
import { MovieUseCase } from "../usecases/movie-usecase.js";
import { AppDataSource } from "../database/database.js";
import { ResourceConflictError } from "../usecases/error.js";
import { Movie } from "../database/entities/movie.js";


/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               durationMin:
 *                 type: integer
 *               director:
 *                 type: string
 *               genre:
 *                 type: string
 *               releaseYear:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Movie title already exists
 */

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

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Movie found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie not found
 */


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

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: List movies with pagination
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       400:
 *         description: Validation error
 */

export const ListMovies = async (req: Request, res: Response) => {
    const validation = ListMovieValidator.validate(req.query)

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

/**
 * @swagger
 * /movies/{id}:
 *   patch:
 *     summary: Update an existing movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               durationMin:
 *                 type: integer
 *               director:
 *                 type: string
 *               genre:
 *                 type: string
 *               releaseYear:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie not found
 *       409:
 *         description: Movie title already exists
 */

export const UpdateMovie = async (req: Request, res: Response) => {
    const validationId = MovieIdValidator.validate(req.params)
    
    if(validationId.error){
        return res.status(400).send(generateValidationErrorMessage(validationId.error.details))
    }
    
    const validation = UpdateMovieValidator.validate(req.body)
    
    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
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

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete a movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie not found
 */

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