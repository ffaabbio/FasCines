import { Request, Response } from "express"
import { CreateRoomValidator, ListRoomValidator, RoomIdValidator, UpdateRoomValidator } from "./validators/room-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { RoomUseCase } from "../usecases/room-usecase.js";
import { AppDataSource } from "../database/database.js";
import { Room } from "../database/entities/room.js";
import { ResourceConflictError } from "../usecases/error.js";

export const CreateRoom = async (req: Request, res:Response) => {
    const validation = CreateRoomValidator.validate(req.body)
    
    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const createRoomRequest = validation.value

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


export const GetRoom = async (req: Request, res:Response) => {
    const validation = RoomIdValidator.validate(req.params)
    
    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const roomIdRequest = validation.value
    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))

    const room = await roomUseCase.getRoom(roomIdRequest.id)
    
    if(room === null){
        return res.status(404).send({
            error: "room not found"
        })
    }
    return res.status(200).json(room);
}


export const ListRooms = async (req: Request, res: Response) => {
    const validation = ListRoomValidator.validate(req.body)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const listRoomsRequest = validation.validate
    let size  = 10;
    if (listRoomsRequest.size !== undefined) {
        size = listRoomsRequest.size
    }

    let page = 1;
    if (listRoomsRequest.page !== undefined) {
        page = listRoomsRequest.page
    }

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))

    const room = await roomUseCase.listRooms({
        page,
        size
    })

    return res.send(room)

}


export const UpdateRoom = async (req: Request, res:Response) => {
    const validation = UpdateRoomValidator.validate(req.body)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const updateRoomRequest = validation.value

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))

    try {
        const roomUdpated = await roomUseCase.updateRoom(
            updateRoomRequest.id,
            updateRoomRequest.name,
            updateRoomRequest.description,
            updateRoomRequest.capacity,
            updateRoomRequest.isHandicapReady,
            updateRoomRequest.isUnderMaintenance
        )
        if( roomUdpated === null){
            return res.status(404).send({
                error: "room not found"
            })
        }
        return res.send(roomUdpated)
    } catch(error){
        if(error instanceof ResourceConflictError){
            return res.status(409).send({
                name: "name is already taken"
            })
        }
        throw error
    }
}

export const DeleteRoom = async (req: Request, res: Response) => {
    const validation = RoomIdValidator.validate(req.params)
    if (validation.error) {
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }
    const roomIdRequest = validation.value

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room));

    const roomDeleted = await roomUseCase.deleteRoom(roomIdRequest.id);
    if (roomDeleted === null) {
        return res.status(404).send({
            error: "room not found"
        })
    }
    return res.send(roomDeleted);

}