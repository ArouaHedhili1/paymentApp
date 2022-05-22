var express = require("express");
const req = require("express/lib/request");
var router = express.Router();
var env = require("dotenv").config({ path: "./.env" });
const url = require("url");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const payoutControllers = require("../../controllers/payout");
const accountControllers = require("../../controllers/account");
const paymentControllers = require("../../controllers/payment");
const invoiceControllers = require("../../controllers/invoice");

router.get("/config", (req, res) => {
  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    amount: process.env.AMOUNT,
    currency: process.env.CURRENCY,
  });
});

router.post("/payConsultant", async (req, res, next) => {
  try {
    console.log(req.body);
    const echeance = parseInt(req.body.echeance);
    console.log(echeance);
    const tva = parseInt(req.body.tva);
    console.log(tva);

    
    if (echeance !== null) {
      const accountRetrieve = await accountControllers.retrieveAccount(
        req.body.account
      );

      console.log("accouuuuuutttt", accountRetrieve)
      //update tva dans le metadata du compte connect
      const accountUpdate = await payoutControllers.updateAccount(
        accountRetrieve.id,
        accountRetrieve.metadata.iban,
        tva
      );

      //création de paiement intent autant que le nb d'écheance
      for (let i = 0; i < echeance; i++) {
        //création des dates des factures
        var d = new Date(req.body.date_debut);
        var days = i * 30;
        var days_due = 30 + i * 30;
        var result = d.setDate(d.getDate() + days_due);
        var end_period = d.getTime() / 1000;
        var d_new = new Date(req.body.date_debut);

        var result2 = d_new.setDate(d_new.getDate() + days);
        var start_period = d_new.getTime() / 1000;

      //   const paymentMethod = await payoutControllers.createPaymentMethod(
      //     accountRetrieve.metadata.iban,
      //     accountRetrieve.business_profile.name,
      //     accountRetrieve.email,
      //     //accountRetrieve.id
      //   );




      const retrieveCustomer = await stripe.customers.list();
      console.log("heeeere", retrieveCustomer)
          const dataRetrieve = retrieveCustomer.data.filter(
            (element) =>
              element.metadata.connect_account === accountRetrieve.id
          );
          console.log("woooooo", dataRetrieve[0].id);

          const paymentMethods2 = await stripe.customers.listPaymentMethods(
            dataRetrieve[0].id,
            { type: "sepa_debit" }
          );
          console.log("defaultttttttt", paymentMethods2.data[0].id);

        const payment = await payoutControllers.createPaymentIntent(
          paymentMethods2.data[0].id,
          req.body.amountHT,
          req.body.account,
          tva,
          echeance,
          dataRetrieve[0].id
        );
        console.log("dddddddddd", payment);
        //create invoice from consultant to meltingworks
        const product = await invoiceControllers.product(req.body.nom_produit);

        const price = await invoiceControllers.price(
          product.id,
          req.body.amountHT,
          echeance
        );
        const paymentUpdate = await paymentControllers.updatePaymentIntent(payment.id, product.name)
console.log("quququququ", paymentUpdate)
        const tax = await invoiceControllers.createTaxRate(
          req.body.nom_produit,
          tva
        );

        const item = await invoiceControllers.item(
          req.body.customer,
          price.id,
          start_period,
          end_period
        );

        const invoice = await invoiceControllers.invoice(
          req.body.customer,
          req.body.account,
          req.body.id_commande,
          tax.id,
          end_period
        );
        console.log(invoice.id);


        const finalize = await invoiceControllers.finalize(invoice.id);
        console.log("eeeeee",finalize.id);

        const send = await invoiceControllers.send(
          invoice.id,
          accountRetrieve.business_profile.name
        );
        console.log("aaaaaa",send.id);

        const updatePayment = await stripe.paymentIntents.update(payment.id,{
          metadata:{
            product: product.name,
            id_invoice: invoice.id
          }
        })
        console.log("updaaaaate", updatePayment)


      }
    }
  } catch (err) {
    res.status(500).json({ message: "pay consultant not done" });
    console.log(err);
  }
});

