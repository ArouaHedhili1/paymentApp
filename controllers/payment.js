const req = require("express/lib/request");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function createPaymentMethod(iban, name, email) {
  const paymentMethod = await stripe.paymentMethods.create({
    type: "sepa_debit",
    sepa_debit: {
      //iban: 'FR7630001007941234567890185',
      iban: iban,
    },
    billing_details: {
      name: name,
      email: email,
    },
  });
  return paymentMethod;
}

async function getPaymentMethod(id) {
  const paymentMethod = await stripe.paymentMethods.retrieve(id);
  return paymentMethod;
}

//list of payment methods of a customer
async function getPaymentMethodList(id_customer) {
  const paymentMethod = await stripe.customers.listPaymentMethods(
    id_customer,
      { type: "sepa_debit" }
  );
  return paymentMethod;
}

async function attachPaymentMethod(id, id_customer) {
  const paymentMethod = await stripe.paymentMethods.attach(id, {
    customer: id_customer,
  });
  return paymentMethod;
}


// Keeps track of what we show on the client -- only for demo purposes
let TAX_AMOUNT;

const calculateTax = (amount) => {
  // Here you would use the postal code to calculate the right amount of tax for the purchase
  TAX_AMOUNT = (amount * 20) / 100;
  console.log("amoooooouuuunnnnt", TAX_AMOUNT)
  return TAX_AMOUNT;
};

async function calculate(){
  // Calculate sales tax each time a customer enters a new postal code
  const { amount } = req.body;
  
  // Calculate tax from order total and postal code
  const tax = postalCode ? calculateTax(amount) : 0;
  const total = amount + tax;

  // Return new tax and total amounts to display on the client
  res.send({
    tax: (tax / 100).toFixed(2),
    total: (total / 100).toFixed(2)
  });
}

async function createPaymentIntent(
  id_customer,
  payment_method,
  receipt_email,
  id_commande,
  autorisation,
  amount
) {

  // Use previously calculated sales tax (or calculate if not available)
  const tax = TAX_AMOUNT || calculateTax(amount);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount + tax,
    currency: process.env.CURRENCY,
    customer: id_customer,
    payment_method_types: ["sepa_debit"],
    payment_method: payment_method,
    receipt_email: receipt_email,
    metadata: {
      id_commande: id_commande,
      autorisation: autorisation,
      mission: 1
    }
    //confirmation_method: 'manual',
    //confirm: true
  });
  return paymentIntent;
}

async function getPaymentIntent(id) {
  const paymentIntent = await stripe.paymentIntents.retrieve(id);
  return paymentIntent;
}

async function updatePaymentIntent(id, product) {
  const paymentIntent = await stripe.paymentIntents.update(id, {
    // 
    metadata:{
      product: product
    }
  });
  return paymentIntent;
}

async function confirmPaymentIntent(id, payment_method, receipt_email) {
  const paymentIntent = await stripe.paymentIntents.confirm(id, {
    payment_method: payment_method,
    //payment_method_types: ['sepa_debit'],
    mandate_data: {
      customer_acceptance: {
        type: "offline",
      },
    },
    receipt_email: receipt_email
  });
  return paymentIntent;
}

async function createItem(id_customer, amount) {
  const invoiceItem = await stripe.invoiceItems.create({
    customer: id_customer,
    amount: amount,
    currency: process.env.CURRENCY,
  });

  return invoiceItem;
}

async function createInvoice(
  id_customer,
  id_item,
  id_charges,
  //payment_intent,
  default_payment_method
) {
  const invoice = await stripe.invoices.create({
    customer: id_customer,
    charges: id_charges,
    metadata: { id_item },
    // lines: {
    //   data: [{ invoice_item: id_item }],
    // },
    //payment_intent: payment_intent ,

    default_payment_method: default_payment_method,
    //auto_advance: true,
  });

  return invoice;
}

async function finalizeInvoice(id, payment_intent) {
  const invoice = await stripe.invoices.finalizeInvoice(id, {
    //auto_advance: true,
    payment_intent: payment_intent,
    
  });

  return invoice;
}

async function updateInvoice(id, payment_intent) {
  const invoice = await stripe.invoices.update(id, {
   payment_intent: payment_intent
  });

  return invoice;
}

async function payInvoice(id, payment_method) {
  const invoice = await stripe.invoices.pay(id, {
    payment_method: payment_method,
  });

  return invoice;
}

async function deletePaymentIntent(req) {
  const paymentIntent_cancled = await stripe.paymentIntents.cancel(
    req.params.id
  );

  return paymentIntent_cancled;
}

async function getPaymentIntentCustomer(id_customer) {
  const paymentIntents = await stripe.paymentIntents.list({
    customer: id_customer,
  });
  return paymentIntents;
}

async function getDonePayments(req) {
  const paymentIntents_done = await stripe.paymentIntents.list({
    customer: req.body.customer,
  });
  const result = paymentIntents_done.data.map((element) => (element.id))
  console.log("messaaaaaaaaage1", result);
  const result2 = paymentIntents_done.data.map((element) => (parseInt(element.metadata.mission)))
  console.log("messaaaaaaaaage2", result2);
  
  return paymentIntents_done;
}

async function getPendingPayments(req) {
  const paymentIntents_done = await stripe.paymentIntents.list({
    customer: req.body.customer,
    //limit: 3,
  });
  const dataPending = paymentIntents_done.data.filter(
    (element) => element.status === "requires_confirmation"
  );
  console.log("done payments", paymentIntents_done.data.length)
  return dataPending;
}


async function getPendingPaymentsNotif(req) {
  const paymentIntentsNotif_pending = await stripe.paymentIntents.list({
    customer: req.body.customer,
    //limit: 3,
  });
  const dataPending = paymentIntentsNotif_pending.data.filter(
    (element) => (element.status === "requires_confirmation") || (element.status === "payment_failed")
  );
  console.log("pending notif payments", paymentIntentsNotif_pending.data.length)
  return dataPending;
}
module.exports = {
  getPendingPaymentsNotif,
  createPaymentMethod,
  createPaymentIntent,
  getDonePayments,
  getPaymentIntent,
  getPaymentIntentCustomer,
  getPendingPayments,
  deletePaymentIntent,
  getPaymentMethod,
  getPaymentMethodList,
  updatePaymentIntent,
  confirmPaymentIntent,
  attachPaymentMethod,
  createInvoice,
  finalizeInvoice,
  payInvoice,
  createItem,
  updateInvoice,
  calculate
};
