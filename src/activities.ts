// @@@SNIPSTART typescript-moneytransfer-activity

export async function withdraw(accountId: string, referenceId: string, amountCents: number): Promise<void> {
  console.log(`Withdraw from ${accountId} of ${amountCents} cents requested. ReferenceId=${referenceId}`);

}
export async function deposit(accountId: string, referenceId: string, amountCents: number): Promise<void> {
  //throw "Unexpected Error";
  console.log(`Deposit to ${accountId} of ${amountCents} cents requested. ReferenceId=${referenceId}`);
}

// @@@SNIPEND