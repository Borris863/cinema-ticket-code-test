import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

const ADULT_TICKET_PRICE = 25;
const ADULT_TICKET_TYPE = 'ADULT';

export default class TicketService {
  #ticketPaymentService;

  #seatReservationService;

  /**
   * Should only have private methods other than the one below.
   */

  constructor(
    ticketPaymentService = new TicketPaymentService(),
    seatReservationService = new SeatReservationService(),
  ) {
    this.#ticketPaymentService = ticketPaymentService;
    this.#seatReservationService = seatReservationService;
  }

  /**
   * Purchases tickets for an account.
   *
   * @param {number} accountId
   * @param {...TicketTypeRequest} ticketTypeRequests
   * @throws {InvalidPurchaseException}
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    const totalAmountToPay = this.#calculateTotalAmount(ticketTypeRequests);
    const totalSeatsToAllocate = this.#calculateSeatsToAllocate(ticketTypeRequests);

    this.#ticketPaymentService.makePayment(accountId, totalAmountToPay);
    this.#seatReservationService.reserveSeat(accountId, totalSeatsToAllocate);
  }

  #calculateTotalAmount(ticketTypeRequests) {
    return this.#countAdultTickets(ticketTypeRequests) * ADULT_TICKET_PRICE;
  }

  #calculateSeatsToAllocate(ticketTypeRequests) {
    return this.#countAdultTickets(ticketTypeRequests);
  }

  #countAdultTickets(ticketTypeRequests) {
    return ticketTypeRequests
      .filter(ticketTypeRequest => ticketTypeRequest.getTicketType() === ADULT_TICKET_TYPE)
      .reduce((total, ticketTypeRequest) => total + ticketTypeRequest.getNoOfTickets(), 0);
  }
}
