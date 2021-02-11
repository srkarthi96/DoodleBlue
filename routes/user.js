let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let config = require('../config');

let mongoose = require('mongoose');

let User = require('../config/models/user')



async function register(req, res) {
    //Creates a new book
    console.log("request", req.body)
    const salt = await bcrypt.genSalt(10);
    var hashedPassword = bcrypt.hashSync(req.body.password,salt);

    var newUser = new User({
    customerName : req.body.customerName,
    email : req.body.email,
    password : hashedPassword
  });
    //Save it into the DB.
    newUser.save((err,user) => {
        if(err) {
            res.status(500).send("There was a problem registering the user.")
        }
        else { //If no errors, send it back to the client
           let token = jwt.sign({ id: user._id }, config.secret, {
           expiresIn: 86400 // expires in 24 hours
         });
            res.status(200).send({ auth: true, token: token });
        }
    });
}


async function login(req, res) {
    console.log("request", req.body)
    let query = User.findOne({email:req.body.email});
    query.exec((err, user) => {
        if(err) res.send(err);
        //If no errors, send them back to the client
        else {
            if (user) {
                const validPassword = bcrypt.compare(req.body.password, user.password);
                console.log("The result after login", user)
                if (validPassword) {
                    let token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                    });
                    res.status(200).send({ auth: true, token: token });
                }
                else {
                    res.status(400).json({ error: "Invalid Password" });
                }
            } else {
                res.status(401).json({ error: "User does not exist" });
            }
        }
        
    });
}
module.exports = {register,login}