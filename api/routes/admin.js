const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const r = require('rethinkdb');
require('./../../env');


//Volunteer Section start


// insert volunteer
router.post("/campus/:campusId/volunteer", function (req, res, next) {
    class Volunteer {
        constructor(obj) {
            this.name = obj.name;
            this.username = obj.username;
            this.contact = obj.contact;
            this.email = obj.email;
            this.campus_id = req.params.campusId
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
                "inserted_id": cursor.generated_keys[0]
            });
        }
    });
});

// fetch all volunteers by campus Id
router.get("/campus/:campusId/volunteers", function (req, res, next) {
    //console.log(req);

    r.db('grace_fellowship').table('volunteer').filter({
        campus_id:req.params.campusId
    }).without("password")
        .run(req._dbconn, (err, vol) => {

            vol.toArray((err, result) => {
                if (err) {
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(result);
                }
            });
        });
});

// get a single volunteer by ID
router.get("/campus/:campusId/volunteer/:id", function (req, res, next) {
// console.log(req.params.id);

    var volunteerId = req.params.id;
    r.db('grace_fellowship').table('volunteer').filter({
        campus_id : req.params.campusId,
        id : req.params.id
    }).without('password')
        .run(req._dbconn, (err, vol) => {
            // console.log(err);
            
            
                vol.toArray((err,result)=>{
                    if(result[0]){
                        res.status(200).json(result[0]);
                    }
                    else
                        res.status(404).json("Volunteer Not Found");
                });
                
            
        });
});

// delete a single volunteer
router.delete("/campus/:campusId/volunteer/:id", function (req, res, next) {

    var volunteerId = req.params.id;
    r.db('grace_fellowship').table('volunteer').filter({
        campus_id : req.params.campusId,
        id : req.params.id
    }).delete()
        .run(req._dbconn, (err, status) => {
            if (status.deleted > 0)
                res.status(200).json(status.deleted);
            else
                res.status(404).json("Volunteer Not Found");
        });
});

// // delete an array of volunteers
// router.delete("/volunteers", function (req, res, next) {

//     var deleted = new Array();
//     var notDeleted = new Array();
//     req.body.volunteersId.forEach(volunteerId => {
//         r.db('grace_fellowship').table('volunteer').get(volunteerId).delete()
//             .run(req._dbconn, (err, status) => {
//                 if (status.deleted > 0)
//                     deleted.push(volunteerId);
//                 else
//                     notDeleted.push(volunteerId);

//                 res.status(200).json({ deleted, notDeleted });
//             });
//     });
// });

// update single volunteer by ID
router.patch("/campus/:campusId/volunteer/:id", function (req, res, next) {
    var volunteerId = req.params.id;

    if (req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    r.db('grace_fellowship').table('volunteer').filter({
        campus_id : req.params.campusId,
        id : volunteerId
    }).update(req.body)
        .run(req._dbconn, (err, result) => {
            if (result.replaced > 0)
                res.status(200).send(result.replaced + "");
            else
                res.status(403).send("No updates done");
        });
});

//Volunteer Section over

//Campuses start

//fetch all campuses name and ID ONLY
router.get("/campuses", function (req, res, next) {

    r.db('grace_fellowship').table("campus").pluck("name", "id").run(req._dbconn, function (err, result) {
        if (err) {
            res.status(500).json(err);
        }

        result.toArray((err, campuses) => {
            if (err) {
                res.status(500).json(err);
            }
            else {
                res.status(200).json(campuses);
            }
        });
    });
});


// ------------------------- batch members section start ---------------------------

//fetching all batch members of a given campus ID
router.get("/campus/:campusId/batch_members", function (req, res, next) {

    r.db('grace_fellowship').table('campus').get(req.params.campusId)('batch_members').filter({
        active:true
    })
    .run(req._dbconn, function (err, result) {
        if (err) {
            res.status(500).json(err);
        }else{
            if(result){
                res.status(200).json(result);
            }else{
                res.status(403).json("No active members found");
            }
        }
        
    });
});

//fetching a single batch member
router.get('/campus/:campusId/batch_member/:memberId',function (req, res, next){
    r.db('grace_fellowship').table('campus').get(req.params.campusId)('batch_members').filter({
        "id":req.params.memberId,
        active:true
    })
    
    .run(req._dbconn, (err, success) => {
        if (err) {
            res.status(500).json(err);
        }
        else {
            if(success[0])
                res.status(200).json(success[0]);
            else    
                res.status(403).json("No member found");
        }
    });
});


//insert batch member in a given campus by campus ID
router.post("/campus/:campusId/batch_member", function (req, res, next) {
    class Member {
        constructor(ID, obj) {
            this.id = ID;
            this.name = obj.name; 
            this.active = true;
            this.email = obj.email;
            this.contact = obj.contact;
            this.address = obj.address;
            this.gender = obj.gender;
            this.join_date = obj.joinDate;
        }
    }

    r.uuid().run(req._dbconn, (err, id) => {
        if (err) {
            // console.log("error : " + err);
            res.status(500).json(err);
        }
        else {
            var member = new Member(id, req.body);
            r.db('grace_fellowship').table("campus").get(req.params.campusId).update(
                { batch_members: r.row("batch_members").default([]).append(member) }
            ).run(req._dbconn, (err, success) => {
                if (err) {
                    // console.log("error : " + err);
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(success.replaced);
                }
            });
        }
    });
});

//update batch member in given campus with given member ID
    router.patch("/campus/:campusId/batch_member/:memberId", (req, res, next) => {
        r.db('grace_fellowship').table('campus').get(req.params.campusId)('batch_members').offsetsOf(
            r.row("id").match(req.params.memberId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];
                
                try{
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        batch_members: r.row('batch_members').changeAt(x, r.row('batch_members').nth(x).merge(req.body))
                    }).run(req._dbconn, function (err, success) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(success.replaced);
                        }
                    });
                }
                catch(err){
                    res.status(500).json("Problem with nth Number"+err);
                 }
            }
        });
    });


