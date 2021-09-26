const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true); 

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.info("database connected successfully");
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
});
userSchema.plugin(passportLocalMongoose);

const postSchema = new mongoose.Schema({
    user: String,
    desc: String,
    img: {
        data: Buffer,
        contentType: String,
    }
});

const scoreSchema = new mongoose.Schema({
  user: String,
  score: Number,
});

const User = new mongoose.model("user", userSchema);
const Post = new mongoose.model('post', postSchema);
const Score = new mongoose.model('score', scoreSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('splash');
});

app.get('/home', (req, res) => {
    if(req.isAuthenticated()) {
        Post.find({}, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            }
            else {
                res.render('home', { items: items });
            }
        });
    } 
    else res.redirect('/login');
});

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) res.render('profile');
    else res.redirect('/');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post('/', upload.single('image'), (req, res, next) => {
 
    var obj = {
        user: req.user.username,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    Post.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/home');
        }
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    const user = new User({
      username: username,
      password: password
    });
  
    req.login(user, (err) => {
      if(err) console.error(err);
      else{
        passport.authenticate("local")(req, res, () => {
          res.redirect('/home');
        });
      }
    });
  
});

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // console.log(email, passport);
    User.register({username: username}, password, (err, user) => {
      if(err){
        console.log(err);
        res.redirect('/register');
      }
      else{
        passport.authenticate("local")(req, res, () => {
          res.redirect('/home');
        });
      }
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.info('app started at port:3000');
});