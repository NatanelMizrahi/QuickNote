

//autofill form with ctrl+Q
$(window).on('keydown',function(e){
	if(e.keyCode==81 && e.ctrlKey){
		e.preventDefault();
		$('#signupBtn').click();
		$('#name').val('nmiz');
		$('#email').val('natanel.mizrahi@gmail.com');
		$('#password').val('qweqwe3');
		$('#pwconfirm').val('qweqwe3');
		$('#terms').attr('checked',true);
		$('#signupSubmitBtn').click();
	}
});
var autofocus= false;

//form data
var name_box= document.getElementById('name');
var email_box= document.getElementById('email');
var pw_box= document.getElementById('password');
var pw2_box= document.getElementById('pwconfirm');
var pw_icon= document.getElementById('pw-icon');
var pw2_icon= document.getElementById('pw2-icon');

var alert=document.getElementById('alert');


//Event listeners
name_box.addEventListener('blur',validateName, false);
email_box.addEventListener('blur',validateEmail, false);
// window.addEventListener('load', function(){document.getElementById('header').classList.add('text-fade');}, false);

// validation functions
function toggleAlert(msg){
	if(msg!==true){
		alert.className="alert alert-danger";
		alert.innerHTML= `<span class="glyphicon glyphicon-exclamation-sign"></span>`+" "+msg;
	}
	else{
		alert.innerHTML= '';
		alert.className='';
	}
	return msg===true;
}

function validateName(){
	var name= name_box.value;

	var regexp=/\w/;
	var isValid=regexp.test(name);
	var msg=isValid? true : "Please enter a valid name (letters and numbers only)";
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
	 }  else if (password==name_box.value){
	 	return "Password can't be the same as your name";
	 } else if (!regexp1.test(password)){
	 	return "Password must contain letters and numbers only";
	 } else if (!regexp2.test(password)){
	 	return "Password must contain  at least one letter and one number";
	 } else if (password!==password2)
	 	return "Passwords don't match";
	 else return true;
}
function validateTerms(){
	var checked= document.getElementById('terms').checked;
	var msg= checked ? true : "Please read and accept the terms and conditions.";
	return toggleAlert(msg);	
}

function submitForm(e){
	//check if all fields are valid, otherwise- do not submit
	if (validateName() && validateEmail() && validatePW() && validateTerms()){}
	else{e.preventDefault();}
}

$(document).ready(function(){
	$('#signup').submit(function(e){
			submitForm(e);
	});

	//email and username duplicate check on blur
	///////////////////////////////////////////
	$("#name, #email").blur(function(){
		var value=$(this).val();
		var key= $(this).attr("id") == 'name' ? 'username' : 'email';
		checkInUse(key, value);
		
	});

	//check if the username/email input is already in use in the DB
	function checkInUse(key, value){
		var data={key:key, value: value};
		$.ajax({
			type:'PUT',
			url: `${window.location.protocol}//${window.location.host}/users`,
			dataType:'json',
			data:data,
			success: function(res){
				if(res.isExist){
					toggleAlert(`The ${key} you entered is already registered. Choose a different ${key}.`);
				}
			},
			err: function(err){ console.log(err);}
		});//ajax
	}
});
