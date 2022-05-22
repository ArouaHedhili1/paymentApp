const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const req = require("express/lib/request");
const url = require('url');
const moment = require("moment");

async function createProduct(nom_produit){
    const product = await stripe.products.create({
        name: nom_produit,
      });
console.log("naaaaaaame", product.name)
      return product
}

async function createPrice(req, product, quantity){
    if((req.body.amountHT % req.body.durée) === 0){
        const amount = Math.round( ((req.body.amountHT)/(req.body.durée)) * 100) / 100;
        const price = await stripe.prices.create({
            //unit amount: quantity (nb users) * amount
            unit_amount: amount,
            currency: process.env.CURRENCY,
            recurring: {interval: 'month',
                        interval_count: quantity},
            // the product is the command
            product: product,
            tax_behavior: "exclusive"
          });
          return price
    }else{
        const amount = Math.round( ((req.body.amountHT)/(req.body.durée)) * 100);
        const price = await stripe.prices.create({
            //unit amount: quantity (nb users) * amount
            unit_amount: amount,
            currency: process.env.CURRENCY,
            recurring: {interval: 'month',
                        interval_count: quantity},
            // the product is the command
            product: product,
            tax_behavior: "exclusive"
          });
          return price
    }
}


async function createSubscription(id_customer,price,payment_method, default_tax_rates,date_fin){
   
    const subscription = await stripe.subscriptions.create({
        customer: id_customer,
        items: [
          {price: price},
        ],
        default_payment_method: payment_method,
        metadata: {
        mission: 1},
       
        default_tax_rates: [default_tax_rates],
        cancel_at: date_fin
      });
console.log("rrrrttttt", subscription.cancel_at)
      return subscription
}

async function getSubscription(id){
    console.log("sub id", id)
    const subscription = await stripe.subscriptions.retrieve(id)

    return subscription
}

async function updateSubscription(id, date_fin){
    const subscription = await stripe.subscriptions.update(id,
        {
            cancel_at: date_fin
        })
        return subscription
}

//update mission = 1 suite à un abonnement attaché à une commande
async function updatePaymentIntent(id, id_commande, autorisation, product){

    const paymentIntent = await stripe.paymentIntents.update(id,
        {
            metadata: {
                        id_commande: id_commande,
                        autorisation: autorisation,
                        mission: 1,
                        product: product
                      }
        })

    return paymentIntent
}

async function cancelSubscription(req){
    const subscription = await stripe.subscriptions.del(req.body.id)

    return subscription
}

async function getSubscriptions(req){
    const subscription = await stripe.subscriptions.list({limit:3})

    return subscription
}

async function createInvoice(req){
    const invoice = await stripe.invoices.create({
        customer: req.body.customer,
      });
      return invoice;
}
async function getInvoice(id){
    const invoice = await stripe.invoices.retrieve(id);

    return invoice
}

async function updateInvoice(id, id_commande){
    const invoice = await stripe.invoices.update(id,
        {
            metadata: {
                id_commande: id_commande
            }
        })

        return invoice
}

async function confirmSubscription(id, payment_method){
    const paymentIntent = await stripe.paymentIntents.confirm(id, 
        {   payment_method: payment_method,
            mandate_data: {
                customer_acceptance: {
                    type: 'offline',
                },
            },
        },
    )

    return paymentIntent
}

async function invoicesList(req){
    const invoices = await stripe.invoices.list({
        customer: req.body.id_customer,
        limit: 100
    });

    return invoices
}

async function getPaymentIntentSubscription(id){
    const paymentIntent = await stripe.paymentIntents.retrieve(id)

    return paymentIntent
}

async function getDoneSubscription(req){
    const subscription_done = await stripe.subscriptions.list({
        customer: req.body.id,
        limit:3
    });

return subscription_done
}

async function createTaxRate(product_name){
    const taxRate = await stripe.taxRates.create({
        display_name: product_name + ' Tax',
        inclusive: false,
        percentage: 20,
        country: 'FR',
      });

return taxRate
}

async function getPaymentIntentsCustomer(id_customer){
    const list = await stripe.paymentIntents.list({
      customer: id_customer
      });

return list
}

module.exports = {createPrice, createProduct, createSubscription,
                    getDoneSubscription, getInvoice, getPaymentIntentSubscription, getSubscription,
                    getSubscriptions, updateInvoice, cancelSubscription, confirmSubscription,
                    createInvoice, updatePaymentIntent, invoicesList, createTaxRate,
                    getPaymentIntentsCustomer, updateSubscription}