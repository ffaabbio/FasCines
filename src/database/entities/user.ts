import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { Token } from "./token.js"
import type { Ticket } from "./ticket.js"
import type { Transaction } from "./transaction.js"

export enum UserRole {
    CLIENT = "client",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [client, admin, super_admin]
 *         balance:
 *           type: number
 *           format: float
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

    @Column("enum", { enum: UserRole, default: UserRole.CLIENT })
    role: UserRole

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    balance: number


    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @OneToMany("Token", (token: Token) => token.user)
    tokens!: Token[]

    @OneToMany("Ticket", (ticket: Ticket) => ticket.user)
    tickets!: Ticket[]

    @OneToMany("Transaction", (transaction: Transaction) => transaction.user)
    transactions!: Transaction[]

    constructor(
        id: string,
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        role: UserRole,
        balance: number,
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
        this.balance = balance
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
