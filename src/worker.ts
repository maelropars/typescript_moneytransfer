// @@@SNIPSTART typescript-moneytransfer-worker
import { Worker } from '@temporalio/worker';
import * as activities from './activities';

async function run() {
  const worker = await Worker.create({
    namespace: 'default',
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'moneytransfer-typescript',
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
