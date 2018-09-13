var express = require('express');
require('dotenv').config();
var path = require('path');
var pug = require('pug');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;

//global root location
global.appRoot = path.resolve(__dirname);


var port = process.env.PORT || 8888;

var morgan = require('morgan'); 
var bodyParser = require('body-parser'); 
var methodOverride = require('method-override'); 
var index = require('./routes');
var auth = require('./routes/auth');
var api = require('./routes/api');

var app = express(); 

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({'extended':'true'})); 
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(expressValidator());
app.use(methodOverride());

//passport session store in db
var options = {
    host: process.env.DB_HOST,
	port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'supersecret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { 
      secure: false, 
      maxAge: 7200000 // 2 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//CORS handle
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  res.header("Access-Control-Allow-Methods", "GET", "POST", "PUT");
  next();

});

//default route
app.get('/', function(req, res){
    res.redirect('/home');
});
app.use('/', index);
app.use('/auth', auth);
app.use('/api', api);

passport.use(new LocalStrategy(
  function(username, password, done) {
      return done(null, user);
  }
));

// socket.io
var server = require('http').Server(app);
var socket = require('socket.io');
var io = socket(server);


io.on('connection', function (sock) {
    console.log("Socket added to health coach socket.io.",sock);
    sock.on('sent message', function (data) {
      console.log('Received a message from : ',data.user);
      sock.broadcast.emit('received message', { user: data.user });
    });
});

server.listen(process.env.PORT || 8888);

console.log("Node and socket.io server listening on port " + process.env.PORT || 8888);
