import React, { useState, useEffect } from "react";
import Sepa from "../sepa";
import PaiementDetailsAccordion from "../components/paiementDetailsAccordion";
import Paiement from "../components/paiement";
import Line from "../components/Line";
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
import Avatar from "@material-ui/core/Avatar";

function ConsultantPaiementDetails() {
  const [isExpanded1, setIsExpanded1] = useState(true);
  const [isExpanded2, setIsExpanded2] = useState(true);
  const [isExpanded3, setIsExpanded3] = useState(true);
  const [isExpanded4, setIsExpanded4] = useState(true);
  const [isExpanded5, setIsExpanded5] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [donePayments, setDonePayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [pendingPaymentsNotif, setPendingPaymentsNotif] = useState([]);
  const [name, setName] = useState("");
  const [doneSubscriptions, setDoneSubscriptions] = useState([]);
  const [account, setAccount] = useState("");
  const [externalAccount, setExternalAccount] = useState("");
  const [amountSub, setAmountSub] = useState("");
  const [date, setDate] = useState("");
  const [notifPending, setNotifPending] = useState("");
  const [notifDone, setNotifDone] = useState("");

  const [isSimiar, setIsSimilar] = useState(true);

  //pendingPayments pagination
  const [pendingPaymentsFirstIndex, setPendingPaymentsFirstIndex] = useState(0);
  const [pendingPaymentsLastIndex, setPendingPaymentsLastIndex] = useState(4);
  const [pendingPaymentsArrowBack, setPendingPaymentsArrowBack] =
    useState(false);
  const [pendingPaymentsArrowForward, setPendingPaymentsArrowForward] =
    useState(false);

  //pending payments notif
  const [pendingPaymentsFirstIndex2, setPendingPaymentsFirstIndex2] = useState(0);
  const [pendingPaymentsLastIndex2, setPendingPaymentsLastIndex2] = useState(4);
  const [pendingPaymentsArrowBack2, setPendingPaymentsArrowBack2] =
    useState(false);
  const [pendingPaymentsArrowForward2, setPendingPaymentsArrowForward2] =
    useState(false);

  //donePayments pagination
  const [donePaymentsFirstIndex, setDonePaymentsFirstIndex] = useState(0);
  const [donePaymentsLastIndex, setDonePaymentsLastIndex] = useState(4);
  const [donePaymentsArrowBack, setDonePaymentsArrowBack] = useState(false);
  const [donePaymentsArrowForward, setDonePaymentsArrowForward] =
    useState(false);

  //doneSubscriptions pagination
  const [doneSubscriptionsFirstIndex, setDoneSubscriptionsFirstIndex] =
    useState(0);
  const [doneSubscriptionsLastIndex, setDoneSubscriptionsLastIndex] =
    useState(4);
  const [doneSubscriptionsArrowBack, setDoneSubscriptionsArrowBack] =
    useState(false);
  const [doneSubscriptionsArrowForward, setDoneSubscriptionsArrowForward] =
    useState(false);

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
    const paymentPayouts_done = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentPayouts/done`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          account: dataConsultant.id_account,
          destination: dataConsultant.bank
        }),
      }
    );
    const dataDone = await paymentPayouts_done.json(paymentPayouts_done);
    console.log("payout dooone", dataDone)
    if (dataDone.length <= donePaymentsLastIndex) {
      setDonePaymentsArrowForward(true);
    }
    setDonePayments(dataDone);
    setNotifDone(dataDone.length);
    setExternalAccount(dataConsultant.bank);


    //fetch pending transferts
    const paymentIntents_pending = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentTransferts/pending`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: dataConsultant.id_account,
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


//fetch pending payments notif
const paymentIntentsNotif_pending = await fetch(
  `${process.env.REACT_APP_BACKEND_URL}paymentPayouts/pending`,
  {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      account: dataConsultant.id_account,
      destination: dataConsultant.bank
    }),
  }
);
const dataPendingNotif = await paymentIntentsNotif_pending.json(
  paymentIntentsNotif_pending
);
if (dataPendingNotif.length <= pendingPaymentsLastIndex2) {
  setPendingPaymentsArrowForward2(true);
}
setPendingPaymentsNotif(dataPendingNotif);
//setProductName(Object.keys(dataPending.metadata.product))
console.log("cxcxcxcxcxcx", dataPendingNotif);
setNotifPending(dataPendingNotif.length);
setExternalAccount(dataConsultant.bank);


    //fetch done subscriptions
    const subscription_done = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}sub/done`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          account: dataConsultant.id_account,
        }),
      }
    );
    const dataSubDone = await subscription_done.json(subscription_done);
    if (dataSubDone.length <= doneSubscriptionsLastIndex) {
      setDoneSubscriptionsArrowForward(true);
    }
    setDoneSubscriptions(dataSubDone);
    // setAmountSub(
    //   (dataSubDone[0].plan.amount +
    //     (dataSubDone[0].plan.amount *
    //       dataSubDone[0].default_tax_rates[0].percentage) /
    //       100) /
    //     100
    // );
    
    if(dataSubDone[(dataSubDone.length -1)].metadata.mission === '0'){
      setAmountSub(
        (dataSubDone[(dataSubDone.length -1)].plan.amount +
          (dataSubDone[(dataSubDone.length -1)].plan.amount *
            dataSubDone[(dataSubDone.length -1)].default_tax_rates[0].percentage) /
            100) /
          100
      );
    }
    setDate(
      new Date(
        dataSubDone[dataSubDone.length - 1].current_period_end * 1000
      ).toLocaleDateString()
    );
    console.log("yyyyoooooyyyyy", dataSubDone.length);
  };

  useEffect(async () => {
    await done();
    setDoneSubscriptionsArrowBack(true);
    setPendingPaymentsArrowBack(true);
    setDonePaymentsArrowBack(true);
  }, []);

  const confirmPayment = async (id, payment_method, invoice) => {
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


    //fetch done subscriptions
    // const subscription_done = await fetch(
    //   `${process.env.REACT_APP_BACKEND_URL}sub/done`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       account: dataConsultant.id_account,
    //     }),
    //   }
    // );
    // const dataSubDone = await subscription_done.json(subscription_done);
    // console.log("data sub done", dataSubDone);



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

  };


const _lineProps = {
  account,name
}

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
            <h3>Bienvenue sur votre espace de paiement</h3>
          </div>
        </div>
        {isVisible && (
          <PaiementDetailsAccordion
            fontFamily="Gilroy"
            fontWeight="normal"
            fontSize={16}
            title="Disclaimer"
            color={colors.rouge}
            icon={<DeleteIcon />}
            changeExpand={() => setIsVisible(false)}
          />
        )}
        <div className="sr-combo-inputs-row">
          <div className="col" style={{ width: "343px" }}>
            <PaiementDetailsAccordion
              fontFamily="Gilroy"
              fontWeight="bolder"
              fontSize={16}
              title={"Versements en cours"}
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
                        {element &&
                          element.transfer_data &&
                          element.transfer_data.destination &&
                          element.transfer_data.destination === account &&
                          //name
                          element.metadata.product
                        }
                      </div>
                      <div
                        style={{
                          fontFamily: "Gilroy",
                          fontWeight: "normal",
                          fontSize: 16,
                        }}
                      >
                        {element &&
                          element.transfer_data &&
                          element.transfer_data.destination &&
                          element.transfer_data.destination === account &&
                          `le ${new Date(
                            element.created * 1000
                          ).toLocaleDateString()}`}
                      </div>
                      <div
                        style={{
                          fontFamily: "Gilroy",
                          fontWeight: "bolder",
                          fontSize: 16,
                        }}
                      >
                        {element &&
                          element.transfer_data &&
                          element.transfer_data.destination &&
                          element.transfer_data.destination === account &&
                          `${element.amount / 100}€`}
                      </div>
                      {element &&
                        element.transfer_data &&
                        element.transfer_data.destination &&
                        element.transfer_data.destination === account && (
                          <Tooltip title="Autoriser">
                            <IconButton
                              style={{
                                maxWidth: "35px",
                                maxHeight: "35px",
                                minWidth: "35px",
                                minHeight: "35px",
                              }}
                              onClick={() => {
                                confirmPayment(
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
                        )}
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
                <IconButton disabled={pendingPaymentsArrowBack}>
                  <ArrowBackIosIcon
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
                    }}
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="suivant">
                <IconButton disabled={pendingPaymentsArrowForward}>
                  <ArrowForwardIosIcon
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
                    }}
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
            </div>

            <PaiementDetailsAccordion
              title={"Versements passés"}
              fontFamily="Gilroy"
              fontWeight="bolder"
              fontSize={16}
              isExpanded={isExpanded3}
              icon={isExpanded3 ? <RemoveIcon /> : <AddIcon />}
              description={
                name &&
                donePayments &&
                donePayments
                  .slice(donePaymentsFirstIndex, donePaymentsLastIndex)
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
                        {element &&                         
                         element.destination &&
                          element.destination === externalAccount &&
                          //name
                          element.object
                        }
                      </div>
                      <div
                        style={{
                          fontFamily: "Gilroy",
                          fontWeight: "normal",
                          fontSize: 16,
                        }}
                      >
                        {element &&
                          element.destination &&
                          element.destination === externalAccount &&
                          `le ${new Date(
                            element.created * 1000
                          ).toLocaleDateString()}`}
                      </div>
                      <div
                        style={{
                          fontFamily: "Gilroy",
                          fontWeight: "bolder",
                          fontSize: 16,
                        }}
                      >
                        {element &&
                          element.destination &&
                          element.destination === externalAccount &&
                          `${element.amount / 100}€`}
                      </div>
                    </div>
                  ))
              }
              changeExpand={() => setIsExpanded3(!isExpanded3)}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Tooltip title="précédent">
                <IconButton disabled={donePaymentsArrowBack}>
                  <ArrowBackIosIcon
                    onClick={() => {
                      if (donePaymentsFirstIndex !== 0) {
                        setDonePaymentsFirstIndex(donePaymentsFirstIndex - 4);
                        setDonePaymentsLastIndex(donePaymentsLastIndex - 4);
                        setDonePaymentsArrowForward(false);
                      } else {
                        setDonePaymentsArrowBack(true);
                        setDonePaymentsArrowForward(false);
                      }
                    }}
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="suivant">
                <IconButton disabled={donePaymentsArrowForward}>
                  <ArrowForwardIosIcon
                    onClick={() => {
                      if (donePaymentsLastIndex < donePayments.length) {
                        setDonePaymentsFirstIndex(donePaymentsFirstIndex + 4);
                        setDonePaymentsLastIndex(donePaymentsLastIndex + 4);
                        setDonePaymentsArrowBack(false);
                      } else {
                        setDonePaymentsArrowForward(true);
                        setDonePaymentsArrowBack(false);
                      }
                    }}
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <div className="col" style={{ width: "343px" }}>
            <PaiementDetailsAccordion
              title="Abonnements"
              fontFamily="Gilroy"
              fontWeight="bolder"
              fontSize={16}
              isExpanded={isExpanded2}
              icon={isExpanded2 ? <RemoveIcon /> : <AddIcon />}
              description={
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
                      fontWeight: "bold",
                      fontSize: 40,
                      color: colors.bleuFoncé,
                    }}
                  >
                    {amountSub}€
                    <div
                      style={{
                        fontSize: 25,
                        fontWeight: "normal",
                        marginLeft: "70px",
                        marginTop: "-35px",
                        fontFamily: "Gilroy",
                        color: colors.grisFoncé,
                      }}
                    >
                      /mois
                    </div>
                    <div
                      style={{
                        fontFamily: "Gilroy",
                        fontWeight: "bold",
                        fontSize: 15,
                        color: colors.bleuFoncé,
                        marginTop: "30px",
                      }}
                    >
                      Prochain prélévement:
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
                            color: colors.grisFoncé,
                            marginTop: "10px",
                          }}
                        >
                          {`${amountSub}€`}
                        </div>

                        <div
                          style={{
                            fontFamily: "Gilroy",
                            fontWeight: "normal",
                            fontSize: 16,
                            color: colors.grisFoncé,
                            marginTop: "10px",
                            marginRight: "-160px",
                          }}
                        >
                          {`le ${date}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
              changeExpand={() => setIsExpanded2(!isExpanded2)}
            />

            <PaiementDetailsAccordion
              title="Derniers prélévements:"
              fontFamily="Gilroy"
              fontWeight="bolder"
              fontSize={16}
              isExpanded={isExpanded2}
              icon={isExpanded2 ? <RemoveIcon /> : <AddIcon />}
              description={
                doneSubscriptions &&
                doneSubscriptions
                  .slice(
                    doneSubscriptionsFirstIndex,
                    doneSubscriptionsLastIndex
                  )
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
                        {element &&
                          element.metadata &&
                          parseInt(element.metadata.mission) === 0 &&
                          `${amountSub}€`}
                      </div>

                      <div
                        style={{
                          fontFamily: "Gilroy",
                          fontWeight: "normal",
                          fontSize: 16,
                        }}
                      >
                        {element &&
                          element.metadata &&
                          parseInt(element.metadata.mission) === 0 &&
                          `le ${new Date(
                            element.created * 1000
                          ).toLocaleDateString()}`}
                      </div>
                    </div>
                  ))
              }
              changeExpand={() => setIsExpanded2(!isExpanded2)}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Tooltip title="précédent">
                <IconButton disabled={doneSubscriptionsArrowBack}>
                  <ArrowBackIosIcon
                    onClick={() => {
                      if (doneSubscriptionsFirstIndex !== 0) {
                        setDoneSubscriptionsFirstIndex(
                          doneSubscriptionsFirstIndex - 4
                        );
                        setDoneSubscriptionsLastIndex(
                          doneSubscriptionsLastIndex - 4
                        );
                        setDoneSubscriptionsArrowForward(false);
                      } else {
                        setDoneSubscriptionsArrowBack(true);
                        setDoneSubscriptionsArrowForward(false);
                      }
                    }}
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="suivant">
                <IconButton disabled={doneSubscriptionsArrowForward}>
                  <ArrowForwardIosIcon
                    onClick={() => {
                      if (
                        doneSubscriptionsLastIndex <= doneSubscriptions.length
                      ) {
                        setDoneSubscriptionsFirstIndex(
                          doneSubscriptionsFirstIndex + 4
                        );
                        setDoneSubscriptionsLastIndex(
                          doneSubscriptionsLastIndex + 4
                        );
                        setDoneSubscriptionsArrowBack(false);
                      } else {
                        setDoneSubscriptionsArrowForward(true);
                        setDoneSubscriptionsArrowBack(false);
                      }
                    }}
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
        <PaiementDetailsAccordion
        isExpanded={!isExpanded4}
          title={(
            <div style={{ color: colors.rougeFoncé }}>
              <span style={{ color: colors.grisFoncé }}>
              Notifications
                <span style={{ position: "absolute" }}>
                  <Avatar
              
                    style={{
                      height: "18px",
                      width: "18px",
                      backgroundColor: colors.blanc,
                      marginLeft: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        color: colors.grisFoncé,
                        fontFamily: "Gilroy",
                        fontWeight: "bold",
                        marginTop:"2px"
                      }}
                    >
                      
                      {!isExpanded4?0: notifPending}
                    
                    </span>
                  </Avatar>
                </span>
              </span>{" "}
            </div>
          )}
          changeExpand={() => setIsExpanded4(!isExpanded4)}
          fontFamily="Gilroy"
          fontWeight="bolder"
          fontSize={16}
          color={colors.bleuFoncé}
          
          icon={<ExpandMoreIcon />}
          description={
            name &&
            pendingPaymentsNotif &&
            pendingPaymentsNotif
              .slice(pendingPaymentsFirstIndex2, pendingPaymentsLastIndex2)
              .map((element) => (
                <>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "3px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Gilroy",
                        fontWeight: "normal",
                        fontSize: 16,
                      }}
                    >
                      {
                       element &&
                       element.destination &&
                       element.destination === externalAccount &&
                          element.object
                        //name
                        //productName
                      }
                    </div>

                    <div
                      style={{
                        fontFamily: "Gilroy",
                        fontWeight: "normal",
                        fontSize: 16,
                      }}
                    >
                      {element &&
                          element.destination &&
                          element.destination === externalAccount &&
                        `-Paiement non passé (${element.amount / 100}€)`}
                    </div>
                    {element &&
                          element.destination &&
                          element.destination === externalAccount && (
                        <button
                          style={{
                            border: "2px solid #FF938C",
                            backgroundColor: colors.blanc,
                            borderRadius: "20px",
                            width: "100px",
                            height: "3px",
                            marginRight: "200px",
                          }}
                        >
                          <p
                            style={{
                              color: colors.rouge,
                              fontFamily: "Gilroy",
                              fontWeight: "normal",
                              fontSize: 12,
                              marginTop: "-6px",
                            }}
                          >
                            en cours
                          </p>
                        </button>
                      )}

                    <div
                      style={{
                        fontFamily: "Gilroy",
                        fontWeight: "normal",
                        fontSize: 16,
                      }}
                    >
                      {element &&
                          element.destination &&
                          element.destination === externalAccount &&
                        `le ${new Date(
                          element.created * 1000
                        ).toLocaleDateString()}`}
                    </div>
                  </div>
                  {/* <br /> */}
                </>
              ))
          }
        />


