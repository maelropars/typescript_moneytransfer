import { executeMoneyTransfer, approveMoneyTransfer } from './client';
import { listMoneyTransfers } from './clientAdmin';
import express from 'express';
import { Request } from 'express';
import { nanoid } from 'nanoid';

type NewPaymentParams = {
   fromAccountId: string;
   toAccountId: string;
   amountCents: number;
};

type ApproveParams = {
   paymentId: string;
};

var app = express();

app.use(express.static('public'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.get('/',  (req, res) => {

   listMoneyTransfers(false).then(result => {
      res.render( __dirname + "/" + "index.html", {payments:result});
   });
})

app.get('/newPayment.html',  (req, res) => {
   res.sendFile( __dirname + "/" + "newPayment.html" );
})

app.get('/approval.html',  (req, res) => {
   listMoneyTransfers(true).then(result => {
      //console.log(result);
      res.render( __dirname + "/" + "approval.html", {payments:result});
   });
})

app.get('/process_get',  (req: Request<{}, {}, {}, NewPaymentParams>, res) => {
    executeMoneyTransfer(req.query.fromAccountId, req.query.toAccountId, nanoid(), req.query.amountCents);
   
    var response ;

    response = {
    fromAccountId:req.query.fromAccountId,
    toAccountId:req.query.toAccountId,
    amountCents:req.query.amountCents
   };
   res.redirect('/');
})

app.get('/process_approve',  (req: Request<{}, {}, {}, ApproveParams>, res) => {
   approveMoneyTransfer(req.query.paymentId)
   res.redirect('/');
 })

app.listen(8081, () => {
   console.log(`[server]: Server is running at https://localhost:8081`);
 });