router.post("/adminConfirm", async (req, res, next) => {
  try {
    console.log(req.body);
    const echeance = parseInt(req.body.echeance);
    console.log(echeance);
    const tva = parseInt(req.body.tva);
    console.log(tva);

    const account = await accountControllers.retrieveAccount(req.body.account);
    const confirm = await payoutControllers.confirmPaymentIntent(
      req.body.id_paymentIntent
    );
    console.log("status", confirm.status);
    console.log("amount", confirm.amount);
    console.log("rddddddddeeeee", confirm);

    //create invoice from consultant to meltingworks
    const product = await invoiceControllers.product(req.body.nom_produit);
    console.log(product.id);
    const price = await invoiceControllers.price(
      product.id,
      req.body.amountHT,
      echeance
    );
    console.log(price.id);
    const tax = await invoiceControllers.createTaxRate(
      req.body.nom_produit,
      tva
    );
    const item = await invoiceControllers.item(req.body.customer, price.id);
    console.log(item.id);
    const invoice = await invoiceControllers.invoice(
      req.body.customer,
      req.body.account,
      req.body.id_commande,
      tax.id
    );
    console.log(invoice);
    const finalize = await invoiceControllers.finalize(invoice.id);
    console.log(finalize.id);
    const send = await invoiceControllers.send(
      invoice.id,
      account.business_profile.name
    );
    console.log(send);

    // const item = await payoutControllers.createInvoiceItem()
    // const createInvoice = await payoutControllers.createInvoiceConnect(req.body.customer, account.id )
    // const finalize = await payoutControllers.finalizeInvoiceConnect()
    // const pay = await payoutControllers.payInvoiceConnect()
    // const send = await payoutControllers.sendInvoiceConnect()

    // const bank = await payoutControllers.getExternalBanks(account.id);
    // console.log("jjjjj", bank.data[0].id)
    // const payout = await payoutControllers.createPayout(bank.data[0].id, confirm.amount, account.id)
    // console.log("ppppppppppppp", payout)

    // setTimeout(async() =>{
    //     const retrieve = await paymentControllers.getPaymentIntent(confirm.id)
    //     console.log(retrieve.status)
    //   if(retrieve.status === "succeeded"){
    //         const transfer = await payoutControllers.createTransfer(account.id, confirm.amount)
    //         console.log(transfer.id);
    //     }

    // }, 8000)
  } catch (err) {
    res.status(500).json({ message: "transfer not created" });
    console.log(err);
  }
});

router.post("/paymentMethod/create", async (req, res, next) => {
  try {
    // const account = await  accountControllers.retrieveAccount(req.body.account)
    // console.log("iban account", account.metadata.iban)
    const paymentMethod = await payoutControllers.createPaymentMethod(
      req.body.iban,
      req.body.name,
      req.body.email,
      req.body.account
    );
    console.log(paymentMethod);
  } catch (err) {
    res.status(500).json({ message: "payment method not created" });
    console.log(err);
  }
});

router.post("/paymentMethod/attach", async (req, res, next) => {
  try {
    // const account = await  accountControllers.retrieveAccount(req.body.account)
    // console.log("iban account", account.metadata.iban)
    const paymentMethod = await payoutControllers.attachPaymentMethod(
      req.body.id,
      req.body.customer,
      req.body.account
    );
    console.log(paymentMethod);
  } catch (err) {
    res.status(500).json({ message: "payment method not attached" });
    console.log(err);
  }
});

router.post("/payment/create", async (req, res, next) => {
  try {
    // const account = await  accountControllers.retrieveAccount(req.body.account)
    // console.log("iban account", account.metadata.iban)
    const paymentMethod = await payoutControllers.createPayment(
      req.body.amount,
      req.body.id_customer,
      req.body.payment_method,
      req.body.account
    );
    console.log(paymentMethod);
  } catch (err) {
    res.status(500).json({ message: "payment not created" });
    console.log(err);
  }
});

