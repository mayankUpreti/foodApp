var path = require('path');
var express = require('express');

var app = express();

app.use(express.static(path.join(__dirname, 'dist')));

const port=process.env.PORT || 8080
app.listen(port)

