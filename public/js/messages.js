$(document).ready(function(){
		$('#messages .success').hide().fadeIn(500);
		$('#messages .success').fadeOut(3000);
		$('#messages .success').addClass("alert alert-success");
		$('#messages .error').addClass("alert alert-danger");
		$('#messages .error li').prepend("<span class='glyphicon glyphicon-exclamation-sign'>&nbsp;</span>");
		

	});