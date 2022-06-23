// @@@SNIPSTART typescript-moneytransfer-workflow
import * as wf from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities';
export const confirm = wf.defineSignal('confirm');

const { deposit } = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '5s'
});

const { withdraw } = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '5s'
});


/** A workflow that simply calls an activity */
export async function transfer(fromAccountId: string, toAccountId: string, referenceId: string, amountCents: number): Promise<void> {
  
  //await wf.sleep('15 s'); // wait some time before triggering the transferx 
  await withdraw(fromAccountId, referenceId, amountCents);
  await deposit(toAccountId, referenceId, amountCents);

}
// @@@SNIPEND