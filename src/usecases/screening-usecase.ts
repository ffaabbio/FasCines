import {Repository,LessThan,MoreThan,Not} from "typeorm"
import { Screening } from "../database/entities/screening.js";
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

        const minDuration = movie.durationMin + 30

        const start = new Date(startsAt)
        const end = new Date(endsAt)

        const actualDuration = (end.getTime() - start.getTime()) / 60000 

        if (actualDuration < minDuration) {
            throw new ResourceConflictError(
                `Screening duration too short: minimum is ${minDuration} minutes`
            )
        }

        const screening = this.screeningRepository.create({
            movie,
            room,
            startsAt: new Date(startsAt),
            endsAt: new Date(endsAt)
        })

        return await this.screeningRepository.save(screening)
    }

    async getScreening(id: string): Promise<Screening | null> {
        return await this.screeningRepository.findOne({
            where:{id},
            relations: ["movie","room"]
        })
    }

    async updateScreening(
        id: string,
        movieId?: string,
        roomId?: string,
        startsAt?: Date, 
        endsAt?: Date 
    ): Promise<Screening | null> {

        const screening = await this.screeningRepository.findOne({
            where: { id },
            relations: ["movie", "room"]
        })

        if (!screening) return null

        if (movieId !== undefined) {
            const movie = await this.movieUseCase.getMovie(movieId)
            if (!movie) throw new ResourceConflictError("Movie not found")
            screening.movie = movie
        }

        if (roomId !== undefined) {
            const room = await this.roomUseCase.getRoom(roomId)
            if (!room) throw new ResourceConflictError("Room not found")
            if (room.isUnderMaintenance)
                throw new ResourceConflictError("Room is under maintenance")
            screening.room = room
        }

        if (startsAt !== undefined) screening.startsAt = new Date(startsAt)
        if (endsAt !== undefined) screening.endsAt = new Date(endsAt)

        const minDuration = screening.movie.durationMin + 30
        const actualDuration =
            (screening.endsAt.getTime() - screening.startsAt.getTime()) / 60000

        if (actualDuration < minDuration)
            throw new ResourceConflictError(`Screening duration too short: minimum is ${minDuration} minutes`)

        const overlapping = await this.screeningRepository.findOne({
            where: {
                movie: { id: screening.movie.id },
                room: { id: screening.room.id },
                startsAt: LessThan(screening.endsAt),
                endsAt: MoreThan(screening.startsAt),
                id: Not(id)
            }
        })

        if (overlapping)
            throw new ResourceConflictError("Screening overlaps with another screening")

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

        const [screenings, totalCount] = await query.leftJoinAndSelect("screening.movie", "movie")
        .leftJoinAndSelect("screening.room", "room")
        .getManyAndCount()

        return {
            data: screenings,
            pageSize: size,
            page,
            totalCount,
            totalPages: Math.ceil(totalCount / size)
        }
    }
}