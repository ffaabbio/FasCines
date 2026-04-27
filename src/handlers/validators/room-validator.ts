import Joi from "joi"
import { CreateRoomRequest, ListRoomRequest, RoomIdRequest, UpdateRoomRequest } from "../requests/room-request.js"

export const CreateRoomValidator = Joi.object<CreateRoomRequest>({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    capacity: Joi.number().min(15).max(30).required(),
    isHandicapReady: Joi.boolean().required(),
    isUnderMaintenance: Joi.boolean().required()
})

export const UpdateRoomValidator = Joi.object<UpdateRoomRequest>({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    capacity: Joi.number().min(15).max(30).optional(),
    isHandicapReady: Joi.boolean().optional(),
    isUnderMaintenance: Joi.boolean().optional()
})

export const ListRoomValidator = Joi.object<ListRoomRequest>({
    page: Joi.number().min(1).optional(),
    size: Joi.number().min(1).optional(),
    capacity: Joi.number().min(10).max(100).optional(),
})

export const RoomIdValidator = Joi.object<RoomIdRequest>({
    id: Joi.string().min(1).optional()
})