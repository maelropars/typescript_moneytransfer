// @@@SNIPSTART typescript-moneytransfer-workflow
import * as wf from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities';
export const confirm = wf.defineSignal<[boolean]>('confirm');

const { deposit } = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '5s'
});

const { withdraw } = wf.proxyActivities<typeof activities>({
  startToCloseTimeout: '5s'
});


/** A workflow that simply calls an activity */
export async function transfer(fromAccountId: string, toAccountId: string, referenceId: string, amountCents: number): Promise<void> {
  let isConfirmed = true;
  wf.setHandler(confirm, (response) => void (isConfirmed = response));
    
  if ( amountCents > 1000) {
    isConfirmed = false;
    console.log('Wait 10s for confirmation');  
    try {
      if (await wf.condition(() => isConfirmed, '30 s')) {
        console.log('confirmed');
      } else {
        console.log('timeout, cancel transaction');  
      }
    } catch (err) {
      if (err instanceof wf.CancelledFailure) {
        console.log('Cancelled');
      }
      throw err;
    }
  }

  if (isConfirmed){
  //await wf.sleep('15 s'); // wait some time before triggering the transferx 
  await withdraw(fromAccountId, referenceId, amountCents);
  await deposit(toAccountId, referenceId, amountCents);
  }
}
// @@@SNIPEND