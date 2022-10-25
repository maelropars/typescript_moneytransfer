// @@@SNIPSTART typescript-hello-client
import { Connection } from '@temporalio/client';
import { SearchAttributePayloadConverter } from '@temporalio/common';

export interface PaymentDesc {
  paymentId?: string;
  status?: string;
  paymentDate?: Date;
  amount?: number;
  needApproval?: boolean;
}

export async function listMoneyTransfers(approveOnly: boolean):Promise<PaymentDesc[]> {

  const connection = await Connection.connect();
  let query = "";
  if (!approveOnly)
    query = 'WorkflowType = "transfer" ';
  else  
    query = 'WorkflowType = "transfer" && CustomStringField = "NEED APPROVAL" ';

  const response = await connection.workflowService.listWorkflowExecutions({
    query: query,
    namespace: 'default'
  });

  let wkfarray: PaymentDesc[] = [];

  response.executions.forEach( (element) => {
    const converter = new SearchAttributePayloadConverter();
    const myPayment: PaymentDesc = {};

    if (element.searchAttributes != null)
    if (element.searchAttributes.indexedFields != null) {
      if (element.searchAttributes.indexedFields['CustomStringField'] != null)
        myPayment.status = converter.fromPayload<string>(element.searchAttributes.indexedFields['CustomStringField']);
      if (element.searchAttributes.indexedFields['CustomBoolField'] != null)
        myPayment.needApproval = converter.fromPayload<boolean>(element.searchAttributes.indexedFields['CustomBoolField']);
      if (element.searchAttributes.indexedFields['CustomDatetimeField'] != null)
        myPayment.paymentDate = converter.fromPayload<Date>(element.searchAttributes.indexedFields['CustomDatetimeField']);
      if (element.searchAttributes.indexedFields['CustomIntField'] != null)
        myPayment.amount = converter.fromPayload<number>(element.searchAttributes.indexedFields['CustomIntField']);
    }

    if (typeof element.execution?.workflowId === 'string' )
      myPayment.paymentId = element.execution?.workflowId;
    wkfarray.push(myPayment);
  });

  return wkfarray;

};
// @@@SNIPEND
