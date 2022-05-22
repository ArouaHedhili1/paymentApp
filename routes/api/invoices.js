var express = require('express');
const req = require('express/lib/request');
var router = express.Router();
var env = require("dotenv").config({ path: "./.env" });
const url = require('url');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const invoiceControllers = require('../../controllers/invoice')

router.get("/config", (req, res) => {
    res.send({
        publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
        amount: process.env.AMOUNT,
        currency: process.env.CURRENCY
    });
});

router.post("/invoicing", async(req, res, next) =>{

try {
    console.log(req.body);
    const echeance = parseInt(req.body.echeance);
    console.log(echeance);
    const tva = parseInt(req.body.tva);
    console.log(tva);

    const product = await invoiceControllers.product(req.body.nom_produit)
    console.log(product.id)
    const price = await invoiceControllers.price(product.id, req.body.amountHT, echeance, tva)
    console.log(price.id)
    const tax = await invoiceControllers.createTaxRate(req.body.nom_produit, tva)
    const item = await invoiceControllers.item(req.body.customer, price.id_commande)
    console.log(item.id)
    const invoice = await invoiceControllers.invoice(req.body.customer, req.body.account, req.body.id_commande, tax.id)
    console.log(invoice.id)
    const finalize = await invoiceControllers.finalize(invoice.id)
    console.log(finalize.id)
    const send = await invoiceControllers.send(invoice.id)
    console.log(send.id)
} catch (err) {
    
}
})



//create product
router.post("/productInvoice", async (req, res, next) => {
    try {
      const product = await invoiceControllers.createProduct(req.body.nom_produit);
      //res.json(product);
      console.log(product.id);
      res.send({
        id: product.id,
        name: product.name
      });
    } catch (err) {
      res.status(500).json({ message: "product not created" });
      console.log(err);
    }
  });
  //create price with /!\ type = recurring
  router.post("/priceInvoice", async (req, res, next) => {
    try {
        
      const price = await invoiceControllers.createPrice(req.body.id,
        req.body.amountHT,
        echeance,
        tva);
      //res.json(price);
      console.log(price);
      res.send({
        id: price.id,
        quantity: price.recurring.interval_count,
        amount: price.unit_amount
      });
    } catch (err) {
      res.status(500).json({ message: "price not created" });
      console.log(err);
    }
  });
  
  //create tax rate
router.post('/taxRate', async(req,res, next) => {
    try {
        const taxRate = await invoiceControllers.createTaxRate(req)
          //res.json(product);
          console.log(taxRate.id);
          res.send({
              id: taxRate.id
          })
    } catch (err) {
        res.status(500).json({ message: 'tax rate is not created' })
    console.log(err)
    }
})

  //create invoice item
  router.post("/invoiceItem", async (req, res, next) => {
    try {
      const item = await invoiceControllers.createInvoiceItem(
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
      const invoice = await invoiceControllers.createInvoiceConnect(
        req.body.customer,
        req.body.account
      );
      res.send({
          id: invoice.id
      })
      console.log(invoice);
    } catch (err) {
      res.status(500).json("invoice connect not created");
      console.log(err);
    }
  });

  
  router.post("/invoiceConnect/finalize", async (req, res, next) => {
    try {
      const invoice = await invoiceControllers.finalizeInvoiceConnect(
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
      const invoice = await invoiceControllers.payInvoiceConnect(
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
      const invoice = await invoiceControllers.sendInvoiceConnect(
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

  router.post("/vat/create", async (req, res, next) => {
    try {
      const vat = await invoiceControllers.numFisc(
        req.body.id,
        req.body.value
      );
      res.send({
        id_vat: vat.id,
        value: vat.value,
        type: vat.type
    })
      console.log(vat);
    } catch (err) {
      res.status(500).json("vat not created");
      console.log(err);
    }
  });
  
module.exports = router;
