
var config= require('../config');
var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs(config.MONGODB_URI, ['users']);
var bcrypt = require('bcryptjs');
var crypto=require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var nodemailer=require('nodemailer');

var templates= require('../utils/email-template');
var validator= require('../utils/formValidation');


//check if username/email exists in DB
router.put("/", function(req,res){
  var query={};
  var key= req.body.key;
  var value= req.body.value;
  query[key]=value; //creates the query object with key:value pair
  db.users.findOne(query, function(err, user){
    if(err) throw err;
    return res.send({isExist: user ? true: false});
  });
});

// Login Page - GET
router.get('/login', function(req, res){
  res.render('login');
});
// Register - POST
router.post('/signup',function(req,res){
   //check name duplicate
   db.users.findOne({username:req.body.name}, function(err, user){
      if(err) throw err;
      if(user){ 
        req.flash("error", "Username taken. Choose a different username."); 
        return res.redirect('/users/login');
      }
      //check email duplicate
      db.users.findOne({email:req.body.email}, function(err, user){
        if (err) throw err;
        if(user){ 
            req.flash("error", "The email you entered is already registered. Choose a different email."); 
            return res.redirect('/users/login');
        }
        var password=req.body.password; 
        //hash password
        bcrypt.genSalt(10,function(err,salt){
          if(err) {return done(err); }
          bcrypt.hash(password, salt, function(err,hash){
            if(err) { return done(err);}
            //create user
            var user={
              username: req.body.name,
              email: req.body.email,
              password: hash
            }
            //insert user to DB
            db.users.insert(user,function(err,result){
              if(err){ return done(err); }
              req.flash("success", "Registration complete. You may now log in.");
              sendRegistrationEmail(user,req);
              res.render("homepage");
          });
        });
      }); 
    });
  });
}); //sorry for the callback hell..

//welcome email for new users
function sendRegistrationEmail(user,req){
  var transporter=nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port:465,
    secure: true,
    auth: {
      user: 'quicknote.service@gmail.com',
      pass: 'lffehbpewdnzwlgo'
    }
  });
  //generate HTML to be sent by the register template in the custom module for email templates, with the user's data.
  templates.register(user, function(err,htmlBody){
    var options={
      from: 'QuickNote <quicknote.service@gmail.com>',
      to: user.email,
      subject:'Welcome to QuickNote',
      html: htmlBody
    };
    transporter.sendMail(options, function(err,info){
      if(err) {
        console.log(err);  
        req.flash('error','Oops! something went wrong. Please check your internet connection and try again.');
        return;
      }
      console.log('Registration email sent to user: ' + user.email);
      return;
    });
  });
  
}

//PASSPORT AUTHENTICATION
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
 db.users.findOne({_id: mongojs.ObjectId(id)}, function(err, user){
  done(err, user);
 });
});



/***FB strategy****/
passport.use(new FacebookStrategy({
    clientID: 1919670618359882,
    clientSecret: '87efe5e123d6c6e28ff1a8f7e597fdd0',
    callbackURL: "https://quicknote3.herokuapp.com/users/facebookLogin/callback",
    profileFields: ['id', 'displayName', 'photos', 'emails'],
    passReqToCallback:true,
  },
  function(req, accessToken, refreshToken, profile, cb) {
    db.users.findAndModify({
      query:{ username: profile.displayName},
      update:{$set:{ username: profile.displayName }},
      upsert: true, //create if it doesn't exist
      new:true
    },
     function (err, user) {
      console.log(user);
      return cb(err, user);
    });
  }
));

router.post('/facebookLogin',
  passport.authenticate('facebook', {scope:['email']}));

router.get('/facebookLogin/callback',
  passport.authenticate('facebook', { failureRedirect: '/users/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.flash("success", "Welcome, you are logged in.");
    res.redirect('/');
  });




//***local strategy*****/
passport.use(new LocalStrategy({
      //set field names
      passReqToCallback:true,
      usernameField: 'username',
      passwordField: 'password'
  },
  function(req, username, password, done){
    db.users.findOne({$or: [{username: username},{email:username}] }, function(err, user){
      if(err) {
        console.trace(err);
        return done(err);
      }
      //no user found with the submitted username/email
      if(!user){
        return done(null, false, req.flash('error', "Invalid username or email."));
      }
      //user found
      bcrypt.compare(password, user.password, 
        function checkPassword(err, match){
          if(err) { return done(err); }
          if(!match){
             return done(null, false, req.flash('error', "Oops! Incorrect password."));
          }
          return done(null, user);
        });
    });
  }
));


router.post('/login', function(req, res, next) {
  //custom passport callback
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/users/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      req.flash('success', `Welcome ${user.username}, you are now logged in.`);
      var previousPage = req.header('Referer');
      //if logged in frm login page, redirect to index, otherwise go to the previous page
      var url = previousPage.endsWith("/users/login") ? "/" : previousPage;
      return res.redirect(url);
    });
  })(req, res, next);
});

