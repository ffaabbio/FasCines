import { Request, Response } from "express"
import { Movie } from "../database/entities/movie.js"
import { MovieUseCase } from "../usecases/movie-usecase.js";
import { Room } from "../database/entities/room.js";
import { RoomUseCase } from "../usecases/room-usecase.js";
import { CreateScreeningValidator, ListScreeningValidator, ScreeningIdValidator, UpdateScreeningValidator } from "./validators/screening-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { ScreeningUseCase } from "../usecases/screening-usecase.js"
import { AppDataSource } from "../database/database.js"
import { ResourceConflictError } from "../usecases/error.js";
import { Screening } from "../database/entities/screening.js";



/**
 * @swagger
 * /screenings:
 *   post:
 *     summary: Create a new screening
 *     tags: [Screenings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - roomId
 *               - startsAt
 *               - endsAt
 *             properties:
 *               movieId:
 *                 type: string
 *                 format: uuid
 *               roomId:
 *                 type: string
 *                 format: uuid
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Screening created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie or Room not found
 *       409:
 *         description: Screening duration too short or overlapping
 */

export const CreateScreening = async (req: Request, res: Response) => {
    const validation = CreateScreeningValidator.validate(req.body)

    const createScreeningRequest = validation.value

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))
    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))
    const screeningUseCase = new ScreeningUseCase(AppDataSource.getRepository(Screening),roomUseCase,movieUseCase)

    try{
        const screening = await screeningUseCase.createScreening(createScreeningRequest.movieId,createScreeningRequest.roomId,createScreeningRequest.startsAt,createScreeningRequest.endsAt)
    
        if (!screening) {
            return res.status(404).send({ error: "Movie or Room not found" })
        }
    
        return res.status(201).send(screening)
    
    } catch(error: unknown){
        if(error instanceof ResourceConflictError){
            return res.status(409).send({
                error: "Invalid screening duration: the provided time range is shorter than the required movie duration plus 30 minutes."
            })
        }

        return res.status(500).send({
            error: "Internal Server Error"
        })
    }
}


/**
 * @swagger
 * /screenings/{id}:
 *   get:
 *     summary: Get a screening by ID
 *     tags: [Screenings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Screening found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Screening'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Screening not found
 */

export const GetScreening = async (req: Request, res: Response) => {
    const validation = ScreeningIdValidator.validate(req.params)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const screeningIdRequest = validation.value

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))
    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))
    const screeningUseCase = new ScreeningUseCase(AppDataSource.getRepository(Screening),roomUseCase,movieUseCase)

    const screening = await screeningUseCase.getScreening(screeningIdRequest.id)

    if(screening === null){
        return res.status(404).send({
            error: "screening not found"
        })
    }

    return res.status(200).json(screening)
}

/**
 * @swagger
 * /screenings:
 *   get:
 *     summary: Get a paginated list of screenings
 *     tags: [Screenings]
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
 *         description: List of screenings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Screening'
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

export const ListScreening = async (req: Request, res: Response) => {
    const validation = ListScreeningValidator.validate(req.body)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const ListScreeningRequest = validation.value
    let size  = 10;
    if (ListScreeningRequest.size !== undefined) {
        size = ListScreeningRequest.size
    }

    let page = 1;
    if (ListScreeningRequest.page !== undefined) {
        page = ListScreeningRequest.page
    }

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))
    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))
    const screeningUseCase = new ScreeningUseCase(AppDataSource.getRepository(Screening),roomUseCase,movieUseCase)

    const screening = await screeningUseCase.listScreeing({
        page,
        size
    })

    return res.send(screening)
}

/**
 * @swagger
 * /screening/{id}:
 *   delete:
 *      summary: Delete an existing screening
 *      tags: [Screenings]
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *              format: uuid
 *      responses:
 *       200:
 *         description: Screening deleted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Screening not found
 *       409:
 *         description: Invalid duration or overlapping screening
 */

export const DeleteScreening = async (req: Request, res: Response) => {
    const validation = ScreeningIdValidator.validate(req.params)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const screeningIdRequest = validation.value

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))
    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))
    const screeningUseCase = new ScreeningUseCase(AppDataSource.getRepository(Screening),roomUseCase,movieUseCase)

    const screeningDelete = await screeningUseCase.deleteScreening(screeningIdRequest.id)

    if(screeningDelete === null){
        return res.status(404).send({
            error: "screening not found"
        })
    }

    return res.status(204).send()
}

/**
 * @swagger
 * /screenings/{id}:
 *   patch:
 *     summary: Update an existing screening
 *     tags: [Screenings]
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
 *               movieId:
 *                 type: string
 *                 format: uuid
 *               roomId:
 *                 type: string
 *                 format: uuid
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Screening updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Screening not found
 *       409:
 *         description: Invalid duration or overlapping screening
 */

export const UpdateScreening = async (req: Request, res: Response) => {
    const validationId = ScreeningIdValidator.validate(req.params)
        
    if(validationId.error){
        return res.status(400).send(generateValidationErrorMessage(validationId.error.details))
    }
    
    const validation = UpdateScreeningValidator.validate(req.body)
    
    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const updateScreeningRequest = validation.value
    const screeningIdRequest = validationId.value

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))
    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))
    const screeningUseCase = new ScreeningUseCase(AppDataSource.getRepository(Screening),roomUseCase,movieUseCase)

    try{
        const screeningUpdated = await screeningUseCase.updateScreening(
            screeningIdRequest.id,
            updateScreeningRequest.movieId,
            updateScreeningRequest.roomId,
            updateScreeningRequest.startsAt,
            updateScreeningRequest.endsAt
        )

        if(screeningUpdated === null){
            return res.status(404).send({
                error: "Screening not found"
            })
        }

        return res.send(screeningUpdated)
    
    }catch(error){
          if(error instanceof ResourceConflictError){
            return res.status(409).send({
                name: "name is already taken"
            })
        }
        throw error
    }
           
}