var express=require('express');

var path=require('path');
var bodyParser=require('body-parser');
var session=require('express-session');
var passport=require('passport');
var flash=require('connect-flash');

//Routes
var index=require('./routes/index');
var users=require('./routes/users');
var notes=require('./routes/notes');

//MIDDLEWARE SETUP
//order matters! each middleware has a next() callback to load the next middleware
//dependencies: express > static > session > passport > flash > messages > routes.

//express (routing framework)
var app=express();
//cookie parser- redundant in express session's lastest version. if used, secret must match the session's secret.
//app.use(cookieParser('keyboard cat'));

//bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


//EJS
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views')); //set views source folder

//static dir
app.use(express.static(path.join(__dirname,'public')));
app.use('/bootstrap', express.static(path.join(__dirname +'/node_modules/bootstrap/dist')));
// bootstrap and shorten the access of files to href="/bootstrap/.."
//additional css is in public/style dir. to access files omit public/

//express-session
//depends on cookie parser - built in for express 4.0
app.use(session({
  secret: 'keyboard cat',
  resave: true,					//TODO : sometimes no flash when true
  saveUninitialized: true,
  cookie: { maxAge : 10*60*1000 } //session lasts 10 minutes
  //cookie: { secure: true}		//TODO : bug. true= no flash
}));

//passport
app.use(passport.initialize());
app.use(passport.session()); 

//flash
//uses session
app.use(flash());

//express-messages
//uses flash
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req,res);
  next();
});

//automatically set locals.user, locals.path
app.get('*', function(req,res,next){
  res.locals.user= req.user || null;

  var pathname= req.path.substring(req.path.lastIndexOf("/")); // string after last('/')
  console.log(pathname);
  res.locals.path= pathname =="/" ? "Home" : cap(pathname.substring(1));
	
	next();

  function cap(str){
    return str.length > 0 ? str.charAt(0).toUpperCase()+str.substring(1) : str;
  }
});

//**important! define routes after initializing bodyParser otherwise form data isn't available*
//also after setting up all the middleware, otherwise it doesn't apply to the routes. e.g no flash in /users

app.use("/"     , index);	//the homepage set to the route in index variable.
app.use("/users", users);
app.use("/notes", notes);

//initialize server
var port=3000;
app.listen(port);
console.log("Running on port "+port);

module.exports=app;
