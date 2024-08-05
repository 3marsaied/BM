const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const FavouriteSchema = new Schema({
    accNum:{type: Number, required: true},
    fullName: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
});

module.exports = mongoose.model('Favourite', FavouriteSchema);