var express = require('express');
const req = require('express/lib/request');
var router = express.Router();
var env = require("dotenv").config({ path: "./.env" });
const url = require('url');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//const subscriptionControllers = require('../../controllers/subscription')
const paymentControllers = require('../../controllers/payment')
const missionControllers = require('../../controllers/mission')
const subscriptionControllers = require('../../controllers/subscription')
const customerControllers = require('../../controllers/customers')
const invoiceControllers = require('../../controllers/invoice');
const moment = require("moment");

//nodemailer
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

router.get("/config", (req, res) => {
    res.send({
        publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
        amount: process.env.AMOUNT,
        currency: process.env.CURRENCY
    });
  });


  //send invoice function
async function sendInvoice(invoice_url, invoice_pdf, statusFacture, invoice){
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
    html: `<h3> Le lien de votre facture ${statusFacture}  :  </h3>` + '<br />' 
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


//send receipt
async function sendReceipt(receipt_url, payment){
    //nodemailer
    var ReceiptTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
        }
    });
    
    var receiptMailOptions = {
        from: process.env.EMAIL,
        to: payment.receipt_email,
        subject: 'Receipt',
        html: `<h3> Le lien de votre reçu :  </h3>` + '<br />' 
        + '<h3>' + receipt_url + '<h3>'
    };
    
    ReceiptTransporter.sendMail(receiptMailOptions, function(error, info){
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });
    
    }


//Steps: create product, then price, 
//then payment method,create customer with the payment method/ provide an existing cus_id to sub, 
//then create sub,then retrieve invoice,then confirm payment intent ,then manage status , then test

