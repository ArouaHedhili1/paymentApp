var express = require('express');
const req = require('express/lib/request');
var router = express.Router();
var env = require("dotenv").config({ path: "./.env" });
const url = require('url');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const subscriptionControllers = require('../../controllers/subscription')
const customerControllers = require('../../controllers/customers')
const paymentControllers = require ('../../controllers/payment')

var SibApiV3Sdk = require('sib-api-v3-sdk');
// var defaultClient = SibApiV3Sdk.ApiClient.instance;
// var apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = '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';

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

router.post("/mailApi", async(req, res, next)=>{
    var defaultClient = SibApiV3Sdk.ApiClient.instance;
    var apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = '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';
          
    const sender = {
        email: 'nsirmariem77@gmail.com',
        name: 'Mariem nsir',
    }
    
    const recivers = [
        {
            name: 'MariemNsir',
            email: 'nsirmariem@gmail.com',
        },
    ]
    
    const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi()
    
    transactionalEmailApi
        .sendTransacEmail({
            subject: 'Subscribe to Cules Coding to become a developer',
            sender,
            to: recivers,
            // textContent: `Cules Coding will teach you how to become a {{params.role}} developer.`,
            htmlContent: `
                <h1>This is my first attempt</h1>`,
            // params: {
            //     role: 'frontend',
            // },
        })
        .then(console.log)
        .catch(console.log)
         
console.log("aaaaaa")
   
})

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


//Steps: create product, then price, 
//then payment method,create customer with the payment method/ provide an existing cus_id to sub, 
//then create sub,then retrieve invoice,then confirm payment intent ,then manage status , then test

