const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function createAccount(req){
    const token = await stripe.tokens.create({
        account: {
          individual: {
            first_name: 'Jane',
            last_name: 'Doe',
          },
          tos_shown_and_accepted: true,
          business_type: "individual"
        },
      });
console.log("tokeeeen", token.id)
    const account = await stripe.accounts.create({
        type: 'custom',
        country: 'FR',
        account_token: token.id,
        //company: {name: req.body.name},
        email: req.body.email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
            sepa_debit_payments: { requested: true },
        },
       // tos_acceptance: {service_agreement: 'recipient'},
        metadata: { iban: req.body.iban },
        // business_type: "individual"

    }
)
return account
}

async function activateAccount(req){
    // const date = new Date.getTime()
    // console.log("accccceeeept", date)
    const accountUpdate = await stripe.accounts.update(req.params.id, {
        tos_acceptance: { date: 1652694313, ip: '8.8.8.8' },
    })

return accountUpdate
}

async function retrieveAccount(id){
    const accountUpdate = await stripe.accounts.retrieve(id)

return accountUpdate
}

async function updateAccount(req){
    const accountUpdate = await stripe.accounts.update(req.params.id, {
        metadata: { iban: req.body.iban },
        //tos_acceptance: {service_agreement: 'recipient'},
    })

return accountUpdate
}

async function accountsList(req){
    const accounts = await stripe.accounts.list({
        limit: 3
    })
    const x = accounts.data.filter((e)=>(
        e.tos_acceptance.ip === '8.8.8.8'
    ))
console.log("hhhhhhhhhhhh", x)
    return x
}



module.exports = {createAccount, activateAccount, retrieveAccount, updateAccount, accountsList}