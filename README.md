# Money Transfer

This is an adaption of the moneytransfer example from the Temporal Java SDK

### Running this sample

1. Make sure Temporal Server is running locally (see the [quick install guide](https://docs.temporal.io/docs/server/quick-install/)).
1. `npm install` to install dependencies.
1. `npm run start.watch` to start the Worker.
1. In another shell, `npm run workflow` to run the Workflow Client.
1. In another shell, `npm run signal` to send a signal to confirm the money transfer. 

DEMO

1/ Simple transaction
2/ Introduce an error ; patch
3/ Introduce logic (if > 1000, reject)
4/ Introduce Signal (if > 1000, wait 30s for approval)
5/ Schedule every day
