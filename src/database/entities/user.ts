import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { Token } from "./token.js"

export enum UserRole {
    CLIENT = "client",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ unique: true, length: 255 })
    email: string

    @Column({ length: 255 })
    password: string

    @Column({ length: 100 })
    firstName: string

    @Column({ length: 100 })
    lastName: string

    @Column({ type: "enum", enum: UserRole, default: UserRole.CLIENT })
    role: UserRole

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @OneToMany("Token", (token: Token) => token.user)
    tokens!: Token[]

    constructor(
        id: string,
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        role: UserRole,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    ) {
        this.id = id
        this.email = email
        this.password = password
        this.firstName = firstName
        this.lastName = lastName
        this.role = role
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
