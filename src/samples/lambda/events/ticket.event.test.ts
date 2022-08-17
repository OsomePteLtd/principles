import { SnsEventName, TicketProgressStage, TicketSnapshot, TicketStatus } from '@osome/sdk';
import { fakeDbId, testSns } from '@osome/server-toolkit';
import * as faker from 'faker';

import { handleSns } from '../../controllers/worker/worker.controller';
import { nockCoreGetTicketById } from '../../tests/nocks/core.nock';
import {
  nockCancelStepFunctionExecution,
  nockContinueStepFunctionExecution,
} from '../../tests/nocks/stepFunctions.nock';

describe('ticketUpdated', () => {
  it('continue stepFunction process', async () => {
    const jamalSfTaskToken = faker.random.uuid();
    const event = fakeTicketUpdatedEvent({
      snapshotOverrides: {
        progressStage: TicketProgressStage.asDone,
      },
    });
    const coreGetTicketByIdResponse = {
      ...event.body.ticket.snapshot,
      metadata: { input: { jamalSfTaskToken } },
    };
    nockCoreGetTicketById({
      ticketId: event.body.ticket.snapshot.id,
      responseBody: {
        ticket: coreGetTicketByIdResponse,
      },
    });
    nockContinueStepFunctionExecution(coreGetTicketByIdResponse, jamalSfTaskToken);

    await testSns(handleSns, [event]);
  });

  it('do nothing if previous version of ticket resolved', async () => {
    const event = fakeTicketUpdatedEvent({
      previousVersionOverrides: { status: TicketStatus.resolved },
    });

    await testSns(handleSns, [event]);
  });

  it('should cancel stepFunction process', async () => {
    const taskToken = faker.random.uuid();
    const event = fakeTicketUpdatedEvent({
      snapshotOverrides: {
        progressStage: TicketProgressStage.asCancelled,
      },
    });
    nockCoreGetTicketById({
      ticketId: event.body.ticket.snapshot.id,
      responseBody: {
        ticket: {
          ...event.body.ticket.snapshot,
          metadata: { input: { jamalSfTaskToken: taskToken } },
        },
      },
    });
    nockCancelStepFunctionExecution({ taskToken, cause: 'Related ticket is canceled' });

    await testSns(handleSns, [event]);
  });

  it('should not cancel stepFunction process when progressStage was not changed', async () => {
    const taskToken = faker.random.uuid();
    const event = fakeTicketUpdatedEvent({
      snapshotOverrides: {
        status: TicketStatus.resolved,
        progressStage: TicketProgressStage.asCancelled,
      },
      previousVersionOverrides: {
        progressStage: TicketProgressStage.asCancelled,
      },
    });
    nockCoreGetTicketById({
      ticketId: event.body.ticket.snapshot.id,
      responseBody: {
        ticket: {
          ...event.body.ticket.snapshot,
          metadata: { input: { jamalSfTaskToken: taskToken } },
        },
      },
    });

    await testSns(handleSns, [event]);
  });
});

// helpers

function fakeTicketUpdatedEvent({
  snapshotOverrides,
  previousVersionOverrides,
}: {
  snapshotOverrides?: Partial<TicketSnapshot>;
  previousVersionOverrides?: Partial<TicketSnapshot>;
}) {
  return {
    eventName: SnsEventName.ticketUpdated,
    body: {
      ticket: {
        snapshot: {
          id: fakeDbId(),
          status: TicketStatus.resolved,
          ...snapshotOverrides,
        },
        previousVersion: {
          ...previousVersionOverrides,
        },
      },
    },
  };
}
