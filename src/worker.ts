// @@@SNIPSTART typescript-moneytransfer-worker
import { NativeConnection, Worker } from '@temporalio/worker';
import { getDataConverter } from './data-converter';
import * as activities from './activities';
import fs from "fs-extra";


async function getConnection(): Promise<NativeConnection> {
  let connectionOptions = {};
  let address = process.env['TEMPORAL_HOST_URL'] || 'localhost:7233';

  console.log('connecting to');
  console.log(address);

  if (process.env['MTLS'] || process.env['MTLS'] == 'false') {
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

  } else {
    console.log('MTLS is not set, connecting to localhost');
    connectionOptions = {
      address: address,
    }
  }

  const connection = await NativeConnection.connect(connectionOptions);
  return connection;
}

async function run() {
  let namespaceName = process.env['TEMPORAL_NAMESPACE'] || 'default';
  const connection = await getConnection();
  let dataConverter;

  if (process.env['ENCRYPT_PAYLOAD']) {
    dataConverter = await getDataConverter();
  }
  const worker = await Worker.create({
    connection: connection,
    namespace: namespaceName,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'moneytransfer-typescript',
    dataConverter: dataConverter,
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
