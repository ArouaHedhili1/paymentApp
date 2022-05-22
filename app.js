var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var env = require("dotenv").config({ path: "./.env" });
var port = process.env.PORT || 5000;

var app = express();
app.use(express.urlencoded({ extended: false }));
var bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var paymentsRouter = require("./routes/api/payments");
var customersRouter = require("./routes/api/customers");
var subscriptionsRouter = require("./routes/api/subscriptions");
var missionsRouter = require("./routes/api/mission");
var accountsRouter = require("./routes/api/accounts");
var payoutRouter = require("./routes/api/payouts");
var invoiceRouter = require("./routes/api/invoices");
var webhookRouter = require("./routes/api/webhook");
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(express.static(path.resolve(__dirname, "../web/build")));

app.use("/", paymentsRouter);
app.use("/", customersRouter);
app.use("/", subscriptionsRouter);
app.use("/", missionsRouter);
app.use("/", accountsRouter);
app.use("/", payoutRouter);
app.use("/", invoiceRouter);
app.use("/", webhookRouter);


app.get("/api", (req, res) => {
  res.send("Hello World!");
});

if (process.env.NODE_ENV == "production") {
  app.use(express.urlencoded({ extended: false }));
  app.use(bodyparser.json());
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static("web/build"));
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "build", "index.html"));
  });
  app.get("/subscription/:id/:type", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "build", "index.html"));
  });
  app.get("/client-paiement-details/:id", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "build", "index.html"));
  });
  app.get("/consultant-paiement-details/:id", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "build", "index.html"));
  });
  app.get("/success/:type", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "build", "index.html"));
  });
  app.get("/error/:type", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "build", "index.html"));
  });
  app.get("/adminInterface/:id", (req, res) => {
    res.sendFile(path.resolve(__dirname, "web", "build", "index.html"));
  });
  app.use("/", paymentsRouter);
  app.use("/", customersRouter);
  app.use("/", subscriptionsRouter);

}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

app.listen(port, () => console.log(`Node server listening on port ${port}!`));

module.exports = app;