//create product
router.post('/product', async(req,res, next) => {
    try {
        const product = await missionControllers.createProduct(req)
          //res.json(product);
          console.log(product.id);
          res.send({
              id: product.id
          })
    } catch (err) {
        res.status(500).json({ message: 'product not created' })
    console.log(err)
    }
})
//create price with /!\ type = recurring
router.post('/pay', async(req,res,next) => {
try {
    //date fin de l'abonnement
        var d = new Date(req.body.date_fin);
        console.log("daaaaate", d)
        var result = d.setDate(d.getDate());
        console.log("resuuuuult", result)
        var end_period = d.getTime() / 1000;
        console.log("ennnnnnnd", end_period)
        // var d_new = new Date(req.body.date_debut);

        // var result2 = d_new.setDate(d_new.getDate() + days);
        // var start_period = d_new.getTime() / 1000;


     console.log(req.body)
     const echeance = parseInt(req.body.echeance)
     console.log(echeance);
     const nom_produit = req.body.nom_produit
     console.log(nom_produit);
     let quantity =0;

     //mission mensuelle
     if((echeance === 1)){
        quantity  = 1;
        const product = await missionControllers.createProduct(nom_produit);
        console.log(product)

        const price = await missionControllers.createPrice(req, product.id, quantity);
        console.log(price);

        const customer = await customerControllers.getCustomer(req.body.id_customer)
        console.log("iban customer", customer.metadata.iban)
        // const paymentMethod = await paymentControllers.createPaymentMethod(customer.metadata.iban, customer.name, customer.email);
        // await paymentControllers.attachPaymentMethod(paymentMethod.id, req.body.id_customer);
        const paymentMethodsList = await paymentControllers.getPaymentMethodList(customer.id)
        const taxRate = await missionControllers.createTaxRate(product.name)
       const sub = await missionControllers.createSubscription(req.body.id_customer, price.id, paymentMethodsList.data[0].id, taxRate.id, end_period);
       const invoiceUpdate = await missionControllers.updateInvoice(sub.latest_invoice, req.body.id_commande);
       const invoice = await missionControllers.getInvoice(invoiceUpdate.id);
       const updatePaymentSub = await missionControllers.updatePaymentIntent(invoice.payment_intent, req.body.id_commande, req.body.autorisation, product.name);
       const autorisation = await missionControllers.getPaymentIntentSubscription(updatePaymentSub.id);



        if(parseInt(autorisation.metadata.autorisation) === 0){
          
            const confirm = await missionControllers.confirmSubscription(invoice.payment_intent, paymentMethodsList.data[0].id);

            const subPayment = await missionControllers.getPaymentIntentSubscription(confirm.id);
            const subscriptionWithoutAutorisation = await missionControllers.getSubscription(sub.id);
            const invoiceUpdating = await missionControllers.updateInvoice(subscriptionWithoutAutorisation.latest_invoice, req.body.id_commande);
            
            setTimeout(async()=>{
               
                const invoiceWithoutAutorisation = await missionControllers.getInvoice(invoiceUpdating.id);    
                
                if(invoiceWithoutAutorisation.status === 'paid'){
                    console.log('email is sending')
                    sendInvoice(invoiceWithoutAutorisation.hosted_invoice_url, invoiceWithoutAutorisation.invoice_pdf, 'payée', invoiceWithoutAutorisation)
                    
                }
            }, 7000)
            
        }


        if( (parseInt(autorisation.metadata.autorisation) === 1) &&  (moment( ((sub.current_period_end) * 1000) + 15).format("DD/MM/YYYY")) && (invoice.status === "open") ){
            console.log("heeeeeere",(moment( ((sub.current_period_end) * 1000) + 15).format("DD/MM/YYYY")))

                const subscriptionBeforeConfirm = await missionControllers.getSubscription(sub.id);
                const upInvoice = await missionControllers.updateInvoice(subscriptionBeforeConfirm.latest_invoice, req.body.id_commande);
                const invoiceBeforeConfirm = await missionControllers.getInvoice(upInvoice.id);
                console.log("invoice before confirm", invoiceBeforeConfirm)

                if(invoiceBeforeConfirm.status === 'open'){
                    console.log('email is sending')
                    sendInvoice(invoiceBeforeConfirm.hosted_invoice_url, invoiceBeforeConfirm.invoice_pdf, "non payée", invoiceBeforeConfirm)
    }
   }

        res.send({
            id: price.id,
            quantity: price.recurring.interval_count
        });
          
        console.log('bloc mensuel');
     }else if((echeance === 2)){
       quantity=3 ;

       const product = await missionControllers.createProduct(nom_produit);
       const price = await missionControllers.createPrice(req, product.id, quantity);
       const customer = await customerControllers.getCustomer(req.body.id_customer);
       const paymentMethodsList = await paymentControllers.getPaymentMethodList(customer.id)
        const taxRate = await missionControllers.createTaxRate(product.name)
       const sub = await missionControllers.createSubscription(req.body.id_customer, price.id, paymentMethodsList.data[0].id, taxRate.id);
       const invoiceUpdate = await missionControllers.updateInvoice(sub.latest_invoice, req.body.id_commande);
       const invoice = await missionControllers.getInvoice(invoiceUpdate.id);
       const updatePaymentSub = await missionControllers.updatePaymentIntent(invoice.payment_intent, req.body.id_commande, req.body.autorisation, product.name);
       const autorisation = await missionControllers.getPaymentIntentSubscription(updatePaymentSub.id);
        if(parseInt(autorisation.metadata.autorisation) === 0){
            console.log("autooooo",autorisation.metadata.autorisation)
            const confirm = await missionControllers.confirmSubscription(invoice.payment_intent, paymentMethodsList.data[0].id);
            await missionControllers.getPaymentIntentSubscription(confirm.id);
            const subscriptionSub = await missionControllers.getSubscription(sub.id);
            console.log("subscription confirm")
            const invoiceUp = await missionControllers.updateInvoice(subscriptionSub.latest_invoice, req.body.id_commande);
            const invoice2 = await missionControllers.getInvoice(invoiceUp.id);
            console.log(invoice2)
            
            setTimeout(async()=>{
                if(invoice2.status === 'paid'){
                    sendInvoice(invoice2.hosted_invoice_url, invoice2.invoice_pdf, "payée", invoice2)
                    
                }
            }, 7000)
          
            
        }
       
        if( (parseInt(autorisation.metadata.autorisation) === 1) &&  (moment( ((sub.current_period_end) * 1000) + 15).format("DD/MM/YYYY")) && (invoice.status === "open") ){
       const subscription = await missionControllers.getSubscription(sub.id);
       console.log("subscription confirm")
       const updateInvoice = await missionControllers.updateInvoice(subscription.latest_invoice, req.body.id_commande);
       const invoice2 = await missionControllers.getInvoice(updateInvoice.id);
       console.log(invoice2)

       if(invoice2.status === 'open'){
        console.log('email is sending')
       sendInvoice(invoice2.hosted_invoice_url, invoice2.invoice_pdf, "non payée", invoice2)
        }
      
        
    }
    

       res.send({
           id: price.id,
           quantity: price.recurring.interval_count
       });
      

       console.log('bloc trimestriel');
     }else if(echeance === 3){
        var d = new Date(req.body.date_fin);
        
        var result = d.setDate(d.getDate());
        console.log("resuuult", result)
        var end_period = d.getTime() / 1000;
        console.log("ennnnnd", end_period)
        var d_new = new Date(req.body.date_debut);
        
        var result2 = d_new.setDate(d_new.getDate());
        console.log("resuuult twooooo ", result2)
        var start_period = d_new.getTime() / 1000;

        const customer = await customerControllers.getCustomer(req.body.id_customer)
        const paymentMethodsList = await paymentControllers.getPaymentMethodList(customer.id)
        const paymentIntent = await paymentControllers.createPaymentIntent(req.body.id_customer, paymentMethodsList.data[0].id, customer.email, req.body.id_commande, req.body.autorisation, req.body.amountHT);
        console.log(paymentIntent.receipt_email)
        
            const confirm = await paymentControllers.confirmPaymentIntent(paymentIntent.id, paymentMethodsList.data[0].id, paymentIntent.receipt_email);
    
            setTimeout(async()=>{
                const paymentRetrieve = await paymentControllers.getPaymentIntent(confirm.id)
                //if(paymentRetrieve.status === "succeeded"){
                //sendReceipt(paymentRetrieve.charges.data[0].receipt_url, paymentRetrieve)
                const product = await invoiceControllers.product(req.body.nom_produit);
    
                const price = await invoiceControllers.priceCustomer(
                  product.id,
                  req.body.amountHT
                );
               
                const paymentUpdate = await paymentControllers.updatePaymentIntent(paymentIntent.id, product.name)
                console.log("wzwzwzwzw", paymentUpdate )

                const tax = await missionControllers.createTaxRate(
                  req.body.nom_produit
                );
        
                const item = await invoiceControllers.item(
                  req.body.id_customer,
                  price.id,
                  start_period,
                  end_period
                );
              
               
                const invoice = await invoiceControllers.invoiceCustomer(
                  req.body.id_customer,
                  req.body.id_commande,
                  tax.id,
                  end_period,
                  paymentMethodsList.data[0].id
        
                );
                console.log(invoice.id);

                const finalize = await invoiceControllers.finalize(invoice.id);
                console.log(finalize.id);
             
                //setTimeout(async()=>{
                    const confirm2 = await paymentControllers.confirmPaymentIntent(finalize.payment_intent, paymentMethodsList.data[0].id, paymentIntent.receipt_email);
                    console.log("youyouyouyoyu", confirm2.status)
            //}, 10000)
            //console.log("youyouyouyoyu", confirm2.status)

               // const payInvoice = await invoiceControllers.payInvoiceCustomerPaiementDirect(finalize.id, paymentMethodsList.data[0].id)
                //console.log("batatatatta", payInvoice)
                const sendInvoiceEmail = await invoiceControllers.sendInvoiceCustomer(finalize.hosted_invoice_url, finalize.invoice_pdf, '', finalize)
               
            }, 10000)

    
       
        console.log('bloc paiement direct');
     }else{
         console.log('echeance error')
     }
       

} catch (err) {
    res.status(500).json({ message: 'price not created' })
    console.log(err)
}
})

