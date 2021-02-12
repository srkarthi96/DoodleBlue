const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let productSchema = new Schema({
    productName: {type:String,required:true},
    createdTime: { type: Date, default: new Date().toDateString() },
    updatedTime:{ type: Date, default: Date.now }
});

let Product = mongoose.model('Products',productSchema)

module.exports = Product