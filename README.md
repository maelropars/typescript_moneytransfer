# Money Transfer

This is a typescript adaption of the moneytransfer example from the Temporal Java SDK

### Running this sample

1. Make sure Temporal Server is running locally (see the [quick install guide](https://docs.temporal.io/docs/server/quick-install/)).
1. `npm install` to install dependencies.
1. `npm run start.watch` to start the Worker.
1. In another shell, `npm run workflow` to run the Workflow Client.
1. Update clientSignal.ts with the correct workflowId 
`let workflowId = "workflow-1KlWy3Wtdey990GZt5jwg";`
In another shell, `npm run signal` to send a signal to confirm the money transfer. 

DEMO SCENARIO

1. Simple transaction
1. Introduce an error in activity ; patch code
1. Introduce business logic (if > 1000, reject)
1. Introduce long running business logic with signal, Signal (if > 1000, wait 30s for approval)
