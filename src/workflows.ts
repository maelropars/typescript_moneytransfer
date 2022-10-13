// @@@SNIPSTART typescript-moneytransfer-workflow
import * as wf from '@temporalio/workflow';
import type * as activities from './activities';
export const confirm = wf.defineSignal<[boolean]>('confirm');

const { deposit } = wf.proxyActivities<typeof activities>({
  retry: {
    initialInterval: '50 milliseconds',
    maximumAttempts: Infinity,
  },
  startToCloseTimeout: '10 seconds',
});

const { withdraw } = wf.proxyActivities<typeof activities>({
  retry: {
    initialInterval: '50 milliseconds',
    maximumAttempts: Infinity,
  },
  startToCloseTimeout: '10 seconds',
});

// THIS IS HOW THE FINAL WORKFLOW LOOKS
// When the ammount is > 1000, it requires an approval, wait 30s for someone to confirm the transfer
export async function transfer2(fromAccountId: string, toAccountId: string, referenceId: string, amountCents: number): Promise<void> {
  let isConfirmed = true;
  wf.setHandler(confirm, (response) => void (isConfirmed = response));

  console.log(`WORKFLOW  : Request transfer from ${fromAccountId} to ${toAccountId} of ${amountCents} cents requested. ReferenceId=${referenceId}`);
  if (amountCents > 1000){
    isConfirmed = false;
    if (await wf.condition(() => isConfirmed, '30 seconds')) {
      console.log('WORKFLOW : Confirmed');
    } else {
      console.log('WORKFLOW : Timeout, cancel transaction');  
    }
  }
  if (isConfirmed){
    await withdraw(fromAccountId, referenceId, amountCents);
    await deposit(toAccountId, referenceId, amountCents);
  } else {
    console.log('WORKFLOW : Rejecting transfer');
  }
}

// INITIAL WORKFLOW 
export async function transfer(fromAccountId: string, toAccountId: string, referenceId: string, amountCents: number): Promise<void> {

  
    await withdraw(fromAccountId, referenceId, amountCents);
    await deposit(toAccountId, referenceId, amountCents);

} 

// @@@SNIPEND