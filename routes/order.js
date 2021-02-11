let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let config = require('../config');
let User = require('../config/models/user')
let Product = require('../config/models/product')
let Order = require('../config/models/order')

let getData = async (collectionName, condition) => {
    return collectionName.findOne(condition);
}

let createData = async (collectionName, data) => {
    return collectionName.create(data)
}
let ordercreate = async (data) => {

    let token = data.headers['x-access-token'];
    if (!token) return { auth: false, message: 'No token provided.' };
  
    jwt.verify(token, config.secret, function (err, decoded) {
        if (err) return { auth: false, message: 'Failed to authenticate token.Please Login Again'};
        else {
            console.log("decoded value",decoded)
        }
    })
    let userData = await getData(User, { email: data.body.email })
    let productData = await getData(Product,{productName:data.body.productName})
    data.body.customerId = userData._id
    data.body.productId = productData._id

    try {
        let orderData = await createData(Order, data.body)
        console.log("OrderData", orderData)
        return { message: "Product ordered", orderData }
    } catch (error) {
        console.log("Error in order creation", error)
        return error
    }
}

let orderUpdate = async (req,res) => {
    Order.findById({_id: req.params.id}, (err, OrderData) => {
        if (err) res.send(err);
        else {
            console.log("Ordered Data", OrderData)
            Object.assign(OrderData, req.body).save((err, updateData) => {
            if(err) res.send(err);
            res.json({ message: 'Book updated!', updateData });
        });
        }
    });
}



module.exports = {ordercreate,orderUpdate }