//delete batch member in given campus with given member ID
router.delete("/campus/:campusId/batch_member/:memberId", (req, res, next) => {
    r.db('grace_fellowship').table('campus').get(req.params.campusId)('batch_members').offsetsOf(
        r.row("id").match(req.params.memberId)
    ).run(req._dbconn, function (err, succ) {
        if (err) {
            res.status(500).json(err);
        } else {

            x = succ[0];
            
            try{
                r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                    batch_members: r.row('batch_members').changeAt(x, r.row('batch_members').nth(x).merge({"active":false}))
                }).run(req._dbconn, function (err, success) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json(success.replaced);
                    }
                });
            }
            catch(err){
                res.status(500).json("Problem with nth Number"+err);
             }
        }
    });
});

// ------------------------- batch members section end ---------------------------

//Adding instruments via campus ID

router.post('/campus/:campusId/instrument',function (req, res, next){

    class Instrument{
        constructor(obj){
            this.campus_id = req.params.campusId;
            this.name = obj.instrument;
        }
    }
    var instrumnet = new Instrument(req.body);
    r.db('grace_fellowship').table('instruments').insert(instrumnet).run(req._dbconn,(err ,result)=>{
        if(err){
            res.status(500).json(err);
        }
        else{
            res.status(200).json(result.generated_keys[0]);
        }
    });
});

//fetching instruments of a single campus by ID

router.get('/campus/:campusId/instruments',function (req, res, next){

    r.db('grace_fellowship').table('instruments').filter({
        campus_id:req.params.campusId
    }).run(req._dbconn,(err ,result)=>{
        if(err){
            res.status(500).json(err);
        }
        else{
            result.toArray((err, instruments) => {
                if (err) {
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(instruments);
                }
            });
        }
    });
});

//deleting instrument of a campus by campus Id and  Isntrument Id
router.delete('/campus/:campusId/instrument/:instrumentId',function(req, res, next){
    
    r.db('grace_fellowship').table('instruments').filter({
        "id":req.params.instrumentId,
        "campus_id":req.params.campusId
    }).delete().run(req._dbconn, (err, result)=>{
        if(err){
            res.status(500).json(err);
        }
        else {
            res.status(200).json(result.deleted);
        }
    });
});

//updating instrument of a campus by campus Id and  Instrument Id
router.patch('/campus/:campusId/instrument/:instrumentId',function(req, res, next){
    
    r.db('grace_fellowship').table('instruments').filter({
        "id":req.params.instrumentId,
        "campus_id":req.params.campusId
    }).update({
        "name":req.body.instrument
    }).run(req._dbconn, (err, result)=>{
        if(err){
            res.status(500).json(err);
        }
        else {
            res.status(200).json(result.replaced);
        }
    });
});

//------------------------- Donation Module ------------------------


//Adding Donation via campus ID

router.post('/donation_category',function (req, res, next){

    class donationCategory{
        constructor(obj){
            
            this.category = obj.category;
        }
    }
    var donation_category = new donationCategory(req.body);
    r.db('grace_fellowship').table('donation_category').insert(donation_category).run(req._dbconn,(err ,result)=>{
        if(err){
            res.status(500).json(err);
        }
        else{
            res.status(200).json(result.generated_keys[0]);
        }
    });
});

