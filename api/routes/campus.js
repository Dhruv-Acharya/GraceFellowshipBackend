const express = require('express');
const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');  
const r = require('rethinkdb');
require('./../../env');

// ------------------------- batch members section start ---------------------------

//fetching all batch members of a given campus ID
router.get("/:campusId/batch_members", function (req, res, next) {

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
router.get('/:campusId/batch_member/:memberId',function (req, res, next){
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
router.post("/:campusId/batch_member", function (req, res, next) {
    class Member {
        constructor(ID, obj) {
            this.id = ID;
            this.name = obj.name; 
            this.active = true;
            this.email = obj.email;
            this.contact = obj.contact;
            this.address = obj.address;
            this.gender = obj.gender;
            this.join_date = obj.join_date;
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
    router.patch("/:campusId/batch_member/:memberId", (req, res, next) => {
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
router.delete("/:campusId/batch_member/:memberId", (req, res, next) => {
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



//-------------------------- report module Begins --------------------------------


//adding basic report details
router.post("/:campusId/report/basic", function (req, res, next) {
    class ReportDetails {
        constructor(id, obj) {

            //converting date and time to date object
            var date_epoch = obj.date.split("-");
            date_epoch = date_epoch.concat(obj.begining.start.split(":"));
            date_epoch.push(0,0);
            var d = new Date(date_epoch[2],date_epoch[1]-1,date_epoch[0],date_epoch[3],date_epoch[4]);

            this.id = id
            this.language = obj.language; 
            
            //adding epoch time
            this.epoch = d.getTime();
            this.date = obj.date;
            this.filedby = obj.filedby;
            this.begining = new Object();
            this.begining = obj.begining;
        }
    }
    r.uuid().run(req._dbconn, (err, id) => {
        if (err) {
            // console.log("error : " + err);
            res.status(500).json(err);
        }
        else {
            var report_details = new ReportDetails(id, req.body);
            r.db('grace_fellowship').table("campus").get(req.params.campusId).update(
                { reports: r.row("reports").default([]).append(report_details) }
            ).run(req._dbconn, (err, success) => {
                if (err) {
                    // console.log("error : " + err);
                    res.status(500).json(err);
                }
                else {


                    var response = new Object();
                    r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').filter({
                        "id":id
                    }).without('general','cheque','tithe')
                    .run(req._dbconn,function (err, report){
                        if(err){
                            res.status(500).json(err);
                        }
                        else{
                            if(report)
                            {   
                                response.report = report[0];
                                r.db('grace_fellowship').table('campus').get(req.params.campusId)('batch_members').filter({
                                    active: true
                                })
                                .run(req._dbconn,function (err, batch_members){
                                    if(err){
                                        res.status(500).json(err);
                                    }
                                    else{
                                        response.batch_members = batch_members;
                                        r.db('grace_fellowship').table('instruments').filter({
                                            campus_id: req.params.campusId
                                        }).without('campus_id')
                                        .run(req._dbconn,function (err, instruments){
                                            if(err){
                                                res.status(500).json(err);
                                            }else{
                                                instruments.toArray((err, result)=>{
                                                    if(err)res.status(500),json(err);
                                                    else{
                                                        response.instruments = result;
                                                        res.status(200).json(response);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            else    
                                res.status(403).json("No report by that Id found");
                        }
                    });
                }
            });
        }
    });
});
//update report basic details
router.patch("/:campusId/report/:reportId/basic", (req, res, next) => {

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];
                
                try{
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge(req.body))
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


// updating report with sermon 
router.patch("/:campusId/report/:reportId/sermon", (req, res, next) => {

    class Sermon {
        constructor(obj) {
            this.preacher = obj.preacher;
            this.title = obj.title;
            this.start = obj.start;
            this.end = obj.end;
        }
    }
    var sermon = new Sermon(req.body);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];
                
                try{
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({"sermon":sermon}))
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

//updating report with activities and ending

    router.patch("/:campusId/report/:reportId/activities_ending", (req, res, next) => {

        class Activities {
            constructor(obj) {
                this.lords_table = obj.lords_table;
                this.announcement = obj.announcement;               
            }
        }
        class Ending {
            constructor(obj) {
                this.time = obj.time;
                this.prayer = obj.prayer;
            }
        }
        var activities = new Activities(req.body.activities);
        var ending = new Ending(req.body.ending);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];

                try {
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
                            "activities": activities,
                            "ending": ending
                        }))
                    }).run(req._dbconn, function (err, success) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(success.replaced);
                        }
                    });
                } catch (err) {
                    res.status(500).json("Problem with nth Number" + err);
                }
            }
        });
    });

    router.patch("/:campusId/report/:reportId/worship", (req, res, next) => {

        // class Worship {
        //     constructor(obj) {
        //         this.leader = obj.leader;
        //         this.choir_members = obj.choir_members;
        //         this.incharge = obj.incharge;
        //     }
        // }
        // var worship = new Worship(req.body);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];

                try {
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
                            "worship": req.body
                        }))
                    }).run(req._dbconn, function (err, success) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(success.replaced);
                        }
                    });
                } catch (err) {
                    res.status(500).json("Problem with nth Number" + err);
                }
            }
        });
    });

    router.patch("/:campusId/report/:reportId/attendance_attendees", (req, res, next) => {

        class Attendance {
            constructor(obj) {
                this.male = obj.male;
                this.female = obj.female;
                this.total = obj.total;
                this.new = obj.new;
            }
        }
        class Attendees {
            constructor(obj) {
                this.new = obj.new;
                this.members = obj.members;
            }
        }
        var attendance = new Attendance(req.body.attendance);
        var attendees = new Attendees(req.body.attendees);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];

                try {
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
                            "attendance": attendance,
                            "attendees": attendees
                        }))
                    }).run(req._dbconn, function (err, success) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(success.replaced);
                        }
                    });
                } catch (err) {
                    res.status(500).json("Problem with nth Number" + err);
                }
            }
        });
    });
    
