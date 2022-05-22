var express = require("express");
const req = require("express/lib/request");
var router = express.Router();
var env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paymentControllers = require("../../controllers/payment");

// router.use(express.json());

router.get("/config", (req, res) => {
  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    amount: process.env.AMOUNT,
    currency: process.env.CURRENCY,
  });
});

router.get("/paymentMethodList", async (req, res, next) => {
  try {
    const paymentMethods = await paymentControllers.getPaymentMethodList(req.body.id)
    console.log(paymentMethods.data[0].id);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment method list is not retrieved" });
  }
});
//create payment method
router.post("/payment", async (req, res, next) => {
  try {
    const paymentMethod = await paymentControllers.createPaymentMethod(
      req.body.iban,
      req.body.name,
      req.body.email
    );
    console.log(paymentMethod.id);

    res.send({
      //customer: paymentMethod.customer,
      id: paymentMethod.id,
      iban: paymentMethod.sepa_debit,
      name: paymentMethod.billing_details.name,
      email: paymentMethod.billing_details.email,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment method is not created" });
  }
});

//retrieve payment method
router.get("/payment", async (req, res, next) => {
  try {
    const paymentMethod = await paymentControllers.getPaymentMethod(req.body.id);
    res.status(200).json(paymentMethod);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment method is not retrieved" });
  }
});

//attach payment method to a customer
router.post("/paymentAttach", async (req, res, next) => {
  try {
    console.log("id msg", req.body.customer);
    const paymentMethod = await paymentControllers.attachPaymentMethod(
      req.body.id,
      req.body.customer
    );
    console.log(paymentMethod.id);
    //res.status(200).json(paymentMethod, { message: 'attach with success' });
    res.send({
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      id: paymentMethod.id,
      customer: paymentMethod.customer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "attach with error" });
  }
});


router.post("/calculate-tax", async (req, res) => {
  try {
    const calculate = await paymentControllers.calculate()
    console.log("taaaaax", calculate)

    // Return new tax and total amounts to display on the client
  res.send({
    tax: (tax / 100).toFixed(2),
    total: (total / 100).toFixed(2)
  });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "tax not calculated" });
  }
});


