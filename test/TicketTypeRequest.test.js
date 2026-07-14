import test from 'node:test';
import assert from 'node:assert/strict';

import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';

test('stores the requested ticket type and quantity', () => {
  const request = new TicketTypeRequest('ADULT', 2);

  assert.equal(request.getTicketType(), 'ADULT');
  assert.equal(request.getNoOfTickets(), 2);
});

test('allows adult, child, and infant ticket requests', () => {
  for (const ticketType of ['ADULT', 'CHILD', 'INFANT']) {
    const request = new TicketTypeRequest(ticketType, 1);

    assert.equal(request.getTicketType(), ticketType);
  }
});

test('rejects unsupported ticket types', () => {
  assert.throws(() => new TicketTypeRequest('SENIOR', 1), TypeError);
});

test('rejects non integer ticket quantities', () => {
  assert.throws(() => new TicketTypeRequest('ADULT', 1.5), TypeError);
});
