import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { Token } from "./token.js"
import { Ticket } from "./ticket.js"

export enum UserRole {
    CLIENT = "client",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("varchar", { unique: true, length: 255 })
    email: string

    @Column("varchar", { length: 255 })
    password: string

    @Column("varchar", { length: 100 })
    firstName: string

    @Column("varchar", { length: 100 })
    lastName: string

    @Column("decimal", { precision: 10, scale: 2, default: 100 })       // a retire il commence avec 100€
    balance: number;

    @Column("enum", { enum: UserRole, default: UserRole.CLIENT })
    role: UserRole

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @OneToMany("Token", (token: Token) => token.user)
    tokens!: Token[]

    @OneToMany("Ticket", (ticket: Ticket) => ticket.user)
    tickets!: Ticket[];

    constructor(
        id: string,
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        balance: number,
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
        this.balance = balance
        this.role = role
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
