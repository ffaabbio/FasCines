import {Repository} from "typeorm"
import { Room } from "../database/entities/room.js";
import { InvalidCredentialsError, ResourceConflictError } from "./error.js"

export class RoomUseCase {
    constructor(
        private roomRepository: Repository<Room>
    ){}

    async createRoom(
        name: string,
        description: string,
        capacity: number,
        isHandicapReady: boolean,
        isUnderMaintenance: boolean
        ):Promise<Room>{
            
            const existingRoom = await this.roomRepository.findOneBy({name})
            
            if(existingRoom){
                throw new ResourceConflictError("Room already exist")
            }

            const room = this.roomRepository.create({
                name,
                description,
                capacity,
                isHandicapReady,
                isUnderMaintenance
            })

            return await this.roomRepository.save(room)
        }
}