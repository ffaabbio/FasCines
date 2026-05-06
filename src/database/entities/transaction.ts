import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { User } from "./user.js"
import type { Ticket } from "./ticket.js"

export enum TransactionType {
    CREDIT = "credit",      // recharge du solde
    PURCHASE = "purchase",  // achat d'un ticket
    USAGE = "usage"         // utilisation d'un ticket à une séance
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [credit, purchase, usage]
 *         amount:
 *           type: number
 *           format: float
 *           nullable: true
 *         screeningId:
 *           type: integer
 *           nullable: true
 *         user:
 *           $ref: '#/components/schemas/User'
 *         ticket:
 *           $ref: '#/components/schemas/Ticket'
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
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "enum", enum: TransactionType })
    type: TransactionType

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    amount: number | null

    @Column("int", { nullable: true })
    screeningId: number | null

    @ManyToOne("User", (user: User) => user.transactions)
    user: User

    @ManyToOne("Ticket", (ticket: Ticket) => ticket.transactions, { nullable: true })
    ticket: Ticket | null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    constructor(
        id: number,
        type: TransactionType,
        amount: number | null,
        screeningId: number | null,
        user: User,
        ticket: Ticket | null,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    ) {
        this.id = id
        this.type = type
        this.amount = amount
        this.screeningId = screeningId
        this.user = user
        this.ticket = ticket
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.deletedAt = deletedAt
    }
}
