let mongoose = require('mongoose');

let Product = require('../config/models/product')


async function addProduct(req, res) {

    let query = Product.findOne({productName:req.body.productName});
    query.exec((err, product) => {
        if (err) { res.send(err); }
        //If no errors, send them back to the client
        else {
            if (product) {

                product.updatedTime = new Date();
                product.save(function(err) {
                    if (err) {
                        console.log('error')
                        res.send(err);
                    }
                    else {
                        res.json({ message: "Product successfully updated", product });
                    } 
                });

            } else {
                var newProduct = new Product(req.body);
                //Save it into the DB.
                newProduct.save((err,newProduct) => {
                    if(err) {
                        res.send(err);
                    }
                    else { //If no errors, send it back to the client
                        res.json({message: "Product successfully added!", newProduct });
                    }
                });
            }
        }
    });
}



module.exports = {addProduct}