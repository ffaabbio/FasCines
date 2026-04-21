import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { Screening } from "./screening.js"

@Entity()
export class Movie {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ length: 255 })
    title: string

    @Column({ length: 1000, nullable: true })
    description: string

    @Column()
    durationMin: number

    @Column({ length: 255, nullable: true })
    director: string

    @Column({ length: 100, nullable: true })
    genre: string

    @Column({ nullable: true })
    releaseYear: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @OneToMany("Screening", (screening: Screening) => screening.movie)
    screenings!: Screening[]

    constructor(
        id: string,
        title: string,
        description: string,
        durationMin: number,
        director: string,
        genre: string,
        releaseYear: number,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    ) {
        this.id = id
        this.title = title
        this.description = description
        this.durationMin = durationMin
        this.director = director
        this.genre = genre
        this.releaseYear = releaseYear
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
