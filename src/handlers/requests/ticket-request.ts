export interface BuyTicketRequest {
    type: "regular" | "super"
}

export interface UseTicketRequest {
    seanceId: number
}

export interface TicketIdRequest {
    id: number
}
