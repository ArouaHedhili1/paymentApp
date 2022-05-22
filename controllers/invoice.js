const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const req = require("express/lib/request");
const url = require("url");
const nodemailer = require('nodemailer');
//const payoutControllers = require('../../controllers/payout')

async function sendInvoice(invoice_url, invoice_pdf, statusFacture, invoice, consultant_name){
  //nodemailer
  var transporter = nodemailer.createTransport({
      //service: process.env.SERVICE,
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS
      }
  });
  
  var mailOptions = {
      from: process.env.EMAIL,
      to: invoice.customer_email,
      subject: 'Invoice',
      html: `<h3> Montant à transférer de MeltingWorks au Consultant ${consultant_name}`  + '<br />' + `Le lien de votre facture ${statusFacture}  :  </h3>` + '<br />' 
      + '<h3>' + invoice_url + '<h3>' + '<br />' + '<h3> Le lien de votre facture pdf : <h3/> ' + '<h3>' + invoice_pdf + '<h3>'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
      console.log(error);
      } else {
      console.log('Email sent: ' + info.response);
      }
  });
  
  }


  async function sendInvoiceCustomer(invoice_url, invoice_pdf, statusFacture, invoice){
    //nodemailer
    var transporter = nodemailer.createTransport({
        //service: process.env.SERVICE,
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
        }
    });
    
    var mailOptions = {
        from: process.env.EMAIL,
        to: invoice.customer_email,
        subject: 'Invoice',
        html: `<h3>Le lien de votre facture ${statusFacture}  :  </h3>` + '<br />' 
        + '<h3>' + invoice_url + '<h3>' + '<br />' + '<h3> Le lien de votre facture pdf : <h3/> ' + '<h3>' + invoice_pdf + '<h3>'
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });
    
    }
  
    
async function product(nom) {
  const product = await stripe.products.create({ name: nom });
  return product;
}


async function price(nom_product, amountHT, echeance) {
  if((amountHT % echeance) === 0){
    const amountSplited = (amountHT / echeance)
    const price = await stripe.prices.create({
        //unit amount: quantity (nb users) * amount
        unit_amount: amountSplited,
        currency: process.env.CURRENCY,
        product: nom_product
      });
      return price
}else{
  const amountSplited = Math.round( ((amountHT / echeance)))
    const price = await stripe.prices.create({
     
        unit_amount: amountSplited,
        currency: process.env.CURRENCY,
        product: nom_product,
      });
      return price
}
}

async function priceCustomer(nom_product, amountHT) {


  const price = await stripe.prices.create({
    product: nom_product,
    unit_amount: amountHT,
    currency: process.env.CURRENCY
  });
  return price;
}

async function item(customer, id_price, new_date, due_date) {
  const invoiceItem = await stripe.invoiceItems.create({
    customer: customer,
    price: id_price,
    period: {
      start: new_date,
      end: due_date
      
    }
    
  });
  console.log(invoiceItem)
  return invoiceItem;
}

async function numFisc(id, value){
  
  const taxId = await stripe.customers.createTaxId(id, {
    value: value,
    type: "eu_vat",
  });
  return taxId
}

async function invoice(customer, account, id_commande, id_tax, due_date) {
  const invoice = await stripe.invoices.create({
    customer: customer,
    collection_method: "send_invoice",
    //days_until_due: 30,
    due_date: due_date,
    on_behalf_of: account,
    metadata:{
      id_commande: id_commande
    },
    default_tax_rates: [id_tax],
    // account_tax_ids: [account_fiscal]
  });
  return invoice;
}

async function invoiceCustomer(customer, id_commande, id_tax, due_date, default_payment_method) {
  const invoice = await stripe.invoices.create({
    customer: customer,
    collection_method: "send_invoice",
    default_payment_method: default_payment_method,
    due_date: due_date,
    metadata:{
      id_commande: id_commande
    },
    default_tax_rates: [id_tax]
  });
  return invoice;
}

async function update(id_invoice, default_payment_method) {
  const invoiceUpdate = await stripe.invoices.update(id_invoice,
    {default_payment_method: default_payment_method});
  return invoiceUpdate;
}

async function finalize(id_invoice) {
  const invoice = await stripe.invoices.finalizeInvoice(id_invoice);
  return invoice;
}

async function payInvoiceCustomerPaiementDirect(id_invoice, payment_method) {
  const invoice = await stripe.invoices.pay(id_invoice,
    {
      payment_method: payment_method
    });
  console.log("rrrrrrrrrryyyyyyyyy", invoice)
  return invoice;
}

async function send(id_invoice, consultant_name) {
  const invoice = await stripe.invoices.sendInvoice(id_invoice);
  sendInvoice(invoice.hosted_invoice_url, invoice.invoice_pdf, 'à payer', invoice, consultant_name)
  return invoice;
}

async function sendCustomer(id_invoice) {
  const invoice = await stripe.invoices.sendInvoice(id_invoice);
  
  return invoice;
}

async function createTaxRate(product_name, tva) {
  const taxRate = await stripe.taxRates.create({
    display_name: product_name + " Tax",
    inclusive: false,
    percentage: tva,
    country: "FR",
  });

  return taxRate;
}

module.exports = {
  product,
  price,
  item,
  invoice,
  finalize,
  send,
  createTaxRate,
  numFisc,
  sendInvoice,
  invoiceCustomer,
  sendCustomer,
  sendInvoiceCustomer,
  priceCustomer,
  payInvoiceCustomerPaiementDirect,
  update

};