// we should have a customer attached to a payment method first => call apis of payments
//create sub
router.post('/subscription', async(req, res, next) => {
    try {
        console.log(req.body)
        const type = parseInt(req.query.type)
        console.log(type);
        if((type === 0)){
            
            const product = await subscriptionControllers.createProduct(req);
            const price = await subscriptionControllers.createPrice(req.body.quantity, product.id);
            const paymentMethod = await paymentControllers.createPaymentMethod(req.body.iban, req.body.name, req.body.email);
            await paymentControllers.attachPaymentMethod(paymentMethod.id, req.body.customer);
            const sub = await subscriptionControllers.createSubscription(req.body.customer, price.id, paymentMethod.id);
            const invoice = await subscriptionControllers.getInvoice(sub.latest_invoice);
            const confirm = await subscriptionControllers.confirmSubscription(invoice.payment_intent, paymentMethod.id);
            await subscriptionControllers.getPaymentIntentSubscription(confirm.id);
            console.log('bloc customer');
        }else if(type === 1){
            
            const product = await subscriptionControllers.createProduct(req);
            const price = await subscriptionControllers.createPrice(req.body.quantity, product.id);
            const paymentMethod = await paymentControllers.createPaymentMethod(req.body.iban, req.body.name, req.body.email);
            await paymentControllers.attachPaymentMethod(paymentMethod.id, req.body.customer);
            const sub = await subscriptionControllers.createSubscription(req.body.customer, price.id, paymentMethod.id);
            const invoice = await subscriptionControllers.getInvoice(sub.latest_invoice);
            const confirm = await subscriptionControllers.confirmSubscription(invoice.payment_intent, paymentMethod.id);
            await subscriptionControllers.getPaymentIntentSubscription(confirm.id);
            console.log('bloc fournisseur');
        }
     
        //   res.send({
        //       id: subscription.id,
        //       default_payment_method: subscription.default_payment_method,
        //       customer: subscription.customer,
        //       status: subscription.status,
        //       latest_invoice: subscription.latest_invoice
        //   })
    } catch (err) {
        res.status(500).json({ message: 'subscription not created' })
  console.log(err)
    }
    
})


