import Ticket from '../../models/ticketModel.js'

class TicketDAO {
    async createTicket(ticket) {
        return await ticket.save();
    }
}

export default new TicketDAO()