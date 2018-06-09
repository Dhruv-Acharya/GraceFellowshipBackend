const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const r = require('rethinkdb');
require('./../../env');




router.post("/volunteer",function(req,res,next){
    class Volunteer{
        constructor(obj){
            this.name = obj.name;
            this.username = obj.username;
            this.contact = obj.contact;
            this.email = obj.email;
            this.password = bcrypt.hashSync(obj.password, 10);
        }
    }
    var volunteer = new Volunteer(req.body);
    r.db('grace_fellowship').table('volunteer').insert(volunteer).run(req._dbconn, (err, cursor) => {
        if (err) {
            res.status(500).json({
                Error: err
            });
        } else {
            res.send({
                "inserted_id":cursor.generated_keys[0]
            });
        }
    });
});

router.get("/volunteers",function(req,res,next){
    
    r.db('grace_fellowship').table('volunteer')
    .run(req._dbconn, (err,vol)=>{

        vol.toArray((err, result) =>{
            if (err) {
                res.status(500).json(err);
            }
            else{
                res.status(200).json(result);
            }
        });
    });
});

router.get("/volunteer/:id",function(req,res,next){
    
    var volunteerId = req.params.id;
    r.db('grace_fellowship').table('volunteer').get(volunteerId)
        .run(req._dbconn, (err,vol)=>{
            if(vol)
                res.status(200).json(vol);
            else
                res.status(404).json("Volunteer Not Found");
        });
});

router.delete("/volunteer/:id",function(req,res,next){
    
    var volunteerId = req.params.id;
    r.db('grace_fellowship').table('volunteer').get(volunteerId).delete()
    .run(req._dbconn, (err,status)=>{
        if(status.deleted>0)
            res.status(200).json(status.deleted);
        else
            res.status(404).json("Volunteer Not Found");
    });
});

router.delete("/volunteers",function(req,res,next){

    var deleted = new Array();
    var notDeleted = new Array();
    req.body.volunteersId.forEach(volunteerId => {
        r.db('grace_fellowship').table('volunteer').get(volunteerId).delete()
        .run(req._dbconn, (err,status)=>{
            if(status.deleted>0)
                deleted.push(volunteerId);
            else
                notDeleted.push(volunteerId);

            res.status(200).json({deleted,notDeleted});
        }); 
    });
});

router.patch("/volunteer/:id",function(req,res,next){
    var volunteerId = req.params.id;
    r.db('grace_fellowship').table('volunteer').get(volunteerId).update(req.body)
    .run(req._dbconn,(err,result)=>{
        if(result.replaced>0)
            res.status(200).send(result.replaced);
        else    
            res.status(403).send(err);

        
        
    });
});

module.exports = router;