// @@@SNIPSTART typescript-hello-client
import { Connection, WorkflowClient } from '@temporalio/client';
import { transfer, confirm } from './workflows';

export async function executeMoneyTransfer(fromAccountId: string, toAccountId: string, transactionID: string ,amountCents: number) {
  const connection = await Connection.connect();
  const client = new WorkflowClient({
    connection,
    namespace: 'default' 
  });

  const handle = await client.start(transfer, {
    args: [fromAccountId, toAccountId,  transactionID, amountCents ],
    taskQueue: 'moneytransfer-typescript',
    workflowId: transactionID,
    searchAttributes: {
      CustomStringField: ['PROCESSING'],
      CustomBoolField: [false],
      CustomDatetimeField: [new Date()],
      CustomIntField: [amountCents | 0 ]
    },
  });
  console.log(`Started workflow ${handle.workflowId}`);
};

export async function approveMoneyTransfer(paymentId: string) {
  const connection = await Connection.connect();
  const client = new WorkflowClient({
    connection,
    namespace: 'default' 
  });

  let workflowId = paymentId;

  const handle = await client.getHandle(workflowId);
  handle.signal(confirm, true);
  console.log(`CLIENT : Confirmed transaction ${workflowId}`);

}
// @@@SNIPEND