//--------------------------insert report module Ends --------------------------------

// ------------------------- getting stuff form reports starts-------------------------



    //response:
    // {
    //     "report": actual report,
    //     "batch_members": batch_members_array,
    //     "instuments": instruments_array
    // }
    //fetch single report
    router.get('/:campusId/report/:reportId',function (req,res,next){

        var response = new Object();
        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').filter({
            "id":req.params.reportId
        }).without('general','cheque','tithe')
        .run(req._dbconn,function (err, report){
            if(err){
                res.status(500).json(err);
            }
            else{
                if(report)
                {   
                    response.report = report[0];
                    r.db('grace_fellowship').table('campus').get(req.params.campusId)('batch_members').filter({
                        active: true
                    })
                    .run(req._dbconn,function (err, batch_members){
                        if(err){
                            res.status(500).json(err);
                        }
                        else{
                            response.batch_members = batch_members;
                            r.db('grace_fellowship').table('instruments').filter({
                                campus_id: req.params.campusId
                            }).without('campus_id')
                            .run(req._dbconn,function (err, instruments){
                                if(err){
                                    res.status(500).json(err);
                                }else{
                                    instruments.toArray((err, result)=>{
                                        if(err)res.status(500),json(err);
                                        else{
                                            response.instruments = result;
                                            res.status(200).json(response);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else    
                    res.status(403).json("No report by that Id found");
            }
        });  
    })
    
    //getting all reports of a campus
    router.get('/:campusId/report/',function (req,res,next){

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports')
        .orderBy(r.desc('epoch'))
        .limit(15)
        .pluck('id', 'date', 'language', 'filedby',{'begining':['start']})
        .run(req._dbconn,function (err, report){
            if (err) {
                res.status(500).json(err);
            } else {
                
                if (report) {
                    
                    res.status(200).json(report);
                } else
                    res.status(403).json("No reports found");
            }
        });
    })



// ------------------------- getting stuff form reports ends-------------------------

//deleting a report
router.delete("/:campusId/report/:reportId", (req, res, next) => {
    r.db('grace_fellowship').table('campus').get(req.params.campusId).update((item) => {
        return {
            reports: item('reports')
            .filter(function (report) {
                return report("id").ne(req.params.reportId)
            })
        }
    })
    .run(req._dbconn, function (err, result) {
        if (err)
            res.status(500).json(err);
        else {
            if (result.replaced >= 1) {
                res.status(200).json(result.replaced);
            } else {
                res.status(403).json(result);
            }
        }
    })
});

module.exports = router;