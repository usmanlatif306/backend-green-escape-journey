var express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const stripe = require("stripe")(
  "sk_test_51IvOubCa4fLMha5R1JB7NHh9jyodJb3wkjBQT8qn051AQ92nHTmCiQTGQPkLFx8y2XjKamd5218V4ClzDVUQFcCs00SFCJSBEV"
);

var app = express();
var port = process.env.PORT || 4000;

// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// confirm the paymentIntent
app.post("/pay", async (request, response) => {
  try {
    // Create the PaymentIntent
    let intent = await stripe.paymentIntents.create({
      payment_method: request.body.payment_method_id,
      description: `Test payment from ${request.body.name}`,
      amount: request.body.amount * 100,
      currency: "pkr",
      confirmation_method: "manual",
      confirm: true,
    });

    // Send the response to the client
    response.send(generateResponse(intent));
  } catch (e) {
    // Display error on client
    return response.send({ error: e.message });
  }
});
// refund handlers
app.post("/refund", async (req, res) => {
  try {
    const refund = await stripe.refunds.create({
      amount: req.body.amount * 100,
      payment_intent: "pi_1IvlQ3Ca4fLMha5RfeNGOvim",
    });
    res.send(generateResponse(refund));
  } catch (e) {
    // Display error on client
    return res.send({ error: e.message });
  }
});
const generateResponse = (intent) => {
  if (intent.status === "succeeded") {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment
    return {
      success: true,
      data: intent,
    };
  } else {
    // Invalid status
    return {
      error: "Invalid PaymentIntent status",
    };
  }
};

// request handlers
app.get("/", (req, res) => {
  res.send("Stripe Integration! - Clue Mediator");
});

// request handlers
app.listen(port, () => {
  console.log("Server started on: " + port);
});