//create product
router.post('/product', async (req, res, next) => {
    try {
        const product = await subscriptionControllers.createProduct(req)
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
router.post('/price', async (req, res, next) => {
    try {
        const price = await subscriptionControllers.createPrice(req);
        //res.json(price);
        console.log(price);
        res.send({
            id: price.id,
            quantity: price.recurring.interval_count
        })

    } catch (err) {
        res.status(500).json({ message: 'price not created' })
        console.log(err)
    }
})

//update price
router.post('/price/update', async (req, res, next) => {
try {
    const price = await subscriptionControllers.updatePrice(req.body.id_price);
        //res.json(price);
        console.log(price);
        res.send({
            id: price.id,
            quantity: price.recurring.interval_count
        })
} catch (err) {
    res.status(500).json({ message: 'price not updated' })
    console.log(err)
}
})

// we should have a customer attached to a payment method first => call apis of payments
//create sub
router.post('/sub', async (req, res, next) => {
    try {
        const subscription = await subscriptionControllers.createSubscription(req)
        //res.json(subscription);
        console.log(subscription);
        res.send({
            id: subscription.id,
            default_payment_method: subscription.default_payment_method,
            customer: subscription.customer,
            status: subscription.status,
            latest_invoice: subscription.latest_invoice
        })
    } catch (err) {
        res.status(500).json({ message: 'subscription not created' })
        console.log(err)
    }

})


router.post('/tax', async (req, res, next) => {
    try {
        const taxRate = await subscriptionControllers.createTaxRate(req.body.name)
        
        console.log(taxRate.id);
        res.send({
            id_tax: taxRate.id
        })
    } catch (err) {
        res.status(500).json({ message: 'tax not created' })
        console.log(err)
    }

})


//retrieve sub
router.get('/subRetrieve', async (req, res, next) => {
    try {
        const subscription = await subscriptionControllers.getSubscription(req.body.id)
        //res.json(subscription)
        console.log(subscription);
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
router.post('/sub/update', async(req, res, next) => {
    try {
        const sub = await subscriptionControllers.updateSubscription(req.body.id)
        console.log(sub)
        res.send({
            id: sub.id
        })
    } catch (err) {
        res.status(500).json({ message: 'subscription not updated' })
        console.log(err)
    }
})

router.post('sub/updatePaymentMethod', async(req, res, next)=>{
    try {
        const sub = await subscriptionControllers.updateSubPaymentMethod(req.body.id, req.body.default_payment_method)
        console.log(sub)
        res.send({
            id: sub.id
        })
    } catch (err) {
        res.status(500).json({ message: 'subscription payment mehtod not updated' })
        console.log(err)
    }
})



//update teeeeeest
router.post('/sub/Testupdate', async(req, res, next) => {
    try {
        // var d = new Date("2022-05-06 11:47:00:00");
        // console.log("ssssss", d)
        // var current_period_end = d.getTime() / 1000;
        // console.log("aaaaa", current_period_end)

        const sub = await subscriptionControllers.updateSub(req.body.id, req.body.default_payment_method)
        console.log(sub)
        res.send({
            id: sub.id
        })
    } catch (err) {
        res.status(500).json({ message: 'subscription payment not updated' })
        console.log(err)
    }
})

//update sub : route backend to update quantity in order to calculate the number of user
router.post('/updateSubscription', async(req, res, next) => {
    try {
        console.log(req.body)
        const customer = await customerControllers.getCustomer(req.body.id_customer)
            console.log("iban customer", customer.metadata.iban)
        const listSubRetrieve = await subscriptionControllers.listSubRetrieve(req.body.id_customer)
        console.log("heeere", listSubRetrieve[0].metadata)
    
        if(listSubRetrieve[0].metadata.mission === '0'){
            const subscription = await subscriptionControllers.updateSubscription(listSubRetrieve[0].id, listSubRetrieve[0].items.data[0].price.id,req.body.nombre_utilisateur)
            
            const invoiceModified = await subscriptionControllers.getInvoice(subscription.latest_invoice);
           
            //only invoice the customer the next month when the sub will be done
                // if((invoiceModified.status === 'paid') && (listSubRetrieve[0].items.data[0].price.id,req.body.nombre_utilisateur > 1)){
                //     sendInvoice(invoiceModified.hosted_invoice_url, invoiceModified.invoice_pdf, "payée", invoiceModified)
                // }

        await subscriptionControllers.updatePaymentSubscription(invoiceModified.payment_intent);
        }
        
    } catch (err) {
        res.status(500).json({ message: 'subscription quantity/nombre_utilisateur not updated' })
  console.log(err)
    }
})


//cancel sub
router.delete('/sub', async (req, res, next) => {
    try {
        const subscription = await subscriptionControllers.cancelSubscription(req)
        console.log(subscription.id);
    } catch (err) {
        res.status(500).json({ message: 'subscription not deleted' })
        console.log(err)
    }
})

//retrieve list of subs
router.get('/listSub', async (req, res, next) => {
    try {
        const subscription = await subscriptionControllers.listSubRetrieve(req.body.id_customer)
        res.json(subscription.data[0].id)
        
    } catch (err) {
        res.status(500).json({ message: 'list not retrieved' })
        console.log(err)
    }
})

//retrieve upcoming invoice
router.get('/invoiceUpComing', async (req, res, next) => {
    try {
const invoiceUpComing = await subscriptionControllers.upComingInvoice(req.body.id_customer, req.body.id_sub)
} catch (err) {
    res.status(500).json({ message: 'upcoming invoice not retrieved' })
    console.log(err)
}
})


//retrieve invoice to get the payment intent id
router.get('/invoice/:id', async (req, res, next) => {
    try {
        const invoice = await subscriptionControllers.getInvoice(req.params.id)
        //res.json(invoice);
        console.log(invoice);
        res.send({
            id: invoice.id,
            customer: invoice.customer,
            payment_intent: invoice.payment_intent,
            customer_email: invoice.customer_email
        })

        //needs a condition here on the invoice's status
        if (invoice.status === 'open') {
            sendInvoice(invoice.hosted_invoice_url, invoice.invoice_pdf, "payée", invoice)
        }

    } catch (err) {
        res.status(500).json({ message: 'invoice not retrieved' })
        console.log(err)
    }
})


//retrieve invoice only
router.get('/invoice/retrieve', async (req, res, next) => {
    try {
        const invoice = await subscriptionControllers.retrieveInvoice(req.body.id)
        //res.json(invoice);
        console.log(invoice.id);
        res.send({
            id: invoice.id,
            customer: invoice.customer,
            payment_intent: invoice.payment_intent,
            customer_email: invoice.customer_email
        })



    } catch (err) {
        res.status(500).json({ message: 'invoice not retrieved' })
        console.log(err)
    }
})


//update invoice
router.post('/invoice/update/:id', async (req, res, next) => {
    try {
        const invoice = await subscriptionControllers.updateInvoice(req.params.id)
        console.log(invoice.id);
    } catch (err) {
        res.status(500).json({ message: 'invoice not updated' })
        console.log(err)
    }
})

//confirm payment intent without payment_method_types, in order to confirm the invoice of the subscription
router.post('/sub/confirm', async (req, res, next) => {
    try {
        const paymentIntent = await subscriptionControllers.confirmSubscription(req.body.id)
        //res.json(paymentIntent)
        console.log(paymentIntent.id);

        res.send({
            publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
            paymentIntent: paymentIntent.status,
            id: paymentIntent.id
        });


    } catch (err) {
        res.status(500).json({ message: 'invoice not confirmed' })
        console.log(err)
    }
})

//retrieve payment intent of the subscription
router.get('/paymentIntentSub/:id', async (req, res, next) => {
    try {
        const paymentIntent = await subscriptionControllers.getPaymentIntentSubscription(req)
        //res.status(200).json(paymentIntent)
        console.log(paymentIntent.status)
        res.send({
            publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
            paymentIntent: paymentIntent.status,
            default_payment_method: paymentIntent.default_payment_method
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'payment not retrieved' })
    }
})

//create paymentIntent setup to get iban or customer infos
router.post('/setupPayment', async (req, res, next) => {
    try {
        const setupIntent = await subscriptionControllers.createSetupPayment(req)
        console.log(setupIntent.id);
        res.send({
            publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
            clientSecret: setupIntent.client_secret,
            customer: setupIntent.customer,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'payment not set' })
    }

})


//retrieve paid subscription
router.post('/subscription/done', async (req, res, next) => {
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

//retrieve subscriptions en cours
router.post("/subPaymentIntents/pending", async (req, res, next) => {
    try {
      const subPaymentIntents_pending = await subscriptionControllers.getPendingSubPayments(req);
      console.log(subPaymentIntents_pending.data);
      const dataSubPending = subPaymentIntents_pending.data.filter(
        ((element) => (element.status === 'requires_confirmation'))
    )
      res.send(dataSubPending);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "sub payments pending not retrieved" });
    }
  });

  
// update subscription payment intent
router.post('/subPayment/update/:id', async (req, res, next) => {
    try {
        const paymentIntent = await subscriptionControllers.updatePaymentSubscription(req.params.id, req.body.payment_method)
        console.log(paymentIntent);
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


//update sub

//scheduling steps: create ,end_date of sub is the start_date of the next one so retrieve end_date sub first
//create schedule subscription
router.post('/schedule', async (req, res, next) => {
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
