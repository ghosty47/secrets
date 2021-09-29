//jshint esversion:6

const dotenv = require('dotenv');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
const User = require('./models/user');



// Load config
dotenv.config({ path: "./config/config.env" });


//  Database connection
mongoose
	.connect(process.env.MONGODB_URL)
	.then((connected) => console.log("Database connected successfully"))
	.catch((err) => console.log("Error connecting to DB", err));


   
//initialize express
const app = express();


//setting up express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");


app.get('/', (req, res) => {
    res.render('home')
})


app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})


app.post('/register', (req, res) => {

    const newUser = new User ({
        
        email: req.body.username,
        password: req.body.password,
    })

    newUser.save(err => {
        if (err) {
            console.error(err)
        } else {
            res.render('secrets')
        }
    })
})


app.post('/login', (req, res) => {

    const {username} = req.body
    const {password} = req.body


    User.findOne({email: username}, (err, foundUser) => {
        if (err) {
            console.error(err)
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets')
                }
            }
        }
    })
})






app.listen(3000, () => {
    console.log('listening on port 3000')
});