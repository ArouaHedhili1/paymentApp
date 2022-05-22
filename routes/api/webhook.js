var express = require("express");
const bodyParser = require("body-parser");
const req = require("express/lib/request");
var router = express.Router();
var env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const payoutControllers = require("../../controllers/payout");
const subscriptionControllers = require("../../controllers/subscription");
const customerControllers = require("../../controllers/customers");
const invoiceControllers = require("../../controllers/invoice");
const nodemailer = require("nodemailer");

// router.use(express.json());

router.get("/config", (req, res) => {
  res.send({
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    amount: process.env.AMOUNT,
    currency: process.env.CURRENCY,
  });
});

//sending invoice
async function sendInvoice(invoice_url, invoice_pdf, statusFacture, invoice) {
  //nodemailer
  var transporter = nodemailer.createTransport({
    //service: process.env.SERVICE,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL,
    to: invoice.customer_email,
    subject: "Invoice",
    html:
      `<h3> Le lien de votre facture ${statusFacture}  :  </h3>` +
      "<br />" +
      "<h3>" +
      invoice_url +
      "<h3>" +
      "<br />" +
      "<h3> Le lien de votre facture pdf : <h3/> " +
      "<h3>" +
      invoice_pdf +
      "<h3>",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

//webhooks
router.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
        console.log("tttttt", req.body);
      }
    },
  })
);

router.post("/webhookEvents", async (req, res, next) => {
  const endpoint = await stripe.webhookEndpoints.create({
    url: "https://melting-works.herokuapp.com/webhook ",
    enabled_events: ["charge.failed", "charge.succeeded"],
  });
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event = req.body;
    try {
      const payload = req.body;
      const payloadString = JSON.stringify(payload, null, 2);
      const secret = process.env.STRIPE_WEBHOOK_SECRET;

      const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret,
      });

      event = stripe.webhooks.constructEvent(payloadString, header, secret);

      console.log("event type", event.type);
      console.log("event data", event.data);
      console.log("event object id", event.data.object.id);
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ success: false });
      return;
    }

    // Handle the event
    switch (event.type) {
      //payment events
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        console.log("payment intent", paymentMethod);
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log("payment intent succeeded", paymentIntentSucceeded.status);
        break;

      //invoice events
      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        console.log("invoiiiice", invoice.payment_intent);
        break;
      case "invoice.payment_failed":
        const paymentFailed = event.data.object;
        console.log("paymeeeent", paymentFailed);

        //send invoice
        // const sendUnpaidInvoice = await sendInvoice(
        //   paymentFailed.hosted_invoice_url,
        //   paymentFailed.invoice_pdf,
        //   "non payé",
        //   paymentFailed
        // );
        // console.log("sending unpaid invoice via email", sendUnpaidInvoice);
        break;
      case "invoice.created":
        const invoiceCreated = event.data.object;
        console.log("invoice created", invoiceCreated);
        console.log("invoice customer", invoiceCreated.customer);
        console.log("invoice account", invoiceCreated.on_behalf_of);

        //if it's a client
        if (invoiceCreated.on_behalf_of === null) {
          const paymentMethods = await stripe.customers.listPaymentMethods(
            invoiceCreated.customer,
            { type: "sepa_debit" }
          );
          console.log("default", paymentMethods.data[0].id);

          const invoice2 = await stripe.invoices.update(invoiceCreated.id, {
            default_payment_method: paymentMethods.data[0].id,
          });
          console.log("invoiiiiiiiieeeceee 2", invoice2);
        } 
        break;
      case "invoice.paid":
        const invoicePay = event.data.object;
        console.log("invoice paid", invoicePay.id);
        break;
      case "invoice.finalized":
        if(event.data.object.status === "draft"){
          const invoiceFinalized = event.data.object;
          console.log("invoice finalized", invoiceFinalized.id);
        }
      
        break;
      case "invoice.updated":
          const invoiceUpdated = event.data.object;
          console.log("invoice updated", invoiceUpdated.id);
        
        break;

      //customer subscription events
      case "customer.subscription.created":
        const subCreated = event.data.object;
        console.log("customer sub created", subCreated);
        break;
      case "customer.subscription.updated":
        const customerSubUpdated = event.data.object;
        console.log("zzzzzz", customerSubUpdated);

        const retrieveInvoice = await stripe.invoices.retrieve(
          customerSubUpdated.latest_invoice
        );

        if (retrieveInvoice.status === "draft") {
          const invoice3 = await stripe.invoices.finalizeInvoice(
            customerSubUpdated.latest_invoice
          );
          console.log("invoiiiieeeceee 3", invoice3);
        }

        if (retrieveInvoice.status === "open") {
          const invoicePaid = await stripe.invoices.pay(
            customerSubUpdated.latest_invoice
          );
          console.log("invoiiiiieeeceee 4", invoicePaid);

          //send invoice
          const send = await sendInvoice(
            retrieveInvoice.hosted_invoice_url,
            retrieveInvoice.invoice_pdf,
            "payé",
            retrieveInvoice
          );
          console.log("sending invoice via email", send);
        }
        //  //send invoice
        //  const send = await sendInvoice(retrieveInvoice.hosted_invoice_url, retrieveInvoice.invoice_pdf, "payé", retrieveInvoice)
        //     console.log("sending invoice via email", send)
        break;
      case "customer.subscription.deleted":
        const customerSubDeleted = event.data.object;
        console.log("customer sub deleted", customerSubDeleted.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ success: true });
  }
);

module.exports = router;
