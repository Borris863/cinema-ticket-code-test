import { mock, test } from 'node:test';
import assert from 'node:assert/strict';

import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';

test('processes adult ticket purchases', () => {
  const paymentService = {
    makePayment: mock.fn(),
  };
  const seatReservationService = {
    reserveSeat: mock.fn(),
  };
  const service = new TicketService(paymentService, seatReservationService);

  service.purchaseTickets(1, new TicketTypeRequest('ADULT', 2));

  assert.equal(paymentService.makePayment.mock.calls.length, 1);
  assert.deepEqual(paymentService.makePayment.mock.calls[0].arguments, [1, 50]);
  assert.equal(seatReservationService.reserveSeat.mock.calls.length, 1);
  assert.deepEqual(seatReservationService.reserveSeat.mock.calls[0].arguments, [1, 2]);
});
