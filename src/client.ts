// @@@SNIPSTART typescript-hello-client
import { Connection, WorkflowClient } from '@temporalio/client';
import { transfer, confirm } from './workflows';
import { getDataConverter } from './data-converter';
import fs from "fs-extra";

export async function executeMoneyTransfer(fromAccountId: string, toAccountId: string, transactionID: string ,amountCents: number) {
  let connectionOptions = {};
  let namespaceName = process.env['TEMPORAL_NAMESPACE'] || 'default';
  let address = process.env['TEMPORAL_HOST_URL'] || 'localhost:7233';

  let dataConverter;

  if (process.env['ENCRYPT_PAYLOAD']){
    dataConverter = await getDataConverter();
  }

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

  const client = new WorkflowClient({
    connection,
    namespace: namespaceName, 
    dataConverter: dataConverter,
  });

  const handle = await client.start(transfer, {
    args: [fromAccountId, toAccountId,  transactionID, amountCents ],
    taskQueue: 'moneytransfer-typescript',
    workflowId: transactionID,
    workflowExecutionTimeout: '10 s',
    searchAttributes: {
      CustomStringField: ['PROCESSING'],
      CustomBoolField: [false],
      CustomDatetimeField: [new Date()],
      CustomIntField: [amountCents | 0 ]
    },
    
  });
  console.log(`Started workflow ${handle.workflowId}`);
};

export async function approveMoneyTransfer(paymentId: string) { let connectionOptions = {};
let namespaceName = process.env['TEMPORAL_NAMESPACE'] || 'default';
let address = process.env['TEMPORAL_HOST_URL'] || 'localhost:7233';
let dataConverter;

if (process.env['ENCRYPT_PAYLOAD']){
  dataConverter = await getDataConverter();
}
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

  const client = new WorkflowClient({
    connection,
    namespace: namespaceName,
    dataConverter: dataConverter,
  });

  let workflowId = paymentId;

  const handle = await client.getHandle(workflowId);
  handle.signal(confirm, true);
  console.log(`CLIENT : Confirmed transaction ${workflowId}`);

}
// @@@SNIPEND
