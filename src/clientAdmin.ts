// @@@SNIPSTART typescript-hello-client
import { Connection } from '@temporalio/client';
import { SearchAttributePayloadConverter } from '@temporalio/common';
import fs from "fs-extra";

export interface PaymentDesc {
  paymentId?: string;
  status?: string;
  paymentDate?: Date;
  amount?: number;
  needApproval?: boolean;
}

export async function listMoneyTransfers(approveOnly: boolean):Promise<PaymentDesc[]> {
  let connectionOptions = {};
  let namespaceName = process.env['TEMPORAL_NAMESPACE'] || 'default';
  let address = process.env['TEMPORAL_HOST_URL'] || 'localhost:7233';
  console.log('connecting to');
  console.log(address);

  if (process.env['MTLS'] || process.env['MTLS'] == 'false'){
    console.log('MTLS is set, connecting to cloud with client certificates');
    if (process.env['TEMPORAL_TLS_CERT'] && process.env['TEMPORAL_TLS_KEY']) {
      const cert = await fs.readFile(process.env['TEMPORAL_TLS_CERT']);
      const key = await fs.readFile(process.env['TEMPORAL_TLS_KEY']);

      connectionOptions = {
        address: address,
        tls: {
          clientCertPair: {
            crt: cert,
            key: key,
          },
        },
      }
    } else {
      throw new Error("Client Certificate details are required to connect to Cloud with MTLS");
    }
    
  } else {
    console.log('MTLS is not set, connecting to localhost');
    connectionOptions = {
      address: address, 
      }
    }

  const connection = await Connection.connect(connectionOptions);

  let query = "";
  if (!approveOnly)
    query = 'WorkflowType = "transfer" ';
  else  
    query = 'WorkflowType = "transfer" && CustomStringField = "NEED APPROVAL" ';

  const response = await connection.workflowService.listWorkflowExecutions({
    query: query,
    namespace: namespaceName,
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