//Create payment intent
router.post("/paymentIntent", async (req, res, next) => {

  try {
    const paymentIntent = await paymentControllers.createPaymentIntent(
      req.body.id_customer,
      req.body.payment_method,
    );

    console.log(paymentIntent.id);

    res.send({
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      customer: paymentIntent.customer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payments intent is not created" });
  }
});
//retrieve a payment intent
router.post("/paymentIntentRetrieve", async (req, res, next) => {
  try {
    const paymentIntent = await paymentControllers.getPaymentIntent(
      req.body.id
    );
    //res.status(200).json(paymentIntent)
    console.log(paymentIntent.status);
    res.send({
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      paymentIntent: paymentIntent.status,
      mandate: paymentIntent.charges.data.payment_method_details.mandate,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment not retrieved" });
  }
});

// update payment intent
router.put("/paymentIntents/update", async (req, res, next) => {
  try {
    const paymentIntent = await paymentControllers.updatePaymentIntent(req);
    console.log(paymentIntent.id);
    //res.status(200).json(paymentIntent)
    res.send({
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      id: paymentIntent.id,
      payment_method: paymentIntent.payment_method,
      status: paymentIntent.status,
    });
  } catch (err) {
    res.status(500).json({ message: " payment not updated" });
    console.log(err);
  }
});

//confirm payment
router.post("/paymentIntents/confirm", async (req, res, next) => {
  try {
    const paymentIntent = await paymentControllers.confirmPaymentIntent(
      req.body.id,
      req.body.payment_method,
      req.body.invoice
    );
    console.log(paymentIntent.id);
    //res.status(200).json(paymentIntent)
    res.send({
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
      paymentIntent: paymentIntent.status,
      id: paymentIntent.id,
      invoice: paymentIntent.invoice
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: " confirm failed" });
  }
});

//create line item
router.post("/item/create", async (req, res, next) => {
  try {
    const invoiceItem = paymentControllers.createItem(
      req.body.id_customer,
      req.body.amount
    );
    console.log(invoiceItem);
    res.send({
      id: invoiceItem.id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment invoice was not created" });
  }
});

//create invoice
router.post("/invoice/create", async (req, res, next) => {
  try {
    const invoice = await paymentControllers.createInvoice(
      req.body.id_customer,
      req.body.id_item,
      req.body.id_charges,
     // req.body.payment_intent,
      req.body.default_payment_method
    );
    console.log(invoice.id);
    //res.status(200).json(invoice)
    res.send({
      id: invoice.id,
      status: invoice.status,
      customer: invoice.customer,
      payment_intent:
        invoice.payment_settings.payment_method_options.payment_intent,
      default_payment_method: invoice.default_payment_method,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment invoice was not created" });
  }
});

//finalize payment invoice
router.post("/invoice/finalize", async (res, req, next) => {
  try {
    const invoice = await paymentControllers.finalizeInvoice(req.body.id, req.body.payment_intent);
    console.log(invoice.id);
    //res.status(200).json(invoice)
    res.send({
      id: invoice.id,
      status: invoice.status,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment invoice was not finalized" });
  }
});

//update invoice
router.post("/invoice/update", async (res, req, next) => {
  try {
    const invoice = await paymentControllers.updateInvoice(req.body.id, req.body.payment_intent);
    console.log(invoice.id);
    //res.status(200).json(invoice)
    res.send({
      id: invoice.id,
      status: invoice.status,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment invoice was not updated" });
  }
});

//pay payment invoice
router.post("/invoice/pay", async (res, req, next) => {
  try {
    const invoice = await paymentControllers.pay(
      req.body.id,
      req.body.payment_method
    );
    console.log(invoice.id);
    //res.status(200).json(invoice)
    res.send({
      id: invoice.id,
      status: invoice.status,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment invoice was not payed" });
  }
});

//cancel payment
router.delete("/paymentIntents/:id", async (req, res) => {
  try {
    const paymentIntent_cancled = await paymentControllers.deletePaymentIntent(
      req
    );
    res.status(200).json(paymentIntent_cancled);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payment not cancled" });
  }
});
//retrieve all payments for for specific account
router.get("/paymentIntents", async (req, res, next) => {
  try {
    const paymentIntents = await stripe.paymentIntents.list(
      {
        // limit: 3,
      },
      {
        stripeAccount: req.body.stripeAccount,
      }
    );
    res.status(200).json(paymentIntents);
  } catch (err) {
    res.status(500).json({ message: "payments not retrieved" });
  }
});

//retrieve all payments for specific customer
router.get("/paymentIntents", async (req, res, next) => {
  try {
    const paymentIntents = await paymentControllers.getPaymentIntentCustomer(
      req
    );
    res.status(200).json(paymentIntents);
  } catch (err) {
    res.status(500).json({ message: "payments not all retrieved" });
    console.log(err);
  }
});

//retrieve payements done(succeeded) for specific customer
router.post("/paymentIntents/done", async (req, res, next) => {
  try {
    const paymentIntents_done = await paymentControllers.getDonePayments(req);
    //console.log(paymentIntents_done.data)
    const filterData = paymentIntents_done.data.filter(
      (element) => element.status === "succeeded"
    );
    res.send(filterData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payments done not retrieved" });
  }
});
//retrieve payments en cours
router.post("/paymentIntents/pending", async (req, res, next) => {
  try {
    const paymentIntents_done = await paymentControllers.getPendingPayments(
      req
    );
   
    res.send(paymentIntents_done);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payments pending not retrieved" });
  }
});

//retrieve notif payments en cours
router.post("/paymentIntentsNotif/pending", async (req, res, next) => {
  try {
    const paymentIntentsNotif_pending = await paymentControllers.getPendingPaymentsNotif(
      req
    );
   
    res.send(paymentIntentsNotif_pending);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "payments pending notif not retrieved" });
  }
});




module.exports = router;
