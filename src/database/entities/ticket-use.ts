import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Ticket } from "./ticket.js";

@Entity()
export class TicketUse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    seanceId: number;

    @ManyToOne("Ticket", (ticket: Ticket) => ticket.uses)
    ticket: Ticket;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    constructor(
        id: number,
        seanceId: number,
        ticket: Ticket,
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    ) {
        this.id = id;
        this.seanceId = seanceId;
        this.ticket = ticket;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
