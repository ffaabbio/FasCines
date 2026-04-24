
export interface CreateRoomRequest {
    name: string,
    description: string,
    capacity: number,
    isHandicapReady: boolean,
    isUnderMaintenance: boolean
}

export interface UpdateRoomRequest{
    name: string,
    description: string,
    capacity: number,
    isHandicapReady: boolean,
    isUnderMaintenance: boolean
}

export interface UnderMaintenanceRoomRequest{
    isUnderMaintenance: boolean
}

export interface ListRoomRequest {
    capacity: number,
    current: number
}