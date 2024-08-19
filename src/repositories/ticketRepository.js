import ticketDAO from '../dao/mongo/DAOticket.js'

class ticketRepository {
    async createTicket(ticket) {
        return await ticketDAO.createTicket(ticket)
    }
}

export default new ticketRepository()