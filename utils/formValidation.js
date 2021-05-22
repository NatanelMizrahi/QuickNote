function validateName(){
	var name= name_box.value;
	var regexp=/\w/;
	var isValid=regexp.test(name);
	var msg=isValid? true : "Please enter a valid username (letters and numbers only)";
	if(autofocus) {name_box.focus();}
	name_box.className=isValid ? "form-control": "form-control alert-danger"; 
	return toggleAlert(msg);
}

function validateEmail(){
	var email= email_box.value;

	var regexp=/[A-Za-z0-9._]{1,}@[A-Za-z0-9._]{2,}\.[A-Za-z0-9._]{2,}/;
	var isValid=regexp.test(email);
	var msg=isValid ? true : "Please enter a valid email address";
	email_box.className= isValid ? "form-control": "form-control alert-danger"; 
	if(autofocus) {email_box.focus();}
	
	return toggleAlert(msg);
}

function validatePW(){
	var password=pw_box.value;
	var password2=pw2_box.value;
	var msg=testPW(password, password2);
	toggleAlert(msg);
	if(msg!==true){
		pw_box.className="form-control alert-danger";
		pw2_box.className="form-control alert-danger";
		pw_icon.className="glyphicon glyphicon-remove-circle";
		pw2_icon.className="glyphicon glyphicon-remove-circle";
		if(autofocus) pw_box.focus();
	} else {
		pw_box.className="form-control alert-success";
		pw2_box.className="form-control alert-success";
		pw_icon.className="glyphicon glyphicon-ok-circle";
		pw2_icon.className="glyphicon glyphicon-ok-circle";
	}
	return msg===true;
}

function testPW(password, password2){				
	var regexp1 = /\w/;
	var regexp2 = /(?=.*[A-Za-z])(?=.*[0-9])/
	 if (password.length < 6){
	 	return "Password must be at least 6 characters";
	 }  else if (typeof(name_box)!=='undefined' && password==name_box.value){
	 	return "Password can't be the same as your name";
	 } else if (!regexp1.test(password)){
	 	return "Password must contain letters and numbers only";
	 } else if (!regexp2.test(password)){
	 	return "Password must contain  at least one letter and one number";
	 } else if (password!==password2){
	 	console.log(password+" : "+ password2);
	 	return "Passwords don't match"; 
	 }
	 else return true;
}
function validateTerms(){
	var checked= document.getElementById('terms').checked;
	var msg= checked ? true : "Please read and accept the terms and conditions.";
	return toggleAlert(msg);	
}

function submitForm(e){
	if (nonRequired || validateName() && validateEmail() && validatePW() && validateTerms()){}
	else {
		e.preventDefault();
	}
}

module.exports={
	validatePassword: testPW
};
