import {Repository,LessThan,MoreThan} from "typeorm"
import { Screening } from "../database/entities/screening.js";
import { Movie } from "../database/entities/movie.js";
import { NotFoundError, ResourceConflictError } from "./error.js"
import { RoomUseCase } from "./room-usecase.js";
import { MovieUseCase } from "./movie-usecase.js";
import { ListResponse } from "./list-response.js";

export interface ListScreeningFilter{
    page:number,
    size:number
}

export class ScreeningUseCase{
    constructor(
        private screeningRepository: Repository<Screening>,
        private roomUseCase: RoomUseCase,
        private movieUseCase: MovieUseCase
    ){}

    async createScreening(
        movieId: string,
        roomId: string,
        startsAt: string, 
        endsAt: string
    ):Promise<Screening | null>{
        const overlappingScreening = await this.screeningRepository.findOne({
            where: {
                movie: { id: movieId },
                startsAt: LessThan(new Date(endsAt)),
                endsAt: MoreThan(new Date(startsAt))
            },
            relations: ["movie", "room"]
        })

        if (overlappingScreening) {
            throw new ResourceConflictError("Screening overlaps with another screening of the same movie")
        }


        const movie = await this.movieUseCase.getMovie(movieId)
        const room = await this.roomUseCase.getRoom(roomId)

        if(movie === null) return null
        if(room === null) return null

        const screening = this.screeningRepository.create({
            movie,
            room,
            startsAt: new Date(startsAt),
            endsAt: new Date(endsAt)
        })

        return await this.screeningRepository.save(screening)
    }

    async getScreening(id: string): Promise<Screening | null> {
        return await this.screeningRepository.findOneBy({
            id
        })
    }

    async updateScreening(
        id: string,
        movieId?: string,
        roomId?: string,
        startsAt?: Date, 
        endsAt?: Date 
    ): Promise<Screening | null>{
        if(movieId === undefined) return null
        if(roomId === undefined) return null
        
        const screening = await this.getScreening(id)
        const movie = await this.movieUseCase.getMovie(movieId)
        const room = await this.roomUseCase.getRoom(roomId)

        if(screening === null) return null
        if(movie === null) return null
        if(room === null) return null
        
        if(movie !== null) screening.movie = movie
        if(room !== null) screening.room = room
        if(startsAt !== undefined) screening.startsAt = startsAt
        if(endsAt !== undefined) screening.endsAt = endsAt

        if(!screening) throw new NotFoundError("Screening not found")
        return await this.screeningRepository.save(screening)
    }

    async deleteScreening(id: string): Promise<void>{
        const screening = await this.getScreening(id)

        if(!screening) throw new NotFoundError("Screening not found")
        
        await this.screeningRepository.softRemove(screening)
    }

    async listScreeing({page,size}: ListScreeningFilter): Promise<ListResponse<Screening>>{
        const query = this.screeningRepository.createQueryBuilder("screening")

        query.skip((page - 1) * size)
        query.take(size)

        const [screenings, totalCount] = await query.getManyAndCount()

        return {
            data: screenings,
            pageSize: size,
            page,
            totalCount,
            totalPages: Math.ceil(totalCount / size)
        }
    }
}