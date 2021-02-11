const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let userSchema = new Schema({
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
});

let User = mongoose.model('Users',userSchema)

module.exports = User