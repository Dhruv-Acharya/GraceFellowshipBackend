const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const checkAuth = require('./api/middleware/check-auth')
const createConnection = require('./api/middleware/createConnection');


//routes
const loginRoutes = require('./api/routes/login');
const adminRoutes = require('./api/routes/admin');
const campusRoutes = require('./api/routes/campus');
const volunteerRoutes = require('./api/routes/volunteer');
const trusteeRoutes = require('./api/routes/trustee');
//app initializatio
const app = express();

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(createConnection);


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

app.use('/login', loginRoutes);
//Uncomment bottom line in Production
// app.use(checkAuth);

// (req,res)=>{
//     console.log("Asd");
    
//     if(req.userData.type = 'admin'){
//         app.use('/admin', adminRoutes);
//     }else if(req.userData.type = 'campus'){
//         app.use('/admin', campusRoutes); 
//     }else if(req.userData.type = 'volunteer'){
//         app.use('/volunteer',volunteerRoutes);
//     }else if(req.userData.type = 'trustee'){
//         app.use('/trustee',trusteeRoutes)
//     }
// }

app.use('/admin', adminRoutes);
app.use('/campus', campusRoutes);
app.use('/volunteer',volunteerRoutes);
app.use('/trustee',trusteeRoutes)


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