const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const r = require('rethinkdb');
require('./../../env');


//Volunteer Section start


// insert volunteer
router.post("/volunteer",function(req,res,next){
    class Volunteer{
        constructor(obj){
            this.name = obj.name;
            this.username = obj.username;
            this.contact = obj.contact;
            this.email = obj.email;
            this.password = bcrypt.hashSync(obj.password, 10);
            //this.password = bcrypt.hashSync(obj.password, process.env.BCRYPT_SALT_ROUNDS);

            // bcrypt.hash(obj.password, process.env.BCRYPT_SALT_ROUNDS, function(err, hash) {
            //     // Store hash in your password DB.
            //     this.password = hash;
            //   });
            
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

// fetch all volunteers
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

// get a single volunteer by ID
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

// delete a single volunteer
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

// delete an array of volunteers
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

// update single volunteer by ID
router.patch("/volunteer/:id",function(req,res,next){
    var volunteerId = req.params.id;
    r.db('grace_fellowship').table('volunteer').get(volunteerId).update(req.body)
    .run(req._dbconn,(err,result)=>{
        if(result.replaced>0)
            res.status(200).send(result.replaced+"");
        else    
            res.status(403).send("No updates done");
    });
});

//Volunteer Section over
 
//Campuses start

//fetch all campuses name and ID ONLY
router.get("/campuses",function(req,res,next){
    
    r.db('grace_fellowship').table("campus").pluck("name", "id").run(req._dbconn, function(err, result) {
        if (err) {
            res.status(500).json(err);
        }
        
        result.toArray((err, campuses) =>{
            if (err) {
                res.status(500).json(err);
            }
            else{
                res.status(200).json(campuses);
            }
        });
    });
});

//fetching bath members of a given campus ID
router.get("/campus/:campus_id/batch_members",function(req,res,next){
    
    r.db('grace_fellowship').table("campus").get(req.params.campus_id).pluck("batchMembers").run(req._dbconn, function(err, result) {
        if (err) {
            res.status(500).json(err);
        }
        res.status(200).json(result);
    });
});

//insert batch member in a given campus by campus ID

router.post("/campus/:campus_id/batch_member",function(req,res,next){
    
    r.db('grace_fellowship').table("campus").get(req.params.campus_id).("batch_member").run(req._dbconn, function(err, result) {
        if (err) {
            res.status(500).json(err);
        }
        res.status(200).json(result);
    });
});




module.exports = router;