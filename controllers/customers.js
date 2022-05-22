const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function createCustomer(name, email, account, vat_id) {
  const customer = await stripe.customers.create(
    {
      name: name,
      email: email,
      // tax_id_data: [{
      //   type: "eu_vat",
      //   value: vat_id,
      // }],
    },
    { stripeAccount: account }
  );
  //console.log("qzqzqzqzq", customer.tax_id_data.data[0].value)
  return customer;
}

async function getCustomer(id) {
  const customer_retrieve = await stripe.customers.retrieve(id);

  return customer_retrieve;
}

async function getCustomers() {
  const customers = await stripe.customers.list();
  return customers;
}

async function deleteCustomer(req) {
  const deletedCustomer = await stripe.customers.del(req.params.id);
  return deletedCustomer;
}

async function updateCustomer(
  id,
  iban,
  connect_account,
  default_payment_method,
  //vat_id
) {
  const customerUpdate = await stripe.customers.update(id, {
    invoice_settings: {
      default_payment_method: default_payment_method,
    },
    // tax_id_data: [{
    //   type: "eu_vat",
    //   value: vat_id,
    // }],
    metadata: { iban: iban, connect_account: connect_account },
  });

  return customerUpdate;
}

async function updateCustomerPayment(id, default_payment_method, iban) {
  const customerPaymentUpdate = await stripe.customers.update(id, {
    invoice_settings: {
      default_payment_method: default_payment_method,
    },
    metadata: { iban: iban },
  });

  return customerPaymentUpdate;
}

module.exports = {
  createCustomer,
  getCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer,
  updateCustomerPayment,
};
