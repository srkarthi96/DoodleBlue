let mongoose = require('mongoose');
let jwt = require('jsonwebtoken');
let config = require('../config');
let User = require('../config/models/user')
let Product = require('../config/models/product')
let Order = require('../config/models/order')


async function count_duplicate(a){
 let counts = {}

 for(let i =0; i < a.length; i++){ 
     if (counts[a[i]]){
     counts[a[i]] += 1
     } else {
     counts[a[i]] = 1
     }
    }  
    for (let prop in counts){
        if (counts[prop] >= 2){
            console.log(prop + " counted: " + counts[prop] + " times.")
        }
    }
    console.log(counts)
    return counts
}

let getData = async (collectionName, condition) => {
    return collectionName.findOne(condition);
}
let getAllData = async (collectionName, condition) => {
    return collectionName.find(condition);
}
let createData = async (collectionName, data) => {
    return collectionName.create(data)
}
let ordercreate = async (data) => {

    let token = data.headers['x-access-token'];
    if (!token) return { auth: false, message: 'No token provided.' };
    else {
       return jwt.verify(token, config.secret, async (err, decoded) => {
            if (err) return { auth: false, message: 'Failed to authenticate token.Please Login Again' };
            else {
                console.log("decoded value", decoded)
                let userData = await getData(User, { email: data.body.email })
                let productData = await getData(Product, { productName: data.body.productName })
                data.body.customerId = userData._id
                data.body.productId = productData._id

                try {
                    let orderData = await createData(Order, data.body)
                    console.log("OrderData", orderData)
                    return { message: "Product ordered", orderData: orderData }
                } catch (error) {
                    console.log("Error in order creation", error)
                    return error
                }
            }
        })
    }
    
}

let orderUpdate = async (req, res) => {
    
    let token = req.headers['x-access-token'];
    if (!token) res.status(403).send({ auth: false, message: 'No token provided.' });
    else {
        jwt.verify(token, config.secret, async (err, decoded) => {
            if (err) res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            else {
                console.log(decoded)
                Order.findById({ _id: req.params.id }, (err, OrderData) => {
                    if (err) res.send(err);
                    else {
                        console.log("Ordered Data", OrderData)
                        Object.assign(OrderData, req.body).save((err, updateData) => {
                            if (err) res.send(err);
                            res.json({ message: 'Book updated!', updateData });
                        });
                    }
                });
            }

        })
    }

    
}

let orderedProduct = async (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) res.status(403).send({ auth: false, message: 'No token provided.' });
    else {
       return jwt.verify(token, config.secret, async (err, decoded)=> {
        if (err) res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        else {
            console.log("decoded", decoded)
            try {
                let products = await getAllData(Product, {})
                if (products.length) {
                    await Order.find({ customerId: decoded.id}).populate({ path: 'productId', select: "productName" })
                        .populate({ path: 'customerId', select: "customerName" })
                        .sort({createdTime:req.query.sortValue})
                        .exec(async (err, orderedData) => {
                            if (err) {
                                console.log("error ",err)
                                res.send(err);
                            }
                            else {
                                console.log("ordered result", orderedData)
                                if (orderedData.length > 0) {
                                    let order = {}
                                    let product = []
                                    console.log("length", orderedData.length)
                                    orderedData.forEach(element => {
                                        order.customerName = element.customerId[0].customerName
                                        product.push({
                                        productName: element.productId[0].productName, orderStatus: element.orderStatus,
                                        createdTime: element.createdTime,updatedTime: element.updatedTime})
                                        order.productName = product
                                        console.log("order is",order)
                                    });
                                    res.send(order)
                                } else {
                                    res.send("No ordered data available")
                                }
                            }
                        })
                } else {
                    console.log("There is no products are there")
                    res.status(201).send({ message: 'Something Error Occur.'});
                }
            } catch (error) {
                console.log("problem to get products ",error)
            }
        }
    })
    }
}

let orderedProductDate = async (req, res) => {
    let result = []
    let token = req.headers['x-access-token'];
    if (!token) res.status(403).send({ auth: false, message: 'No token provided.' });
    else {
       return jwt.verify(token, config.secret, async (err, decoded)=> {
        if (err) res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        else {
            console.log("decoded", decoded)
            await Order.find({ customerId: decoded.id }).populate({ path: 'productId', select: "productName" })
                .exec(async (err, orders) => {
                    if (err) {
                            console.log("error ",err)
                            res.send(err);
                    }
                    else {
                        console.log("orders", orders)
                        let orderWithDate = {}
                        orderWithDate.products=[]
                        if (orders.length > 0) {
                            let purchaseDate = []
                            for (let value of orders) {
                                purchaseDate.push(value.createdTime)
                            }
                            for (let date of purchaseDate) {
                                for (let value of orders) {
                                 if (value.createdTime === date) {
                                     orderWithDate.date = date
                                     orderWithDate.products.push(value.productId[0].productName)
                                     //console.log("product", orderWithDate)
                                } else {
                                   // console.log("false",value)
                                }   
                                }
                                orderWithDate.prod =  await count_duplicate(orderWithDate.products)
                                result.push({ date: date, product: orderWithDate.prod })
                                console.log("result is ",result)
                            }
                            res.send(result)
                        }
                        else {
                           res.send("there is no orders") 
                        }
                    }
                   
            })
            
        }
    })
    }
}

let orderedProductCustomer = async (req, res) => {
    
    let result = []
    let users = await getAllData(User, {})
    let a = []
    if (users.length) {
        console.log("users", users)
        for (let i = 0; i < users.length;i++){
             a= await Order.find({ customerId: users[i]._id , orderStatus : ["created","received"]}).exec() 
              
               
                   await result.push({
                        customerName: users[i].customerName,
                        noOfPurchase: a.length
                    })
                    console.log("the result", result)
            
             }
                    console.log("a",a)
    
       res.send({status:200,result : result}) 
    } else {
        res.send("There is no customer are there") 
    }
}

module.exports = {ordercreate,orderUpdate,orderedProduct,orderedProductDate,orderedProductCustomer}

