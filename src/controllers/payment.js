const express = require("express");
const User  = require("../models/user");
const paymentRouter = express.Router();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY)
const userMiddleware = require("../middleware/userMiddleware");


paymentRouter.post("/payment", userMiddleware, async (req, res) => {
  try {
    
  const { amount } = req.body;
  
    if (!amount || isNaN(amount)) {
      return res.status(400).send({ message: "Invalid amount" });
    }
    const product = await stripe.products.create({
      name: "Premium",
    });
  

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: parseInt(amount) * 100,
      currency: "usd",
    });
 

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "payment",
      // success_url: `https://www.codexweb.shop/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: "https://www.codexweb.shop/payment/cancel",
      customer_email: req?.result?.emailId, // optional
    });
    

  await User.findByIdAndUpdate(req.result._id, { premium: true });
    res.status(200).send({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe Error:", error.message);
    res.status(500).send({ message: "Payment Error", error: error.message });
  }
});


module.exports = paymentRouter;