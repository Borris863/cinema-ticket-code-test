import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

const TICKET_PRICES = {
  ADULT: 25,
  CHILD: 15,
  INFANT: 0,
};

const SEAT_ALLOCATING_TICKET_TYPES = new Set(['ADULT', 'CHILD']);
const MAX_TICKETS_PER_PURCHASE = 25;

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
    this.#validateAccountId(accountId);
    this.#validateTicketRequests(ticketTypeRequests);

    const totalAmountToPay = this.#calculateTotalAmount(ticketTypeRequests);
    const totalSeatsToAllocate = this.#calculateSeatsToAllocate(ticketTypeRequests);

    this.#ticketPaymentService.makePayment(accountId, totalAmountToPay);
    this.#seatReservationService.reserveSeat(accountId, totalSeatsToAllocate);
  }

  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('accountId must be an integer greater than zero');
    }
  }

  #validateTicketRequests(ticketTypeRequests) {
    if (ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException('at least one ticket must be requested');
    }

    if (ticketTypeRequests.some(ticketTypeRequest => ticketTypeRequest.getNoOfTickets() <= 0)) {
      throw new InvalidPurchaseException('ticket quantities must be greater than zero');
    }

    if (this.#calculateTicketCount(ticketTypeRequests) > MAX_TICKETS_PER_PURCHASE) {
      throw new InvalidPurchaseException('a maximum of 25 tickets can be purchased at once');
    }
  }

  #calculateTotalAmount(ticketTypeRequests) {
    return ticketTypeRequests.reduce((total, ticketTypeRequest) => {
      const ticketType = ticketTypeRequest.getTicketType();
      const ticketQuantity = ticketTypeRequest.getNoOfTickets();

      return total + (TICKET_PRICES[ticketType] * ticketQuantity);
    }, 0);
  }

  #calculateSeatsToAllocate(ticketTypeRequests) {
    return ticketTypeRequests.reduce((total, ticketTypeRequest) => {
      const ticketType = ticketTypeRequest.getTicketType();

      if (!SEAT_ALLOCATING_TICKET_TYPES.has(ticketType)) {
        return total;
      }

      return total + ticketTypeRequest.getNoOfTickets();
    }, 0);
  }

  #calculateTicketCount(ticketTypeRequests) {
    return ticketTypeRequests.reduce(
      (total, ticketTypeRequest) => total + ticketTypeRequest.getNoOfTickets(),
      0,
    );
  }
}
