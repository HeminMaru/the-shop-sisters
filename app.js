require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const Passport = require("passport");
const flash = require("express-flash")
const User = require("./models/usersModel");
const initializePassport = require("./auth_config");
initializePassport(passport);

const app = express();

app.use(express.static(__dirname + '/public'));
app.set("view-engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("home.ejs", {
            userData: req.user
        });
    } else {
        res.redirect("/signin");
    }
});

app.get("/auth/google/",
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }));

app.get("/auth/google/home/",
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/signin'
    }));

app.get("/signin", function(req, res) {
    res.render("signin.ejs");
});

app.get("/signup", function(req, res) {
    res.render("signup.ejs");
});

app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    successRedirect: '/',
    failureFlash: true
}));

app.post('/signup', async(req, res) => {
    hashedPass = await bcrypt.hash(req.body.password, 10);
    try {
        const newUser = new User({
            profileImage: "",
            username: req.body.username,
            firstName: req.body.firstName,
            secondName: req.body.secondName,
            password: hashedPass
        });

        newUser.save();
        res.redirect('/signin');
    } catch {
        res.redirect("/")
    }
});

app.get("/user/:userId", function(req, res) {
    if (req.isAuthenticated()) {
        if (JSON.stringify(req.user._id) === JSON.stringify(req.params.userId)) {
            res.render("user.ejs", {
                userData: req.user
            });
        }
    } else {
        res.redirect("/signin");
    }
});

app.listen(process.env.PORT || 3000)