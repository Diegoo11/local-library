var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const mongoose = require('mongoose')
const compression =require('compression')
const helmet = require('helmet')

const SomeModel = require('./models/somemodel')

const mongoDB = 'mongodb+srv://Diegoo11:Diegoo11@cluster0.0lxgj.mongodb.net/library?retryWrites=true&w=majority';
mongoose.connect( mongoDB, {useNewUrlParser: true , useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MingiDB connection error:'))

var index = require('./routes/index');
var users = require('./routes/users');
const wiki = require('./routes/wiki')
const catalog = require('./routes/catalog')

var app = express();

app.use(helmet())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/catalog', catalog)
app.use('/wiki', wiki)
app.get('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
