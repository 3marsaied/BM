const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    firstName:{ type: String, required: true },
    lastName:{ type: String, required: true },
    email:{ type: String, required: true, unique: true },
    phoneNumber:{ type: String, default: "" },
    address:{ type: String, default: "" },
    nationality:{ type: String, default: "" },
    nationalIdNumber:{ type: Number, default: 0 },
    gender:{ type: String, default: "" },
    dateOfBirth:{ type: String, default: "" },
    balance:{ type: Number, default: 0 },
    currency:{ type: String, default: "USD" },
    accountNumber:{ type: Number, default: 0 },
    favourite: [{ type: Schema.Types.ObjectId, ref: 'Favourite' }],
    payment: [{ type: Schema.Types.ObjectId, ref: 'Payment' }]
});

module.exports = mongoose.model('User', UserSchema);