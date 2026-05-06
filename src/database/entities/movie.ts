import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { Screening } from "./screening.js"

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         durationMin:
 *           type: integer
 *         director:
 *           type: string
 *           nullable: true
 *         genre:
 *           type: string
 *           nullable: true
 *         releaseYear:
 *           type: integer
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

@Entity()
export class Movie {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("varchar", { length: 255 })
    title: string

    @Column("varchar", { length: 1000, nullable: true })
    description: string

    @Column("int")
    durationMin: number

    @Column("varchar", { length: 255, nullable: true })
    director: string

    @Column("varchar", { length: 100, nullable: true })
    genre: string

    @Column("int", { nullable: true })
    releaseYear: number

    @OneToMany("Screening", (screening: Screening) => screening.movie)
    screenings!: Screening[]
    
    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date


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
