const express = require('express')

let app = express()

const mongoose = require('mongoose')

const morgan = require('morgan')

const bodyParser = require('body-parser')

let config = require('config')

let user = require('./routes/user.js')
let product = require('./routes/product.js')
let order = require('./routes/order.js')

let options = {
    server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
};

mongoose.connect(config.DBHost,{ useNewUrlParser: true,useUnifiedTopology: true },options,{ useNewUrlParser: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

if(config.util.getEnv('NODE_ENV') !== 'test') {
    //use morgan to log at command line
    app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

app.get("/", async(req, res) => res.json({ message: "Welcome to our product portal!" }));

app.route("/user/register").post(user.register)

app.route("/user/login").post(user.login)

app.route("/product").post(product.addProduct)

app.post("/order/creation", async (req, res) => {
    let result = await order.ordercreate(req)
    res.send(result)
})

app.route("/order/:id").put(order.orderUpdate)

app.listen(9000);
console.log("Listening on port 9000 " );

module.exports = app;