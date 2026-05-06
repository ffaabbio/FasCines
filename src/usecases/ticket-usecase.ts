import { Repository } from "typeorm"
import { Ticket, TicketType } from "../database/entities/ticket.js"
import { Transaction, TransactionType } from "../database/entities/transaction.js"
import { User } from "../database/entities/user.js"
import { NotFoundError } from "./error.js"

const TICKET_PRICES = {
    [TicketType.REGULAR]: 10,
    [TicketType.SUPER]: 50,
}

const TICKET_USES = {
    [TicketType.REGULAR]: 1,
    [TicketType.SUPER]: 10,
}

export class TicketUsecase {
    constructor(
        private ticketRepo: Repository<Ticket>,
        private transactionRepo: Repository<Transaction>,
        private userRepo: Repository<User>
    ) {}

    async addBalance(userId: string, amount: number): Promise<User> {
        const user = await this.userRepo.findOneBy({ id: userId })
        if (!user) throw new NotFoundError("Utilisateur non trouvé")

        user.balance = Number(user.balance) + amount
        await this.userRepo.save(user)

        await this.transactionRepo.save(
            this.transactionRepo.create({ type: TransactionType.CREDIT, amount, screeningId: null, user, ticket: null })
        )

        return user
    }

    async buyTicket(userId: string, type: TicketType): Promise<Ticket> {
        const user = await this.userRepo.findOneBy({ id: userId })
        if (!user) throw new NotFoundError("Utilisateur non trouvé")

        const price = TICKET_PRICES[type]
        if (Number(user.balance) < price) throw new Error("Solde insuffisant")

        user.balance = Number(user.balance) - price
        await this.userRepo.save(user)

        const ticket = await this.ticketRepo.save(
            this.ticketRepo.create({ type, remainingUses: TICKET_USES[type], price, user })
        )

        await this.transactionRepo.save(
            this.transactionRepo.create({ type: TransactionType.PURCHASE, amount: -price, screeningId: null, user, ticket })
        )

        return ticket
    }

    async useTicket(ticketId: number, userId: string, screeningId: number): Promise<Transaction> {
        const ticket = await this.ticketRepo.findOne({ where: { id: ticketId }, relations: ["user"] })
        if (!ticket) throw new NotFoundError("Ticket non trouvé")
        if (ticket.user.id !== userId) throw new Error("Ce ticket ne vous appartient pas")
        if (ticket.remainingUses <= 0) throw new Error("Ce ticket n'a plus d'utilisations restantes")

        ticket.remainingUses -= 1
        await this.ticketRepo.save(ticket)

        const user = await this.userRepo.findOneBy({ id: userId })

        return await this.transactionRepo.save(
            this.transactionRepo.create({ type: TransactionType.USAGE, amount: null, screeningId, user: user!, ticket })
        )
    }

    async listTickets(userId: string): Promise<Ticket[]> {
        return await this.ticketRepo.find({ where: { user: { id: userId } } })
    }

    async getTransactions(userId: string): Promise<Transaction[]> {
        return await this.transactionRepo.find({
            where: { user: { id: userId } },
            relations: ["ticket"],
            order: { createdAt: "DESC" },
        })
    }
}
