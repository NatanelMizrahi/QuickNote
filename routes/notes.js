var membersOnly=true;
var mongojs=require('mongojs');
var config= require('../config');
var db=mongojs(config.MONGODB_URI,['users']); //(DB,collections)
var express=require('express');
var router=express.Router();
module.exports= router;
router.get('/', function(req,res){
	res.render('notes');
});


function isLoggedIn(req, res, next){
	if(!membersOnly || req.isAuthenticated()){ return next();}
	req.flash('error', 'Your session has expired. Please log in to continue');
	res.status(511).send({url:'/users/login'});	//511: Authentication required
	return;
}

function incrementNoteID(req,res,next){
	db.users.findOne({noteID: {$gte:0}},function(err,counter){
		if(err) throw err;
		if(!counter){
			db.users.insert({noteID:0}, 
				function(err,id){
					req.noteID=id.noteID;
					next();
			});
			return;
		}
		db.users.findAndModify({
			query:{noteID: {$gte:0}},
			update:{ $inc:{noteID:1} },
			new:true,	
			},function(err,id){ 
				req.noteID=id.noteID; 
				next(); 
			});
		return;
	});
}
router.put("/", isLoggedIn, function(req,res){
	var id=req.user._id;
	var noteID=parseInt(req.body.noteID);
	var title=req.body.title;
	var body=req.body.body;
	var modified=req.body.modified;
	db.users.update(
		{_id: id, "notes.id": noteID},
		{ $set:{ 
			"notes.$": {id:noteID, title:title, body:body, modified:modified} 
			}	
		},
		function(err,result){
			if(err) {
				throw err; 
				return res.status(500).send(); 
			} 
			db.users.findOne({_id:id}, function(err, user){
			 if(err) throw err;
			 res.send(user.notes);});
	});
});
router.get("/getNote/:noteID",isLoggedIn, function(req,res){
	var user=req.user;
	var noteID=parseInt(req.params.noteID);
	db.users.find({_id: user._id, "notes.id": noteID}, {'notes.$': 1}, 
    	function(err,result){
    		if(result.length==0){ return res.send("Not found");}
    		var note= result[0].notes[0]; 
    		res.send(note);
    	});
});
router.delete("/:noteID", isLoggedIn, function(req,res){
	var user=req.user;
	var noteID=parseInt(req.params.noteID);
	db.users.update( { _id: user._id },
					 { $pull: { notes: { id: noteID } } },
					 { multi:false }, 
					 function(err, result){
					 	if(err){ return res.status(500).send(err);}
					 	db.users.findOne({_id:user._id}, function(err,user){ res.send(user.notes);});
					});
});



function addNote(req,res, noteID){
	var user=req.user;
	var title=req.body.title;
	var body=req.body.body;
	var modified= req.body.modified;

	db.users.findOne({_id: user._id},function(err,user){
		if(err) throw err;
		if(!user.notes){	//first entry
			db.users.findAndModify({
					query:{_id:user._id},
					update:{
						$set:{ notes: [ { id: noteID, title:title, body: body, modified: modified} ]	}
					},
					new:true
				},
				function resolveData(err,user){
					//length=data.notes.length;
					return res.send({notes:user.notes, currentNoteID:noteID});
				});//findAndModify//
				return;
		}
		//user found
		db.users.findAndModify({
					query:{_id:user._id},
					update:{
						$push:{ //with modifiers, adds new note to beginning of array
							notes: {
								$each: [{ id: noteID, title:title, body: body, modified: modified} ],
								$position:0
							}
						}
					},
					new:true
				},
				function resolveData(err,user){
					return res.send({notes: user.notes, currentNoteID:noteID});
				});//findAndModify
	}); //find
}

router.post("/new", isLoggedIn, incrementNoteID, function(req,res){
	var noteID=req.noteID;
	req.noteID=undefined;
	addNote(req,res,noteID);
});

router.put("/sort", isLoggedIn, function(req,res){
	var user=req.user;
	var sortBy=req.body.sortBy;
	db.users.findAndModify({
		query:{_id:user._id},
		update:{ $set:{ notes: user.notes.sort(function(a,b){
						if(sortBy==="title"){
							return a.title > b.title ? 1 : -1;
						}
						if(sortBy==="modified"){
							return a.modified < b.modified ? 1 : -1;
						}
					})
				}
			},
		new: true,
	},
	function(err,user){
		if(err) throw err;
		return res.send(user.notes);
	}); 
});
