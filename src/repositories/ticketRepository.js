import Ticket from '../models/ticketModel.js'

export default {
    createTicket: async (ticket) => await ticket.save()
}