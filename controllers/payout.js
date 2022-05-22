const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const req = require("express/lib/request");
const url = require("url");
//nodemailer
const nodemailer = require("nodemailer");

async function createPaymentMethod(iban, name, email, account) {
  const paymentMethod = await stripe.paymentMethods.create(
    {
      type: "sepa_debit",
      sepa_debit: {
        iban: iban,
      },
      billing_details: {
        name: name,
        email: email,
      },
    }
    //{stripeAccount: account}
  );
  return paymentMethod;
}

async function listPaymentMethods(account, customer) {
  const paymentMethod = await stripe.paymentMethods.list(
    {
      customer: customer,
      type: "sepa_debit",
    },
    { stripeAccount: account }
  );
  return paymentMethod;
}

async function attachPaymentMethod(id, id_customer, account) {
  const paymentMethod = await stripe.paymentMethods.attach(
    id,
    {
      customer: id_customer,
    }
    //{ stripeAccount: account}
  );
  return paymentMethod;
}

async function createPayment(amount, id_customer, payment_method, account) {
  const payment = await stripe.paymentIntents.create(
    {
      amount: amount,
      currency: process.env.CURRENCY,
      customer: id_customer,
      payment_method_types: ["sepa_debit"],
      payment_method: payment_method,
      confirm: true,
      mandate_data: {
        customer_acceptance: {
          type: "offline",
        },
      },
    },
    { stripeAccount: account }
  );
  return payment;
}

async function confirmPayment(id, payment_method, account) {
  const payment = await stripe.paymentIntents.confirm(
    id,
    {
      payment_method: payment_method,
      //customer: customer,
      mandate_data: {
        customer_acceptance: {
          type: "offline",
        },
      },
    },
    { stripeAccount: account }
  );
  return payment;
}

// Keeps track of what we show on the client -- only for demo purposes
let TAX_AMOUNT;

const calculateTax = (amountHT) => {
  // Here you would use the postal code to calculate the right amount of tax for the purchase
  TAX_AMOUNT = (amountHT * 20) / 100;
  console.log("amoooooouuuunnnnt", TAX_AMOUNT);
  return TAX_AMOUNT;
};

async function calculate() {
  // Calculate sales tax each time a customer enters a new postal code
  const { amountHT } = req.body;

  // Calculate tax from order total and postal code
  const tax = postalCode ? calculateTax(amountHT) : 0;
  const total = amountHT + tax;

  // Return new tax and total amounts to display on the client
  res.send({
    tax: (tax / 100).toFixed(2),
    total: (total / 100).toFixed(2),
  });
}

async function createPaymentIntent(
  id_paymentMethod,
  amount,
  account,
  tva,
  echeance,
  customer
) {
  // Use previously calculated sales tax (or calculate if not available)
  if (tva === 20) {
    const tax = TAX_AMOUNT || calculateTax(amount);
    const amountSplited = (amount + tax) / echeance;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountSplited,
      currency: process.env.CURRENCY,
      payment_method: id_paymentMethod,
      payment_method_types: ["sepa_debit"],
      transfer_data: {
        destination: account,
      },
      metadata: {
        tva: tva,
      },
      customer: customer,
    });
    return paymentIntent;
  } else if (tva === 0) {
    const amountSplited = amount / echeance;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountSplited),
      currency: process.env.CURRENCY,
      payment_method: id_paymentMethod,
      payment_method_types: ["sepa_debit"],
      transfer_data: {
        destination: account,
      },
      metadata: {
        tva: tva,
      },
      customer: customer,
    });
    return paymentIntent;
  }
}

async function confirmPaymentIntent(id_paymentIntent, payment_method, invoice) {
  const confirm = await stripe.paymentIntents.confirm(id_paymentIntent, {
    payment_method: payment_method,
    //payment_method_types: ['sepa_debit'],
    mandate_data: {
      customer_acceptance: {
        type: "offline",
      }
    },
    // metadata:{
    //   id_invoice: invoice
    // }
   //receipt_email: receipt_email
  });

  return confirm;
}

