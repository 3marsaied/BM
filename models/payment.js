const mongoose = require('mongoose');   
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    recipientName: { type: String, required: true },
    recipientAccNum: { type: Number, required: true },
    totalSent: { type: Number, required: true },
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
});

module.exports = mongoose.model('Payment', PaymentSchema);