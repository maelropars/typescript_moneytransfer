// @@@SNIPSTART typescript-hello-client
import { Connection, WorkflowClient } from '@temporalio/client';
import { transfer } from './workflows';
import { nanoid } from 'nanoid';

async function run() {
  const connection = new Connection({
  });

  const client = new WorkflowClient(connection.service, {
  });

  const handle = await client.start(transfer, {
    args: ["myaccount", "friendaccount",  nanoid(), 2500 ],
    taskQueue: 'moneytransfer-typescript',
    workflowId: 'workflow-' + nanoid(),
  });
  console.log(`Started workflow ${handle.workflowId}`);

}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