async function createCharge() {
  const charge = await stripe.charges.create(
    {
      amount: 1000,
      currency: process.env.CURRENCY,
    },
    {
      stripeAccount: "acct_1KsS942SpYbMM5oq",
    }
  );
  return charge;
}

// async function retrieve(){
//   const retrieve = await stripe.balance.retrieve();
//   return retrieve
// }

async function createTransfer(account, amount) {
  const retrieve = await stripe.balance.retrieve();
  const x =
    retrieve.available[0].amount - (retrieve.available[0].amount - amount);
  //console.log("sooooolde", retrieve.available[0].amount)
  console.log("ammouuuuuuuunt", x);
  const transfer = await stripe.transfers.create({
    amount: x,
    currency: process.env.CURRENCY,
    destination: account,
  });
  //console.log("confffiiiiirrrrm", amount)
  return transfer;
}

async function getExternalBanks(id_account) {
  const bankAccount = await stripe.accounts.listExternalAccounts(id_account, {
    object: "bank_account",
  });

  return bankAccount;
}

async function createPayout(id_bank, amount, account) {
  const payout = await stripe.payouts.create(
    {
      amount: amount,
      currency: "USD",
      //balance_transaction: "txn_3KsQbsCz8fxitj4r0724idRB",
      destination: id_bank,
      method: "standard",
      //source_type: 'bank_account'
    },
    {
      stripeAccount: account,
    }
  );

  return payout;
}

async function createCus(name, email, account) {
  const customer = await stripe.customers.create(
    { name: name, email: email },
    { stripeAccount: account }
  );
  return customer;
}

async function createProduct(account) {
  const product = await stripe.products.create(
    {
      name: "first product",
    }
    //{stripeAccount: account}
  );

  return product;
}

async function createPrice(product, amount, quantity) {
  const price = await stripe.prices.create(
    {
      //unit amount: quantity (nb users) * amount
      unit_amount: amount,
      currency: process.env.CURRENCY,
      recurring: {
        interval: "month",
        interval_count: quantity,
      },
      // the product is the command
      product: product,
      //tax_behavior: "exclusive",
    }
    //{stripeAccount: req.body.account}
  );

  return price;
}

async function createInvoiceItem(customer, price, account) {
  console.log("msssssg", customer, price, account);
  const item = await stripe.invoiceItems.create(
    {
      customer: customer,
      price: price,
      //  price_data: {
      //   currency: process.env.CURRENCY,
      //   product: product,
      //   unit_amount: unit_amount
      // },
      // invoice: req.body.id_invoice,
      currency: process.env.CURRENCY,
    },
    { stripeAccount: account }
  );

  return item;
}

async function createInvoiceConnect(customer, account) {
  const invoice = await stripe.invoices.create(
    {
      customer: customer,
      //on_behalf_of: accountStripe,
      collection_method: "send_invoice",
      due_date: 1651750457,
    },
    { stripeAccount: account }
  );
  console.log("zzzuuuuu", invoice.customer);
  return invoice;
}

async function updateInvoiceConnect(id, accountStripe, account) {
  const invoice = await stripe.invoices.update(
    id,
    {
      on_behalf_of: accountStripe,
    },
    { stripeAccount: account }
  );
  console.log("zzttttttttttttttttu", invoice.customer);
  return invoice;
}

async function finalizeInvoiceConnect(id, account) {
  const invoice = await stripe.invoices.finalizeInvoice(id, {
    stripeAccount: account,
  });

  return invoice;
}

