import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { User } from "./user.js"
import type { Transaction } from "./transaction.js"

export enum TicketType {
    REGULAR = "regular",
    SUPER = "super"
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [regular, super]
 *         remainingUses:
 *           type: integer
 *         price:
 *           type: number
 *           format: float
 *         user:
 *           $ref: '#/components/schemas/User'
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
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
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "enum", enum: TicketType })
    type: TicketType

    @Column("int")
    remainingUses: number

    @Column("decimal", { precision: 10, scale: 2 })
    price: number

    @ManyToOne("User", (user: User) => user.tickets)
    user: User

    @OneToMany("Transaction", (transaction: Transaction) => transaction.ticket)
    transactions!: Transaction[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    constructor(
        id: number,
        type: TicketType,
        remainingUses: number,
        price: number,
        user: User,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    ) {
        this.id = id
        this.type = type
        this.remainingUses = remainingUses
        this.price = price
        this.user = user
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
