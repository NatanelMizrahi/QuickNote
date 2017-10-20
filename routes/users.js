
//test.sayHi();
var siteURL="http://localhost:3000";
var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('usersDB', ['users']);
var bcrypt = require('bcryptjs');
var crypto=require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var nodemailer=require('nodemailer');

var templates= require('../utils/email-template');
var validator= require('../utils/formValidation');

router.put("/", function(req,res){
  console.log("checking server match");
  var query={};
  var key= req.body.key;
  var value= req.body.value;
  query[key]=value;
  console.log(query);
  db.users.findOne(query, function(err, user){
    if(err) throw err;
    return res.send({isExist: user? true: false});
  });
});
// Login Page - GET
router.get('/login', function(req, res){
  res.render('login');
});

// Register Page - GET
/*
router.get('/signup', function(req, res){
  res.render('signup');
});
*/
// Register - POST
router.post('/signup',function(req,res){
   db.users.findOne({username:req.body.name}, function(err, user){
      if(err) throw err;
      if(user){ 
        req.flash("error", "Username taken. Choose a different username."); 
        return res.redirect('/users/login');
      }
      db.users.findOne({email:req.body.email}, function(err, user){
        if (err) throw err;
        if(user){ 
            req.flash("error", "The email you entered is already registered. Choose a different email."); 
            return res.redirect('/users/login');
        }
        var password=req.body.password; 
        bcrypt.genSalt(10,function(err,salt){
          if(err) {return done(err); }
          bcrypt.hash(password, salt, function(err,hash){
            if(err) { return done(err);}
            var user={
              username: req.body.name,
              email: req.body.email,
              phone: req.body.phone,
              password: hash
            }
            db.users.insert(user,function(err,result){
              if(err){ return done(err); }
              req.flash("success", "Registration complete. You may now log in.")
              console.log("registered ", user.username);
              sendRegistrationEmail(user);
              res.render("homepage");
          });
        });
      }); 
    });
  });
}); //sorry for the callback hell..works fine

function sendRegistrationEmail(user){
  var transporter=nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port:465,
    secure: true,
    auth: {
      user: 'testpassrestore@gmail.com',
      pass: 'qweqwe343'
    }
  });
  templates.register(user, function(err,htmlBody){
    var options={
      from: 'QuickNote <testpassrestore@gmail.com>',
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
      console.log('email sent');
      return;
    });
  });
  
}

//PASSPORT
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
    callbackURL: "http://localhost:3000/users/facebookLogin/callback",
    profileFields: ['id', 'displayName', 'photos', 'emails'],
    passReqToCallback:true,
  },
  function(req, accessToken, refreshToken, profile, cb) {
    console.log(profile);
    db.users.findAndModify({
      query:{ username: profile.displayName},
      update:{$set:{ username: profile.displayName }},
      upsert: true, //create if it doesn't
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
      passReqToCallback:true,
      usernameField: 'username',
      passwordField: 'password'
  },
  function(req, username, password, done){
    db.users.findOne({$or: [{username: username},{email:username}] }, function(err, user){
      if(err) { return done(err); }
      if(!user){
        return done(null, false, req.flash('error', "Invalid username or email."));
      }
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
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/users/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      req.flash('success', "Welcome " + user.username+", you are now logged in."); 
      var url= req.header('Referer')===siteURL+"/users/login" ? "/" : 'back';
      return res.redirect(url);
    });
  })(req, res, next);
});

//logout
router.get('/logout',function(req, res){
  req.logout();
  req.flash('success', 'You have logged out');
  res.redirect('/users/login');
});


//password reset email
router.post('/resetPassword', sendpass, function(req, res){
  req.flash('success', 'Email sent. check your inbox.');
  res.redirect('/users/login');
});

function sendpass(req, res, next){
  var email= req.body.email;
  console.log(email);
  db.users.findOne({email: email}, function(err,user){
    if (err) { console.log(err); return;}
    if (!user){
      req.flash('error', 'No user found with this email.');
      return res.render('login');
    }
    crypto.randomBytes(32, function(err, bytes){
      var token= bytes.toString('hex');
      db.users.findAndModify({
        query:{_id: user._id},
        update:{
          $set: {
            'restorePasswordToken': token,
            'restoreTokenExpiry': Date.now()+ 24*60*60*1000,
          }
        },
        new:true    
        }, function(err, user){
          if(err) { throw err;}
          var transporter = nodemailer.createTransport({
            //service: 'gmail',
            host: 'smtp.gmail.com',
            port:465,
            secure: true,
            auth: {
              user: 'testpassrestore@gmail.com',
              pass: 'qweqwe343'
            }
          });
          var resetUrl= "http://"+req.headers.host+'/users/resetPassword/'+token;
          templates.pwdRestore(user, resetUrl , function(err, htmlBody){
            var options = {
              from: 'QuickNote <testpassrestore@gmail.com>',
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
  console.log(resetToken);
  db.users.findOne({restorePasswordToken: resetToken, restoreTokenExpiry: {$gt:Date.now()}},
  function(err,user){
    if(err) throw err;
    if(!user){
      req.flash("error","Temporary password has expired. Please resend password reset email.");
      return res.redirect('/users/login');
    }
    return res.render('resetPassword', {user:user, resetToken:resetToken});
  }
  );//findOne
});

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
            req.flash('success', 'Password changed successfully. You may now log in.')
            return res.redirect('/users/login');
          }); //findAndModify
        }); //hash
      }); //bcrypt
    }); //findOne
});


module.exports = router;