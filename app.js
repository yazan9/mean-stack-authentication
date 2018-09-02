// We’ll declare all our dependencies here
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
var passport = require('passport');

require('./api/models/db');
require('./api/config/passport');

//Initialize our app variable
const app = express();

//Middleware for bodyparsing using both json and urlencoding
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

var routesApi = require('./api/routes/index');

app.use(passport.initialize());
app.use('/api', routesApi);

//Declaring Port
const port = 8081;
//Middleware for CORS
app.use(cors());

/*express.static is a built in middleware function to serve static files.
 We are telling express server public folder is the place to look for the static files
*/
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

app.get('/', (req,res) => {
    res.send("Invalid page");
})

//Listen to port 8081
app.listen(port, () => {
    console.log(`Starting the server at port ${port}`);
});
