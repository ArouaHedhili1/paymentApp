var express = require('express');
var router = express.Router();
var env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const accountControllers = require('../../controllers/account');

//create customer for an account
router.post('/account/create', async(req, res, next) => {
    try {
        const createAccount = await accountControllers.createAccount(req)
        res.status(200).json(createAccount)
       
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'account not created' })
    }
})
//update /active an account
router.post('/account/activate/:id', async (req, res, next) => {
    try {
        const accountUpdate = await accountControllers.activateAccount(req)
        console.log(accountUpdate)
        //res.status(200).json(accountUpdate)
        res.send({
            id: accountUpdate.id
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'account not active' })
    }
})

//retrieve account
router.get('/account/:id', async (req, res, next) => {
    try {
        const retrievedAccount = await accountControllers.retrieveAccount(req.params.id)

        console.log("waaaaaaaaa", retrievedAccount.company)
        res.send({
            id_account: retrievedAccount.id,
            name: retrievedAccount.business_profile.name,
            email: retrievedAccount.email,
            vat: retrievedAccount.company.vat_id,
            //vat: "FRAB123456789"
            //bank: retrievedAccount.external_accounts.data[0].id
           // number: retrievedAccount.external_account.account_number
        })
    } catch (err) {
        res.status(500).json({ message: 'account not retrieved' })
        console.log(err)
    }
})

//update metadata account
router.post('/account/update/:id', async (req, res, next) => {
    try {
        const accountUpdate = await accountControllers.updateAccount(req)
        console.log(accountUpdate)
        res.send({
            iban: accountUpdate.metadata.iban
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'account not updated' })
    }
})

//create bank token for connected account
router.post('/bankToken', async (req, res, next) => {
    try {
        const tokenConnectedAccount =await stripe.tokens.create({
            bank_account: {
              country: 'FR',
              currency: process.env.CURRENCY,
              account_holder_name: req.body.name,
              account_holder_type: 'individual',
              //routing_number: '110000000',
              account_number: req.body.iban,
            },
          });
        console.log(tokenConnectedAccount)
        res.send({
            id_token: tokenConnectedAccount.id,
            name: req.body.name,
            iban: req.body.iban
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'token not created' })
    }
})

//create external bank account for connected account
router.post('/bankExternalAccount', async (req, res, next) => {
    try {
        const bankExternalAccount = await stripe.accounts.createExternalAccount(
            'acct_1KaeNJ2R99Te73yJ',
            {
              external_account: req.body.id_token,
            }
          );
        console.log(bankExternalAccount)
        res.send({
            id: bankExternalAccount.id
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'bank not created' })
    }
})

//retrieve list of accounts
router.get('/accounts/list', async (req, res, next) => {
    try {
        const AccountsList = await accountControllers.accountsList(req);
        console.log(AccountsList)
        
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'accounts list not retrieved' })
    }
})


module.exports = router
