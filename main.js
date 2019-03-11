// const http = require('http');
// const fs = require('fs');


// fs.readFile('./index.html', function (err, html) {
//     if (err) {
//         throw err; 
//     }       
//     http.createServer(function(request, response) {  
//         response.writeHeader(200, {"Content-Type": "text/html"});  
//         response.write(html);  
//         response.end();  
//     }).listen(3000);
// });

// console.log('Server started')

var express = require('express');
var app = express();
var path = require('path');

app.use('/static/', express.static(__dirname + '/static/'))
app.use('/config.html', express.static(__dirname + '/config.html'))

app.use('/index-bundle.js', express.static(__dirname + '/index-bundle.js'))

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(3000);
console.log('Server started')