import { Repository } from "typeorm";
import { Ticket, TicketType } from "../database/entities/ticket.js";
import { TicketUse } from "../database/entities/ticket-use.js";
import { User } from "../database/entities/user.js";

const TICKET_PRICES: Record<TicketType, number> = {
    [TicketType.REGULAR]: 10,
    [TicketType.SUPER]: 80
}

const TICKET_USES: Record<TicketType, number> = {
    [TicketType.REGULAR]: 1,
    [TicketType.SUPER]: 10
}

export class TicketUsecase {
    constructor(
        private ticketRepo: Repository<Ticket>,
        private ticketUseRepo: Repository<TicketUse>,
        private userRepo: Repository<User>
    ) {}

    async buyTicket(userId: string, type: TicketType): Promise<Ticket> {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new Error("user not found");

        const price = TICKET_PRICES[type];
        if (user.balance < price) throw new Error("insufficient balance");

        user.balance = Number(user.balance) - price;
        await this.userRepo.save(user);

        const ticket = this.ticketRepo.create({
            type,
            remainingUses: TICKET_USES[type],
            price,
            user
        });
        return await this.ticketRepo.save(ticket);
    }

    async useTicket(ticketId: number, userId: string, seanceId: number): Promise<TicketUse> {
        const ticket = await this.ticketRepo.findOne({
            where: { id: ticketId },
            relations: ["user"]
        });
        if (!ticket || ticket.user.id !== userId) throw new Error("j'ai perdue ton ticket");
        if (ticket.remainingUses <= 0) throw new Error("Vas recharger ton compte");

        ticket.remainingUses -= 1;
        await this.ticketRepo.save(ticket);

        const use = this.ticketUseRepo.create({ seanceId, ticket });
        return await this.ticketUseRepo.save(use);
    }

    async listTickets(userId: string): Promise<Ticket[]> {
        return await this.ticketRepo.find({
            where: { user: { id: userId } }
        });
    }

    async getHistory(userId: string): Promise<TicketUse[]> {
        return await this.ticketUseRepo.find({
            where: { ticket: { user: { id: userId } } },
            relations: ["ticket"]
        });
    }
}
