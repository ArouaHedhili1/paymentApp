import React, { useState, useEffect } from "react";
import Sepa from "../sepa";
import "../styles/sepa.css";
import "../styles/normalize.css";
import { Link } from "react-router-dom";
import Loader from "../components/loader";
import bankIcon from "../assets/images/icon-bank.png";
import logoConsultant from "../assets/images/logo-consultant.png";
import logoClient from "../assets/images/logo-client.png";
import arrowConsultant from "../assets/images/arrow.png";
import blueDesign from "../assets/images/blue-design.png";

import avatar1 from "../assets/images/avatar11.PNG";
import avatar2 from "../assets/images/avatar2.png";
import avatar3 from "../assets/images/avatar3.png";
import arrowClient from "../assets/images/Arrows-Left-icon.png";

import { useParams } from "react-router-dom";
import colors from "../styles/colors";

function SubscriptionHome() {
  const [state, setState] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [iban, setIban] = useState("");
  const [check, setCheck] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState();
  const [userId, setUserId] = useState();
  //const [echeance, setEcheance] = useState(3);
  const [logo, setLogo] = useState();
  const [btnColor, setBtnColor] = useState();
  const [color, setColor] = useState();
  const [portail, setPortail] = useState();
  const [arrow, setArrow] = useState();
  const [backgroundColor, setBackgroundColor] = useState();
  const [fontFamily, setFontFamily] = useState("Gilroy 16");
  const [opacity, setOpacity] = useState("70%");
  const [fontWeight, setFontWeight]= useState("light");
  const [fontSize, setFontSize]= useState("16");
  const [ibanFontFamily, setIbanFontFamily] = useState("Gilroy");
  const [ibanFontWeight, setIbanFontWeight] = useState("light");
  const [ibanFontSize, setIbanFontSize] = useState("16");
  const [ibanOpacity, setIbanOpacity] = useState("40%");


  //get fields by customer id from url
  let { id: user_id } = useParams();
  let { type: user_type } = useParams();

  useEffect(async () => {
    setUserId(user_id);
    setType(user_type);

    console.log("type", user_type);
    if (type === "1") {   
      console.log("type consultant ya baba")   
      setLogo(logoConsultant);
      setBtnColor(colors.blanc);
      setColor(colors.grisFoncé);
      setPortail(colors.grisFoncé);
      setArrow(arrowConsultant);
      setBackgroundColor(colors.blanc);
      await getConsultantId();
    } else if(type === "0") {
      console.log("type customer ya baba")
      setLogo(logoClient);
      setBtnColor(colors.grisFoncé);
      setColor(colors.blanc);
      setPortail(colors.blanc);
      setArrow(arrowClient);
      setBackgroundColor(colors.bleuClair);
      await getClientId();
    }
    setFontFamily("Gilroy");
    setOpacity("100%");
    setFontWeight("bolder")
    setFontSize("16")
  });
  async function getConsultantId() {
    const accountId = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}account/${userId}`,
      {
        //mode: "no-cors",
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );
    console.log("res", accountId);
    const accountData = await accountId.json(accountId);
    console.log("account", accountData);
    setName(accountData.name);
    setEmail(accountData.email);
  }

  async function getClientId() {
    console.log("customer id", userId);
    const customerId = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}customer`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: userId
        })
      }
    );

    console.log("res", customerId);
    const customerData = await customerId.json(customerId);
    console.log("customer", customerData);
    setName(customerData.name);
    setEmail(customerData.email);
  }

  //redirection
  function clickHandler(status) {
    if ((status === "processing") || (status === "succeeded")) {
      //console.log(status)
      window.location.assign(`/success/${type}`);
    } else {
      window.location.assign(`/error/${type}`);
    }
    return status;
  }

  //function consultant subscription
  async function subConsultant() {
    //activate account
    const activateAccount = await fetch(`${process.env.REACT_APP_BACKEND_URL}account/activate/${userId}`,
    {
        //mode: "no-cors",
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
         id: userId
        }),
      }
    );
    console.log("activate", activateAccount);
    const accountActivateData = await activateAccount.json(activateAccount);
    console.log("account activate", accountActivateData);
    

