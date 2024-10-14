const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
};

router.post("/", async (req, res) => {
    const user = req.body;
    const token = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
    });
    res.cookie("token", token, cookieOptions).send({ success: true });
});

router.delete("/", async (req, res) => {
    res.clearCookie("token", { ...cookieOptions, maxAge: 0 }).send({
        success: true,
    });
});

module.exports = router;
