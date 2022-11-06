// @@@SNIPSTART typescript-hello-client
import { Connection } from '@temporalio/client';
import { SearchAttributePayloadConverter } from '@temporalio/common';
import fs from "fs-extra";

export interface PaymentDesc {
  paymentId?: string;
  status?: string;
  paymentDate?: string;
  amount?: number;
  needApproval?: boolean;
  color?: string
}

export function getTemporalUILink():string{
  return process.env['TEMPORAL_UI'] || 'http://localhost:8080';
}

export async function getConnection():Promise<Connection> {
  let address = process.env['TEMPORAL_HOST_URL'] || 'localhost:7233';
  let connectionOptions = {};

  if (!process.env['MTLS'] || process.env['MTLS'] == 'false'){
    console.log('MTLS is not set, connecting to localhost');
    connectionOptions = {
      address: address, 
    } 
  } else {
    console.log('MTLS is set, connecting to cloud with client certificates');
    if (process.env['TEMPORAL_TLS_CERT'] && process.env['TEMPORAL_TLS_KEY']) {
      console.log('loading certs');
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
  }
    const connection = await Connection.connect(connectionOptions);
  return connection;
}

export async function listMoneyTransfers(approveOnly: boolean):Promise<PaymentDesc[]> {
  let namespaceName = process.env['TEMPORAL_NAMESPACE'] || 'default';
  
  const connection = await getConnection();

  let query = "";
  if (!approveOnly)
    query = 'WorkflowType = "transfer" ';
  else  
    query = 'WorkflowType = "transfer" && CustomStringField = "NEED APPROVAL" && ExecutionStatus="Running"';

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
      if (element.searchAttributes.indexedFields['CustomDatetimeField'] != null) {
        var ldate:Date = converter.fromPayload<Date>(element.searchAttributes.indexedFields['CustomDatetimeField']);
        myPayment.paymentDate = ldate.toLocaleString();
      }
      if (element.searchAttributes.indexedFields['CustomIntField'] != null)
        myPayment.amount = converter.fromPayload<number>(element.searchAttributes.indexedFields['CustomIntField']);
    }

    if (typeof element.execution?.workflowId === 'string' )
      myPayment.paymentId = element.execution?.workflowId;
    
    if (myPayment.status == "SUCCESS")
          myPayment.color = "green";
    if (myPayment.status == "REJECTED")
          myPayment.color = "red";

    wkfarray.push(myPayment);
  });

  return wkfarray;

};
// @@@SNIPEND
