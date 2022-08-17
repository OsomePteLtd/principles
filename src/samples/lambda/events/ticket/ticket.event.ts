import { SnsEvent, TicketProgressStage, TicketStatus } from '@osome/sdk';
import { debug } from '@osome/server-toolkit';

import { osomeSdk } from '../../lib/toolkit';
import { sendTaskFailure, sendTaskSuccess } from '../../sdk/stepFunctions.sdk';

export async function handleTicketUpdated(messageBody: SnsEvent['ticketUpdated']): Promise<void> {
  debug(`[handleTicketUpdated] Ticket: ${JSON.stringify(messageBody)}`);
  const { ticket: ticketPayload } = messageBody;
  if (!isStatusChangedTo(ticketPayload, TicketStatus.resolved)) {
    return;
  }

  const { ticket } = await osomeSdk.tickets.id(ticketPayload.snapshot.id).get();
  const taskToken = (ticket.metadata as any)?.input?.jamalSfTaskToken;

  if (taskToken) {
    if (isProgressStageChangedTo(ticketPayload, TicketProgressStage.asCancelled)) {
      debug(`[handleTicketUpdated] cancel ticket #${ticket.id} process`);
      await sendTaskFailure({ taskToken, cause: 'Related ticket is canceled' });
    } else if (
      isProgressStageChangedTo(ticketPayload, TicketProgressStage.asDone) ||
      isProgressStageChangedTo(ticketPayload, TicketProgressStage.asCannotDo)
    ) {
      debug(`[handleTicketUpdated] continue ticket #${ticket.id} process`);
      await sendTaskSuccess({ taskToken, payload: ticket });
    }
  }
}

// private

function isStatusChangedTo(ticket: SnsEvent['ticketUpdated']['ticket'], status: TicketStatus) {
  return (
    ticket.snapshot.status === status && ticket.snapshot.status !== ticket.previousVersion?.status
  );
}

function isProgressStageChangedTo(
  ticket: SnsEvent['ticketUpdated']['ticket'],
  stage: TicketProgressStage,
) {
  return (
    ticket.snapshot.progressStage === stage &&
    ticket.snapshot.progressStage !== ticket.previousVersion?.progressStage
  );
}
