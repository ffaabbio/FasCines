import { Request, Response } from "express"
import { CreateRoomValidator, ListRoomValidator, RoomIdValidator, UpdateRoomValidator } from "./validators/room-validator.js"
import { generateValidationErrorMessage } from "./validators/utils.js"
import { RoomUseCase } from "../usecases/room-usecase.js";
import { AppDataSource } from "../database/database.js";
import { Room } from "../database/entities/room.js";
import { ResourceConflictError } from "../usecases/error.js";

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *               - isHandicapReady
 *               - isUnderMaintenance
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               isHandicapReady:
 *                 type: boolean
 *               isUnderMaintenance:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Room name already exists
 */

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

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Get a room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Room found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Room not found
 */

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
    return res.status(200).json(room)
}

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: List rooms with pagination
 *     tags: [Rooms]
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
 *         description: Paginated list of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
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

export const ListRooms = async (req: Request, res: Response) => {
    const validation = ListRoomValidator.validate(req.body)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const listRoomsRequest = validation.value
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

/**
 * @swagger
 * /rooms/{id}:
 *   patch:
 *     summary: Update an existing room
 *     tags: [Rooms]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               isHandicapReady:
 *                 type: boolean
 *               isUnderMaintenance:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Room not found
 *       409:
 *         description: Room name already exists
 */

export const UpdateRoom = async (req: Request, res:Response) => {
    const validationId = RoomIdValidator.validate(req.params)
    
    if (validationId.error) {
        return res.status(400).send(generateValidationErrorMessage(validationId.error.details))
    }

    const validation = UpdateRoomValidator.validate(req.body)

    if(validation.error){
        return res.status(400).send(generateValidationErrorMessage(validation.error.details))
    }

    const updateRoomRequest = validation.value
    const updateRoomidRequet = validation.value

    const roomUseCase = new RoomUseCase(AppDataSource.getRepository(Room))

    try {
        const roomUdpated = await roomUseCase.updateRoom(
            updateRoomidRequet.id,
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

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Room not found
 */

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