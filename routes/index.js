var membersOnly=false;
var express=require('express');
var router=express.Router(); //router object from express

router.get('/',isLoggedIn, function(req,res){
	//console.log("logged in with: ", req.user.username);
	res.render('homepage');
});

function isLoggedIn(req,res,next){
	if(!membersOnly || req.isAuthenticated()) { return next(); }
	res.redirect('/users/login');
}

router.get('/about', function(req, res){
	res.render('about');
});

module.exports=router;	//export to 'require' function