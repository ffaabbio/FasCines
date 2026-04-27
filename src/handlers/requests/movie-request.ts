export interface CreateMovieRequest {
    title: string,
    description?: string,
    durationMin?: number,
    director?: string,
    genre?: string,
    releaseYear?: number
}

export interface UpdateMovieRequest {
    id:number,
    title?: string,
    description?: string,
    durationMin?: number,
    director?: string,
    genre?: string,
    releaseYear?: number
}

export interface MovieIdRequest {
    id: number
}