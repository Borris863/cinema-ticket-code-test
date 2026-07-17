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