//retrieve sub
router.get('/subRetrieve', async(req, res, next) => {
    try {
        const subscription = await missionControllers.getSubscription(req.body.id)
        //res.json(subscription)
          console.log(subscription.id);
          res.send({
              id: subscription.id,
              status: subscription.status,
              current_period_end: subscription.current_period_end
          })
    } catch (err) {
        res.status(500).json({ message: 'subscription not retrieved' })
  console.log(err)
    }
})

//update sub
router.post('/sub/updateCancelAt', async(req, res, next) => {
    try {
         //date fin de l'abonnement
         var d = new Date(req.body.date_fin);
         console.log("daaaaate", d)
         //var days =  30;
         var result = d.setDate(d.getDate());
         console.log("resuuuuult", result)
         var end_period = d.getTime() / 1000;
         console.log("ennnnnnnd", end_period)
         // var d_new = new Date(req.body.date_debut);
 
         // var result2 = d_new.setDate(d_new.getDate() + days);
         // var start_period = d_new.getTime() / 1000;

        const subscription = await missionControllers.updateSubscription(req.body.id, end_period)
          console.log(subscription.id);
    } catch (err) {
        res.status(500).json({ message: 'subscription cancel at not updated' })
  console.log(err)
    }
})

// update subscription payment intent
router.post('/subPaymentIntent/update', async (req, res, next) => {
    try {
        const paymentIntent = missionControllers.updatePaymentIntent(req.body.id)
        console.log(paymentIntent.id);
        //res.status(200).json(paymentIntent)
        res.send({
            publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
            id: paymentIntent.id,
            payment_method: paymentIntent.payment_method,
            status: paymentIntent.status
        })
    } catch (err) {
        res.status(500).json({ message: ' payment not updated' })
        console.log(err)
    }
})


//cancel sub
router.delete('/sub', async(req, res, next) => {
    try {
        const subscription = await subscriptionControllers.cancelSubscription(req)
          console.log(subscription.id);
    } catch (err) {
        res.status(500).json({ message: 'subscription not deleted' })
  console.log(err)
    }
})

