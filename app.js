const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config({ path: '.env' });




mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

const loginRouter = require("./routes/login.js");
const createRouter = require("./routes/create.js");
const gameRouter = require("./routes/game.js");
const friendsRouter = require("./routes/friends.js");
const homeRouter = require("./routes/home.js");


app.locals = require('./library/locals.js')

app.use(require('body-parser').urlencoded({ // this is needed so that req.body isn't undefined
    extended:true
}));
app.use(express.json()); // this is needed for req.body to receive json

app.use(session({
  secret: 'lebron',
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
     expires: 10000000000000000000000000000
  }
}));

app.set('view engine', 'ejs'); 

// app.use('/public', express.static('public')); // this says where the css and js is 
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('login');
})



// this kicks people back to the login screen when their session expires
let privilegedPages = ['/game', '/friends']; // these are pages you must be signed in to access
app.use('/', (req, res, next) => {
  if (!req.session.username && privilegedPages.includes(req.originalUrl)){
    return res.redirect('login');
  }
  next();
})

app.use('/friends', friendsRouter);
app.use('/game', gameRouter);
app.use('/create', createRouter);
app.use('/login', loginRouter);
app.use('/home', homeRouter);

app.listen(3000, 'localhost');