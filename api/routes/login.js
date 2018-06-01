const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const r = require('rethinkdb');
require('./../../env');

router.post('/', function (req, res, next) {
    //let found = 0;
    let user_type = null;
    /*
    r.db('grace_fellowship').table('Trustee').filter(r.row('username').eq(req.body.username)).
        run(req._dbconn, function (err, cursor) {
            if (err) {
                found = 1;
                user_type = "trustee";
            }
        });
    if (found == 0) {
        r.db('grace_fellowship').table('Admin').filter(r.row('username').eq(req.body.username)).
            run(req._dbconn, function (err, cursor) {
                if (err) {
                    found = 1;
                    user_type = "member";
                }
            });
    }
    if (found == 0) {
        r.db('grace_fellowship').table('Volunteer').filter(r.row('username').eq(req.body.username)).
            run(req._dbconn, function (err, cursor) {
                if (err) {
                    found = 1;
                    user_type = "volunteer";
                }
            });
    }
    else {
        r.db('grace_fellowship').table('OfferingsHandler').filter(r.row('username').eq(req.body.username)).
            run(req._dbconn, function (err, cursor) {
                if (err) {
                    found = 1;
                    user_type = "offeringHandler";
                }
            });
    }*/
    if(req.body.username[0] === 'v')
        user_type = "Volunteer";
    else if(req.body.username[0] === 'o')
        user_type = "OfferingsHandler";
    else if(req.body.username[0] === 'a')
        user_type = "Admin";
    else if(req.body.username[0] === 't')
        user_type = "Trustee";
    else
        user_type = "Invalid";

    if (user_type.localeCompare("Invalid") != 0 || user_type !== null) {
        let username_field = user_type+'_username';
        r.db('grace_fellowship').table(user_type).filter(r.row(username_field).eq(req.body.username)).
        run(req._dbconn, (err, cursor) =>{
            if(err){
                res.status(500).json({
                    Error : err
                });
            }
            else{
                cursor.toArray((err, result) =>{
                    if (err) {
                        res.status(500).json(err);
                    }
                    else if(result.length === 0) {
                        res.status(404).json({
                            message : "User not Found!"
                        });
                    }
                    else {
                        let name_password = retriveNamePassword(user_type,result);
                        bcrypt.compare(req.body.password, name_password.split("%")[1], (err, success) => {
                            if (err) {
                                return res.status(500).json({
                                    message: err
                                });
                            }
                            if (success) {
                                const token = jwt.sign(
                                    {
                                        id: result[0].id,
                                        name: name_password.split("%")[0],
                                        type: user_type
                                    },
                                    process.env.JWT_KEY,
                                    {
                                        expiresIn: '1h'
                                    }
                                );
                                return res.status(200).json({
                                    message: 'Login successful!',
                                    token: token
                                });
                            }
                            else{
                                return res.status(401).json({
                                    message: 'Password Incorrect!',
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else {
        res.status(404).json({
            Error : "User not Found"
        });
    }
});

function retriveNamePassword(type,res)  {
    if(type.localeCompare("Trustee") === 0){
        return res[0].Trustee_name+"%"+res[0].Trustee_password;
    }
    else if(type.localeCompare("Admin") === 0){
        return res[0].Admin_name+"%"+res[0].Admin_password;
    }
    else if(type.localeCompare("OfferingsHandler") === 0){
        return res[0].OfferingsHandler_name+"%"+res[0].OfferingsHandler_password;
    }
    else {
        return res[0].Volunteer_name+"%"+res[0].Volunteer_password;
    }
}

module.exports = router;