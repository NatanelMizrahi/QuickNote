//disable refresh
//$(window).on("keydown", function(e) { if ((e.which || e.keyCode) == 116) e.preventDefault(); });

//////////
//jQuery//
//////////

//Read more for "readmore" class
////////////////////////////////
function classValue(classNameFull, className){
	var toFind= className+'-'+"\\d+";
	var length= className.length+1;
	var regexp= new RegExp(toFind);
	
	var result=regexp.exec(classNameFull);
	var val= result==null ? 0 : result[0].substring(length);
	return parseInt(val);
}
$(function(){
	//readmore text
	$(document).find("[class*='readmore']").each(function(){
		var default_chars= 300;
		var maxlength=classValue(this.className, 'readmore');
		maxlength= maxlength==0 ? default_chars : maxlength;
		var text= $(this).text();
		if(text.length > maxlength){
			var moretxt=text.substring(maxlength);
			$(this).text(text.substring(0,maxlength)); //leave only max length of text
			var ellips= $('<span>...<br></span>');
			moretxt= 	$('<span>'+moretxt+'<br></span>');
			moretxt.hide();								//makes the rest hidden
			$(this).append(ellips);
			$(this).append(moretxt);
			$(this).append('<button class="btn-readmore btn btn-info btn-sm">Read More</button>');
		}
	});

	//readmore button
	$('.btn-readmore').click(function(){
		$(this).prev().prev().toggle(200);	//toggle '...'
		$(this).prev().slideToggle(200); //toggle text
		var state= $(this).text();
		$(this).text(state=="Read More" ? "Read Less":"Read More");
	});
});
