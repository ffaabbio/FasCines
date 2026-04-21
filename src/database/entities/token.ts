import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { User } from "./user.js"

@Entity()
export class Token {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ length: 512 })
    token: string

    @ManyToOne("User", (user: User) => user.tokens, { onDelete: "CASCADE" })
    user: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    constructor(
        id: string,
        token: string,
        user: User,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    ) {
        this.id = id
        this.token = token
        this.user = user
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
