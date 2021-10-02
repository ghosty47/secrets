//jshint esversion:6
const { globalVariables } = require('./middlewares/configurations');
const dotenv = require('dotenv');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport');
const logger = require("morgan");
const flash = require("connect-flash");
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
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
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");


//setting up session

app.use(session({
    secret: 'This is my secret',
    resave: false,
    saveUninitialized: true
  }))


app.use(passport.initialize());
app.use(passport.session());


//serializing and deserializing user
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

//google authentication
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get('/', (req, res) => {
    res.render('home')
})

//google authentication route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));



app.get('/auth/google/secrets', 
passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });



app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register') 
})

app.get('/secrets', (req, res) => {

    User.find({'secret': {$ne:null}}, (err, foundUsers) => {
        if (err) {
            console.log(err)
        } else {
            if (foundUsers) {
                res.render('secrets', {usersWithSecrets: foundUsers})
            }
        }
    })
})

app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('submit')
    } else {
        res.redirect('/login')
    }
})

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})


app.post('/register', (req, res) => {

    User.register({username: req.body.username}, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })

    // bcrypt.hash(req.body.password, saltRounds, (err, hash) => {

    //     const newUser = new User ({
        
    //         email: req.body.username,
    //         password: hash
    //     })
    
    //     newUser.save(err => {
    //         if (err) {
    //             console.error(err)
    //         } else {
    //             res.render('secrets')
    //         }
    //     })
    // });


})


app.post('/login', (req, res) => {

    const user = new User({

        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err) => {
        if (err) {
            console.error('user not found')
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })
        }
    })

    // const {username} = req.body
    // const {password} = req.body


    // User.findOne({email: username}, (err, foundUser) => {
    //     if (err) {
    //         console.error(err)
    //     } else {
    //         if (foundUser) {
    //             bcrypt.compare(password, foundUser.password, (err, result) => {
    //                 if (result === true) {
    //                     res.render('secrets')
    //                 }
    //             });
                
    //         }
    //     }
    // })
})


app.post('/submit', (req, res) => {

    const {secret} = req.body

    User.findById(req.user.id, (err, foundUser) => {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                foundUser.secret = secret
                foundUser.save(() =>{
                    res.redirect('/secrets')
                }) 
            }
        }
    })
})






app.listen(3000, () => {
    console.log('listening on port 3000')
});