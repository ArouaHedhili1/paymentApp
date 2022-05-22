const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const req = require("express/lib/request");
const url = require("url");

async function createProduct(req) {
  const product = await stripe.products.create({
    name: "new product",
  });

  return product;
}

async function createPrice(req, quantity) {
  const price = await stripe.prices.create({
    //unit amount: quantity (nb users) * amount
    unit_amount: 1000,
    currency: process.env.CURRENCY,
    recurring: {
      interval: "month",
      interval_count: quantity,
    },
    // the product is the command
    product: req.body.product,
    tax_behavior: "exclusive",
  });

  return price;
}

async function updatePrice(id) {
  const price = await stripe.prices.update(id, {
    recurring: {
      interval_count: 30,
    },
  });
  return price;
}


async function createSubscription(req) {
  const subscription = await stripe.subscriptions.create({
    customer: req.body.customer,
    items: [{ price: req.body.price }],
    default_payment_method: req.body.payment_method,
    metadata: {
      mission: 0,
      nombre_utilisateur: 1,
    },
    default_tax_rates: [req.body.default_tax_rates],
    proration_behavior: "none"
  });

  return subscription;
}

async function createTaxRate(product_name) {
  const taxRate = await stripe.taxRates.create({
    display_name: product_name + " Tax",
    inclusive: false,
    percentage: 20,
    country: "FR",
  });

  return taxRate;
}

async function getSubscription(id) {
  //console.log("sub id", req.body)
  const subscription = await stripe.subscriptions.retrieve(id);

  return subscription;
}

async function updateSubscription(id_sub, id_price, nombre_utilisateur) {
  const subscription = await stripe.subscriptions.retrieve(id_sub);
const old_value= subscription.items.data[0].quantity
console.log("oooooold but gold", old_value)
  let updatedItemParams = subscription.items.data
    .filter((item) => item.price != id_price)
    .map((item) => {
      return { id: item.id, quantity: nombre_utilisateur };
    });
  console.log("taaahahaaa", updatedItemParams);
  await stripe.subscriptions.update(id_sub, {
    proration_behavior: "none",
    items: updatedItemParams,
    metadata: {
      nombre_utilisateur: nombre_utilisateur,
      mission: 0,
      old_value: old_value
    },
  });

  return subscription;
}

//teeeeest
async function updateSub(id_sub, current_period_end) {
  const subscription = await stripe.subscriptions.update(id_sub, {
    proration_behavior: "always_invoice",
    //billing_cycle_anchor: current_period_end
    billing_thresholds: {
      reset_billing_cycle_anchor: true,
    },
  });

  return subscription;
}

async function cancelSubscription(req) {
  const subscription = await stripe.subscriptions.del(req.body.id, {
    stripeAccount: req.body.account,
  });

  return subscription;
}

async function getInvoice(id) {
  const invoice = await stripe.invoices.retrieve(id);

  return invoice;
}

async function retrieveInvoice(id) {
  const invoice = await stripe.invoices.retrieve(id);
  console.log("just invoice retrieve");
  return invoice;
}

async function upComingInvoice(id_customer, id_sub) {
  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: id_customer,
    subscription: id_sub,
  });
  return invoice;
}

async function updateInvoice(id_invoice, id_price, nombre_utilisateur) {
  const invoice = await stripe.invoices.retrieve(id_invoice);

  let updatedItemParams = invoice.lines.data
    .filter((item) => item.price != id_price)
    .map((item) => {
      return { id: item.id, quantity: nombre_utilisateur };
    });
  console.log("rrrrrrrrrr", updatedItemParams);
  await stripe.invoices.update(id_invoice, {
    //default_payment_method: default_payment_method
    lines: updatedItemParams,
  });
  console.log("kkkkkkkkkkkkkk", lines);
  return invoice;
}

async function confirmSubscription(id) {
  const paymentIntent = await stripe.paymentIntents.confirm(
    id,
    {
      //payment_method: req.body.payment_method,
      mandate_data: {
        customer_acceptance: {
          type: "offline",
        },
      },
    }
    //{ stripeAccount: req.body.account }
  );

  return paymentIntent;
}

async function getPaymentIntentSubscription(req) {
  const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);

  return paymentIntent;
}

async function getPendingSubPayments(req) {
  const subscription_pending = await stripe.paymentIntents.list({
    customer: req.body.customer,
    limit: 3,
  });
  console.log("batataaaaaa", subscription_pending.data.length);
  return subscription_pending;
}
async function getDoneSubscription(req) {
  const subscription_done = await stripe.subscriptions.list({
    customer: req.body.customer,
    limit: 100,
  });
  console.log("zzzzzzzzzzqqqqqqqqq", subscription_done.data.length);
  return subscription_done;
}

async function updatePaymentSubscription(id, payment_method) {
  const paymentIntentUpdateSub = await stripe.paymentIntents.update(id, {
    metadata: { mission: 0 },
    payment_method: payment_method,
  });

  return paymentIntentUpdateSub;
}

async function listSubRetrieve(id_customer) {
  const listSub = await stripe.subscriptions.list({
    customer: id_customer,
  });
  const retrieve = listSub.data.filter(
    (element) => element.metadata.mission === "0"
  );
  console.log(listSub.data.length);
  return retrieve;
}

async function updateSubPaymentMethod(subscription_id, default_payment_method) {
  const subscription = await stripe.subscriptions.update(subscription_id, {
    default_payment_method: default_payment_method,
  });
  return subscription;
}


module.exports = {
  createPrice,
  createProduct,
  createSubscription,
  getDoneSubscription,
  getInvoice,
  retrieveInvoice,
  getPaymentIntentSubscription,
  getSubscription,
  updateInvoice,
  cancelSubscription,
  confirmSubscription,
  updatePaymentSubscription,
  updateSubscription,
  updatePrice,
  upComingInvoice,
  createTaxRate,
  listSubRetrieve,
  updateSub,
  getPendingSubPayments,
  updateSubPaymentMethod,
};
