import { Request, Response } from "express"
import { CreateRoomValidator } from "./validators/room-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { RoomUseCase } from "../usecases/room-usecase.js";
import { AppDataSource } from "../database/database.js";
import { Room } from "../database/entities/room.js";
import { ResourceConflictError } from "../usecases/error.js";

const CreateRoom = async (req: Request, res:Response) => {
    const validation = CreateRoomValidator.validate(req.body);
    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const createRoomRequest = validation.value;

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))
    
    try {
        const room = await roomUseCase.createRoom(createRoomRequest.name,createRoomRequest.description,createRoomRequest.capacity,createRoomRequest.isHandicapReady,createRoomRequest.isUnderMaintenance)
        return res.status(201).send(room)
    } catch (error: unknown) {
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