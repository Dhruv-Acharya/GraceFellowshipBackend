const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const r = require('rethinkdb');
require('./../../env');

router.post('/login', function (req, res, next) {
    r.db('grace_fellowship').table('trustee').filter(r.row('trustee_username').eq('William1234')).
        run(req._dbconn, function (err, cursor) {
            if (err) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }
            else {
                cursor.toArray(function (err, result) {
                    if (err){
                        res.status(500).json(err);
                    }
                    else {
                        bcrypt.compare(req.body.trustee_password,result[0].trustee_password,(err,success)=>{
                            if(err) {
                                    return res.status(401).json({
                                    message: 'Invalid password'
                                });
                                }
                                if(success){
                                    const token = jwt.sign(
                                        {
                                            id: result[0].id,
                                            name: result[0].trustee_name,
                                            type: "trustee"
                                        },
                                        process.env.JWT_KEY,
                                        {
                                            expiresIn:'1h'
                                        }
                                    );
                                    return  res.status(200).json({
                                        message:'Login successful',
                                        token:token
                                    });
                                }
                            });
                    }
                });
            }
        });
});

module.exports = router;
/*
router.post('/login',function(req,res,next){
    Admin.find({admin_email:req.body.trustee_username})
       .exec()
       .then(data => {
           if(!data.length){
               return res.status(404).json({
                   message: 'User not found'
               });
           }
           else{
            bcrypt.compare(req.body.admin_password,data[0].admin_password,(err,result)=>{
               if(err) {
                       return res.status(401).json({
                       message: 'Invalid email or password'
                   });
                   }
                   if(result){
                       const token = jwt.sign(
                           {
                               admin_email:data[0].admin_email,
                           },
                           process.env.JWT_KEY,
                           {
                               expiresIn:'1h'
                           }
                       );
                       return  res.status(200).json({
                           message:'Login successful',
                           token:token
                       });
                   }
               });
           }
       }).catch(err=>{
           res.status(500).json({
               error:err
           });
        });
});*/