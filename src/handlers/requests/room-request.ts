
export interface CreateRoomRequest {
    name: string,
    description: string,
    capacity: number,
    isHandicapReady: boolean,
    isUnderMaintenance: boolean
}

export interface UpdateRoomRequest{
    id:number,
    name?: string,
    description?: string,
    capacity?: number,
    isHandicapReady?: boolean,
    isUnderMaintenance?: boolean
}

export interface UnderMaintenanceRoomRequest{
    isUnderMaintenance: boolean
}

export interface ListRoomRequest {
    page: number,
    size: number
    capacity: number,
}

export interface RoomIdRequest {
    id: number
}