router.post("/payment/confirm", async (req, res, next) => {
  try {
    const payment = await payoutControllers.confirmPayment(
      req.body.id,
      req.body.payment_method,
      req.body.account
    );
    console.log(payment);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "payment not confirmed" });
    console.log(err);
  }
});

router.post("/paymentIntent/create", async (req, res, next) => {
  try {
    const payment = await payoutControllers.createPaymentIntent(
      req,
      req.body.id_paymentMethod
    );
    console.log(payment);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "payment intent not created" });
    console.log(err);
  }
});

router.post("/paymentIntent/confirm", async (req, res, next) => {
  try {
    const payment = await payoutControllers.confirmPayment(
      req.body.id,
      req.body.payment_method
    );
    console.log(payment);
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "payment intent not confirmed" });
    console.log(err);
  }
});

router.post("/paymentIntentPayout/confirm", async (req, res, next) => {
  try {
    const confirm = await payoutControllers.confirmPaymentIntent(
      req.body.id_paymentIntent,
      req.body.payment_method,
      //req.body.id_invoice
    );
    console.log(confirm.id);
    res.send({
      id_paymentIntent: confirm.id,
      status: confirm.status,
      amount: confirm.amount,
      id_invoice: confirm.metadata.id_invoice
    });
  } catch (err) {
    res.status(500).json({ message: "payment intent not confirmed" });
    console.log(err);
  }
});

router.post("/charge/create", async (req, res, next) => {
  try {
    const charge = await payoutControllers.createCharge(req);
    console.log(charge);
  } catch (err) {
    res.status(500).json("charge not created");
    console.log(err);
  }
});

router.post("/transfer/create", async (req, res, next) => {
  try {
    // const confirm = await payoutControllers.confirmPaymentIntent(req.body.id_paymentIntent)
    // console.log(confirm.id);
    setTimeout(async () => {
      const retrieve = await payoutControllers.getPaymentIntentPayout(
        req.body.id_paymentIntent
      );
      console.log(retrieve.status);
      if (retrieve.status === "succeeded") {
        const transfer = await payoutControllers.createTransfer(
          req.body.id_account,
          req.body.amount
        );
        console.log(transfer.id);
      }
    }, 8000);

    // const transfer = await payoutControllers.createTransfer(req)
    // console.log(transfer);
  } catch (err) {
    res.status(500).json("transfer not created");
    console.log(err);
  }
});

router.post("/bank", async (req, res, next) => {
  try {
    const bank = await payoutControllers.getExternalBanks(req.body.id);
    console.log("hhhhhhhhhhhhhhhhhhhh", bank.data[0].id);
    res.send({
      id_bank: bank.data[0].id,
    });
  } catch (err) {
    res.status(500).json("external bank not retrieved");
    console.log(err);
  }
});

router.post("/payout/create", async (req, res, next) => {
  try {
    const payout = await payoutControllers.createPayout(
      req.body.id_bank,
      req.body.amount,
      req.body.account
    );
    console.log("eeeeeeeeeeeeeeeeee", payout);
  } catch (err) {
    res.status(500).json("payout not created");
    console.log(err);
  }
});

//create customer for an account
router.post("/customer/create", async (req, res, next) => {
  try {
    const createCustomer = await payoutControllers.createCus(
      req.body.name,
      req.body.email,
      req.body.account
    );
    console.log(createCustomer.id);
    res.send({
      id_customer: createCustomer.id,
      name: req.body.name,
      email: req.body.email,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "customer not created" });
  }
});

