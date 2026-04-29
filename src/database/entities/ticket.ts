import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { User } from "./user.js";
import type { TicketUse } from "./ticket-use.js";

export enum TicketType {
    REGULAR = "regular",
    SUPER = "super"
}
export enum UserRole {
    CLIENT = "client",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}


@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: TicketType })
    type: TicketType;

    @Column("int")
    remainingUses: number;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @ManyToOne("User", (user: User) => user.tickets)
    user: User;

    @OneToMany("TicketUse", (ticketUse: TicketUse) => ticketUse.ticket)
    uses!: TicketUse[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

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
        this.id = id;
        this.type = type;
        this.remainingUses = remainingUses;
        this.price = price;
        this.user = user;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