async function sendInvoice(
  invoice_url,
  invoice_pdf,
  statusFacture,
  invoice,
  consultant_name
) {
  //nodemailer
  var transporter = nodemailer.createTransport({
    //service: process.env.SERVICE,
    host: "smtp.gmail.com",
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
      `<h3> Montant à transférer de MeltingWorks au Consultant ${consultant_name}` +
      "<br />" +
      `Le lien de votre facture ${statusFacture}  :  </h3>` +
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

async function payInvoiceConnect(id, account, paymentMethod) {
  const invoice = await stripe.invoices.pay(
    id,
    { payment_method: paymentMethod },
    { stripeAccount: account }
  );

  console.log("status", invoice.status);
  return invoice;
}

async function sendInvoiceConnect(id, account, consultant_name) {
  const invoice = await stripe.invoices.sendInvoice(
    id,

    { stripeAccount: account }
  );
  sendInvoice(
    invoice.hosted_invoice_url,
    invoice.invoice_pdf,
    "payée",
    invoice,
    consultant_name
  );
  console.log("status", invoice.status);
  return invoice;
}

async function updateAccountCap(id) {
  const accountUpdate = await stripe.accounts.update(id, {
    capabilities: {
      card_payments: {
        requested: true,
      },
    },
    //tos_acceptance: {service_agreement: 'recipient'},
  });

  return accountUpdate;
}

async function getPendingPaymentsTransferts(req) {
  const paymentPayouts_pending = await stripe.paymentIntents.list({
    customer: req.body.account,
    //limit: 3,
  });
  //console.log(paymentPayouts_pending.data[0].transfer_data.destination)
  const dataPending = paymentPayouts_pending.data.filter(
    (element) => element.status === "requires_confirmation"
    );
  //console.log("pending payments payouts", paymentPayouts_pending.data.length)
  return dataPending;
}

async function getPendingPaymentsPayouts(req) {
  const paymentPayouts_pending = await stripe.payouts.list({
    destination: req.body.destination,
    limit: 100,
  },
  {stripeAccount: req.body.account});
  //console.log(paymentPayouts_pending.data[0].transfer_data.destination)
  const dataPending = paymentPayouts_pending.data.filter(
    (element) => (element.status === "failed")
  );
  //console.log("pending payments payouts", paymentPayouts_pending.data.length)
  return dataPending;
}

async function getDonePaymentsPayouts(req) {
  const paymentPayouts_pending = await stripe.payouts.list({
    //customer: req.body.account,
    destination: req.body.destination
  },
  {stripeAccount: req.body.account});
  //console.log(paymentPayouts_pending.data[0].transfer_data.destination)
  const dataPending = paymentPayouts_pending.data.filter(
    (element) => element.status === "paid"
  );
  //console.log("pending payments payouts", paymentPayouts_pending.data.length)
  return dataPending;
}

async function getPaymentIntentPayout(id_paymentIntent) {
  const retrieve = await stripe.paymentIntents.retrieve(id_paymentIntent);
  return retrieve;
}

async function updateAccount(id, iban, tva) {
  const accountUpdate = await stripe.accounts.update(id, {
    metadata: {
      iban: iban,
      tva: tva,
    },
    //tos_acceptance: {service_agreement: 'recipient'},
  });

  return accountUpdate;
}

module.exports = {
  createPayout,
  createTransfer,
  createPaymentIntent,
  confirmPaymentIntent,
  createPaymentMethod,
  createCharge,
  calculate,
  getPendingPaymentsPayouts,
  getPaymentIntentPayout,
  getDonePaymentsPayouts,
  updateAccount,
  getExternalBanks,
  createInvoiceConnect,
  finalizeInvoiceConnect,
  sendInvoiceConnect,
  createCus,
  createProduct,
  createPrice,
  createInvoiceItem,
  sendInvoice,
  updateAccountCap,
  attachPaymentMethod,
  createPayment,
  confirmPayment,
  updateInvoiceConnect,
  payInvoiceConnect,
  listPaymentMethods,
  getPendingPaymentsTransferts,
  //updateInvoiceItem
  //retrieve
};
