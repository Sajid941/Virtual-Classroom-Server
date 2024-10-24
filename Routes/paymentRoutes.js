const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Payment } = require("../models/payments");
const User = require("../models/Users");
const crypto = require("crypto");

router.post("/create-payment", async (req, res) => {
    const { name, email } = req.body;
    const transactionId = crypto.randomBytes(10).toString("hex");
    const initiateData = {
        store_id: process.env.SSL_STORE_ID,
        store_passwd: process.env.SSL_STORE_PASS,
        total_amount: "5000",
        currency: "BDT",
        tran_id: transactionId,
        success_url: "http://localhost:3000/payment/success-payment",
        fail_url: "http://yoursite.com/fail.php",
        cancel_url: "http://yoursite.com/cancel.php",
        cus_name: name,
        cus_email: email,
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        shipping_method: "NO",
        product_name: "premiumSubscription",
        product_category: "premiumSubscription",
        product_profile: "premiumSubscription",
        multi_card_name: "mastercard,visacard,amexcard",
        value_a: "ref001_A",
        value_b: "ref002_B",
        value_c: "ref003_C",
        value_d: "ref004_D",
    };

    const response = await axios.post(
        "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        initiateData,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    paymentInfo = {
        name: name,
        email: email,
        amount: 5000,
        transactionId,
        status: "pending",
    };
    const save = await Payment.create(paymentInfo);
    userSave = await User.findOneAndUpdate(
        { email: email },
        { transactionId },
        { new: true }
    );

    if (save) {
        res.status(200).send({ paymentUrl: response.data.GatewayPageURL });
    }
});

router.post("/success-payment", async (req, res) => {
    const successData = req.body;
    console.log(successData);

    if (successData.status !== "VALID") {
        throw new Error("Payment failed");
    }
    const update = {
        $set: {
            status: "success",
            cardType: successData.card_type,
        },
    };

    const result = await Payment.findOneAndUpdate(
        { transactionId: successData.tran_id },
        update,
        { new: true }
    );

    const updateUser = await User.findOneAndUpdate(
        { transactionId: successData.tran_id },
        { userType: "premium" }
    );
});

module.exports = router;
