import {Repository} from "typeorm"
import { Movie } from "../database/entities/movie.js"
import { NotFoundError, ResourceConflictError } from "./error.js"
import { ListResponse } from "./list-response.js";


export interface ListMovieFilter {
    page: number,
    size: number
}

export class MovieUseCase{

    constructor(
        private movieRepository: Repository<Movie>
    ){}
    
    async createMovie(
        title: string,
        description?: string,
        durationMin?: number,
        director?: string,
        genre?: string,
        releaseYear?: number
    ):Promise<Movie>{
        const existingMovie = await this.movieRepository.findOneBy({title})

        if(existingMovie){
            throw new ResourceConflictError("Movie already exist")
        }

        const movie = this.movieRepository.create({
            title,
            description,
            durationMin,
            director,
            genre,
            releaseYear
        })

        return await this.movieRepository.save(movie)
    }
    
    async getMovie(id: number):Promise<Movie | null> {
        return await this.movieRepository.findOneBy({
            id
        })
    }

    async updateMovie(  
        id:number,
        title?: string,
        description?: string,
        durationMin?: number,
        director?: string,
        genre?: string,
        releaseYear?: number
    ):Promise<Movie | null> {
        const movie = await this.getMovie(id)

        if(movie === null) return null

        if(title !== undefined) movie.title = title
        if(description !== undefined) movie.description = description
        if(durationMin !== undefined) movie.durationMin = durationMin
        if(director !== undefined) movie.director = director
        if(genre !== undefined) movie.genre = genre
        if(releaseYear !== undefined) movie.releaseYear = releaseYear

        if(!movie) throw new NotFoundError("Movie not found")
        return movie
    }

    async deleteMovie(id: number): Promise<void> {
        const movie = await this.getMovie(id)

        if(!movie) throw new NotFoundError("Movie nof found")
        
        await this.movieRepository.softRemove(movie)
    }

    async listMovie({page, size}: ListMovieFilter): Promise<ListResponse<Movie>> {
        const query = this.movieRepository.createQueryBuilder("movie")

        query.skip((page - 1) * size)
        query.take(size)

        const [movies, totalCount] = await query.getManyAndCount()

        return {
            data: movies,
            pageSize: size,
            page,
            totalCount,
            totalPages: Math.ceil(totalCount / size)
        }
    }
}