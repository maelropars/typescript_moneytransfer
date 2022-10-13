// @@@SNIPSTART typescript-hello-client
import { Connection, WorkflowClient } from '@temporalio/client';
import { transfer } from './workflows';
import { confirm } from './workflows';
import { nanoid } from 'nanoid';

async function run() {
  const connection = new Connection({
  });

  const client = new WorkflowClient(connection.service, {
  });

  let workflowId = "workflow-1KlWy3Wtdey990GZt5jwg";

  const handle = await client.getHandle(workflowId);
  handle.signal(confirm, true);
  console.log(`CLIENT : Confirmed transaction ${workflowId}`);

}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
