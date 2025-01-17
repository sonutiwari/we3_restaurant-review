const express = require('express');
const router  = express.Router();
const autoIncrement = require("mongodb-autoincrement");
const bcrypt = require('bcrypt');
const saltRounds = 10;



router.get('/reset_password', function(req, res ){
    if(req.session.rest==true){
        res.render('rest_password_reset',{title:"password reset"}) 
      }
    else res.redirect('/resturant/login')
});
router.get('/login', function(req, res ){
    res.render('rest_login',{title:" Login"})
 
});

router.get('/signup', function(req, res ){
    res.render('rest_create',{title:"signup"})
});
router.get('/home', function(req, res ){
    if(req.session.rest==true){
       
        res.render('rest',{title:"Home"});
      }
    else res.redirect('/login')
});





router.post('/reset_password', function(req, res ){
    var db = req.app.locals.db; 
    
    db.collection("resturant_details").findOne({id:req.session.rest_id}, function(err, result) {
        var current_pwd=result.password;
        bcrypt.compare(req.body.current_password, current_pwd, function(err, pwd_check) {
           
            if(!pwd_check)  res.render('password_reset',{error:"please enter the old password correctly",title:"password reset"})
            else{

                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    db.collection("resturant_details").updateOne({email:result.email},{ $set: {password: hash } } , function(err, updated) {
                        if (err) throw err;
                       else{
                        req.session.destroy();
                        res.render('rest_login',{sucess:'password updated sucessfully',title:"Login"});
                     }    
                    });
                });
            }
        });
    });
});



router.post('/auth', function(req, res ){
    var db = req.app.locals.db; 
    db.collection("resturant_details").findOne({email:req.body.email}, function(err, result) {
        if(result==null)  res.render('rest_login',{error:'Please check the email id or write us cs@mail.com',title:"Login"}); 
        else {
            bcrypt.compare(req.body.password, result.password, function(err, auth) {
               if(auth)
               {
                req.session.rest = true;
                req.session.rest_id=result.id;
                res.redirect("/resturant/home")
               }
               else res.render('rest_login',{error:'Please check passord or write us cs@mail.com',title:"Login"}); 
            });
        }
     });
});


router.post('/signup',function(req,res){
    var db = req.app.locals.db; 
    var pwd="";
        db.collection("resturant_details").findOne({email:req.body.email}, function(err, result) {
            if (err) throw err;
           
            if(result!=null){
                res.render('rest_login',{error:'you have already an acount please login',title:"login"}); 
               }
           else{
                 bcrypt.genSalt(saltRounds, function(err, salt) {
                     bcrypt.hash(req.body.password, salt, function(err, hash) {
                     pwd=hash;
                        autoIncrement.getNextSequence(db, 'resturant_details', function (err, autoIndex) {
                            var updatedobj=req.body;
                            delete updatedobj.password;
                            delete updatedobj.password1;
                            updatedobj.password=hash;
                            updatedobj.id="rest_own10"+autoIndex;

                        db.collection('resturant_details').insertOne(updatedobj);
                        res.render('rest_login',{sucess:'Account created sucessfully please login',title:"Login"}); 
                     });
                 });
             });
         }
    });
 });




router.get('/logout', function(req, res){
    req.session.destroy();
    res.render('rest_login',{sucess:'logout sucessfully',title:"Login"});  
  });
  










module.exports = router;