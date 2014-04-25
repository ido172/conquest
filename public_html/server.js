/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express');


var app = express();//.createServer();
app.configure(function () {
    app.use(express.logger('dev'));    
    app.use(express.bodyParser());//it will parse json request bodies (as well as others), and place the result in req.body:
});

app.listen(3000);
