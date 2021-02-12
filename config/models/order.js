const mongoose = require('mongoose');

//Define a schema
let Schema = mongoose.Schema;

let orderSchema = new Schema({
    customerId: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    productId: [{ type: Schema.Types.ObjectId, ref: 'Products' }],
    orderStatus: {
    type: String,
    enum: ['created', 'received', 'canceled',]
  },
    createdTime: { type: Date, default: new Date().toDateString() },
    updatedTime: { type: Date, default: Date.now }
});

let Order = mongoose.model('Order',orderSchema)

module.exports = Order