//Logout
router.get('/logout',function(req, res){
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});


//******PASSWORD RESET*********//

//password reset email
router.post('/resetPassword', sendpass, function(req, res){
  req.flash('success', 'Email sent. check your inbox.');
  res.redirect('/users/login');
});

//send the reset password email
function sendpass(req, res, next){
  var email= req.body.email;
  db.users.findOne({email: email}, function(err,user){
    if (err) { console.log(err); return;}
    if (!user){
      req.flash('error', 'No user found with this email.');
      return res.render('login');
    }
    //generate random characters
    crypto.randomBytes(32, function(err, bytes){
      var token= bytes.toString('hex');
      db.users.findAndModify({
        query:{_id: user._id},
        update:{
          $set: {
            //set a unique token that expires in 24 hours
            'restorePasswordToken': token,
            'restoreTokenExpiry': Date.now()+ 24*60*60*1000,
          }
        },
        new:true    //return the new user with the token
        }, function(err, user){
          if(err) { throw err;}
          var transporter = nodemailer.createTransport({
            //service: 'gmail',
            host: 'smtp.gmail.com',
            port:465,
            secure: true,
            auth: {
              user: 'quicknote.service@gmail.com',
              pass: 'lffehbpewdnzwlgo'
            }
          });
          var resetUrl= req.protocol + "://"+req.headers.host+'/users/resetPassword/'+token;
          templates.pwdRestore(user, req, resetUrl , function(err, htmlBody){
            var options = {
              from: 'QuickNote <quicknote.service@gmail.com>',
              to: email,
              subject: `Hello ${user.username}, your password reset email from QuickNote`,
              html: htmlBody
            };
            transporter.sendMail(options, function(err, info){
              if (err) {
                console.log(err);
                req.flash('error','Oops! something went wrong. Please check your internet connection and try again.');
                return res.redirect(req.header('Referer')); //back
              }
              console.log('email sent');
              next();
            });
          }); //template
        });
    });
  }); //findOne
}


//password reset page
router.get('/resetPassword/:resetToken', function(req,res){
  var resetToken= req.params.resetToken;
  //find a user with the reset token in the url that has not expired
  db.users.findOne({restorePasswordToken: resetToken, restoreTokenExpiry: {$gt:Date.now()}},
  function(err,user){
    if(err) throw err;
    //
    if(!user){
      req.flash("error","Temporary password has expired, or the address you typed was incorrect. Please resend password reset email.");
      return res.redirect('/users/login');
    }
    return res.render('resetPassword', {user:user, resetToken:resetToken});
  }
  );//findOne
});

//reset password POST- user attempts to change password
router.post('/resetPassword/:resetToken', function(req, res){
  var resetToken= req.params.resetToken;
  db.users.findOne({restorePasswordToken: resetToken, restoreTokenExpiry: {$gt: Date.now()}},
    function(err,user){
      if(err) throw err;
      if(!user){
        req.flash("error","Temporary password has expired. Please resend password reset email.");
        return res.redirect('/users/login');
      }
      var password=req.body.password;
      var confirm= req.body.password2;
      //check password is valid
      var msg= validator.validatePassword(password,confirm);
      if(msg!==true){
        req.flash('error',msg);
        return res.redirect(req.header('Referer'));
      }
      bcrypt.genSalt(10,function(err,salt){
        if(err) throw err;
        bcrypt.hash(password, salt, function(err, hash){
          db.users.findAndModify({
          query:{_id: user._id},
          update:{
            $set: {
              'password':hash,
              'restorePasswordToken': undefined,
              'restoreTokenExpiry': undefined,
            }
          },
          new:true    
          }, function(err, user){
            if(err) throw err;
            console.log("pass changed ",user.username);
            req.flash('success', 'Your password was changed successfully. You may now log in.')
            return res.redirect('/users/login');
          }); //findAndModify
        }); //hash
      }); //bcrypt
    }); //findOne
});


module.exports = router;