<div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Tooltip title="précédent">
                <IconButton disabled={pendingPaymentsArrowBack2}>
                  <ArrowBackIosIcon
                    onClick={() => {
                      if (pendingPaymentsFirstIndex2 !== 0) {
                        setPendingPaymentsFirstIndex2(
                          pendingPaymentsFirstIndex2 - 4
                        );
                        setPendingPaymentsLastIndex2(
                          pendingPaymentsLastIndex2 - 4
                        );
                        setPendingPaymentsArrowForward2(false);
                      } else {
                        setPendingPaymentsArrowBack2(true);
                        setPendingPaymentsArrowForward2(false);
                      }
                    }}
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="suivant">
                <IconButton disabled={pendingPaymentsArrowForward2}>
                  <ArrowForwardIosIcon
                    onClick={() => {
                      if (pendingPaymentsLastIndex2 < pendingPaymentsNotif.length) {
                        setPendingPaymentsFirstIndex2(
                          pendingPaymentsFirstIndex2 + 4
                        );
                        setPendingPaymentsLastIndex2(
                          pendingPaymentsLastIndex2 + 4
                        );
                        setPendingPaymentsArrowBack2(false);
                      } else {
                        setPendingPaymentsArrowForward2(true);
                        setPendingPaymentsArrowBack2(false);
                      }
                    }}
                    fontSize="small"
                    color="primary"
                  />
                </IconButton>
              </Tooltip>
            </div>

      </div>
    </Sepa>
  );
}

export default ConsultantPaiementDetails;