//create bank token for connected account
console.log("naaame", name)
console.log("ibaaan", iban)
      const tokenConnectedAccount =await fetch(`${process.env.REACT_APP_BACKEND_URL}bankToken`,
       {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          iban: iban
         }),
      }
    );
    console.log("token", tokenConnectedAccount);
    const tokenConnectedAccountData = await tokenConnectedAccount.json(tokenConnectedAccount);
    console.log("data token", tokenConnectedAccountData);


//create external bank account for connected account


      const bankExternalAccount = await fetch(`${process.env.REACT_APP_BACKEND_URL}bankExternalAccount`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
         id: userId,
         id_token: tokenConnectedAccountData.id_token
        }),
      }
    );
    console.log("external bank", bankExternalAccount);
    const bankExternalAccountData = await bankExternalAccount.json(bankExternalAccount);
    console.log("external bank data", bankExternalAccountData);
 

    //save iban inside metadata
    const updateAccount = await fetch(`${process.env.REACT_APP_BACKEND_URL}account/update/${userId}`,
    {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
         id: userId,
         iban: iban
        }),
      }
    );
    console.log("matadata update", updateAccount);
    const updateAccountData = await updateAccount.json(updateAccount);
    console.log("account metadata update", updateAccountData);
    
      //retrieve account
      const retrieveAccount = await fetch(`${process.env.REACT_APP_BACKEND_URL}account/${userId}`,
      {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          }
        }
      );
      const retrieveAccountData = await retrieveAccount.json(retrieveAccount);
      console.log("account data retrieved", retrieveAccountData);


      
      
    //fetch create customer
    const customerCreate = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}customer/create`,
      {
        //mode: "no-cors",
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          //vat_id: retrieveAccountData.vat
        }),
      }
    );
    console.log("res create", customerCreate);
    const customerCreateData = await customerCreate.json(customerCreate);
    console.log("customer create", customerCreateData);

    //fetch create vat number
    const vatCreate = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}vat/create`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: customerCreateData.id_customer,
          value: retrieveAccountData.vat
        }),
      }
    );
    
    const vatCreateData = await vatCreate.json(vatCreate);
    console.log("vat create", vatCreateData);

    //fetch customer to get id
    const id_customer = customerCreateData.id_customer;
    const customerId = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}customer`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: id_customer
        })
      }
    );
    console.log("res", customerId);
    const customerData = await customerId.json(customerId);
    console.log("customer", customerData);

    

    //loading
    setIsLoading(true);

    //fetch create product
    const product = await fetch(`${process.env.REACT_APP_BACKEND_URL}product`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    });
    console.log(product);

    const dataProduct = await product.json(product);
    console.log(dataProduct);

    //fetch create price
    const price = await fetch(`${process.env.REACT_APP_BACKEND_URL}price`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        product: dataProduct.id,
        id_customer: id_customer,
        iban: iban,
        name: name,
        email: email,
      }),
    });
    console.log(price);

    const dataPrice = await price.json(price);
    console.log(dataPrice);

    //fetch create payment method
    const paymentMethod = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}payment`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          iban: iban,
          name: name,
          email: email,
        }),
      }
    );
    console.log(paymentMethod);

    const dataPayment = await paymentMethod.json(paymentMethod);
    console.log(dataPayment);

     //fetch attach payment method to customer
     const paymentMethodAttach = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentAttach`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: id_customer,
          id: dataPayment.id,
        }),
      }
    );
    console.log(paymentMethodAttach);
    const dataAttach = await paymentMethodAttach.json(paymentMethodAttach);
    console.log(dataAttach);

    //fetch update customer matadata for connect account
    const customerUpdate = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}customer/update/${id_customer}`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          iban: iban,
          connect_account: userId,
          default_payment_method: dataPayment.id,
          //vat_id: customerCreateData.value
        }),
      }
    );
    console.log(customerUpdate);
    const customerUpdateData = await customerUpdate.json(customerUpdate);
    console.log(customerUpdateData);

   

    //fecth create sub
    const taxRate = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}tax`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          name: dataProduct.name
        }),
      }
    );
    console.log(taxRate);
    const dataTax = await taxRate.json(taxRate);
    console.log(dataTax);

    //fetch create sub
    const subscription = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}sub`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: id_customer,
          price: dataPrice.id,
          payment_method: dataAttach.id,
          default_tax_rates: dataTax.id_tax
        }),
      }
    );
    console.log(subscription);
    const dataSubscription = await subscription.json(subscription);
    console.log(dataSubscription);

    const id = dataSubscription.latest_invoice;
    //fetch retrieve invoice
    const invoice = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}invoice/${id}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );
    console.log(invoice);
    const dataInvoice = await invoice.json(invoice);
    console.log(dataInvoice);

    //fetch confirm subscription via confirm payment intent
    const paymentIntent = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}sub/confirm`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: dataInvoice.payment_intent,
          payment_method: dataSubscription.default_payment_method,
        }),
      }
    );
    console.log(paymentIntent);
    const dataConfirm = await paymentIntent.json(paymentIntent);
    console.log(dataConfirm);

    const id_pyamenIntent = dataConfirm.id;
    //fetch retrieve subscription to get status to test on
    const status = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntentSub/${id_pyamenIntent}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );
    console.log(status);
    const dataStatus = await status.json(status);
    console.log(dataStatus);

    return dataStatus;
  }

  //function client subscription
  async function subClient() {
    //fetch customer to get id

    const customerId = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}customer`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: userId
        })
      }
    );
    console.log("res", customerId);
    const customerData = await customerId.json(customerId);
    console.log("customer", customerData);

    //loading
    setIsLoading(true);

    //fetch create product
    const product = await fetch(`${process.env.REACT_APP_BACKEND_URL}product`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    });
    console.log(product);

    const dataProduct = await product.json(product);
    console.log(dataProduct);

    //fetch create price
    const price = await fetch(`${process.env.REACT_APP_BACKEND_URL}price`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        product: dataProduct.id,
        id_customer: userId,
        iban: iban,
        name: name,
        email: email,
        //echeance: echeance,
      }),
    });
    console.log(price);

    const dataPrice = await price.json(price);
    console.log(dataPrice);

    //fetch create payment method
    const paymentMethod = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}payment`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          iban: iban,
          name: name,
          email: email,
        }),
      }
    );
    console.log(paymentMethod);

    const dataPayment = await paymentMethod.json(paymentMethod);
    console.log(dataPayment);

    //fetch attach payment method to customer
    const paymentMethodAttach = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentAttach`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: customerData.id_customer,
          id: dataPayment.id,
        }),
      }
    );
    console.log(paymentMethodAttach);
    const dataAttach = await paymentMethodAttach.json(paymentMethodAttach);
    console.log(dataAttach);

     //fecth create sub
     const taxRate = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}tax`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          name: dataProduct.name
        }),
      }
    );
    console.log(taxRate);
    const dataTax = await taxRate.json(taxRate);
    console.log(dataTax);

    //fetch create sub
    const subscription = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}sub`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: dataAttach.customer,
          price: dataPrice.id,
          payment_method: dataAttach.id,
          default_tax_rates: dataTax.id_tax
        }),
      }
    );
    console.log(subscription);
    const dataSubscription = await subscription.json(subscription);
    console.log(dataSubscription);

    const id = dataSubscription.latest_invoice;
    //fetch retrieve invoice
    const invoice = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}invoice/${id}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );
    console.log(invoice);
    const dataInvoice = await invoice.json(invoice);
    console.log(dataInvoice);

    //fetch confirm subscription via confirm payment intent
    const paymentIntent = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}sub/confirm`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: dataInvoice.payment_intent,
          payment_method: dataSubscription.default_payment_method,
        }),
      }
    );
    console.log(paymentIntent);
    const dataConfirm = await paymentIntent.json(paymentIntent);
    console.log(dataConfirm);


    //update payment intent sub mission = 0
    const paymentIntentUpdate = await fetch(`${process.env.REACT_APP_BACKEND_URL}subPayment/update/${dataConfirm.id}`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: dataConfirm.payment_intent
      })
    })
    console.log(paymentIntentUpdate)

    //fetch send invoice via email
    // const send = await fetch('/sendInvoice', {
    //   method: "POST",
    //   headers: {
    //     "Content-type": "application/json"
    //   }, body: JSON.stringify({

    //   })
    // })
    // console.log(send);
    // const dataSend = await send.json(send);
    // console.log(dataSend);

    

//fetch update customer matadata
const customerPaymentUpdate = await fetch(
  `${process.env.REACT_APP_BACKEND_URL}customer/paymentMethod/update/${userId}`,
  {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      iban: iban,
      default_payment_method: dataPayment.id
    }),
  }
);
console.log(customerPaymentUpdate);
const customerPaymentUpdateData = await customerPaymentUpdate.json(customerPaymentUpdate);
console.log(customerPaymentUpdateData);


    const id_pyamenIntent = dataConfirm.id;
    //fetch retrieve subscription to get status to test on
    const status = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntentSub/${id_pyamenIntent}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );
    console.log(status);
    const dataStatus = await status.json(status);
    console.log(dataStatus);


    //update payment method
    // const updatePaymentMethod = await fetch(
    //   `${process.env.REACT_APP_BACKEND_URL}sub/updatePaymentMethod`,
    //   { //mode:"no-cors",
    //     method: "POST",
    //     headers: {
    //       "Content-type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       id: dataSubscription.id,
    //       default_payment_method: dataSubscription.default_payment_method
    //     }),
    //   }
    // );
    // console.log(updatePaymentMethod);
    // const dataupdatePaymentMethod = await updatePaymentMethod.json(updatePaymentMethod);
    // console.log(dataupdatePaymentMethod);
    
    return dataStatus;
  }

  //---------------------------------------------------------------------

  //function to fetch payment apis
  async function api() {
    //fetch create payment method
    const paymentMethod = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}payment`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          iban: iban,
          name: name,
          email: email,
        }),
      }
    );
    console.log(paymentMethod);

    const dataPayment = await paymentMethod.json(paymentMethod);
    console.log(dataPayment);

    //fetch attach payment method to customer
    const paymentMethodAttach = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentAttach`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: userId,
          id: dataPayment.id,
        }),
      }
    );
    console.log(paymentMethodAttach);
    const dataAttach = await paymentMethodAttach.json(paymentMethodAttach);
    console.log(dataAttach);

    //fetch create payment intent
    const paymentIntent = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntent`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id_customer: userId,
          payment_method: dataAttach.id,
        }),
      }
    );
    //res.status(200).json(paymentIntent.clientSecret)
    const dataIntent = await paymentIntent.json(paymentIntent.clientSecret);
    console.log(dataIntent);

    //fetch confirm payment intent
    const paymentIntentConfirm = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntents/confirm`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: dataIntent.id,
          payment_method: dataAttach.id,
        }),
      }
    );
    const dataConfirm = await paymentIntentConfirm.json(paymentIntentConfirm);
    console.log(dataConfirm);

    //return dataConfirm.paymentIntent;

    //const id_payment = dataIntent.id
    //fetch retrieve payment intent

    const statusPayment = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntentRetrieve`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: dataIntent.id,
        }),
      }
    );
    console.log(statusPayment);
    const dataStatusPayment = await statusPayment.json(statusPayment);
    console.log(dataStatusPayment);

    return dataStatusPayment;

    //fetch send invoice via email
    // const send = await fetch('/sendInvoice', {
    //   method: "POST",
    //   headers: {
    //     "Content-type": "application/json"
    //   }, body: JSON.stringify({

    //   })
    // })
    // console.log(send);
    // const dataSend = await send.json(send);
    // console.log(dataSend);
  }
  console.log("type style", type);
  return (
    <Sepa
      image={logo}
      btnColor={btnColor}
      color={color}
      design={blueDesign}
      portail={portail}
      avatar={avatar1}
      avatar2={avatar2}
      avatar3={avatar3}
      arrow={arrow}
    >
      <div className="sr-main" style={{ backgroundColor: backgroundColor }}>
        <form id="payment-form" className="sr-payment-form">
          <div className="sr-combo-inputs-row">
            <div className="col">
              <h3>Autorisation de prélèvement</h3>
            </div>
          </div>
          <div className="sr-combo-inputs-row">
            <div className="col">
              <label for="name"> Identité </label>
              <input
                id="name"
                name="name"
                placeholder="Clark Kent"
                style={{ fontFamily: fontFamily, fontWeight: fontWeight, fontSize: fontSize, opacity: opacity }}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                value={name || ""}
                required
              />
            </div>
            <div className=" col">
              <label for="email"> Adresse Mail </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="superman@smallville.com"
                style={{ fontFamily: fontFamily, fontWeight: fontWeight, fontSize: fontSize, opacity: opacity }}
                onChange={(event) => setEmail(event.target.value)}
                value={email || ""}
                required
              />
            </div>
          </div>

          <div className="sr-combo-inputs-row">
            <div className="col">
              <label for="iban"> IBAN </label>
              <div>
                <img
                  className="icon-bank"
                  src={bankIcon}
                  alt="icon-bank"
                  style={{
                    opacity: "40%",
                    height: "26px",
                    width: "20px",
                    position: "absolute",
                    marginLeft: "8px",
                    marginTop: "10px",
                  }}
                ></img>
                <input
                  name="iban"
                  type="text"
                  placeholder="FR0000000000000000000000000"
                  style={{
                    fontFamily: ibanFontFamily,
                    fontWeight: ibanFontWeight,
                    fontSize: ibanFontSize,
                    opacity: ibanOpacity,
                    width: "465px",
                    marginLeft: "35px",
                    color: colors.grisFoncé,
                  }}
                  onChange={(event) => {
                    setIban(event.target.value);
                    setIbanFontFamily("Gilroy");
                    setIbanOpacity("100%");
                    setIbanFontWeight("bolder");
                    setIbanFontSize("16")
                  }}
                  value={iban}
                  required
                ></input>
              </div>

              {/* <img className="icon-bank" src="icon-bank.png" alt="icon-bank"></img>
                        <input name="iban" type="text" placeholder="FR00 0000 0000 0000 0000 00" style="
                        font-family: 'Gilroy Light 16' ;
                        opacity: 50% ; background: url(icon-bank.png) no-repeat scroll 6px 10px; background-size:20px 20px; padding-left: 30px; " required/> */}
              <div id="iban-element">
                {/* <!-- A Stripe Element will be inserted here. --> */}
              </div>
            </div>
          </div>

          {/* <!-- Used to display form errors. --> */}
          <div
            id="error-message "
            className="sr-field-error "
            role="alert "
          ></div>

          {/* <!-- Display mandate acceptance text. --> */}
          <div className="col " id="mandate-acceptance ">
            En fournissant votre IBAN et en confirmant ce paiement, vous
            autorisez Rocketship Inc. et Stripe, notre prestataire de services
            de paiement, à envoyer des instructions à votre banque pour débiter
            votre compte et votre banque à débiter votre compte conformément à
            ces instructions. Vous avez droit à un remboursement de votre banque
            selon les termes et conditions de votre accord avec votre banque. Un
            remboursement doit être réclamé dans un délai de 8 semaines à
            compter de la date à laquelle votre compte a été débité.
          </div>
          {/* {check === "proccessing"&&<Link to={ "/success"}> */}
          <Link to={check === "/subscriptionConsultant"}>
            <button
              id="confirm-mandate "
              style={{
                margin: "40px 150px",
                marginBottom: "-30px",
                padding: "12px 16px",
                backgroundColor: backgroundColor,
              }}
              onClick={async () => {
                let statusPayment;
                if (type === "1") {
                  console.log("sub consultant")
                  statusPayment = await subConsultant();
                } else {
                  console.log("sub customer")
                  statusPayment = await subClient();
                }
                // } else {
                //   if (echeance === 1 || echeance === 2) {
                //     statusPayment = await subClient();
                //   } else {
                //     statusPayment = await api();
                //   }
                //}

                //const statusPayment = await api();
                console.log(statusPayment);
                console.log("test status", statusPayment.paymentIntent);
                setCheck(statusPayment);
                console.log("check", statusPayment.paymentIntent);
                clickHandler(statusPayment.paymentIntent);
              }}
            >
              <span
                style={{ color: colors.grisFoncé, fontWeight: "normal" }}
                id="button-text"
              >
                Confirmer le mandat
                {/* <!-- <span id="order-amount "></span
            >--> */}
              </span>
            </button>
          </Link>
        </form>
        <div className="sr-result hidden ">
          <p>
            Payment processing
            <br />
          </p>
          <pre>
            <code></code>
          </pre>
        </div>
      </div>
      <Loader
        loader={{
          isOpen: isLoading,

          title: "Autorisation en cours de confirmation...",
        }}
      />
    </Sepa>
  );
}

export default SubscriptionHome;
