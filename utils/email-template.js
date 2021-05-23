var fs= require('fs');
var ejs= require('ejs');

var getAppBaseUrl = (req) => `${req.protocol}://${req.headers.host}`;

// credit for template to https://postmarkapp.com
var passwordTemplate= function(user,req, resetUrl, callback){
	fs.readFile(__dirname+'/templates/password-reset.ejs','utf-8', function(err,file){	//utf-8 converts to String
	if(err){ console.log(err);}
	let supportUrl = getAppBaseUrl(req) + "/support";
	var html=ejs.render(file, {user, resetUrl, supportUrl});
	callback(err,html);
});
}
var registerTemplate= function(user, req, callback){
	fs.readFile(__dirname+'/templates/register.ejs','utf-8', function(err,file){	//utf-8 converts to String
	if(err){ console.log(err);}
	let baseUrl = getAppBaseUrl(req);
	var html=ejs.render(file, {user:user, url: baseUrl+"/users/login", supportUrl: baseUrl+"/support"});
	callback(err,html);
	});

}
module.exports={
	pwdRestore: passwordTemplate,
	register: registerTemplate,
};
