import React, { useState, useEffect } from "react";
import Sepa from "../sepa";
import PaiementDetailsAccordion from "../components/paiementDetailsAccordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";
import colors from "../styles/colors";
import logoClient from "../assets/images/logo-client.png";
import arrowClient from "../assets/images/Arrows-Left-icon.png";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

function AdminInterface() {
  const [isExpanded1, setIsExpanded1] = useState(true);
//   const [isExpanded2, setIsExpanded2] = useState(true);
//   const [isExpanded3, setIsExpanded3] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [donePayments, setDonePayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [name, setName] = useState("");
  //const [doneSubscriptions, setDoneSubscriptions] = useState([]);
  const [account, setAccount] = useState("")
  const [amountSub, setAmountSub] =useState("")
  const [date, setDate] = useState("")

  const [isSimiar, setIsSimilar] = useState(true);

  //pendingPayments pagination
  const [pendingPaymentsFirstIndex, setPendingPaymentsFirstIndex] = useState(0);
  const [pendingPaymentsLastIndex, setPendingPaymentsLastIndex] = useState(4);
  const [pendingPaymentsArrowBack, setPendingPaymentsArrowBack] =
    useState(false);
  const [pendingPaymentsArrowForward, setPendingPaymentsArrowForward] =
    useState(false);

  //donePayments pagination
//   const [donePaymentsFirstIndex, setDonePaymentsFirstIndex] = useState(0);
//   const [donePaymentsLastIndex, setDonePaymentsLastIndex] = useState(4);
//   const [donePaymentsArrowBack, setDonePaymentsArrowBack] = useState(false);
//   const [donePaymentsArrowForward, setDonePaymentsArrowForward] =
    //useState(false);

  //doneSubscriptions pagination
//   const [doneSubscriptionsFirstIndex, setDoneSubscriptionsFirstIndex] =
//     useState(0);
//   const [doneSubscriptionsLastIndex, setDoneSubscriptionsLastIndex] =
//     useState(4);
//   const [doneSubscriptionsArrowBack, setDoneSubscriptionsArrowBack] =
//     useState(false);
//   const [doneSubscriptionsArrowForward, setDoneSubscriptionsArrowForward] =
//     useState(false);

  let { id: id_cus } = useParams();

  //fetch done payments
  const done = async () => {
    //fetch customer
    const consultantAccount = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}account/${id_cus}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );
    const dataConsultant = await consultantAccount.json(consultantAccount);
    console.log("data consultant", dataConsultant);
    setName(dataConsultant.name);

    //fetch done payments
    // const paymentIntents_done = await fetch(
    //   `${process.env.REACT_APP_BACKEND_URL}paymentPayouts/done`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       account: dataConsultant.id,
    //     }),
    //   }
    // );
    // const dataDone = await paymentIntents_done.json(paymentIntents_done);
    // if (dataDone.length <= donePaymentsLastIndex) {
    //   setDonePaymentsArrowForward(true);
    // }
    // setDonePayments(dataDone);

    //fetch pending payments
    const paymentIntents_pending = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentTransferts/pending`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          account: dataConsultant.id,
        }),
      }
    );
    const dataPending = await paymentIntents_pending.json(
      paymentIntents_pending
    );
    if (dataPending.length <= pendingPaymentsLastIndex) {
      setPendingPaymentsArrowForward(true);
    }
    setPendingPayments(dataPending);
    setAccount(dataConsultant.id_account);

    //fetch list accounts
    // const accountsList = await fetch(
    //   `${process.env.REACT_APP_BACKEND_URL}accounts/list`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-type": "application/json",
    //     }
    //   }
    // );
    // const dataAccounts= await accountsList.json(
    //   accountsList
    // );
    // if (dataAccounts.length <= pendingPaymentsLastIndex) {
    //   setPendingPaymentsArrowForward(true);
    // }
    // console.log("daattaaaa accounts", dataAccounts)
    // setListAccounts(dataAccounts);
    // setName("naaaame",dataAccounts[0].name);
    //setAccount(dataConsultant.id_account);


}



  useEffect(async () => {
    await done();
    
    setPendingPaymentsArrowBack(true);
    
  }, []);

  const confirmPaymentAdmin = async (id, payment_method, invoice) => {
    //fetch customer
    // const consultantAccount = await fetch(
    //   `${process.env.REACT_APP_BACKEND_URL}account/${id_cus}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-type": "application/json",
    //     },
    //   }
    // );
    // const dataConsultant = await consultantAccount.json(consultantAccount);
    // console.log("data consultant", dataConsultant);

    //confirm payment intent payout
    const paymentToConfirm = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntentPayout/confirm`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id_paymentIntent: id,
          payment_method: payment_method,
         id_invoice: invoice,
        }),
      }
    );
    const confirmedPayment = await paymentToConfirm.json(paymentToConfirm);
    console.log("babababababa", confirmedPayment);
    console.log("invoiiice idddd", confirmedPayment.id_invoice)
   //return confirmedPayment.status;


  
   const sendInvoice = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}invoice/retrieve/${confirmedPayment.id_invoice}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    }
  );
  const invoiceData = await sendInvoice.json(sendInvoice);
  return invoiceData.status;

//retrieve external bank
  //  const bank = await fetch(
  //     `${process.env.REACT_APP_BACKEND_URL}bank`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         id: dataConsultant.id_account
  //       }),
  //     }
  //   );
  //   const dataBank = await bank.json(bank);
  //   console.log("data bank", dataBank)
    //return dataBank.status;


    // fetch create payout
    // const payout = await fetch(
    //   `${process.env.REACT_APP_BACKEND_URL}payout/create`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       id_bank: dataBank.id,
    //       amount: confirmedPayment.amount,
    //       account: dataConsultant.id_account
    //     }),
    //   }
    // );
    // const dataPayout = await payout.json(payout);
    // console.log("data payout", dataPayout)
    //return dataPayout.status;

    

    
    
  };

  return (
    <Sepa
      image={logoClient}
      btnColor={colors.grisFoncé}
      color={colors.blanc}
      portail={colors.blanc}
      arrow={arrowClient}
      isSimilar={isSimiar}
    >
      <div style={{ width: "80%", height: "60%" }}>
        <div className="sr-combo-inputs-row">
          <div
            style={{
              fontFamily: "Gilroy",
              fontWeight: "bolder",
              fontSize: 22,
              textAlign: "center",
            }}
          >
            <h3>Bienvenue sur votre espace administratif</h3>
          </div>
        </div>
       
        <div className="sr-combo-inputs-row">
          <div className="col">
            <PaiementDetailsAccordion
              fontFamily="Gilroy"
              fontWeight="bolder"
              fontSize={16}
              title={"Versements"}
              isExpanded={isExpanded1}
              icon={isExpanded1 ? <RemoveIcon /> : <AddIcon />}
              description={
                name &&
                pendingPayments &&
                pendingPayments
                  .slice(pendingPaymentsFirstIndex, pendingPaymentsLastIndex)
                  .map((element) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "Gilroy",
                          fontWeight: "normal",
                          fontSize: 16,
                        }}
                      >
                        {element
                         && element.transfer_data
                         && element.transfer_data.destination
                         && element.transfer_data.destination === account
                         && element.metadata.product
                         //name
                        }
                      </div>
                      <div
                        style={{
                          fontFamily: "Gilroy",
                          fontWeight: "normal",
                          fontSize: 16,
                        }}
                      >
                        {element
                         && element.transfer_data
                         && element.transfer_data.destination
                         && element.transfer_data.destination === account
                         && `le ${new Date(element.created * 1000).toLocaleDateString()}`}
                      </div>
                      <div
                        style={{
                          fontFamily: "Gilroy",
                          fontWeight: "bolder",
                          fontSize: 16,
                        }}
                      >
                        {element
                         && element.transfer_data
                         && element.transfer_data.destination
                         && element.transfer_data.destination === account
                         && `${(element.amount) /100}€`}
                      </div>
                      {element
                         && element.transfer_data
                         && element.transfer_data.destination
                         && element.transfer_data.destination === account
                         &&
                        <Tooltip title="Autoriser">
                          <IconButton
                            style={{
                              maxWidth: "35px",
                              maxHeight: "35px",
                              minWidth: "35px",
                              minHeight: "35px",
                            }}
                            onClick={() => {
                              confirmPaymentAdmin(
                                element.id,
                                element.payment_method,
                                element.metadata.id_invoice
                              );
                              //sendInvoice(element.invoive)
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    </div>
                  ))
              }
              changeExpand={() => setIsExpanded1(!isExpanded1)}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Tooltip title="précédent">
                <IconButton disabled={pendingPaymentsArrowBack}
                 onClick={() => {
                  if (pendingPaymentsFirstIndex !== 0) {
                    setPendingPaymentsFirstIndex(
                      pendingPaymentsFirstIndex - 4
                    );
                    setPendingPaymentsLastIndex(
                      pendingPaymentsLastIndex - 4
                    );
                    setPendingPaymentsArrowForward(false);
                  } else {
                    setPendingPaymentsArrowBack(true);
                    setPendingPaymentsArrowForward(false);
                  }
                }}>
                  <ArrowBackIosIcon
                   
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="suivant">
                <IconButton disabled={pendingPaymentsArrowForward}
                 onClick={() => {
                  if (pendingPaymentsLastIndex < pendingPayments.length) {
                    setPendingPaymentsFirstIndex(
                      pendingPaymentsFirstIndex + 4
                    );
                    setPendingPaymentsLastIndex(
                      pendingPaymentsLastIndex + 4
                    );
                    setPendingPaymentsArrowBack(false);
                  } else {
                    setPendingPaymentsArrowForward(true);
                    setPendingPaymentsArrowBack(false);
                  }
                }}>
                  <ArrowForwardIosIcon
                   
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
            </div>

            
         </div>   
          </div>
        
      </div>
    </Sepa>
  );
}

export default AdminInterface;
