require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { Passport } = require("passport");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/meetDB", {useNewUrlParser: true});

const meetingSchema = {
    meetingTitle: String,
    meetingGoal: String,
    meetingAgenda: String,
    meetingType: String,
    meetingdate: String,
    organisationName: String,
    organisationEmail: String,
    organisationNumber: String,
    userName: String
};


const registerSchema = {
    fname: String,
    lname: String,
    email: String,
    contact: Number,
    contact2: Number,
    college: String,
    country: String,
    state: String,
    address: String,
    username: String,
    password: String
};


const loginDataSchema = mongoose.Schema({
    email: String,
    passport: String
});

const userSchema = {
    userName: String,
    userEmail: String,
    userMeetName: String,
    userHostName: String
};

const contactSchema = {
    email: String,
    query: String,
};


loginDataSchema.plugin(passportLocalMongoose);


const Register = mongoose.model("Register", registerSchema);

const LoginData = mongoose.model("LoginData", loginDataSchema);

const Meet = mongoose.model("Meet", meetingSchema);


const Contact = mongoose.model("Contact", contactSchema);

const User = mongoose.model("User", userSchema);


passport.use(LoginData.createStrategy());

passport.serializeUser(LoginData.serializeUser());
passport.deserializeUser(LoginData.deserializeUser());

var globalUser = "";


app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register", { warning: "" });
});

app.get("/account", function(req, res) {
    Register.find({username: globalUser}, function (err, details) {
        res.render("compose", { page: "Compose", detail:details, userName: globalUser, page: "Admin" });
    });
});


app.post("/register", function(req, res) {
    console.log(req.body.fname);
    const register = new Register({
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        contact: req.body.contact,
        contact2: req.body.contact2,
        college: req.body.college,
        country: req.body.country,
        state: req.body.state,
        address: req.body.address,
        username: req.body.username,
        password: req.body.password
    });

    register.save(function(err) {
        if (!err) {
            LoginData.register({ username: req.body.username }, req.body.password, function(err, user) {
                if (err) {
                    res.render("register", { warning: "Opps! Something went wrong" });
                } else {
                    passport.authenticate("local")(req, res, function() {
                        res.redirect("/login");
                    });
                };
            });
        } else {
            res.render("register", { warning: "Opps! Something went wrong" });
        }
    });
});

app.post("/login", function(req, res) {

    globalUser = req.body.username;

    const loginData = new LoginData({
        username: req.body.username,
        password: req.body.password
    });

    req.login(loginData, function(err) {
        if (err) {
            res.redirect("/login");
        } else {
            passport.authenticate("local")(req, res, function() {
                User.find({userHostName: globalUser}, function (err, user) {
                    Register.find({username: globalUser}, function (err, detail) {
                        res.render("compose", { page: "Compose", details:detail, users:user, userName: globalUser, page: "Admin" });
                    });
                });
                
            });
        }
    });

});

app.get("/", function (req, res) {

    Meet.find({}, function (err, meet) {
            res.render("home", { posts: meet, page: "Home" });
    });
   
});


app.get("/admin", function (req, res) {
    
    res.redirect("login");

});

app.get("/thank-you", function (req, res) {
    res.render("thank-you", { page: "About" });
});



app.get("/404notfound", function (req, res) {
    res.render("404notfound", { page: "404 Not Found" });
});


app.get("/about", function (req, res) {
    res.render("about", { page: "About" });
});


app.get("/contact", function (req, res) {
    res.render("contact", { page: "Contact" });
});

app.get("/compose", function (req, res) {

    User.find({}, function (err, user) {
        res.render("compose", { page: "Compose", users:user, userName: '', page: "Admin" });
    });
});

app.get("/privacy-policy", function (req, res) {
    res.render("privacy-policy", { page: "Privacy-Policy" });
});

app.get("/terms-conditions", function (req, res) {
    res.render("terms-conditions", { page: "Terms And Conditions" });
});


app.post("/compose", function (req, res) {
    const meet = new Meet({
        meetingTitle: req.body.meetingTitle,
        meetingGoal: req.body.meetingGoal,
        meetingAgenda: req.body.meetingAgenda,  
        meetingType: req.body.meetingType,
        organisationName: req.body.organisationName,
        organisationEmail: req.body.organisationEmail,
        organisationNumber: req.body.organisationNumber,
        meetingdate: req.body.meetingdate,
        userName: req.body.userName
      });

    meet.save(function (err) {
        if (!err) {
            res.redirect("/");
        } else {
            res.redirect("/compose");
        }


    });
});


app.post("/list", function (req, res) {
    
    globalUser = req.body.userName;
    
    User.find({userHostName: globalUser}, function (err, user) {
        res.render("admin-users", {users:user, page: "Home" }); 
    });

});


app.post("/user", function (req, res) {
    const user = new User({
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        userMeetName: req.body.userMeetName,
        userHostName: req.body.userHostName
    });

    user.save(function (err) {
        if (!err) {
            res.redirect("/thank-you");
        } else {
            res.redirect("/");
        }


    });
});



app.post("/contact", function (req, res) {
    const contact = new Contact({
        email: req.body.email,
        query: req.body.query
    });

    contact.save(function (err) {
        if (!err) {
            res.redirect("/");
        } else {
            res.redirect("/contact");
        }


    });
});

app.listen(3000, function () {
    console.log("Server is running on port 3000");
})