import React, { useState, useEffect } from "react";
import Sepa from "../sepa";
import PaiementDetailsAccordion from "../components/paiementDetailsAccordion";
import Paiement from "../components/paiement";
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

function ClientPaiementDetails() {
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
  const [productName, setProductName] = useState("");
  const [doneSubscriptions, setDoneSubscriptions] = useState([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [amountSub, setAmountSub] = useState("");
  const [amountSub2, setAmountSub2] = useState("");
  const [date, setDate] = useState("");
  const [nombre, setNombre] = useState("");
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

  //donePayments pagination
  const [donePaymentsFirstIndex, setDonePaymentsFirstIndex] = useState(0);
  const [donePaymentsLastIndex, setDonePaymentsLastIndex] = useState(4);
  const [donePaymentsArrowBack, setDonePaymentsArrowBack] = useState(false);
  const [donePaymentsArrowForward, setDonePaymentsArrowForward] =
    useState(false);

  //pendingPayments notif pagination
  const [pendingPaymentsFirstIndex2, setPendingPaymentsFirstIndex2] =
    useState(0);
  const [pendingPaymentsLastIndex2, setPendingPaymentsLastIndex2] = useState(4);
  const [pendingPaymentsArrowBack2, setPendingPaymentsArrowBack2] =
    useState(false);
  const [pendingPaymentsArrowForward2, setPendingPaymentsArrowForward2] =
    useState(false);

  //donePayments notif pagination
  const [donePaymentsFirstIndex2, setDonePaymentsFirstIndex2] = useState(0);
  const [donePaymentsLastIndex2, setDonePaymentsLastIndex2] = useState(4);
  const [donePaymentsArrowBack2, setDonePaymentsArrowBack2] = useState(false);
  const [donePaymentsArrowForward2, setDonePaymentsArrowForward2] =
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
    const customerRetrieve2 = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}customer`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: id_cus,
        }),
      }
    );
    const dataCustomer = await customerRetrieve2.json(customerRetrieve2);
    setName(dataCustomer.name);

    //fetch done payments
    const paymentIntents_done = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntents/done`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: dataCustomer.id_customer,
        }),
      }
    );
    const dataDone = await paymentIntents_done.json(paymentIntents_done);
    if (dataDone.length <= donePaymentsLastIndex) {
      setDonePaymentsArrowForward(true);
    }
    setDonePayments(dataDone);
    
        donePayments &&
        donePayments.map(
      (e) =>
      e.metadata &&
      e.metadata.mission &&
      parseInt(e.metadata.mission) === 1 &&
        setNotifDone(dataDone.length)
    );

    //fetch pending subscriptions
    const subPaymentIntents_pending = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}subPaymentIntents/pending`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: dataCustomer.id_customer,
        }),
      }
    );
    const dataSubPending = await subPaymentIntents_pending.json(
      subPaymentIntents_pending
    );
    console.log("aqqqqqqqqqq", dataSubPending);
    setPendingSubscriptions(dataSubPending);

    //fetch pending payments
    const paymentIntents_pending = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntents/pending`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: dataCustomer.id_customer,
        }),
      }
    );
    const dataPending = await paymentIntents_pending.json(
      paymentIntents_pending
    );
    if (dataPending.length <= pendingPaymentsLastIndex) {
      setPendingPaymentsArrowForward(true);
    }
    // if (dataPending.length <= pendingPaymentsLastIndex2) {
    //   setPendingPaymentsArrowForward2(true);
    // }
    setPendingPayments(dataPending);



 //fetch pending payments notif
 const paymentIntentsNotif_pending = await fetch(
  `${process.env.REACT_APP_BACKEND_URL}paymentIntentsNotif/pending`,
  {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      customer: dataCustomer.id_customer,
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
console.log("cxcxcxcxcxcx", dataPending);
setNotifPending(dataPendingNotif.length);


    //fetch done subscriptions
    const subscription_done = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}sub/done`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          customer: dataCustomer.id_customer,
        }),
      }
    );
    const dataSubDone = await subscription_done.json(subscription_done);
    if (dataSubDone.length <= doneSubscriptionsLastIndex) {
      setDoneSubscriptionsArrowForward(true);
    }
    if (dataSubDone.length <= doneSubscriptionsLastIndex) {
      setDoneSubscriptionsArrowForward(true);
    }
    setDoneSubscriptions(dataSubDone);
    console.log("dudududududu", dataSubDone.length);
    console.log("batatatatat", dataSubDone[dataSubDone.length -1].metadata.old_value)
    if (dataSubDone[dataSubDone.length - 1].metadata.mission === "0") {
      setAmountSub(
        ( (dataSubDone[dataSubDone.length - 1].plan.amount +
          (dataSubDone[dataSubDone.length - 1].plan.amount *
            dataSubDone[dataSubDone.length - 1].default_tax_rates[0]
              .percentage) /
            100) /
          100) * (dataSubDone[dataSubDone.length -1].quantity)
      );

      setAmountSub2(
        ( (dataSubDone[dataSubDone.length - 1].plan.amount +
          (dataSubDone[dataSubDone.length - 1].plan.amount *
            dataSubDone[dataSubDone.length - 1].default_tax_rates[0]
              .percentage) /
            100) /
          100) * (parseInt(dataSubDone[dataSubDone.length -1].metadata.old_value))
      );
    }

    //setNombre(dataSubDone[dataSubDone.length - (dataSubDone.length -1)].metadata.nombre_utilisateur);
    console.log("yyyyyy", dataSubDone[dataSubDone.length - 1].quantity);
    setNombre(dataSubDone[0].quantity);
    setDate(
      new Date(
        dataSubDone[dataSubDone.length - 1].current_period_end * 1000
      ).toLocaleDateString()
    );
    console.log("yyyyoooooyyyy", dataSubDone.length);

    //fetch update sub to retrieve nombre_utilisateur
    //fetch done subscriptions
    const subscription_update = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}updateSubscription`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id_customer: dataCustomer.id_customer,
        }),
      }
    );
    const dataSubUpdate = await subscription_update.json(subscription_update);

    setNombre(dataSubUpdate[0].items.data[0].quantity);
    console.log(
      "uuuupppdaaaaateeee quantity",
      dataSubUpdate[0].items.data[0].quantity
    );
  };

  useEffect(async () => {
    await done();
    setDoneSubscriptionsArrowBack(true);
    setPendingPaymentsArrowBack(true);
    setDonePaymentsArrowBack(true);
    setPendingPaymentsArrowBack2(true);
    setDonePaymentsArrowBack2(true);
  }, []);

  const confirmPayment = async (id, payment_method, invoice) => {
    const paymentToConfirm = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}paymentIntents/confirm`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          payment_method: payment_method,
          invoice: invoice,
        }),
      }
    );
    const confirmedPayment = await paymentToConfirm.json(paymentToConfirm);
    //return confirmedPayment.status;

    const sendInvoice = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}invoice/retrieve/${confirmedPayment.invoice}`,
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

  //send invoice
  // const sendInvoice = async (id) => {
  //   const invoice = await fetch(
  //     `${process.env.REACT_APP_BACKEND_URL}invoice`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         id: id
  //       })
  //     }
  //   );
  //   const invoiceData = await invoice.json(invoice);
  //   return invoiceData.status;
  // }

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
              title={"Paiements en cours"}
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
                          element.metadata &&
                          element.metadata.autorisation &&
                          parseInt(element.metadata.autorisation) === 1 &&
                          parseInt(element.metadata.mission) === 1 &&
                          // name
                          element.metadata.product}
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
                          element.metadata.autorisation &&
                          parseInt(element.metadata.autorisation) === 1 &&
                          parseInt(element.metadata.mission) === 1 &&
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
                          element.metadata &&
                          element.metadata.autorisation &&
                          parseInt(element.metadata.autorisation) === 1 &&
                          parseInt(element.metadata.mission) === 1 &&
                          `${element.amount / 100}€`}
                      </div>
                      {element &&
                        element.metadata &&
                        element.metadata.autorisation &&
                        parseInt(element.metadata.autorisation) === 1 &&
                        parseInt(element.metadata.mission) === 1 && (
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
                                  element.invoive
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
              title={"Paiements passés"}
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
                        {
                          element &&
                            element.metadata &&
                            element.metadata.mission &&
                            parseInt(element.metadata.mission) === 1 &&
                            element.metadata.product
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
                          element.metadata &&
                          element.metadata.mission &&
                          parseInt(element.metadata.mission) === 1 &&
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
                          element.metadata &&
                          element.metadata.mission &&
                          parseInt(element.metadata.mission) === 1 &&
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
                      fontWeight: "normal",
                      fontSize: 16,
                    }}
                  >
                    Utilisateurs :{nombre}
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
                        /mois par utilisateur
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
                              marginRight: "-40px",
                            }}
                          >
                            {`le ${date}`}
                          </div>
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
                          `${amountSub2}€`}
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
          title={
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
                        marginTop: "2px",
                      }}
                    >
                      {!isExpanded4 ? 0 : notifPending}
                    </span>
                  </Avatar>
                </span>
              </span>{" "}
            </div>
          }
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
                          element.metadata &&
                          element.metadata.autorisation &&
                          parseInt(element.metadata.autorisation) === 1 &&
                          parseInt(element.metadata.mission) === 1 &&
                          element.metadata.product
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
                        element.metadata &&
                        element.metadata.autorisation &&
                        parseInt(element.metadata.autorisation) === 1 &&
                        parseInt(element.metadata.mission) === 1 &&
                        `-Paiement non passé (${element.amount / 100}€)`}
                    </div>
                    {element &&
                      element.metadata &&
                      element.metadata.autorisation &&
                      parseInt(element.metadata.autorisation) === 1 &&
                      parseInt(element.metadata.mission) === 1 && (
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
                        element.metadata &&
                        element.metadata.autorisation &&
                        parseInt(element.metadata.autorisation) === 1 &&
                        parseInt(element.metadata.mission) === 1 &&
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
                    setPendingPaymentsLastIndex2(pendingPaymentsLastIndex2 - 4);
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
                    setPendingPaymentsLastIndex2(pendingPaymentsLastIndex2 + 4);
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

export default ClientPaiementDetails;
