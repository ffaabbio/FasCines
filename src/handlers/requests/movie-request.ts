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

export interface ListMovieRequest {
    page:number,
    size: number
}

export interface MovieIdRequest {
    id: string
}