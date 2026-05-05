import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import type { User } from "./user.js"
import type { Ticket } from "./ticket.js"

export enum TransactionType {
    CREDIT = "credit",      // recharge du solde
    PURCHASE = "purchase",  // achat d'un ticket
    USAGE = "usage"         // utilisation d'un ticket à une séance
}

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
