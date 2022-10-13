// @@@SNIPSTART typescript-moneytransfer-activity

export async function withdraw(accountId: string, referenceId: string, amountCents: number): Promise<void> {
  // THROW ERROR TO SHOW AUTOMATED RETRIES + PATCHING 
  //throw "Unexpected Error";
  console.log(`ACTIVITY WITHDRAW : Withdraw from ${accountId} of ${amountCents} cents requested. ReferenceId=${referenceId}`);
  }

export async function deposit(accountId: string, referenceId: string, amountCents: number): Promise<void> {
  // THROW ERROR TO SHOW AUTOMATED RETRIES + PATCHING 
  //throw "Unexpected Error";
  console.log(`ACTIVITY DEPOSIT : Deposit to ${accountId} of ${amountCents} cents requested. ReferenceId=${referenceId}`);
}

// @@@SNIPEND mael_bzh