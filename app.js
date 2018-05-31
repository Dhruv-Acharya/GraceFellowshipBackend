const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const r = require('rethinkdb');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connection = null;
r.connect( {host: '139.59.0.131', port: 28015}, function(err, conn) {
    if (err) throw console.log(err);
    connection = conn;
    console.log(connection);
});

//cors headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//test route
app.get('/test', function (req, res, next) {
    res.json({
        success: "Successful test"
    });
});

//error handling
app.use((req, res, next) => {
    const error = new Error('Not Found!');
    error.status = 404;

});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
module.exports = app;