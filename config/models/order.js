const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let orderSchema = new Schema({
    customerId: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    productId: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    orderStatus: {
    type: String,
    enum: ['created', 'received', 'canceled',]
  },
    createdTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
});

let Order = mongoose.model('Order',orderSchema)

module.exports = Order
