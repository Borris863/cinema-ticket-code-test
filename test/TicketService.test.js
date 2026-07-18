import { mock, test } from 'node:test';
import assert from 'node:assert/strict';

import TicketService from '../src/pairtest/TicketService.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';

test('processes adult ticket purchases', () => {
  const { paymentService, seatReservationService, service } = createTicketService();

  service.purchaseTickets(1, new TicketTypeRequest('ADULT', 2));

  assert.equal(paymentService.makePayment.mock.callCount(), 1);
  assert.deepEqual(paymentService.makePayment.mock.calls[0].arguments, [1, 50]);
  assert.equal(seatReservationService.reserveSeat.mock.callCount(), 1);
  assert.deepEqual(seatReservationService.reserveSeat.mock.calls[0].arguments, [1, 2]);
});

test('calculates totals for mixed ticket purchases', () => {
  const { paymentService, seatReservationService, service } = createTicketService();

  service.purchaseTickets(
    1,
    new TicketTypeRequest('ADULT', 2),
    new TicketTypeRequest('CHILD', 3),
    new TicketTypeRequest('INFANT', 1),
  );

  assert.equal(paymentService.makePayment.mock.callCount(), 1);
  assert.deepEqual(paymentService.makePayment.mock.calls[0].arguments, [1, 95]);
  assert.equal(seatReservationService.reserveSeat.mock.callCount(), 1);
  assert.deepEqual(seatReservationService.reserveSeat.mock.calls[0].arguments, [1, 5]);
});

test('rejects invalid account IDs before payment or seat reservation', () => {
  const invalidAccountIds = [0, -1, 1.5, undefined];

  for (const accountId of invalidAccountIds) {
    const { paymentService, seatReservationService, service } = createTicketService();

    assert.throws(
      () => service.purchaseTickets(accountId, new TicketTypeRequest('ADULT', 1)),
      InvalidPurchaseException,
    );
    assert.equal(paymentService.makePayment.mock.callCount(), 0);
    assert.equal(seatReservationService.reserveSeat.mock.callCount(), 0);
  }
});

test('rejects empty or negative ticket requests before payment or seat reservation', () => {
  const invalidTicketRequests = [
    [],
    [new TicketTypeRequest('ADULT', 0)],
    [new TicketTypeRequest('ADULT', -1)],
  ];

  for (const ticketTypeRequests of invalidTicketRequests) {
    const { paymentService, seatReservationService, service } = createTicketService();

    assert.throws(
      () => service.purchaseTickets(1, ...ticketTypeRequests),
      InvalidPurchaseException,
    );
    assert.equal(paymentService.makePayment.mock.callCount(), 0);
    assert.equal(seatReservationService.reserveSeat.mock.callCount(), 0);
  }
});

test('allows a purchase of exactly 25 tickets', () => {
  const { paymentService, seatReservationService, service } = createTicketService();

  service.purchaseTickets(1, new TicketTypeRequest('ADULT', 25));

  assert.equal(paymentService.makePayment.mock.callCount(), 1);
  assert.deepEqual(paymentService.makePayment.mock.calls[0].arguments, [1, 625]);
  assert.equal(seatReservationService.reserveSeat.mock.callCount(), 1);
  assert.deepEqual(seatReservationService.reserveSeat.mock.calls[0].arguments, [1, 25]);
});

test('rejects purchases of more than 25 tickets before payment or seat reservation', () => {
  const invalidTicketRequests = [
    [new TicketTypeRequest('ADULT', 26)],
    [
      new TicketTypeRequest('ADULT', 10),
      new TicketTypeRequest('CHILD', 10),
      new TicketTypeRequest('INFANT', 6),
    ],
  ];

  for (const ticketTypeRequests of invalidTicketRequests) {
    const { paymentService, seatReservationService, service } = createTicketService();

    assert.throws(
      () => service.purchaseTickets(1, ...ticketTypeRequests),
      InvalidPurchaseException,
    );
    assert.equal(paymentService.makePayment.mock.callCount(), 0);
    assert.equal(seatReservationService.reserveSeat.mock.callCount(), 0);
  }
});

test('rejects child or infant ticket purchases without an adult before payment or seat reservation', () => {
  const invalidTicketRequests = [
    [new TicketTypeRequest('CHILD', 1)],
    [new TicketTypeRequest('INFANT', 1)],
    [
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('INFANT', 1),
    ],
  ];

  for (const ticketTypeRequests of invalidTicketRequests) {
    const { paymentService, seatReservationService, service } = createTicketService();

    assert.throws(
      () => service.purchaseTickets(1, ...ticketTypeRequests),
      InvalidPurchaseException,
    );
    assert.equal(paymentService.makePayment.mock.callCount(), 0);
    assert.equal(seatReservationService.reserveSeat.mock.callCount(), 0);
  }
});

test('allows child and infant ticket purchases with an adult', () => {
  const validTicketRequests = [
    [new TicketTypeRequest('ADULT', 1), new TicketTypeRequest('CHILD', 1)],
    [new TicketTypeRequest('ADULT', 1), new TicketTypeRequest('INFANT', 1)],
    [
      new TicketTypeRequest('ADULT', 1),
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('INFANT', 1),
    ],
  ];

  for (const ticketTypeRequests of validTicketRequests) {
    const { paymentService, seatReservationService, service } = createTicketService();

    service.purchaseTickets(1, ...ticketTypeRequests);

    assert.equal(paymentService.makePayment.mock.callCount(), 1);
    assert.equal(seatReservationService.reserveSeat.mock.callCount(), 1);
  }
});

test('rejects purchases with more infants than adults before payment or seat reservation', () => {
  const { paymentService, seatReservationService, service } = createTicketService();

  assert.throws(
    () => service.purchaseTickets(
      1,
      new TicketTypeRequest('ADULT', 1),
      new TicketTypeRequest('INFANT', 2),
    ),
    InvalidPurchaseException,
  );
  assert.equal(paymentService.makePayment.mock.callCount(), 0);
  assert.equal(seatReservationService.reserveSeat.mock.callCount(), 0);
});

test('allows purchases with an infant for each adult', () => {
  const validTicketRequests = [
    [new TicketTypeRequest('ADULT', 1), new TicketTypeRequest('INFANT', 1)],
    [new TicketTypeRequest('ADULT', 2), new TicketTypeRequest('INFANT', 2)],
  ];

  for (const ticketTypeRequests of validTicketRequests) {
    const { paymentService, seatReservationService, service } = createTicketService();

    service.purchaseTickets(1, ...ticketTypeRequests);

    assert.equal(paymentService.makePayment.mock.callCount(), 1);
    assert.equal(seatReservationService.reserveSeat.mock.callCount(), 1);
  }
});

function createTicketService() {
  const paymentService = {
    makePayment: mock.fn(),
  };
  const seatReservationService = {
    reserveSeat: mock.fn(),
  };

  return {
    paymentService,
    seatReservationService,
    service: new TicketService(paymentService, seatReservationService),
  };
}
