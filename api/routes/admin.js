const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const r = require('rethinkdb');
require('./../../env');


//Volunteer Section start


// insert volunteer
router.post("/volunteer", function (req, res, next) {
    class Volunteer {
        constructor(obj) {
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
                "inserted_id": cursor.generated_keys[0]
            });
        }
    });
});

// fetch all volunteers
router.get("/volunteers", function (req, res, next) {
    //console.log(req);

    r.db('grace_fellowship').table('volunteer').without("password")
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
router.get("/volunteer/:id", function (req, res, next) {

    var volunteerId = req.params.id;
    r.db('grace_fellowship').table('volunteer').without('password').get(volunteerId)
        .run(req._dbconn, (err, vol) => {
            if (vol)
                res.status(200).json(vol);
            else
                res.status(404).json("Volunteer Not Found");
        });
});

// delete a single volunteer
router.delete("/volunteer/:id", function (req, res, next) {

    var volunteerId = req.params.id;
    r.db('grace_fellowship').table('volunteer').get(volunteerId).delete()
        .run(req._dbconn, (err, status) => {
            if (status.deleted > 0)
                res.status(200).json(status.deleted);
            else
                res.status(404).json("Volunteer Not Found");
        });
});

// delete an array of volunteers
router.delete("/volunteers", function (req, res, next) {

    var deleted = new Array();
    var notDeleted = new Array();
    req.body.volunteersId.forEach(volunteerId => {
        r.db('grace_fellowship').table('volunteer').get(volunteerId).delete()
            .run(req._dbconn, (err, status) => {
                if (status.deleted > 0)
                    deleted.push(volunteerId);
                else
                    notDeleted.push(volunteerId);

                res.status(200).json({ deleted, notDeleted });
            });
    });
});

// update single volunteer by ID
router.patch("/volunteer/:id", function (req, res, next) {
    var volunteerId = req.params.id;

    if (req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    r.db('grace_fellowship').table('volunteer').get(volunteerId).update(req.body)
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

//fetching batch members of a given campus ID
router.get("/campus/:campus_id/batch_members", function (req, res, next) {
    console.log("asdas");

    r.db('grace_fellowship').table("campus").get(req.params.campus_id).pluck("batch_members").run(req._dbconn, function (err, result) {
        if (err) {
            res.status(500).json(err);
        }
        res.status(200).json(result);
    });
});

//insert batch member in a given campus by campus ID
router.post("/campus/:campus_id/batch_member", function (req, res, next) {

    class Member {
        constructor(ID, obj) {
            this.id = ID;
            this.name = obj.name;
            this.email = obj.email;
            this.contact = obj.contact;
            this.address = obj.address;
            this.gender = obj.gender;
        }
    }

    r.uuid().run(req._dbconn, (err, id) => {
        if (err) {
            console.log("error : " + err);
            res.status(500).json(err);
        }
        else {
            var member = new Member(id, req.body);
            r.db('grace_fellowship').table("campus").get(req.params.campus_id).update(
                { batch_members: r.row("batch_members").default([]).append(member) }
            ).run(req._dbconn, (err, success) => {
                if (err) {
                    console.log("error : " + err);
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(success.replaced);
                }
            });
        }
    });



    /*r.uuid().run(req._dbconn, (err, id ) => {
        var member = new Member(id, req.body);
        r.db('grace_fellowship').table("campus").get(req.params.campus_id).pluck("batch_members").run(req._dbconn, function(err, result) {

            if (err) {
                console.log("error"+ err);
                res.status(500).json(err);
            }
            else{
                result.batch_members.push(member);
                r.db('grace_fellowship').table('campus').get(req.params.campus_id).update({
                    "batch_members":result.batch_members
                }).run(req._dbconn,function (err,success){
                    if(err){
                        console.log("error"+ err);
                        res.status(500).json(err); 
                    }
                    else{
                        res.status(200).json(success.replaced);
                    }
                })
            }
        });
    });
    
    */
    // r.db('grace_fellowship').table("campus").get(req.params.campus_id).update({"batchMembers" : [r.row('batchMembers')].push(member) }).run(req._dbconn, function(err, result) {

});

//update batch member in given campus with given member ID
router.patch("/campus/:campus_id/batch_member/:member_id", (req, res, next) => {

    class Member {
        constructor(obj) {
            this.id = req.params.member_id;
            this.name = obj.name;
            this.email = obj.email;
            this.contact = obj.contact;
            this.address = obj.address;
            this.gender = obj.gender;
        }
    }
    var member = new Member(req.body);

    r.db('grace_fellowship').table('campus').get(req.params.campus_id)
        .update(function (row) {
            return {
                batch_members: row('batch_members').filter(function (batch_members) {
                    return batch_members('id').ne(req.params.member_id)
                })
                    .append(member)
            };
        }).run(req._dbconn, (err, success) => {
            if (err) {
                res.status(500).json(err);
            }
            else {
                res.status(200).json(success.replaced);
            }
        });
});

//delete batch member in given campus with given member ID
router.delete("/campus/:campus_id/batch_member/:member_id", (req, res, next) => {

    r.db('grace_fellowship').table('campus').get(req.params.campus_id)
        .update(function (row) {
            return {
                batch_members: row('batch_members').filter(function (batch_members) {
                    return batch_members('id').ne(req.params.member_id)
                })
            };
        }).run(req._dbconn, (err, success) => {
            if (err) {
                res.status(500).json(err);
            }
            else {
                res.status(200).json(success.replaced);
            }
        });
});

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

router.post('/campus/:campusId/password', function (req, res, next) {
    var encryptedPassword = req.body.password;
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



module.exports = router;