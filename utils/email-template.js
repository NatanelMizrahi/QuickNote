var fs= require('fs');
var ejs= require('ejs');
var supportUrl="http://localhost:3000";//TODO change

// credit for template to https://postmarkapp.com
var passwordTemplate= function(user,resetUrl, callback){
	fs.readFile(__dirname+'/templates/password-reset.ejs','utf-8', function(err,file){	//utf-8 converts to String
	if(err){ console.log(err);}
	var html=ejs.render(file, {user:user, resetUrl: resetUrl, supportUrl: supportUrl});
	callback(err,html);
});
}
var registerTemplate= function(user, callback){
	fs.readFile(__dirname+'/templates/register.ejs','utf-8', function(err,file){	//utf-8 converts to String
	if(err){ console.log(err);}
	var html=ejs.render(file, {user:user, url:"http://localhost:3000/users/login", supportUrl: supportUrl});
	callback(err,html);
	});

}
module.exports={
	pwdRestore: passwordTemplate,
	register: registerTemplate,
};