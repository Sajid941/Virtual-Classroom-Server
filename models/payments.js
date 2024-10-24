const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
});
const payments = mongoose.model("payments", paymentSchema);
module.exports = { payments };
