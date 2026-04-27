import {Repository} from "typeorm"
import { Room } from "../database/entities/room.js";
import { NotFoundError, ResourceConflictError } from "./error.js"
import { ListResponse } from "./list-response.js";


export interface ListRoomFilter {
    page: number,
    size: number,
}

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

    async getRoom(id: string): Promise<Room | null> {
        return await this.roomRepository.findOneBy({
            id
        })
    }
    
    async updateRoom(
        id:string,
        name?: string,
        description?: string,
        capacity?: number,
        isHandicapReady?: boolean,
        isUnderMaintenance?: boolean
    ): Promise<Room | null> {
        const room = await this.getRoom(id)

        if(room === null) return null

        if(name !== undefined) room.name = name
        if(description !== undefined) room.description = description
        if(capacity !== undefined) room.capacity = capacity
        if(isHandicapReady !== undefined) room.isHandicapReady = isHandicapReady
        if(isUnderMaintenance !== undefined) room.isUnderMaintenance = isUnderMaintenance
        
        if(!room) throw new NotFoundError("Room not found")
        return room
    }
    
    async deleteRoom(id: string): Promise<void> {
        const room = await this.getRoom(id)
        
        if(!room) throw new NotFoundError("Room not found")

        await this.roomRepository.softRemove(room)
    }

    async listRooms({page,size}: ListRoomFilter): Promise<ListResponse<Room>> {
        const query = this.roomRepository.createQueryBuilder("room")
 
        query.skip((page - 1) * size)
        query.take(size)

        const [rooms, totalCount] = await query.getManyAndCount();
        return {
            data: rooms,
            pageSize: size,
            page,
            totalCount,
            totalPages: Math.ceil(totalCount / size)
        }
        
    }

}