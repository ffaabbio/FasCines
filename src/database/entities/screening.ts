import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { Movie } from "./movie.js"
import type { Room } from "./room.js"

@Entity()
export class Screening {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @ManyToOne("Movie", (movie: Movie) => movie.screenings, { onDelete: "RESTRICT" })
    movie: Movie

    @ManyToOne("Room", (room: Room) => room.screenings, { onDelete: "RESTRICT" })
    room: Room

    @Column("timestamp")
    startsAt: Date

    @Column("timestamp")
    endsAt: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    constructor(
        id: string,
        movie: Movie,
        room: Room,
        startsAt: Date,
        endsAt: Date,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    ) {
        this.id = id
        this.movie = movie
        this.room = room
        this.startsAt = startsAt
        this.endsAt = endsAt
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