//fetching all donation category

router.get('/donation_category',function (req, res, next){

    r.db('grace_fellowship').table('donation_category').run(req._dbconn,(err ,result)=>{
        if(err){
            res.status(500).json(err);
        }
        else{
            result.toArray((err,list)=>{
                if (err) {
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(list);
                }
            })   
        }
    });
});

//deleting donation category by  donation Id
router.delete('/donation_category/:donation_categoryId',function(req, res, next){
    
    r.db('grace_fellowship').table('donation_category').get(req.params.donation_categoryId).delete().run(req._dbconn, (err, result)=>{
        if(err){
            res.status(500).json(err);
        }
        else {
            res.status(200).json(result.deleted);
        }
    });
});

//updating donation by  donation category Id
router.patch('/donation_category/:donation_categoryId',function(req, res, next){
    
    r.db('grace_fellowship').table('donation_category').get(req.params.donation_categoryId).update({
        "category":req.body.category
    }).run(req._dbconn, (err, result)=>{
        if(err){
            res.status(500).json(err);
        }
        else {
            res.status(200).json(result.replaced);
        }
    });
});

//-------------------------- Donation Module Ends here---------------------
//adding a new campus
router.post("/campus", function (req, res, next) {

    class Campus {
        constructor(obj) {
            this.name = obj.name;
            this.username = obj.username;
            this.password = bcrypt.hashSync(obj.password, 10);
            this.address = obj.address;
            this.batch_members = [];
            this.reports = [];
        }
    }
    var newCampus = new Campus(req.body);
    r.db('grace_fellowship').table('campus').insert(newCampus).run(req._dbconn, function (err, success) {
        if (err) {
            res.status(500).json(err);
        }
        else {
            res.status(200).json(success.inserted);
        }

    });
});


//Update password of a campus login
router.patch('/campus/:campusId/password', function (req, res, next) {
    var encryptedPassword = bcrypt.hashSync(req.body.password, 10);    
    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
        "password": encryptedPassword
    }).run(req._dbconn, (err, result) => {
        if (err) {
            res.status(500).json(err);
        }
        else {
            res.status(200).json(result.replaced);
        }
    });
});

// adding an admin
// router.post("/qwe",function (req,res,next){
//     r.db("grace_fellowship").table('admin').insert({
//         username:"a-grace",
//         password:bcrypt.hashSync("qwe", 10)
//     }).run(req._dbconn,function (err,result){
//         res.send(result);
//     });
// });

//------------------------trustee module begin----------------------


//Adding instruments via campus ID

router.post('/trustee',function (req, res, next){

    class Trustee{
        constructor(obj){
            this.username = obj.username;
            this.email = obj.email;
            this.name = obj.name;
            this.password = bcrypt.hashSync(obj.password, 10);
        }
    }
    var trustee = new Trustee(req.body);
    r.db('grace_fellowship').table('trustee').insert(trustee).run(req._dbconn,(err ,result)=>{
        if(err){
            res.status(500).json(err);  
        }
        else{
            res.status(200).json(result.generated_keys[0]);
        }
    });
});

//fetching trustee of a single by ID

router.get('/trustee/:trusteeId',function (req, res, next){

    r.db('grace_fellowship').table('trustee').get(req.params.trusteeId)
    .run(req._dbconn,(err ,trustee)=>{
        if(err){
            res.status(500).json(err);
        }
        else{
          
                if (err) {
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(trustee);
                }
          
        }
    });
});

//fetching all trustee

router.get('/trustees',function (req, res, next){

    r.db('grace_fellowship').table('trustee')
    .run(req._dbconn,(err ,result)=>{
        if(err){
            res.status(500).json(err);
        }
        else{
            result.toArray((err, trustee) => {
                if (err) {
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(trustee);
                }
            });
        }
    });
});

//deleting trustee by trustee ID
router.delete('/trustee/:trusteeId',function(req, res, next){
    
    r.db('grace_fellowship').table('trustee').get(req.params.trusteeId).delete().run(req._dbconn, (err, result)=>{
        if(err){
            res.status(500).json(err);
        }
        else {
            res.status(200).json(result.deleted);
        }
    });
});

//updating trustee by trustee Id
router.patch('/trustee/:trusteeId',function(req, res, next){
    
    r.db('grace_fellowship').table('trustee').filter({
        "id":req.params.trusteeId,
    }).update({
        "name":req.body.instrument
    }).run(req._dbconn, (err, result)=>{
        if(err){
            res.status(500).json(err);
        }
        else {
            res.status(200).json(result.replaced);
        }
    });
});


//------------------------trustee module ends----------------------

module.exports = router;