export interface CreateScreeningRequest {
    movieId: string,
    roomId: string,
    startsAt: Date, 
    endsAt: Date
}

export interface UpdateScreeningRequest {
    movieId?: string,
    roomId?: string,
    startsAt?: Date, 
    endsAt?: Date 
}

export interface ListScreeningRequest {
    page?: number,
    size?: number
}

export interface ScreeningIdRequest {
    id: string
}