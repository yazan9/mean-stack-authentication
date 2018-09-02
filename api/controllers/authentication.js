var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.register = function(req, res) {

 
  //validate that all field exist
  if(!req.body.name.trim() || !req.body.email.trim() || !req.body.password.trim()) {
    res.status(401);
    res.json({"message" : "All fields required"});
    return;
  }
  
  var user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.setPassword(req.body.password);

  user.save(function(err) {
    if(err){
      res.status(401);
      if(err.code == 11000){
        res.json({"message" : "Duplicate email"});
      }
      else{
        res.json({"message" : "User could not be saved"});
      }
      return;
    }
    
    var token;
    token = user.generateJwt();
    res.status(200);
    res.json({
      "token" : token
    });
  });

};

module.exports.login = function(req, res) {

  //validate that all field exist
  if(!req.body.email.trim() || !req.body.password.trim()) {
    res.status(401);
    res.json({"message" : "All fields required"});
    return;
  }

  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    } else {
      // If user is not found
      res.status(401).json({"message" : "Invalid email/password combination"});
    }
  })(req, res);

};