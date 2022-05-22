// A reference to Stripe.js
const stripeInstance = require("stripe")(
  process.env.STRIPE_SECRET_KEY,
  { stripeAccount: process.env.STRIPE_ACCOUNT }
);
let stripe;

var orderData = {
  items: [{ id: "photo" }],
};

// Disable the button until we have Stripe set up on the page
document.querySelector("button").disabled = true;

fetch("/config")
  .then(function (result) {
    return result.json();
  })
  .then(function (data) {
    stripe = stripeInstance(data.publicKey);
    // Show formatted price information.
    // var price = (data.amount / 100).toFixed(2);
    // var numberFormat = new Intl.NumberFormat(["fr-FR"], {
    //   style: "currency",
    //   currency: data.currency,
    //   currencyDisplay: "symbol",
    // });
    // document.getElementById("order-amount").innerText =
    //   numberFormat.format(price);
    createPaymentIntent();
  });

var createPaymentIntent = function () {
  fetch("/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then(function (result) {
      return result.json();
    })
    .then(function (data) {
      return setupElements(data);
    })
    .then(function ({ stripe, iban, clientSecret }) {
      // Handle form submission.
      var form = document.getElementById("payment-form");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        // Validate the form input
        if (!event.target.reportValidity()) {
          // Form not valid, abort!
          return;
        }
        // Initiate payment when the submit button is clicked
        pay(stripe, iban, clientSecret);
      });
    });
};

// Set up Stripe.js and Elements to use in checkout form
var setupElements = function (data) {
  var elements = stripeInstance.elements();
  var style = {
    base: {
      color: "#32325d",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
      ":-webkit-autofill": {
        color: "#32325d",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
      ":-webkit-autofill": {
        color: "#fa755a",
      },
    },
  };

  var options = {
    style: style,
    supportedCountries: ["SEPA"],
    // If you know the country of the customer, you can optionally pass it to
    // the Element as placeholderCountry. The example IBAN that is being used
    // as placeholder reflects the IBAN format of that country.
    placeholderCountry: "FR",
  };

  var iban = elements.create("iban", options);
  iban.mount("#iban-element");

  iban.on("change", function (event) {
    // Handle real-time validation errors from the iban Element.
    if (event.error) {
      showError(event.error.message);
    }
  });

  // Enable button.
  document.querySelector("button").disabled = false;

  return {
    stripe: stripe,
    iban: iban,
    clientSecret: data.clientSecret,
  };
};

/*
 * Calls stripe.confirmSepaDebitPayment to generate the mandate and initaite the debit.
 */
var pay = function (stripe, iban, clientSecret) {
  changeLoadingState(true);

  // Initiate the payment.
  stripe
    .confirmSepaDebitPayment(clientSecret, {
      payment_method: {
        sepa_debit: iban,
        billing_details: {
          name: document.querySelector('input[name="name"]').value,
          email: document.querySelector('input[name="email"]').value,
        },
      },
    })
    .then(function (result) {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        orderComplete(result.paymentIntent.client_secret);
      }
    });
};

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
var orderComplete = function (clientSecret) {
  stripe.retrievePaymentIntent(clientSecret).then(function (result) {
    var paymentIntent = result.paymentIntent;
    var paymentIntentJson = JSON.stringify(paymentIntent, null, 2);
    var paymentIntentMessage = JSON.stringify("paymentIntent succeeded");

    document.querySelector(".sr-payment-form").classList.add("hidden");
    document.querySelector("pre").textContent = paymentIntentJson;
    document.querySelector("pre").textContent = paymentIntentMessage;

    document.querySelector(".sr-result").classList.remove("hidden");
    setTimeout(function () {
      document.querySelector(".sr-result").classList.add("expand");
    }, 200);

    changeLoadingState(false);
  });
};

var showError = function (errorMsgText) {
  changeLoadingState(false);
  var errorMsg = document.querySelector("#error-message");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};

// Show a spinner on payment submission
var changeLoadingState = function (isLoading) {
  if (isLoading) {
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};