//create product
router.post("/product", async (req, res, next) => {
  try {
    const product = await payoutControllers.createProduct(req.body.account);
    //res.json(product);
    console.log(product.id);
    res.send({
      id: product.id,
    });
  } catch (err) {
    res.status(500).json({ message: "product not created" });
    console.log(err);
  }
});
//create price with /!\ type = recurring
router.post("/price", async (req, res, next) => {
  try {
    const price = await payoutControllers.createPrice(req);
    //res.json(price);
    console.log(price);
    res.send({
      id: price.id,
      quantity: price.recurring.interval_count,
    });
  } catch (err) {
    res.status(500).json({ message: "price not created" });
    console.log(err);
  }
});

//create invoice item
router.post("/invoiceItem", async (req, res, next) => {
  try {
    const item = await payoutControllers.createInvoiceItem(
      req.body.customer,
      req.body.product,
      req.body.unit_amount
    );
    //res.json(product);
    console.log(item.id);
    res.send({
      id: item.id,
    });
  } catch (err) {
    res.status(500).json({ message: "invoice item not created" });
    console.log(err);
  }
});

router.post("/invoiceConnect/create", async (req, res, next) => {
  try {
    const invoice = await payoutControllers.createInvoiceConnect(
      req.body.customer,
      req.body.account
    );
    console.log(invoice);
  } catch (err) {
    res.status(500).json("invoice connect not created");
    console.log(err);
  }
});

router.post("/invoiceConnect/update", async (req, res, next) => {
  try {
    const invoice = await payoutControllers.updateInvoiceConnect(
      req.body.id,
      req.body.stripe,
      req.body.account
    );
    console.log(invoice);
  } catch (err) {
    res.status(500).json("invoice connect not updated");
    console.log(err);
  }
});

router.post("/invoiceConnect/finalize", async (req, res, next) => {
  try {
    const invoice = await payoutControllers.finalizeInvoiceConnect(
      req.body.id,
      req.body.account
    );
    console.log(invoice);
  } catch (err) {
    res.status(500).json("invoice connect not created");
    console.log(err);
  }
});

router.post("/invoiceConnect/pay", async (req, res, next) => {
  try {
    const invoice = await payoutControllers.payInvoiceConnect(
      req.body.id,
      req.body.account,
      req.body.payment_method
    );
    console.log(invoice);
  } catch (err) {
    res.status(500).json("invoice connect not created");
    console.log(err);
  }
});

router.post("/invoiceConnect/send", async (req, res, next) => {
  try {
    const invoice = await payoutControllers.sendInvoiceConnect(
      req.body.id,
      req.body.account,
      req.body.payment_method
    );
    console.log(invoice);
  } catch (err) {
    res.status(500).json("invoice connect not sended");
    console.log(err);
  }
});

//update account
router.post("/accountCap/update", async (req, res, next) => {
  try {
    const accountUpdate = await payoutControllers.updateAccountCap(req.body.id);
    console.log(accountUpdate);
    res.send({
      id: accountUpdate.id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "account not updated" });
  }
});

router.get("/balance", async (req, res, next) => {
  try {
    const balance = await payoutControllers.retrieve(req);
    console.log(balance);
    res.json(balance);
  } catch (err) {
    res.status(500).json("balance not retrieved");
    console.log(err);
  }
});

router.post("/paymentTransferts/pending", async (req, res, next) => {
  try {
    const paymentTransferts_pending =
      await payoutControllers.getPendingPaymentsTransferts(req);
    console.log(paymentTransferts_pending);
    res.send(paymentTransferts_pending);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payments transferts pending not retrieved" });
  }
});

router.post("/paymentPayouts/pending", async (req, res, next) => {
  try {
    const paymentPayouts_pending =
      await payoutControllers.getPendingPaymentsPayouts(req);
    console.log(paymentPayouts_pending);
    res.send(paymentPayouts_pending);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payments payout pending not retrieved" });
  }
});

router.post("/paymentPayouts/done", async (req, res, next) => {
  try {
    const paymentPayouts_done = await payoutControllers.getDonePaymentsPayouts(
      req
    );
    console.log(paymentPayouts_done);
    res.send(paymentPayouts_done);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payments payout pending not retrieved" });
  }
});

module.exports = router;
