var express = require("express");
var router = express.Router();
var env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const customerControllers = require("../../controllers/customers");

//create customer for an account
router.post("/customer/create", async (req, res, next) => {
  try {
    const createCustomer = await customerControllers.createCustomer(
      req.body.name,
      req.body.email,
      //req.body.vat_id
    );
    console.log(createCustomer.id);
    res.send({
      id_customer: createCustomer.id,
      name: req.body.name,
      email: req.body.email,
      //vat_id: createCustomer.tax_id_data[0].value
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "customer not created" });
  }
});

//Retrieve a customer
router.post("/customer", async (req, res, next) => {
  try {
    console.log(req.body);
    const customerRetrieve = await customerControllers.getCustomer(req.body.id);

    console.log(customerRetrieve);
    res.send({
      id_customer: customerRetrieve.id,
      name: customerRetrieve.name,
      email: customerRetrieve.email,
      iban: customerRetrieve.metadata.iban,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "customer not founded" });
  }
});
// Get all customers by id
router.get("/customers", async (req, res) => {
  try {
    const customers = await customerControllers.getCustomers();

    //by id
    // if(req.body.name !=null){
    //     res.status(200).json(customers.data.map(c => c.name))
    // }
    res.send(customers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "customers not found" });
  }
});

//update metadata customer
router.post("/customer/paymentMethod/update/:id", async (req, res, next) => {
  try {
    const updatePaymentCustomer =
      await customerControllers.updateCustomerPayment(
        req.params.id,
        req.body.default_payment_method,
        req.body.iban
      );
    console.log(updatePaymentCustomer);
    console.log(
      "payyyyment",
      updatePaymentCustomer.invoice_settings.default_payment_method
    );
    console.log("methooooood", updatePaymentCustomer.payment_method);
    res.send({
      iban: updatePaymentCustomer.metadata.iban,
      default_payment_method:
        updatePaymentCustomer.invoice_settings.default_payment_method,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "customer payment method not updated" });
  }
});

//Delete customer
router.delete("/customers/:id", async (req, res, next) => {
  try {
    const deletedCustomer = await customerControllers.deleteCustomer(req);
    res.status(200).json(deletedCustomer);
  } catch (err) {
    console.log(err);
  }
});

//update metadata customer
router.post("/customer/update/:id", async (req, res, next) => {
  try {
    const updateCustomer = await customerControllers.updateCustomer(
      req.params.id,
      req.body.iban,
      req.body.connect_account,
      req.body.default_payment_method,
      //req.body.vat_id
    );
    console.log(updateCustomer);
    res.send({
      iban: updateCustomer.metadata.iban,
      connect_account: updateCustomer.metadata.connect_account,
      default_payment_method:
        updateCustomer.invoice_settings.default_payment_method,
      // vat_id: updateCustomer.tax_id_data[0].value
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "customer not updated" });
  }
});

module.exports = router;
