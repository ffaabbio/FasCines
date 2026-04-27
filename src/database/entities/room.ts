import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { Screening } from "./screening.js"

@Entity()
export class Room {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("varchar", { unique: true, length: 100 })
    name: string

    @Column("varchar", { length: 500, nullable: true })
    description: string

    @Column("int")
    capacity: number

    @Column("boolean", { default: false })
    isHandicapReady: boolean

    @Column("boolean", { default: false })
    isUnderMaintenance: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @OneToMany("Screening", (screening: Screening) => screening.room)
    screenings!: Screening[]

    constructor(
        id: string,
        name: string,
        description: string,
        capacity: number,
        isHandicapReady: boolean,
        isUnderMaintenance: boolean,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    ) {
        this.id = id
        this.name = name
        this.description = description
        this.capacity = capacity
        this.isHandicapReady = isHandicapReady
        this.isUnderMaintenance = isUnderMaintenance
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
