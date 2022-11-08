// @@@SNIPSTART typescript-hello-client
import { Connection, WorkflowClient } from '@temporalio/client';
import { transfer, confirm } from './workflows';
import { getDataConverter } from './data-converter';
import { getConnection } from './clientAdmin';
import { watchFile } from 'fs-extra';
import * as wf from '@temporalio/workflow';

export async function executeMoneyTransfer(fromAccountId: string, toAccountId: string, transactionID: string, amountCents: number) {
  let namespaceName = process.env['TEMPORAL_NAMESPACE'] || 'default';
  let dataConverter;

  if (process.env['ENCRYPT_PAYLOAD']) {
    dataConverter = await getDataConverter();
  }

  const connection = await getConnection();

  const client = new WorkflowClient({
    connection,
    namespace: namespaceName,
    dataConverter: dataConverter,
  });

  const handle = await client.start(transfer, {
    args: [fromAccountId, toAccountId, transactionID, amountCents],
    taskQueue: 'moneytransfer-typescript',
    workflowId: transactionID,
    searchAttributes: {
      CustomStringField: ['PROCESSING'],
      CustomBoolField: [false],
      CustomDatetimeField: [new Date()],
      CustomIntField: [amountCents | 0]
    },

  });
  console.log(`Started workflow ${handle.workflowId}`);
};

export async function approveMoneyTransfer(paymentId: string) {
  let connectionOptions = {};
  let namespaceName = process.env['TEMPORAL_NAMESPACE'] || 'default';
  let dataConverter;

if (process.env['ENCRYPT_PAYLOAD']){
  dataConverter = await getDataConverter();
}
  const connection = await getConnection();

  const client = new WorkflowClient({
    connection,
    namespace: namespaceName,
    dataConverter: dataConverter,
  });

  let workflowId = paymentId;
  const handle = await client.getHandle(workflowId);

  try {
    await handle.signal(confirm, true);
  } catch (error) {
    if (error) {
      console.log(`CLIENT : Workflow already closed, cannot approve ${workflowId}`);
    } else{
      console.log(`CLIENT : Confirmed transaction ${workflowId}`);
    }
  }
}
// @@@SNIPEND
