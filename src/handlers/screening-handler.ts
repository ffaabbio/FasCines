import { Request, Response } from "express"
import { Movie } from "../database/entities/movie.js"
import { MovieUseCase } from "../usecases/movie-usecase.js";
import { Room } from "../database/entities/room.js";
import { RoomUseCase } from "../usecases/room-usecase.js";
import { CreateScreeningValidator, ScreeningIdValidator } from "./validators/screening-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { ScreeningUseCase } from "../usecases/screening-usecase.js"
import { AppDataSource } from "../database/database.js"
import { ResourceConflictError } from "../usecases/error.js";


export const CreateScreening = async (req: Request, res: Response) => {
    const validation = CreateScreeningValidator.validate(req.body)

    const createScreeningRequest = validation.value

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))
    const movieUseCase = new MovieUseCase(AppDataSource.getRepository(Movie))
    const screeningUseCase = new ScreeningUseCase(AppDataSource.getRepository(Movie),roomUseCase,movieUseCase)

    try{
        const screening = await screeningUseCase.createScreening(createScreeningRequest.movieId,createScreeningRequest.roomId,createScreeningRequest.startsAt,createScreeningRequest.endsAt)
        return res.status(201).send(screening)
    } catch(error: unknown){
        if(error instanceof ResourceConflictError){
            return res.status(409).send({
                error: "error"
            })
        }

        return res.status(500).send({
            error: "Internal Server Error"
        })
    }
}

export const GetScreening = async (req: Request, res: Response) => {
    const validation = ScreeningIdValidator.validate(req.params)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }
}