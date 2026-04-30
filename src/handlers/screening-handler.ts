import { Request, Response } from "express"
import { Movie } from "../database/entities/movie.js"
import { MovieUseCase } from "../usecases/movie-usecase.js";
import { Room } from "../database/entities/room.js";
import { RoomUseCase } from "../usecases/room-usecase.js";
import { CreateScreeningValidator, ListScreeningValidator, ScreeningIdValidator } from "./validators/screening-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { ScreeningUseCase } from "../usecases/screening-usecase.js"
import { AppDataSource } from "../database/database.js"
import { ResourceConflictError } from "../usecases/error.js";
import { Screening } from "../database/entities/screening.js";


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

    return res.send(screeningDelete)
}