//retrieve list of subs
router.get('/list', async(req, res, next) => {
    try {
        const subscription = await subscriptionControllers.getSubscriptions(req)
        //res.json(subscription)
        console.log(subscription.id);
    } catch (err) {
        res.status(500).json({ message: 'list not retrieved' })
  console.log(err)
    }
})

//retrieve invoice to get the payment intent id
router.get('/invoice/retrieve/:id', async(req,res,next) => {
    try {
        const invoice = await missionControllers.getInvoice(req.params.id)
        //res.json(invoice);
        console.log(invoice.id);
        res.send({
            id: invoice.id,
            customer: invoice.customer,
            payment_intent: invoice.payment_intent,
            customer_email: invoice.customer_email
        })
        if(invoice.status === 'open'){
            sendInvoice(invoice.hosted_invoice_url, invoice.invoice_pdf, "payée après votre autorisation", invoice)
        }
        
    } catch (err) {
        res.status(500).json({ message: 'invoice not retrieved' })
  console.log(err)
    }
})

//update invoice
router.post('/invoiceTVA/update', async(req,res,next) => {
    try {
        const invoice = await missionControllers.updateInvoice(req.body.id, req)
            console.log(invoice.id);
    } catch (err) {
        res.status(500).json({ message: 'invoice not retrieved' })
  console.log(err)
    }
})

//confirm payment intent without payment_method_types, in order to confirm the invoice of the subscription
router.post('/sub/confirm', async(req,res,next) => {
    try {
        const paymentIntent = await subscriptionControllers.confirmSubscription(req)
        //res.json(paymentIntent)
        console.log(paymentIntent.id);
        
        res.send({
          publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
          paymentIntent : paymentIntent.status,
          id: paymentIntent.id
        });

 
    } catch (err) {
        res.status(500).json({ message: 'invoice not confirmed' })
        console.log(err)
    }
})

//retrieve payment intent of the subscription
router.get('/paymentIntentSub/:id', async(req, res, next) => {
    try {
        const paymentIntent = await subscriptionControllers.getPaymentIntentSubscription(req)
        //res.status(200).json(paymentIntent)
        console.log(paymentIntent.status)
        res.send({
          publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id,
          paymentIntent: paymentIntent.status
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'payment not retrieved' })
    }
  })

//retrieve paid subscription
router.post('/sub/done', async(req, res, next) => {
    try {
        const subscription_done = await subscriptionControllers.getDoneSubscription(req)
        console.log(subscription_done.data);
        const dataSubDone = subscription_done.data.filter(
            ((element) => (element.status === 'active' || 'past_due'))
        )
        res.send(dataSubDone)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'done subscriptions not retrieved' })
    }
})

//retrieve list of invoices of a customer
router.get('/invoices', async(req, res, next) => {
    try {
        const invoices = await missionControllers.invoicesList(req);
        console.log(invoices.data.length)
        const modifiedInvoices = invoices.data.map((invoice) => {
            return {[invoice['hosted_invoice_url']] : invoice.metadata.id_commande}
        })
        console.log(modifiedInvoices)
        res.status(200).json(modifiedInvoices)
        
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'invoices not retrieved' })
    }
})


//create tax rate
router.post('/taxRate', async(req,res, next) => {
    try {
        const taxRate = await missionControllers.createTaxRate(req)
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


//scheduling steps: create ,end_date of sub is the start_date of the next one so retrieve end_date sub first
//create schedule subscription
router.post('/schedule', async(req, res, next) => {
    try {
        const subscriptionSchedule = await stripe.subscriptionSchedules.create({
            customer: 'cus_LQFeroieQWrUyW',
            start_date: req.body.start_date,
            end_behavior: 'release',
            phases: [
              {
                items: [
                  {
                    price: 'price_1KRHToCz8fxitj4rprSI2Yeb',
                    quantity: 1,
                  },
                ],
                iterations: 12,
              },
            ],
          });
    } catch (err) {
        
    }
})


module.exports = router;
